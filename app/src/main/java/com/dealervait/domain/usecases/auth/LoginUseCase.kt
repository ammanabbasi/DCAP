// File: domain/usecases/auth/LoginUseCase.kt
// Purpose: Business logic for user authentication
// Dependencies: AuthRepository, validation logic

package com.dealervait.domain.usecases.auth

import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.User
import com.dealervait.domain.repository.AuthRepository
import com.dealervait.domain.repository.ValidationResult
import javax.inject.Inject

/**
 * Use case for user login with validation and business logic
 */
class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    /**
     * Execute login with validation
     * @param username User's username
     * @param password User's password  
     * @param rememberMe Whether to remember user session
     * @return NetworkResult with User or error
     */
    suspend operator fun invoke(
        username: String,
        password: String,
        rememberMe: Boolean = false
    ): NetworkResult<User> {
        // Validate credentials format first
        val validation = authRepository.validateCredentials(username.trim(), password)
        if (!validation.isValid) {
            return NetworkResult.Error(
                message = validation.usernameError ?: validation.passwordError ?: "Invalid credentials"
            )
        }

        // Attempt login
        return when (val result = authRepository.login(username.trim(), password)) {
            is NetworkResult.Success -> {
                // Save session if login successful
                authRepository.saveUserSession(result.data, rememberMe)
                result
            }
            else -> result
        }
    }
}

/**
 * Use case for user logout
 */
class LogoutUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    /**
     * Execute logout and clear session
     * @return NetworkResult indicating success or failure
     */
    suspend operator fun invoke(): NetworkResult<Unit> {
        return authRepository.logout()
    }
}

/**
 * Use case for token refresh
 */
class RefreshTokenUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    /**
     * Execute token refresh
     * @return NetworkResult with updated User or error
     */
    suspend operator fun invoke(): NetworkResult<User> {
        return authRepository.refreshToken()
    }
}

/**
 * Use case for validating login credentials
 */
class ValidateLoginInputUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    /**
     * Validate username and password format
     * @param username Username to validate
     * @param password Password to validate
     * @return ValidationResult with any errors
     */
    operator fun invoke(username: String, password: String): ValidationResult {
        return authRepository.validateCredentials(username.trim(), password)
    }
}

/**
 * Use case for checking if user is authenticated
 */
class GetCurrentUserUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    /**
     * Get current authenticated user
     * @return Flow of current user (null if not authenticated)
     */
    fun invoke() = authRepository.getCurrentUser()
}

/**
 * Use case for biometric authentication setup
 */
class BiometricAuthUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    /**
     * Check if biometric authentication is enabled
     */
    suspend fun isEnabled(): Boolean {
        return authRepository.isBiometricEnabled()
    }

    /**
     * Enable or disable biometric authentication
     * @param enabled Whether to enable biometric auth
     */
    suspend fun setEnabled(enabled: Boolean) {
        authRepository.setBiometricEnabled(enabled)
    }
}
