// File: domain/repository/AuthRepository.kt
// Purpose: Authentication repository interface for domain layer
// Dependencies: NetworkResult, User domain model

package com.dealervait.domain.repository

import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.User
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for authentication operations
 * Defines the contract for authentication-related data operations
 */
interface AuthRepository {

    /**
     * Authenticate user with username and password
     * @param username User's username
     * @param password User's password
     * @return NetworkResult containing User data or error
     */
    suspend fun login(username: String, password: String): NetworkResult<User>

    /**
     * Logout current user and clear all session data
     * @return NetworkResult indicating success or failure
     */
    suspend fun logout(): NetworkResult<Unit>

    /**
     * Refresh authentication token
     * @return NetworkResult containing updated User data or error
     */
    suspend fun refreshToken(): NetworkResult<User>

    /**
     * Get current authenticated user
     * @return Flow of current user state (null if not authenticated)
     */
    fun getCurrentUser(): Flow<User?>

    /**
     * Check if user is currently authenticated
     * @return Flow of authentication state
     */
    fun isAuthenticated(): Flow<Boolean>

    /**
     * Save user session with remember me option
     * @param user User data to save
     * @param rememberMe Whether to persist session across app restarts
     */
    suspend fun saveUserSession(user: User, rememberMe: Boolean)

    /**
     * Check if biometric authentication is enabled
     * @return Whether biometric auth is enabled for current user
     */
    suspend fun isBiometricEnabled(): Boolean

    /**
     * Enable/disable biometric authentication
     * @param enabled Whether to enable biometric auth
     */
    suspend fun setBiometricEnabled(enabled: Boolean)

    /**
     * Validate user credentials format
     * @param username Username to validate
     * @param password Password to validate
     * @return ValidationResult with any errors
     */
    fun validateCredentials(username: String, password: String): ValidationResult
}

/**
 * Result of credential validation
 */
data class ValidationResult(
    val isValid: Boolean,
    val usernameError: String? = null,
    val passwordError: String? = null
)
