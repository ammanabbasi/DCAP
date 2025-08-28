// File: domain/usecases/dashboard/GetDashboardDataUseCase.kt
// Purpose: Use case for retrieving dashboard data with business logic
// Dependencies: DashboardRepository

package com.dealervait.domain.usecases.dashboard

import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.DashboardMetrics
import com.dealervait.domain.repository.DashboardRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

/**
 * Use case for retrieving dashboard data
 * Handles caching strategy and business logic for dashboard metrics
 */
class GetDashboardDataUseCase @Inject constructor(
    private val dashboardRepository: DashboardRepository
) {
    /**
     * Get dashboard metrics with smart caching
     * @param forceRefresh Whether to bypass cache and fetch fresh data
     * @return Flow of dashboard metrics with loading, success, and error states
     */
    operator fun invoke(forceRefresh: Boolean = false): Flow<NetworkResult<DashboardMetrics>> {
        return dashboardRepository.getDashboardMetrics(forceRefresh)
    }
}

/**
 * Use case for refreshing dashboard data
 */
class RefreshDashboardDataUseCase @Inject constructor(
    private val dashboardRepository: DashboardRepository
) {
    /**
     * Force refresh dashboard data from API
     * @return NetworkResult with updated dashboard metrics
     */
    suspend operator fun invoke(): NetworkResult<DashboardMetrics> {
        return dashboardRepository.refreshDashboard()
    }
}

/**
 * Use case for clearing dashboard cache
 */
class ClearDashboardCacheUseCase @Inject constructor(
    private val dashboardRepository: DashboardRepository
) {
    /**
     * Clear all cached dashboard data
     */
    suspend operator fun invoke() {
        dashboardRepository.clearCache()
    }
}
