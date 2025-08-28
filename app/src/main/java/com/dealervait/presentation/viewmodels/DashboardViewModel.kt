// File: presentation/viewmodels/DashboardViewModel.kt
// Purpose: ViewModel for dashboard screen with metrics and real-time updates
// Dependencies: Use cases, BaseViewModel, StateFlow

package com.dealervait.presentation.viewmodels

import androidx.lifecycle.viewModelScope
import com.dealervait.core.base.BaseViewModel
import com.dealervait.domain.model.DashboardMetrics
import com.dealervait.domain.usecases.dashboard.GetDashboardDataUseCase
import com.dealervait.domain.usecases.dashboard.RefreshDashboardDataUseCase
import com.dealervait.domain.usecases.dashboard.ClearDashboardCacheUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for dashboard screen
 * Handles dashboard metrics, real-time updates, and user interactions
 */
@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val getDashboardDataUseCase: GetDashboardDataUseCase,
    private val refreshDashboardDataUseCase: RefreshDashboardDataUseCase,
    private val clearDashboardCacheUseCase: ClearDashboardCacheUseCase
) : BaseViewModel() {

    // UI State for dashboard
    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    // Dashboard metrics flow
    private val _dashboardMetrics = MutableStateFlow<DashboardMetrics?>(null)
    val dashboardMetrics: StateFlow<DashboardMetrics?> = _dashboardMetrics.asStateFlow()

    // Auto-refresh control
    private var autoRefreshEnabled = true

    init {
        loadDashboardData()
        startAutoRefresh()
    }

    /**
     * Load dashboard data with caching
     */
    private fun loadDashboardData(forceRefresh: Boolean = false) {
        viewModelScope.launch {
            getDashboardDataUseCase(forceRefresh)
                .collect { result ->
                    when (result) {
                        is com.dealervait.core.error.NetworkResult.Loading -> {
                            if (_dashboardMetrics.value == null) {
                                // Only show loading if we don't have cached data
                                _uiState.value = _uiState.value.copy(isLoading = true)
                            }
                        }
                        is com.dealervait.core.error.NetworkResult.Success -> {
                            _dashboardMetrics.value = result.data
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                error = null,
                                lastRefreshTime = System.currentTimeMillis()
                            )
                        }
                        is com.dealervait.core.error.NetworkResult.Error -> {
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                error = result.message
                            )
                        }
                        is com.dealervait.core.error.NetworkResult.NetworkError -> {
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                error = result.message,
                                isOffline = true
                            )
                        }
                    }
                }
        }
    }

    /**
     * Manual refresh triggered by user
     */
    fun refreshDashboard() {
        Timber.d("Manual dashboard refresh triggered")
        _uiState.value = _uiState.value.copy(isRefreshing = true)
        
        executeWithLoading(
            onSuccess = { metrics: DashboardMetrics ->
                _dashboardMetrics.value = metrics
                _uiState.value = _uiState.value.copy(
                    isRefreshing = false,
                    error = null,
                    lastRefreshTime = System.currentTimeMillis(),
                    isOffline = false
                )
            },
            onError = { errorMessage ->
                _uiState.value = _uiState.value.copy(
                    isRefreshing = false,
                    error = errorMessage
                )
            }
        ) {
            refreshDashboardDataUseCase()
        }
    }

    /**
     * Clear dashboard cache and reload
     */
    fun clearCacheAndReload() {
        viewModelScope.launch {
            try {
                clearDashboardCacheUseCase()
                loadDashboardData(forceRefresh = true)
                Timber.d("Dashboard cache cleared and reloaded")
            } catch (e: Exception) {
                Timber.e(e, "Error clearing cache and reloading")
                setError("Failed to clear cache and reload")
            }
        }
    }

    /**
     * Handle navigation to vehicles section
     */
    fun onNavigateToVehicles() {
        _uiState.value = _uiState.value.copy(shouldNavigateToVehicles = true)
    }

    /**
     * Handle navigation to CRM section
     */
    fun onNavigateToLeads() {
        _uiState.value = _uiState.value.copy(shouldNavigateToLeads = true)
    }

    /**
     * Clear navigation flags
     */
    fun clearNavigationFlags() {
        _uiState.value = _uiState.value.copy(
            shouldNavigateToVehicles = false,
            shouldNavigateToLeads = false
        )
    }

    /**
     * Enable/disable auto refresh
     */
    fun setAutoRefreshEnabled(enabled: Boolean) {
        autoRefreshEnabled = enabled
        if (enabled) {
            startAutoRefresh()
        }
        Timber.d("Auto-refresh ${if (enabled) "enabled" else "disabled"}")
    }

    /**
     * Start auto-refresh timer (every 30 seconds)
     */
    private fun startAutoRefresh() {
        viewModelScope.launch {
            while (autoRefreshEnabled) {
                kotlinx.coroutines.delay(30_000) // 30 seconds
                if (autoRefreshEnabled) {
                    loadDashboardData(forceRefresh = false) // Use cache first
                }
            }
        }
    }

    /**
     * Handle connectivity change
     */
    fun onConnectivityChanged(isConnected: Boolean) {
        _uiState.value = _uiState.value.copy(isOffline = !isConnected)
        
        if (isConnected && _dashboardMetrics.value == null) {
            // Reload data when coming back online
            loadDashboardData(forceRefresh = true)
        }
    }

    /**
     * Get formatted last refresh time
     */
    fun getLastRefreshTimeFormatted(): String {
        val lastRefresh = _uiState.value.lastRefreshTime
        return if (lastRefresh > 0) {
            val diffMinutes = (System.currentTimeMillis() - lastRefresh) / (60 * 1000)
            when {
                diffMinutes < 1 -> "Just now"
                diffMinutes < 60 -> "${diffMinutes}m ago"
                else -> "${diffMinutes / 60}h ago"
            }
        } else {
            "Never"
        }
    }

    /**
     * Clear error message
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    override fun onCleared() {
        super.onCleared()
        autoRefreshEnabled = false
        Timber.d("DashboardViewModel cleared")
    }
}

/**
 * UI state for dashboard screen
 */
data class DashboardUiState(
    // Loading states
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    
    // Data state
    val error: String? = null,
    val lastRefreshTime: Long = 0,
    val isOffline: Boolean = false,
    
    // Navigation states
    val shouldNavigateToVehicles: Boolean = false,
    val shouldNavigateToLeads: Boolean = false
)
