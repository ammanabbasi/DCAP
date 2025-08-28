// File: data/api/ApiInterceptor.kt
// Purpose: HTTP interceptors for authentication, logging, and token refresh
// Dependencies: OkHttp, TokenManager, Coroutines

package com.dealervait.data.api

import com.dealervait.core.storage.TokenManager
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Authentication interceptor that adds Bearer token to requests
 * and handles token refresh on 401 responses
 */
@Singleton
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {

    companion object {
        private const val HEADER_AUTHORIZATION = "Authorization"
        private const val BEARER_PREFIX = "Bearer "
        
        // Endpoints that don't require authentication
        private val NON_AUTH_ENDPOINTS = setOf(
            "login",
            "register", 
            "forgot-password",
            "reset-password"
        )
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Skip authentication for non-auth endpoints
        if (shouldSkipAuth(originalRequest)) {
            return chain.proceed(originalRequest)
        }

        // Get current access token
        val accessToken = runBlocking { tokenManager.getAccessToken() }
        
        // Add token to request if available
        val authenticatedRequest = if (!accessToken.isNullOrBlank()) {
            originalRequest.newBuilder()
                .header(HEADER_AUTHORIZATION, BEARER_PREFIX + accessToken)
                .build()
        } else {
            originalRequest
        }

        // Execute request
        val response = chain.proceed(authenticatedRequest)

        // Handle 401 Unauthorized - attempt token refresh
        return if (response.code == 401 && !accessToken.isNullOrBlank()) {
            response.close()
            handleUnauthorizedResponse(chain, originalRequest)
        } else {
            response
        }
    }

    /**
     * Check if request should skip authentication
     */
    private fun shouldSkipAuth(request: Request): Boolean {
        val url = request.url.toString()
        return NON_AUTH_ENDPOINTS.any { endpoint -> 
            url.contains("/$endpoint")
        }
    }

    /**
     * Handle 401 response by attempting token refresh
     */
    private fun handleUnauthorizedResponse(chain: Interceptor.Chain, originalRequest: Request): Response {
        return runBlocking {
            try {
                val refreshToken = tokenManager.getRefreshToken()
                if (refreshToken.isNullOrBlank()) {
                    // No refresh token available, clear tokens and return 401
                    tokenManager.clearTokens()
                    return@runBlocking chain.proceed(originalRequest)
                }

                // Attempt to refresh token
                val refreshed = attemptTokenRefresh(refreshToken, chain)
                if (refreshed) {
                    // Retry original request with new token
                    val newAccessToken = tokenManager.getAccessToken()
                    val retryRequest = originalRequest.newBuilder()
                        .header(HEADER_AUTHORIZATION, BEARER_PREFIX + newAccessToken)
                        .build()
                    chain.proceed(retryRequest)
                } else {
                    // Refresh failed, clear tokens
                    tokenManager.clearTokens()
                    chain.proceed(originalRequest)
                }
            } catch (e: Exception) {
                Timber.e(e, "Error during token refresh")
                tokenManager.clearTokens()
                chain.proceed(originalRequest)
            }
        }
    }

    /**
     * Attempt to refresh access token
     */
    private suspend fun attemptTokenRefresh(refreshToken: String, chain: Interceptor.Chain): Boolean {
        try {
            // Create refresh token request
            val refreshRequest = Request.Builder()
                .url("${getBaseUrl(chain)}/refresh-token")
                .post(
                    okhttp3.RequestBody.create(
                        okhttp3.MediaType.Companion.parse("application/json"),
                        """{"refreshToken": "$refreshToken"}"""
                    )
                )
                .build()

            // Execute refresh request
            val refreshResponse = chain.proceed(refreshRequest)
            
            if (refreshResponse.isSuccessful) {
                val responseBody = refreshResponse.body?.string()
                responseBody?.let { body ->
                    // Parse refresh response (simplified - use proper JSON parsing in production)
                    val tokenRegex = "\"token\"\\s*:\\s*\"([^\"]+)\"".toRegex()
                    val userIdRegex = "\"id\"\\s*:\\s*(\\d+)".toRegex()
                    val usernameRegex = "\"username\"\\s*:\\s*\"([^\"]+)\"".toRegex()

                    val newToken = tokenRegex.find(body)?.groupValues?.get(1)
                    val userId = userIdRegex.find(body)?.groupValues?.get(1)?.toIntOrNull()
                    val username = usernameRegex.find(body)?.groupValues?.get(1)

                    if (!newToken.isNullOrBlank() && userId != null && !username.isNullOrBlank()) {
                        tokenManager.saveTokenWithAutoExpiry(
                            accessToken = newToken,
                            refreshToken = refreshToken,
                            userId = userId,
                            username = username
                        )
                        return true
                    }
                }
            }
            refreshResponse.close()
            return false
        } catch (e: Exception) {
            Timber.e(e, "Token refresh failed")
            return false
        }
    }

    /**
     * Extract base URL from chain request
     */
    private fun getBaseUrl(chain: Interceptor.Chain): String {
        val url = chain.request().url
        return "${url.scheme}://${url.host}:${url.port}/api"
    }
}

/**
 * Request/Response logging interceptor for debugging
 */
class LoggingInterceptor @Inject constructor() {
    
    fun create(isDebug: Boolean): HttpLoggingInterceptor {
        return HttpLoggingInterceptor { message ->
            Timber.tag("HTTP").d(message)
        }.apply {
            level = if (isDebug) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
    }
}

/**
 * Network timeout and retry interceptor
 */
@Singleton
class NetworkInterceptor @Inject constructor() : Interceptor {
    
    companion object {
        private const val MAX_RETRY_ATTEMPTS = 3
        private const val RETRY_DELAY_MS = 1000L
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        var lastException: Exception? = null
        var attempt = 0

        while (attempt < MAX_RETRY_ATTEMPTS) {
            try {
                val response = chain.proceed(chain.request())
                
                // Return successful response
                if (response.isSuccessful || !shouldRetry(response.code)) {
                    return response
                }
                
                response.close()
                attempt++
                
                if (attempt < MAX_RETRY_ATTEMPTS) {
                    Thread.sleep(RETRY_DELAY_MS * attempt)
                }
                
            } catch (e: Exception) {
                lastException = e
                attempt++
                
                if (attempt < MAX_RETRY_ATTEMPTS && shouldRetryOnException(e)) {
                    Thread.sleep(RETRY_DELAY_MS * attempt)
                    continue
                } else {
                    throw e
                }
            }
        }

        // All retries failed
        throw lastException ?: RuntimeException("Request failed after $MAX_RETRY_ATTEMPTS attempts")
    }

    /**
     * Check if HTTP status code should trigger a retry
     */
    private fun shouldRetry(code: Int): Boolean {
        return when (code) {
            408, // Request Timeout
            429, // Too Many Requests
            500, // Internal Server Error
            502, // Bad Gateway
            503, // Service Unavailable
            504  // Gateway Timeout
            -> true
            else -> false
        }
    }

    /**
     * Check if exception should trigger a retry
     */
    private fun shouldRetryOnException(exception: Exception): Boolean {
        return when (exception) {
            is java.net.SocketTimeoutException,
            is java.net.ConnectException,
            is java.net.UnknownHostException
            -> true
            else -> false
        }
    }
}

/**
 * Request header interceptor for common headers
 */
@Singleton
class HeaderInterceptor @Inject constructor() : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        val requestWithHeaders = originalRequest.newBuilder()
            .header("Accept", "application/json")
            .header("Content-Type", "application/json")
            .header("User-Agent", "DealerVait-Android/1.0")
            .header("X-Platform", "Android")
            .header("Cache-Control", "no-cache")
            .build()

        return chain.proceed(requestWithHeaders)
    }
}
