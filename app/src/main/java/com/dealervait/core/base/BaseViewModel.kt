// File: core/base/BaseViewModel.kt
// Purpose: Base ViewModel with common functionality and error handling
// Dependencies: ViewModel, Coroutines, StateFlow

package com.dealervait.core.base

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dealervait.core.error.ErrorHandler
import com.dealervait.core.error.NetworkResult
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * Base ViewModel providing common functionality for all ViewModels
 * Includes error handling, loading states, and coroutine management
 */
abstract class BaseViewModel : ViewModel() {

    @Inject
    protected lateinit var errorHandler: ErrorHandler

    // Loading state
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    // Error state
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // Network connectivity state
    private val _isNetworkAvailable = MutableStateFlow(true)
    val isNetworkAvailable: StateFlow<Boolean> = _isNetworkAvailable.asStateFlow()

    // Global exception handler for coroutines
    private val exceptionHandler = CoroutineExceptionHandler { _, throwable ->
        Timber.e(throwable, "Unhandled exception in ViewModel")
        handleError(throwable)
    }

    /**
     * Execute a suspend function with error handling and loading state
     */
    protected fun <T> executeWithLoading(
        onStart: (() -> Unit)? = null,
        onComplete: (() -> Unit)? = null,
        onSuccess: (T) -> Unit,
        onError: ((String) -> Unit)? = null,
        apiCall: suspend () -> NetworkResult<T>
    ) {
        viewModelScope.launch(exceptionHandler) {
            try {
                _isLoading.value = true
                clearError()
                onStart?.invoke()

                when (val result = apiCall()) {
                    is NetworkResult.Success -> {
                        onSuccess(result.data)
                    }
                    is NetworkResult.Error -> {
                        val errorMessage = result.message
                        _error.value = errorMessage
                        onError?.invoke(errorMessage) ?: handleApiError(result)
                    }
                    is NetworkResult.NetworkError -> {
                        val errorMessage = result.message
                        _error.value = errorMessage
                        _isNetworkAvailable.value = false
                        onError?.invoke(errorMessage)
                    }
                    is NetworkResult.Loading -> {
                        // Loading state already set
                    }
                }
            } catch (e: Exception) {
                handleError(e)
            } finally {
                _isLoading.value = false
                onComplete?.invoke()
            }
        }
    }

    /**
     * Execute a suspend function without loading state management
     */
    protected fun executeAsync(
        onError: ((String) -> Unit)? = null,
        block: suspend () -> Unit
    ) {
        viewModelScope.launch(exceptionHandler) {
            try {
                block()
            } catch (e: Exception) {
                val errorMessage = errorHandler.getUserMessage(errorHandler.handleError<Any>(e))
                onError?.invoke(errorMessage) ?: run {
                    _error.value = errorMessage
                }
            }
        }
    }

    /**
     * Handle throwable errors
     */
    private fun handleError(throwable: Throwable) {
        val errorResult = errorHandler.handleError<Any>(throwable)
        val errorMessage = errorHandler.getUserMessage(errorResult)
        
        _error.value = errorMessage
        _isLoading.value = false
        
        // Set network availability based on error type
        if (errorHandler.isNetworkError(errorResult)) {
            _isNetworkAvailable.value = false
        }
    }

    /**
     * Handle API errors with specific logic
     */
    private fun handleApiError(error: NetworkResult.Error) {
        // Check if it's an authentication error
        if (errorHandler.isAuthError(error)) {
            // Handle auth error (e.g., navigate to login)
            onAuthenticationError()
        }
        
        // Check if error should trigger retry
        if (errorHandler.shouldRetry(error)) {
            // Could implement automatic retry logic here
            onRetryableError(error)
        }
    }

    /**
     * Called when authentication error occurs
     * Override in subclasses to handle auth errors
     */
    protected open fun onAuthenticationError() {
        // Default implementation - subclasses can override
        Timber.w("Authentication error occurred")
    }

    /**
     * Called when retryable error occurs
     * Override in subclasses to handle retryable errors
     */
    protected open fun onRetryableError(error: NetworkResult.Error) {
        // Default implementation - subclasses can override
        Timber.w("Retryable error occurred: ${error.message}")
    }

    /**
     * Clear current error state
     */
    fun clearError() {
        _error.value = null
    }

    /**
     * Set loading state manually
     */
    protected fun setLoading(loading: Boolean) {
        _isLoading.value = loading
    }

    /**
     * Set network availability state
     */
    fun setNetworkAvailable(available: Boolean) {
        _isNetworkAvailable.value = available
        if (available) {
            // Clear network-related errors when connectivity is restored
            clearError()
        }
    }

    /**
     * Get current loading state
     */
    protected fun isCurrentlyLoading(): Boolean = _isLoading.value

    /**
     * Get current error state
     */
    protected fun getCurrentError(): String? = _error.value

    /**
     * Check if there's currently an error
     */
    protected fun hasError(): Boolean = _error.value != null

    /**
     * Set error manually
     */
    protected fun setError(message: String) {
        _error.value = message
    }

    /**
     * Retry last operation - override in subclasses
     */
    open fun retry() {
        // Default implementation - subclasses should override
        clearError()
    }

    /**
     * Refresh data - override in subclasses  
     */
    open fun refresh() {
        // Default implementation - subclasses should override
        clearError()
    }

    override fun onCleared() {
        super.onCleared()
        // Clean up any resources if needed
        Timber.d("${this::class.simpleName} cleared")
    }
}
