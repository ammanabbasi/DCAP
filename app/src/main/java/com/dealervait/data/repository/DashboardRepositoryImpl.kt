// File: data/repository/DashboardRepositoryImpl.kt
// Purpose: Dashboard repository implementation with API and caching
// Dependencies: API service, cache DAO, NetworkBoundResource

package com.dealervait.data.repository

import com.dealervait.core.error.ErrorHandler
import com.dealervait.core.error.NetworkResult
import com.dealervait.data.api.DealersCloudApiService
import com.dealervait.data.api.NetworkBoundResource
import com.dealervait.data.local.dao.DashboardCacheDao
import com.dealervait.data.local.entities.DashboardCacheEntity
import com.dealervait.data.mappers.toDashboardMetrics
import com.dealervait.domain.model.DashboardMetrics
import com.dealervait.domain.repository.DashboardRepository
import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.Moshi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of DashboardRepository using API service and local caching
 */
@Singleton
class DashboardRepositoryImpl @Inject constructor(
    private val apiService: DealersCloudApiService,
    private val dashboardCacheDao: DashboardCacheDao,
    private val errorHandler: ErrorHandler,
    private val moshi: Moshi
) : DashboardRepository {

    companion object {
        private const val DASHBOARD_CACHE_KEY = "dashboard_metrics"
        private const val CACHE_EXPIRY_MINUTES = 5L // 5 minutes cache
    }

    private val dashboardAdapter: JsonAdapter<DashboardMetrics> = 
        moshi.adapter(DashboardMetrics::class.java)

    /**
     * Get dashboard metrics using NetworkBoundResource for smart caching
     */
    override fun getDashboardMetrics(forceRefresh: Boolean): Flow<NetworkResult<DashboardMetrics>> {
        return object : NetworkBoundResource<DashboardMetrics, com.dealervait.data.models.response.DashboardResponse>(errorHandler) {
            
            override fun loadFromDb(): Flow<DashboardMetrics?> = flow {
                try {
                    val cached = getCachedDashboard()
                    emit(cached)
                } catch (e: Exception) {
                    Timber.e(e, "Error loading dashboard from cache")
                    emit(null)
                }
            }

            override fun shouldFetch(data: DashboardMetrics?): Boolean {
                return forceRefresh || data == null || isCacheExpired()
            }

            override suspend fun createCall(): NetworkResult<com.dealervait.data.models.response.DashboardResponse> {
                return try {
                    val response = apiService.getDashboard()
                    if (response.isSuccessful) {
                        val body = response.body()
                        if (body != null) {
                            NetworkResult.Success(body)
                        } else {
                            NetworkResult.Error("Empty response from server")
                        }
                    } else {
                        errorHandler.handleError(retrofit2.HttpException(response))
                    }
                } catch (e: Exception) {
                    Timber.e(e, "Dashboard API call failed")
                    errorHandler.handleError(e)
                }
            }

            override suspend fun saveCallResult(item: com.dealervait.data.models.response.DashboardResponse) {
                try {
                    val dashboardMetrics = item.toDashboardMetrics()
                    saveDashboardToCache(dashboardMetrics)
                } catch (e: Exception) {
                    Timber.e(e, "Error saving dashboard to cache")
                }
            }
        }.asFlow()
    }

    /**
     * Force refresh dashboard data from API
     */
    override suspend fun refreshDashboard(): NetworkResult<DashboardMetrics> {
        return try {
            val response = apiService.getDashboard()
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    val dashboardMetrics = body.toDashboardMetrics()
                    saveDashboardToCache(dashboardMetrics)
                    NetworkResult.Success(dashboardMetrics)
                } else {
                    NetworkResult.Error("Empty response from server")
                }
            } else {
                errorHandler.handleError(retrofit2.HttpException(response))
            }
        } catch (e: Exception) {
            Timber.e(e, "Dashboard refresh failed")
            errorHandler.handleError(e)
        }
    }

    /**
     * Get cached dashboard data if available
     */
    override suspend fun getCachedDashboard(): DashboardMetrics? {
        return try {
            val cachedEntity = dashboardCacheDao.getCachedData(
                key = DASHBOARD_CACHE_KEY,
                currentTime = System.currentTimeMillis()
            )

            cachedEntity?.let { entity ->
                dashboardAdapter.fromJson(entity.data)
            }
        } catch (e: Exception) {
            Timber.e(e, "Error retrieving cached dashboard data")
            null
        }
    }

    /**
     * Clear dashboard cache
     */
    override suspend fun clearCache() {
        try {
            dashboardCacheDao.deleteCachedData(DASHBOARD_CACHE_KEY)
            Timber.d("Dashboard cache cleared")
        } catch (e: Exception) {
            Timber.e(e, "Error clearing dashboard cache")
        }
    }

    /**
     * Save dashboard data to cache
     */
    private suspend fun saveDashboardToCache(dashboardMetrics: DashboardMetrics) {
        try {
            val json = dashboardAdapter.toJson(dashboardMetrics)
            val expiryTime = System.currentTimeMillis() + (CACHE_EXPIRY_MINUTES * 60 * 1000)
            
            val cacheEntity = DashboardCacheEntity(
                cacheKey = DASHBOARD_CACHE_KEY,
                data = json,
                expiresAt = expiryTime
            )
            
            dashboardCacheDao.insertCachedData(cacheEntity)
            Timber.d("Dashboard data cached successfully")
        } catch (e: Exception) {
            Timber.e(e, "Error caching dashboard data")
        }
    }

    /**
     * Check if cache is expired
     */
    private suspend fun isCacheExpired(): Boolean {
        return try {
            val cachedEntity = dashboardCacheDao.getCachedData(
                key = DASHBOARD_CACHE_KEY,
                currentTime = System.currentTimeMillis()
            )
            cachedEntity == null
        } catch (e: Exception) {
            Timber.e(e, "Error checking cache expiry")
            true // Assume expired on error
        }
    }
}
