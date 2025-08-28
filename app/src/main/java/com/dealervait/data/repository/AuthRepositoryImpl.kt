// File: data/repository/AuthRepositoryImpl.kt
// Purpose: Authentication repository implementation with API and local storage
// Dependencies: API service, TokenManager, local storage, mappers

package com.dealervait.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import com.dealervait.R
import com.dealervait.core.error.ErrorHandler
import com.dealervait.core.error.NetworkResult
import com.dealervait.core.storage.TokenManager
import com.dealervait.data.api.DealersCloudApiService
import com.dealervait.data.local.dao.UserDao
import com.dealervait.data.mappers.toEntity
import com.dealervait.data.mappers.toUser
import com.dealervait.data.models.request.LoginRequest
import com.dealervait.domain.model.User
import com.dealervait.domain.repository.AuthRepository
import com.dealervait.domain.repository.ValidationResult
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

// DataStore extension
private val Context.userPreferencesDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "user_preferences"
)

/**
 * Implementation of AuthRepository using API service and local storage
 */
@Singleton
class AuthRepositoryImpl @Inject constructor(
    @ApplicationContext private val context: Context,
    private val apiService: DealersCloudApiService,
    private val tokenManager: TokenManager,
    private val userDao: UserDao,
    private val errorHandler: ErrorHandler
) : AuthRepository {

    private val userPreferences = context.userPreferencesDataStore

    companion object {
        private val REMEMBER_ME_KEY = booleanPreferencesKey("remember_me")
        private val BIOMETRIC_ENABLED_KEY = booleanPreferencesKey("biometric_enabled")
    }

    /**
     * Authenticate user with API and save session
     */
    override suspend fun login(username: String, password: String): NetworkResult<User> {
        return try {
            val loginRequest = LoginRequest(username, password)
            val response = apiService.login(loginRequest)

            if (response.isSuccessful) {
                val loginResponse = response.body()
                if (loginResponse != null) {
                    // Save tokens
                    tokenManager.saveTokenWithAutoExpiry(
                        accessToken = loginResponse.token,
                        refreshToken = null, // API doesn't provide refresh token
                        userId = loginResponse.id,
                        username = loginResponse.username,
                        dealershipId = loginResponse.dealershipId
                    )

                    // Convert to domain model
                    val user = loginResponse.toUser()

                    // Save to local database
                    userDao.insertUser(user.toEntity())

                    NetworkResult.Success(user)
                } else {
                    NetworkResult.Error(context.getString(R.string.error_empty_response))
                }
            } else {
                errorHandler.handleError(retrofit2.HttpException(response))
            }
        } catch (e: Exception) {
            Timber.e(e, "Login failed")
            errorHandler.handleError(e)
        }
    }

    /**
     * Logout user and clear all session data
     */
    override suspend fun logout(): NetworkResult<Unit> {
        return try {
            // Call logout API (optional - API might not have this endpoint)
            try {
                apiService.logout()
            } catch (e: Exception) {
                // Logout API call failed, but continue with local cleanup
                Timber.w(e, "Logout API call failed, continuing with local cleanup")
            }

            // Clear tokens and user data
            tokenManager.clearTokens()
            userDao.deleteAllUsers()

            // Clear preferences except biometric setting
            userPreferences.edit { preferences ->
                preferences.remove(REMEMBER_ME_KEY)
            }

            NetworkResult.Success(Unit)
        } catch (e: Exception) {
            Timber.e(e, "Logout failed")
            errorHandler.handleError(e)
        }
    }

    /**
     * Refresh authentication token
     */
    override suspend fun refreshToken(): NetworkResult<User> {
        return try {
            val refreshToken = tokenManager.getRefreshToken()
            if (refreshToken.isNullOrBlank()) {
                return NetworkResult.Error("No refresh token available")
            }

            val response = apiService.refreshToken(mapOf("refreshToken" to refreshToken))

            if (response.isSuccessful) {
                val loginResponse = response.body()
                if (loginResponse != null) {
                    // Update tokens
                    tokenManager.updateAccessToken(loginResponse.token)

                    // Convert to domain model
                    val user = loginResponse.toUser()

                    // Update local database
                    userDao.insertUser(user.toEntity())

                    NetworkResult.Success(user)
                } else {
                    NetworkResult.Error(context.getString(R.string.error_empty_response))
                }
            } else {
                errorHandler.handleError(retrofit2.HttpException(response))
            }
        } catch (e: Exception) {
            Timber.e(e, "Token refresh failed")
            errorHandler.handleError(e)
        }
    }

    /**
     * Get current authenticated user from local storage
     */
    override fun getCurrentUser(): Flow<User?> {
        return combine(
            tokenManager.isLoggedIn,
            userPreferences.data.map { it[REMEMBER_ME_KEY] ?: false }
        ) { isLoggedIn, rememberMe ->
            if (isLoggedIn || rememberMe) {
                val userId = tokenManager.getUserId()
                if (userId > 0) {
                    userDao.getUserById(userId)?.toUser()
                } else null
            } else null
        }.catch { exception ->
            Timber.e(exception, "Error getting current user")
            emit(null)
        }
    }

    /**
     * Check if user is authenticated
     */
    override fun isAuthenticated(): Flow<Boolean> {
        return combine(
            tokenManager.isLoggedIn,
            userPreferences.data.map { it[REMEMBER_ME_KEY] ?: false }
        ) { isLoggedIn, rememberMe ->
            isLoggedIn && (rememberMe || tokenManager.hasValidToken())
        }.catch { exception ->
            Timber.e(exception, "Error checking authentication status")
            emit(false)
        }
    }

    /**
     * Save user session with remember me preference
     */
    override suspend fun saveUserSession(user: User, rememberMe: Boolean) {
        try {
            // Save user to database
            userDao.insertUser(user.toEntity())

            // Save remember me preference
            userPreferences.edit { preferences ->
                preferences[REMEMBER_ME_KEY] = rememberMe
            }
        } catch (e: Exception) {
            Timber.e(e, "Failed to save user session")
            throw e
        }
    }

    /**
     * Check if biometric authentication is enabled
     */
    override suspend fun isBiometricEnabled(): Boolean {
        return try {
            userPreferences.data.map { preferences ->
                preferences[BIOMETRIC_ENABLED_KEY] ?: false
            }.catch { false }.first()
        } catch (e: Exception) {
            Timber.e(e, "Error checking biometric setting")
            false
        }
    }

    /**
     * Enable/disable biometric authentication
     */
    override suspend fun setBiometricEnabled(enabled: Boolean) {
        try {
            userPreferences.edit { preferences ->
                preferences[BIOMETRIC_ENABLED_KEY] = enabled
            }
        } catch (e: Exception) {
            Timber.e(e, "Error setting biometric preference")
            throw e
        }
    }

    /**
     * Validate login credentials format
     */
    override fun validateCredentials(username: String, password: String): ValidationResult {
        val usernameError = when {
            username.isBlank() -> context.getString(R.string.field_required)
            username.length < 3 -> "Username must be at least 3 characters"
            else -> null
        }

        val passwordError = when {
            password.isBlank() -> context.getString(R.string.field_required)
            password.length < 6 -> "Password must be at least 6 characters"
            else -> null
        }

        return ValidationResult(
            isValid = usernameError == null && passwordError == null,
            usernameError = usernameError,
            passwordError = passwordError
        )
    }
}
