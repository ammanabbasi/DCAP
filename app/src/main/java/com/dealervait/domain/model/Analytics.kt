// File: app/src/main/java/com/dealervait/domain/model/Analytics.kt
// Purpose: Domain models for analytics and reporting data
// Dependencies: None

package com.dealervait.domain.model

data class AnalyticsDashboard(
    val summary: AnalyticsSummary,
    val salesTrends: SalesTrendData,
    val inventoryMetrics: InventoryAnalytics,
    val leadMetrics: LeadAnalytics,
    val performanceMetrics: PerformanceMetrics,
    val dateRange: DateRange,
    val lastUpdated: Long = System.currentTimeMillis()
)

data class AnalyticsSummary(
    val totalRevenue: Double,
    val totalSales: Int,
    val averageDealValue: Double,
    val conversionRate: Double,
    val activeLeads: Int,
    val totalInventory: Int,
    val revenueGrowth: Double, // Percentage change
    val salesGrowth: Double,   // Percentage change
    val period: String = "This Month"
)

data class SalesTrendData(
    val dailySales: List<DataPoint>,
    val weeklySales: List<DataPoint>,
    val monthlySales: List<DataPoint>,
    val salesByCategory: List<CategoryData>,
    val salesBySource: List<CategoryData>,
    val topPerformers: List<SalesPersonData>
)

data class InventoryAnalytics(
    val inventoryTurnover: Double,
    val averageDaysOnLot: Double,
    val inventoryByMake: List<CategoryData>,
    val inventoryByPriceRange: List<CategoryData>,
    val agingAnalysis: List<AgingData>,
    val popularModels: List<ModelData>,
    val slowMovingVehicles: List<VehicleSummary>
)

data class LeadAnalytics(
    val totalLeads: Int,
    val qualifiedLeads: Int,
    val convertedLeads: Int,
    val leadSources: List<CategoryData>,
    val conversionFunnel: List<FunnelData>,
    val leadsByStatus: List<CategoryData>,
    val averageResponseTime: Double, // In hours
    val leadsOverTime: List<DataPoint>
)

data class PerformanceMetrics(
    val salesTeamPerformance: List<SalesPersonData>,
    val dealershipComparison: List<ComparisonData>,
    val customerSatisfaction: Double,
    val repeatCustomerRate: Double,
    val averageMargin: Double,
    val kpiMetrics: List<KpiMetric>
)

// Supporting data classes
data class DataPoint(
    val label: String,      // Date or category label
    val value: Double,      // Numeric value
    val timestamp: Long? = null,
    val metadata: Map<String, Any> = emptyMap()
)

data class CategoryData(
    val category: String,
    val value: Double,
    val count: Int,
    val percentage: Double,
    val color: String? = null
)

data class SalesPersonData(
    val id: Int,
    val name: String,
    val totalSales: Double,
    val unitsSold: Int,
    val conversionRate: Double,
    val averageDealValue: Double,
    val rank: Int,
    val avatar: String? = null
)

data class AgingData(
    val ageRange: String,   // "0-30 days", "31-60 days", etc.
    val count: Int,
    val value: Double,
    val percentage: Double
)

data class ModelData(
    val make: String,
    val model: String,
    val soldCount: Int,
    val averagePrice: Double,
    val averageDaysOnLot: Double,
    val popularityScore: Double
)

data class VehicleSummary(
    val id: Int,
    val make: String,
    val model: String,
    val year: Int,
    val daysOnLot: Int,
    val price: Double,
    val viewCount: Int
)

data class FunnelData(
    val stage: String,
    val count: Int,
    val conversionRate: Double,
    val dropOffRate: Double
)

data class ComparisonData(
    val dealershipName: String,
    val metric: String,
    val value: Double,
    val rank: Int,
    val isCurrentDealership: Boolean = false
)

data class KpiMetric(
    val name: String,
    val value: Double,
    val target: Double,
    val unit: String,
    val trend: TrendDirection,
    val trendPercentage: Double
)

enum class TrendDirection {
    UP, DOWN, STABLE
}

data class DateRange(
    val startDate: Long,
    val endDate: Long,
    val preset: DateRangePreset
)

enum class DateRangePreset {
    TODAY,
    YESTERDAY,
    LAST_7_DAYS,
    LAST_30_DAYS,
    THIS_MONTH,
    LAST_MONTH,
    THIS_QUARTER,
    LAST_QUARTER,
    THIS_YEAR,
    LAST_YEAR,
    CUSTOM
}

// Chart configuration models
data class ChartConfig(
    val type: ChartType,
    val title: String,
    val showLegend: Boolean = true,
    val showValues: Boolean = false,
    val colors: List<String> = emptyList(),
    val height: Int = 300
)

enum class ChartType {
    LINE,
    BAR,
    PIE,
    DONUT,
    AREA,
    SCATTER,
    FUNNEL
}

// Report configuration
data class ReportConfig(
    val title: String,
    val dateRange: DateRange,
    val sections: List<ReportSection>,
    val format: ReportFormat,
    val schedule: ReportSchedule? = null
)

data class ReportSection(
    val title: String,
    val type: ReportSectionType,
    val chartConfig: ChartConfig? = null,
    val includeTable: Boolean = false
)

enum class ReportSectionType {
    SUMMARY,
    SALES_TRENDS,
    INVENTORY_ANALYSIS,
    LEAD_PERFORMANCE,
    TEAM_PERFORMANCE,
    CUSTOM_CHART,
    DATA_TABLE
}

enum class ReportFormat {
    PDF,
    EXCEL,
    CSV,
    IMAGE
}

data class ReportSchedule(
    val frequency: ReportFrequency,
    val recipients: List<String>,
    val nextRun: Long
)

enum class ReportFrequency {
    DAILY,
    WEEKLY,
    MONTHLY,
    QUARTERLY
}
