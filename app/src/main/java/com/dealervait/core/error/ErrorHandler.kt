// File: core/error/ErrorHandler.kt
// Purpose: Comprehensive error handling for API and network errors
// Dependencies: Retrofit, NetworkResult

package com.dealervait.core.error

import android.content.Context
import com.dealervait.R
import com.squareup.moshi.JsonDataException
import com.squareup.moshi.Moshi
import dagger.hilt.android.qualifiers.ApplicationContext
import retrofit2.HttpException
import retrofit2.Response
import timber.log.Timber
import java.io.IOException
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Centralized error handling for all API calls and network operations
 */
@Singleton
class ErrorHandler @Inject constructor(
    @ApplicationContext private val context: Context,
    private val moshi: Moshi
) {

    /**
     * Convert throwable to user-friendly NetworkResult.Error
     */
    fun <T> handleError(throwable: Throwable): NetworkResult<T> {
        Timber.e(throwable, "API Error occurred")

        return when (throwable) {
            is HttpException -> handleHttpError(throwable)
            is SocketTimeoutException -> NetworkResult.NetworkError(
                message = context.getString(R.string.error_timeout),
                exception = throwable
            )
            is ConnectException -> NetworkResult.NetworkError(
                message = context.getString(R.string.error_connection),
                exception = throwable
            )
            is UnknownHostException -> NetworkResult.NetworkError(
                message = context.getString(R.string.error_no_internet),
                exception = throwable
            )
            is IOException -> NetworkResult.NetworkError(
                message = context.getString(R.string.error_network_generic),
                exception = throwable
            )
            is JsonDataException -> NetworkResult.Error(
                message = context.getString(R.string.error_data_parsing),
                exception = throwable
            )
            else -> NetworkResult.Error(
                message = throwable.message ?: context.getString(R.string.error_unknown),
                exception = throwable
            )
        }
    }

    /**
     * Handle HTTP exceptions with specific status codes
     */
    private fun <T> handleHttpError(httpException: HttpException): NetworkResult<T> {
        val errorCode = httpException.code()
        val errorBody = httpException.response()?.errorBody()?.string()

        val errorMessage = when (errorCode) {
            400 -> parseErrorMessage(errorBody) ?: context.getString(R.string.error_bad_request)
            401 -> context.getString(R.string.error_unauthorized)
            403 -> context.getString(R.string.error_forbidden)
            404 -> context.getString(R.string.error_not_found)
            408 -> context.getString(R.string.error_timeout)
            422 -> parseErrorMessage(errorBody) ?: context.getString(R.string.error_validation)
            429 -> context.getString(R.string.error_rate_limit)
            500, 502, 503, 504 -> context.getString(R.string.error_server)
            else -> parseErrorMessage(errorBody) ?: context.getString(R.string.error_unknown)
        }

        return NetworkResult.Error(
            message = errorMessage,
            code = errorCode,
            exception = httpException
        )
    }

    /**
     * Parse error message from API response body
     */
    private fun parseErrorMessage(errorBody: String?): String? {
        return try {
            if (errorBody.isNullOrBlank()) return null
            
            // Try to parse as API error response
            val errorResponse = moshi.adapter(ApiErrorResponse::class.java).fromJson(errorBody)
            errorResponse?.message ?: errorResponse?.error
            
        } catch (e: Exception) {
            // If parsing fails, try to extract message from plain JSON
            try {
                val messageRegex = "\"message\"\\s*:\\s*\"([^\"]+)\"".toRegex()
                val errorRegex = "\"error\"\\s*:\\s*\"([^\"]+)\"".toRegex()
                
                messageRegex.find(errorBody ?: "")?.groupValues?.get(1)
                    ?: errorRegex.find(errorBody ?: "")?.groupValues?.get(1)
            } catch (ex: Exception) {
                null
            }
        }
    }

    /**
     * Safe API call wrapper that returns NetworkResult
     */
    suspend fun <T> safeApiCall(apiCall: suspend () -> Response<T>): NetworkResult<T> {
        return try {
            NetworkResult.Loading
            val response = apiCall()
            
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    NetworkResult.Success(body)
                } else {
                    NetworkResult.Error(
                        message = context.getString(R.string.error_empty_response),
                        code = response.code()
                    )
                }
            } else {
                handleHttpError(HttpException(response))
            }
        } catch (e: Exception) {
            handleError(e)
        }
    }

    /**
     * Check if error is network related (vs API error)
     */
    fun isNetworkError(error: NetworkResult<*>): Boolean {
        return error is NetworkResult.NetworkError
    }

    /**
     * Check if error is authentication related
     */
    fun isAuthError(error: NetworkResult<*>): Boolean {
        return when (error) {
            is NetworkResult.Error -> error.code == 401 || error.code == 403
            else -> false
        }
    }

    /**
     * Get user-friendly error message for UI display
     */
    fun getUserMessage(error: NetworkResult<*>): String {
        return when (error) {
            is NetworkResult.Error -> error.message
            is NetworkResult.NetworkError -> error.message
            else -> context.getString(R.string.error_unknown)
        }
    }

    /**
     * Check if error should trigger retry
     */
    fun shouldRetry(error: NetworkResult<*>): Boolean {
        return when (error) {
            is NetworkResult.NetworkError -> true
            is NetworkResult.Error -> error.code in listOf(408, 429, 500, 502, 503, 504)
            else -> false
        }
    }
}

/**
 * Standard API error response format
 */
data class ApiErrorResponse(
    val error: String? = null,
    val message: String? = null,
    val statusCode: Int? = null,
    val timestamp: String? = null,
    val path: String? = null
)
