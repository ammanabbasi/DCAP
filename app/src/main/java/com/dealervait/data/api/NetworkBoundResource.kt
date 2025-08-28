// File: data/api/NetworkBoundResource.kt
// Purpose: Smart caching strategy for network and local data coordination
// Dependencies: Room, Coroutines, NetworkResult

package com.dealervait.data.api

import com.dealervait.core.error.ErrorHandler
import com.dealervait.core.error.NetworkResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import timber.log.Timber
import javax.inject.Inject

/**
 * A generic class that coordinates fetching data from network and local storage
 * It implements the single source of truth pattern:
 * - Fetch data from local storage first
 * - If data is fresh enough, return cached data
 * - If data is stale or doesn't exist, fetch from network
 * - Save network result to local storage
 * - Return updated local data
 */
abstract class NetworkBoundResource<ResultType, RequestType> @Inject constructor(
    private val errorHandler: ErrorHandler
) {

    /**
     * Execute the network bound resource operation
     */
    fun asFlow(): Flow<NetworkResult<ResultType>> = flow {
        emit(NetworkResult.Loading)

        try {
            // First, load data from local storage
            val localData = loadFromDb().first()
            
            // Check if we should fetch from network
            if (shouldFetch(localData)) {
                // Emit loading with current cached data (if available)
                localData?.let { emit(NetworkResult.Success(it)) }

                try {
                    // Fetch from network
                    val networkResult = createCall()
                    
                    when (networkResult) {
                        is NetworkResult.Success -> {
                            // Save network result to local storage
                            saveCallResult(networkResult.data)
                            
                            // Emit the fresh data from local storage
                            emitAll(loadFromDb().map { NetworkResult.Success(it) })
                        }
                        is NetworkResult.Error -> {
                            // Network call failed, emit error with cached data
                            onFetchFailed(networkResult)
                            if (localData != null) {
                                emit(NetworkResult.Success(localData))
                            } else {
                                emit(networkResult)
                            }
                        }
                        is NetworkResult.NetworkError -> {
                            // Network connectivity issue
                            onFetchFailed(networkResult)
                            if (localData != null) {
                                emit(NetworkResult.Success(localData))
                            } else {
                                emit(networkResult)
                            }
                        }
                        else -> {
                            // Loading state, continue with cached data
                            if (localData != null) {
                                emit(NetworkResult.Success(localData))
                            }
                        }
                    }
                } catch (e: Exception) {
                    Timber.e(e, "Network fetch failed")
                    val error = errorHandler.handleError<ResultType>(e)
                    onFetchFailed(error)
                    
                    if (localData != null) {
                        emit(NetworkResult.Success(localData))
                    } else {
                        emit(error)
                    }
                }
            } else {
                // No need to fetch from network, return cached data
                if (localData != null) {
                    emit(NetworkResult.Success(localData))
                } else {
                    // No cached data and no network fetch needed - this might be an error state
                    emit(NetworkResult.Error("No data available"))
                }
            }
        } catch (e: Exception) {
            Timber.e(e, "Database operation failed")
            emit(errorHandler.handleError(e))
        }
    }

    /**
     * Load data from local database
     */
    protected abstract fun loadFromDb(): Flow<ResultType?>

    /**
     * Check if we should fetch fresh data from network
     * @param data Current cached data (null if no cached data)
     * @return true if network fetch is needed, false to use cached data
     */
    protected abstract fun shouldFetch(data: ResultType?): Boolean

    /**
     * Create network call to fetch data
     * @return NetworkResult with fetched data or error
     */
    protected abstract suspend fun createCall(): NetworkResult<RequestType>

    /**
     * Save the network call result to local storage
     * @param item The data fetched from network
     */
    protected abstract suspend fun saveCallResult(item: RequestType)

    /**
     * Called when network fetch fails
     * Override to handle specific failure scenarios
     */
    protected open fun onFetchFailed(error: NetworkResult<*>) {
        Timber.w("Network fetch failed: ${error}")
    }
}

/**
 * Simple version of NetworkBoundResource for cases where local and remote types are the same
 */
abstract class SimpleNetworkBoundResource<T> @Inject constructor(
    errorHandler: ErrorHandler
) : NetworkBoundResource<T, T>(errorHandler)

/**
 * Configuration for cache expiry
 */
data class CacheConfig(
    val maxAgeMillis: Long,
    val maxSizeBytes: Long? = null
)

/**
 * Helper class for cache expiry checking
 */
class CacheHelper {
    companion object {
        /**
         * Check if cached data is still fresh
         */
        fun isCacheFresh(cacheTimestamp: Long, maxAgeMillis: Long): Boolean {
            val currentTime = System.currentTimeMillis()
            return (currentTime - cacheTimestamp) < maxAgeMillis
        }

        /**
         * Standard cache configurations
         */
        val SHORT_CACHE = CacheConfig(maxAgeMillis = 5 * 60 * 1000L) // 5 minutes
        val MEDIUM_CACHE = CacheConfig(maxAgeMillis = 30 * 60 * 1000L) // 30 minutes  
        val LONG_CACHE = CacheConfig(maxAgeMillis = 2 * 60 * 60 * 1000L) // 2 hours
        val DAILY_CACHE = CacheConfig(maxAgeMillis = 24 * 60 * 60 * 1000L) // 24 hours
    }
}

/**
 * Force refresh extension for NetworkBoundResource
 */
abstract class RefreshableNetworkBoundResource<ResultType, RequestType> @Inject constructor(
    errorHandler: ErrorHandler
) : NetworkBoundResource<ResultType, RequestType>(errorHandler) {

    private var forceRefresh = false

    /**
     * Force a refresh from network ignoring cache
     */
    fun refresh(): Flow<NetworkResult<ResultType>> {
        forceRefresh = true
        val flow = asFlow()
        forceRefresh = false
        return flow
    }

    /**
     * Override to include force refresh logic
     */
    override fun shouldFetch(data: ResultType?): Boolean {
        return forceRefresh || shouldFetchImpl(data)
    }

    /**
     * Implement the actual cache freshness check
     */
    protected abstract fun shouldFetchImpl(data: ResultType?): Boolean
}
