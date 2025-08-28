// File: app/src/main/java/com/dealervait/domain/repository/AnalyticsRepository.kt
// Purpose: Repository interface for analytics and reporting functionality
// Dependencies: NetworkResult, Analytics domain models

package com.dealervait.domain.repository

import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.*

interface AnalyticsRepository {

    // Dashboard data
    suspend fun getDashboardAnalytics(dateRange: DateRange): NetworkResult<AnalyticsDashboard>
    suspend fun getSummaryMetrics(dateRange: DateRange): NetworkResult<AnalyticsSummary>
    
    // Sales analytics
    suspend fun getSalesTrends(dateRange: DateRange): NetworkResult<SalesTrendData>
    suspend fun getSalesByPeriod(
        period: String, // "daily", "weekly", "monthly"
        dateRange: DateRange
    ): NetworkResult<List<DataPoint>>
    suspend fun getSalesByCategory(dateRange: DateRange): NetworkResult<List<CategoryData>>
    suspend fun getSalesBySource(dateRange: DateRange): NetworkResult<List<CategoryData>>
    suspend fun getTopPerformers(
        dateRange: DateRange,
        limit: Int = 10
    ): NetworkResult<List<SalesPersonData>>

    // Inventory analytics
    suspend fun getInventoryAnalytics(dateRange: DateRange): NetworkResult<InventoryAnalytics>
    suspend fun getInventoryTurnover(dateRange: DateRange): NetworkResult<Double>
    suspend fun getInventoryByMake(): NetworkResult<List<CategoryData>>
    suspend fun getInventoryByPriceRange(): NetworkResult<List<CategoryData>>
    suspend fun getInventoryAging(): NetworkResult<List<AgingData>>
    suspend fun getPopularModels(dateRange: DateRange): NetworkResult<List<ModelData>>
    suspend fun getSlowMovingVehicles(daysThreshold: Int = 90): NetworkResult<List<VehicleSummary>>

    // Lead analytics
    suspend fun getLeadAnalytics(dateRange: DateRange): NetworkResult<LeadAnalytics>
    suspend fun getLeadConversionFunnel(dateRange: DateRange): NetworkResult<List<FunnelData>>
    suspend fun getLeadsBySource(dateRange: DateRange): NetworkResult<List<CategoryData>>
    suspend fun getLeadsByStatus(dateRange: DateRange): NetworkResult<List<CategoryData>>
    suspend fun getLeadsOverTime(
        period: String,
        dateRange: DateRange
    ): NetworkResult<List<DataPoint>>
    suspend fun getAverageResponseTime(dateRange: DateRange): NetworkResult<Double>

    // Performance analytics
    suspend fun getPerformanceMetrics(dateRange: DateRange): NetworkResult<PerformanceMetrics>
    suspend fun getSalesTeamPerformance(dateRange: DateRange): NetworkResult<List<SalesPersonData>>
    suspend fun getDealershipComparison(
        metric: String,
        dateRange: DateRange
    ): NetworkResult<List<ComparisonData>>
    suspend fun getKpiMetrics(dateRange: DateRange): NetworkResult<List<KpiMetric>>

    // Custom reports
    suspend fun generateCustomReport(config: ReportConfig): NetworkResult<String> // Returns report URL/path
    suspend fun getAvailableMetrics(): NetworkResult<List<String>>
    suspend fun getReportHistory(): NetworkResult<List<ReportConfig>>
    suspend fun scheduleReport(config: ReportConfig): NetworkResult<String>
    suspend fun cancelScheduledReport(reportId: String): NetworkResult<Unit>

    // Export functionality
    suspend fun exportData(
        dataType: String,
        format: ReportFormat,
        dateRange: DateRange,
        filters: Map<String, Any> = emptyMap()
    ): NetworkResult<String> // Returns file URL/path

    // Benchmarking
    suspend fun getBenchmarkData(
        metric: String,
        dealershipType: String,
        region: String? = null
    ): NetworkResult<ComparisonData>

    // Real-time metrics
    suspend fun getRealTimeMetrics(): NetworkResult<Map<String, Double>>
    suspend fun getTodaysSummary(): NetworkResult<AnalyticsSummary>

    // Forecasting (if available)
    suspend fun getSalesForcast(
        period: String,
        periodsAhead: Int = 12
    ): NetworkResult<List<DataPoint>>
    suspend fun getInventoryForecast(
        make: String? = null,
        periodsAhead: Int = 6
    ): NetworkResult<List<DataPoint>>

    // Goals and targets
    suspend fun getGoals(dateRange: DateRange): NetworkResult<List<KpiMetric>>
    suspend fun updateGoal(metric: String, target: Double): NetworkResult<Unit>

    // Caching and refresh
    suspend fun refreshAnalytics(): NetworkResult<Unit>
    suspend fun isCacheExpired(): Boolean
}
