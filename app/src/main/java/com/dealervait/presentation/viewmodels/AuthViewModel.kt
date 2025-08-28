// File: presentation/viewmodels/AuthViewModel.kt
// Purpose: ViewModel for authentication screens with complete state management
// Dependencies: Use cases, BaseViewModel, StateFlow

package com.dealervait.presentation.viewmodels

import androidx.lifecycle.viewModelScope
import com.dealervait.core.base.BaseViewModel
import com.dealervait.domain.model.User
import com.dealervait.domain.repository.ValidationResult
import com.dealervait.domain.usecases.auth.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for authentication flow
 * Handles login, logout, validation, and biometric authentication
 */
@HiltViewModel
class AuthViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val logoutUseCase: LogoutUseCase,
    private val validateLoginInputUseCase: ValidateLoginInputUseCase,
    private val getCurrentUserUseCase: GetCurrentUserUseCase,
    private val biometricAuthUseCase: BiometricAuthUseCase
) : BaseViewModel() {

    // UI State for login form
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    // Current authenticated user
    val currentUser: StateFlow<User?> = getCurrentUserUseCase.invoke()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    // Authentication status
    val isAuthenticated: StateFlow<Boolean> = currentUser
        .map { it != null }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = false
        )

    init {
        // Check biometric availability on initialization
        checkBiometricAvailability()
    }

    /**
     * Update username input and validate in real-time
     */
    fun updateUsername(username: String) {
        _uiState.value = _uiState.value.copy(username = username)
        validateInput()
    }

    /**
     * Update password input and validate in real-time
     */
    fun updatePassword(password: String) {
        _uiState.value = _uiState.value.copy(password = password)
        validateInput()
    }

    /**
     * Toggle remember me option
     */
    fun toggleRememberMe() {
        _uiState.value = _uiState.value.copy(rememberMe = !_uiState.value.rememberMe)
    }

    /**
     * Toggle password visibility
     */
    fun togglePasswordVisibility() {
        _uiState.value = _uiState.value.copy(passwordVisible = !_uiState.value.passwordVisible)
    }

    /**
     * Attempt login with current credentials
     */
    fun login() {
        val state = _uiState.value
        if (!state.isFormValid) {
            return
        }

        executeWithLoading(
            onStart = {
                _uiState.value = _uiState.value.copy(isLoginInProgress = true)
            },
            onComplete = {
                _uiState.value = _uiState.value.copy(isLoginInProgress = false)
            },
            onSuccess = { user: User ->
                _uiState.value = _uiState.value.copy(
                    loginSuccess = true,
                    isLoginInProgress = false
                )
                Timber.i("Login successful for user: ${user.username}")
            },
            onError = { errorMessage ->
                _uiState.value = _uiState.value.copy(
                    loginError = errorMessage,
                    isLoginInProgress = false
                )
            }
        ) {
            loginUseCase(
                username = state.username,
                password = state.password,
                rememberMe = state.rememberMe
            )
        }
    }

    /**
     * Attempt biometric login
     */
    fun loginWithBiometrics() {
        viewModelScope.launch {
            try {
                val isBiometricEnabled = biometricAuthUseCase.isEnabled()
                if (!isBiometricEnabled) {
                    _uiState.value = _uiState.value.copy(
                        loginError = "Biometric authentication is not enabled"
                    )
                    return@launch
                }

                // Biometric authentication would be handled by the UI layer
                // This just checks if it's available
                _uiState.value = _uiState.value.copy(
                    shouldShowBiometricPrompt = true
                )
            } catch (e: Exception) {
                Timber.e(e, "Biometric login check failed")
                _uiState.value = _uiState.value.copy(
                    loginError = "Biometric authentication not available"
                )
            }
        }
    }

    /**
     * Handle successful biometric authentication
     */
    fun onBiometricSuccess() {
        _uiState.value = _uiState.value.copy(
            loginSuccess = true,
            shouldShowBiometricPrompt = false
        )
    }

    /**
     * Handle biometric authentication failure
     */
    fun onBiometricFailure(error: String) {
        _uiState.value = _uiState.value.copy(
            loginError = error,
            shouldShowBiometricPrompt = false
        )
    }

    /**
     * Logout current user
     */
    fun logout() {
        executeWithLoading(
            onSuccess = {
                _uiState.value = AuthUiState() // Reset to initial state
                Timber.i("Logout successful")
            },
            onError = { errorMessage ->
                Timber.e("Logout failed: $errorMessage")
                // Even if logout API fails, clear local state
                _uiState.value = AuthUiState()
            }
        ) {
            logoutUseCase()
        }
    }

    /**
     * Clear login error message
     */
    fun clearLoginError() {
        _uiState.value = _uiState.value.copy(loginError = null)
    }

    /**
     * Clear login success flag
     */
    fun clearLoginSuccess() {
        _uiState.value = _uiState.value.copy(loginSuccess = false)
    }

    /**
     * Enable/disable biometric authentication
     */
    fun setBiometricEnabled(enabled: Boolean) {
        viewModelScope.launch {
            try {
                biometricAuthUseCase.setEnabled(enabled)
                _uiState.value = _uiState.value.copy(isBiometricEnabled = enabled)
            } catch (e: Exception) {
                Timber.e(e, "Failed to set biometric preference")
            }
        }
    }

    /**
     * Validate input fields in real-time
     */
    private fun validateInput() {
        val state = _uiState.value
        val validation = validateLoginInputUseCase(state.username, state.password)
        
        _uiState.value = state.copy(
            usernameError = validation.usernameError,
            passwordError = validation.passwordError,
            isFormValid = validation.isValid
        )
    }

    /**
     * Check biometric availability
     */
    private fun checkBiometricAvailability() {
        viewModelScope.launch {
            try {
                val isEnabled = biometricAuthUseCase.isEnabled()
                _uiState.value = _uiState.value.copy(
                    isBiometricEnabled = isEnabled,
                    isBiometricAvailable = true // Would check hardware availability
                )
            } catch (e: Exception) {
                Timber.e(e, "Error checking biometric availability")
                _uiState.value = _uiState.value.copy(
                    isBiometricAvailable = false
                )
            }
        }
    }

    /**
     * Handle forgotten password
     */
    fun onForgotPassword() {
        // Navigate to forgot password screen
        _uiState.value = _uiState.value.copy(
            shouldNavigateToForgotPassword = true
        )
    }

    /**
     * Clear navigation flags
     */
    fun clearNavigationFlags() {
        _uiState.value = _uiState.value.copy(
            shouldNavigateToForgotPassword = false,
            shouldShowBiometricPrompt = false
        )
    }
}

/**
 * UI state for authentication screens
 */
data class AuthUiState(
    // Form fields
    val username: String = "",
    val password: String = "",
    val rememberMe: Boolean = false,
    val passwordVisible: Boolean = false,

    // Validation
    val usernameError: String? = null,
    val passwordError: String? = null,
    val isFormValid: Boolean = false,

    // Loading states
    val isLoginInProgress: Boolean = false,

    // Success/Error states
    val loginSuccess: Boolean = false,
    val loginError: String? = null,

    // Biometric authentication
    val isBiometricAvailable: Boolean = false,
    val isBiometricEnabled: Boolean = false,
    val shouldShowBiometricPrompt: Boolean = false,

    // Navigation
    val shouldNavigateToForgotPassword: Boolean = false
)
