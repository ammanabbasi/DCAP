// File: core/storage/TokenManager.kt
// Purpose: Secure token management with automatic refresh and persistence
// Dependencies: EncryptedSharedPreferences, Coroutines

package com.dealervait.core.storage

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Secure token management for authentication tokens
 * Handles storage, retrieval, refresh, and expiration checking
 */
@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val PREFS_NAME = "dealervait_secure_prefs"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token" 
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USERNAME = "username"
        private const val KEY_DEALERSHIP_ID = "dealership_id"
        private const val KEY_TOKEN_EXPIRES_AT = "token_expires_at"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        
        // Token expiry buffer - refresh 5 minutes before expiry
        private const val TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000L
    }

    private val mutex = Mutex()
    
    // Encrypted SharedPreferences for secure storage
    private val encryptedPrefs by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    // Authentication state flow
    private val _isLoggedIn = MutableStateFlow(checkLoginStatus())
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    /**
     * Check if user is currently logged in
     */
    private fun checkLoginStatus(): Boolean {
        return encryptedPrefs.getBoolean(KEY_IS_LOGGED_IN, false) && hasValidToken()
    }

    /**
     * Save authentication tokens and user data
     */
    suspend fun saveTokens(
        accessToken: String,
        refreshToken: String? = null,
        userId: Int,
        username: String,
        dealershipId: Int? = null,
        expiresInSeconds: Long? = null
    ) = mutex.withLock {
        val expiresAt = expiresInSeconds?.let { 
            System.currentTimeMillis() + (it * 1000L) 
        }

        with(encryptedPrefs.edit()) {
            putString(KEY_ACCESS_TOKEN, accessToken)
            refreshToken?.let { putString(KEY_REFRESH_TOKEN, it) }
            putInt(KEY_USER_ID, userId)
            putString(KEY_USERNAME, username)
            dealershipId?.let { putInt(KEY_DEALERSHIP_ID, it) }
            expiresAt?.let { putLong(KEY_TOKEN_EXPIRES_AT, it) }
            putBoolean(KEY_IS_LOGGED_IN, true)
            apply()
        }
        
        _isLoggedIn.value = true
    }

    /**
     * Get access token if available and valid
     */
    suspend fun getAccessToken(): String? = mutex.withLock {
        if (!hasValidToken()) return null
        return encryptedPrefs.getString(KEY_ACCESS_TOKEN, null)
    }

    /**
     * Get refresh token
     */
    suspend fun getRefreshToken(): String? = mutex.withLock {
        return encryptedPrefs.getString(KEY_REFRESH_TOKEN, null)
    }

    /**
     * Get current user ID
     */
    fun getUserId(): Int {
        return encryptedPrefs.getInt(KEY_USER_ID, -1)
    }

    /**
     * Get current username
     */
    fun getUsername(): String? {
        return encryptedPrefs.getString(KEY_USERNAME, null)
    }

    /**
     * Get current dealership ID
     */
    fun getDealershipId(): Int {
        return encryptedPrefs.getInt(KEY_DEALERSHIP_ID, -1)
    }

    /**
     * Check if current token is valid and not expired
     */
    fun hasValidToken(): Boolean {
        val accessToken = encryptedPrefs.getString(KEY_ACCESS_TOKEN, null)
        if (accessToken.isNullOrBlank()) return false

        val expiresAt = encryptedPrefs.getLong(KEY_TOKEN_EXPIRES_AT, 0)
        if (expiresAt > 0) {
            return System.currentTimeMillis() < (expiresAt - TOKEN_REFRESH_BUFFER_MS)
        }

        // If no expiry time is stored, assume token is valid (handle in interceptor)
        return true
    }

    /**
     * Check if token needs refresh soon
     */
    fun shouldRefreshToken(): Boolean {
        val expiresAt = encryptedPrefs.getLong(KEY_TOKEN_EXPIRES_AT, 0)
        if (expiresAt <= 0) return false

        return System.currentTimeMillis() >= (expiresAt - TOKEN_REFRESH_BUFFER_MS)
    }

    /**
     * Update access token after refresh
     */
    suspend fun updateAccessToken(
        newAccessToken: String, 
        expiresInSeconds: Long? = null
    ) = mutex.withLock {
        val expiresAt = expiresInSeconds?.let { 
            System.currentTimeMillis() + (it * 1000L) 
        }

        with(encryptedPrefs.edit()) {
            putString(KEY_ACCESS_TOKEN, newAccessToken)
            expiresAt?.let { putLong(KEY_TOKEN_EXPIRES_AT, it) }
            apply()
        }
    }

    /**
     * Clear all tokens and logout user
     */
    suspend fun clearTokens() = mutex.withLock {
        with(encryptedPrefs.edit()) {
            remove(KEY_ACCESS_TOKEN)
            remove(KEY_REFRESH_TOKEN)
            remove(KEY_USER_ID)
            remove(KEY_USERNAME)
            remove(KEY_DEALERSHIP_ID)
            remove(KEY_TOKEN_EXPIRES_AT)
            putBoolean(KEY_IS_LOGGED_IN, false)
            apply()
        }
        
        _isLoggedIn.value = false
    }

    /**
     * Get user authentication state
     */
    data class AuthState(
        val isLoggedIn: Boolean,
        val userId: Int,
        val username: String?,
        val dealershipId: Int,
        val hasValidToken: Boolean
    )

    /**
     * Get current authentication state
     */
    fun getAuthState(): AuthState {
        return AuthState(
            isLoggedIn = _isLoggedIn.value,
            userId = getUserId(),
            username = getUsername(),
            dealershipId = getDealershipId(),
            hasValidToken = hasValidToken()
        )
    }

    /**
     * Parse JWT token to extract expiry time (basic implementation)
     * Note: This is a simplified version. In production, use a proper JWT library
     */
    private fun parseTokenExpiry(token: String): Long? {
        try {
            val parts = token.split(".")
            if (parts.size != 3) return null

            val payload = String(Base64.getUrlDecoder().decode(parts[1]))
            // This is a simplified approach - in production use proper JSON parsing
            val expRegex = "\"exp\":(\\d+)".toRegex()
            val matchResult = expRegex.find(payload)
            
            return matchResult?.groupValues?.get(1)?.toLongOrNull()?.let { exp ->
                exp * 1000L // Convert to milliseconds
            }
        } catch (e: Exception) {
            return null
        }
    }

    /**
     * Extract expiry from token and save with current time reference
     */
    suspend fun saveTokenWithAutoExpiry(
        accessToken: String,
        refreshToken: String? = null,
        userId: Int,
        username: String,
        dealershipId: Int? = null
    ) {
        val expiryTime = parseTokenExpiry(accessToken)
        val expiresInSeconds = expiryTime?.let { (it - System.currentTimeMillis()) / 1000L }
        
        saveTokens(
            accessToken = accessToken,
            refreshToken = refreshToken,
            userId = userId,
            username = username,
            dealershipId = dealershipId,
            expiresInSeconds = expiresInSeconds
        )
    }
}
