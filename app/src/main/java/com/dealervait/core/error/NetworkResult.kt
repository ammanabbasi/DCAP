// File: core/error/NetworkResult.kt
// Purpose: Sealed class for handling network responses and error states
// Dependencies: None

package com.dealervait.core.error

/**
 * Sealed class representing the result of a network operation
 */
sealed class NetworkResult<out T> {
    /**
     * Successful response with data
     */
    data class Success<out T>(val data: T) : NetworkResult<T>()

    /**
     * Error response with message and optional code
     */
    data class Error(
        val message: String,
        val code: Int? = null,
        val exception: Throwable? = null
    ) : NetworkResult<Nothing>()

    /**
     * Loading state
     */
    object Loading : NetworkResult<Nothing>()

    /**
     * Network connectivity error
     */
    data class NetworkError(
        val message: String = "Please check your internet connection",
        val exception: Throwable? = null
    ) : NetworkResult<Nothing>()
}

/**
 * Extensions for NetworkResult
 */

/**
 * Check if result is successful
 */
fun <T> NetworkResult<T>.isSuccess(): Boolean = this is NetworkResult.Success

/**
 * Check if result is error
 */
fun <T> NetworkResult<T>.isError(): Boolean = this is NetworkResult.Error || this is NetworkResult.NetworkError

/**
 * Check if result is loading
 */
fun <T> NetworkResult<T>.isLoading(): Boolean = this is NetworkResult.Loading

/**
 * Get data if successful, null otherwise
 */
fun <T> NetworkResult<T>.getDataOrNull(): T? = when (this) {
    is NetworkResult.Success -> data
    else -> null
}

/**
 * Get error message if error, null otherwise
 */
fun <T> NetworkResult<T>.getErrorMessage(): String? = when (this) {
    is NetworkResult.Error -> message
    is NetworkResult.NetworkError -> message
    else -> null
}

/**
 * Execute block if successful
 */
inline fun <T> NetworkResult<T>.onSuccess(block: (T) -> Unit): NetworkResult<T> {
    if (this is NetworkResult.Success) {
        block(data)
    }
    return this
}

/**
 * Execute block if error
 */
inline fun <T> NetworkResult<T>.onError(block: (String, Int?, Throwable?) -> Unit): NetworkResult<T> {
    when (this) {
        is NetworkResult.Error -> block(message, code, exception)
        is NetworkResult.NetworkError -> block(message, null, exception)
        else -> { /* No-op */ }
    }
    return this
}

/**
 * Execute block if loading
 */
inline fun <T> NetworkResult<T>.onLoading(block: () -> Unit): NetworkResult<T> {
    if (this is NetworkResult.Loading) {
        block()
    }
    return this
}

/**
 * Map success data to another type
 */
inline fun <T, R> NetworkResult<T>.map(transform: (T) -> R): NetworkResult<R> {
    return when (this) {
        is NetworkResult.Success -> NetworkResult.Success(transform(data))
        is NetworkResult.Error -> NetworkResult.Error(message, code, exception)
        is NetworkResult.NetworkError -> NetworkResult.NetworkError(message, exception)
        is NetworkResult.Loading -> NetworkResult.Loading
    }
}
