// File: domain/repository/DashboardRepository.kt
// Purpose: Repository interface for dashboard data operations
// Dependencies: NetworkResult, DashboardMetrics

package com.dealervait.domain.repository

import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.DashboardMetrics
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for dashboard operations
 * Defines the contract for dashboard-related data operations
 */
interface DashboardRepository {

    /**
     * Get dashboard metrics with caching
     * @param forceRefresh Whether to force refresh from API
     * @return Flow of dashboard metrics with caching strategy
     */
    fun getDashboardMetrics(forceRefresh: Boolean = false): Flow<NetworkResult<DashboardMetrics>>

    /**
     * Refresh dashboard data from API
     * @return NetworkResult with updated dashboard metrics
     */
    suspend fun refreshDashboard(): NetworkResult<DashboardMetrics>

    /**
     * Get cached dashboard data if available
     * @return Cached dashboard metrics or null
     */
    suspend fun getCachedDashboard(): DashboardMetrics?

    /**
     * Clear dashboard cache
     */
    suspend fun clearCache()
}
