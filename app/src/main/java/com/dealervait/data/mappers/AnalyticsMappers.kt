// File: app/src/main/java/com/dealervait/data/mappers/AnalyticsMappers.kt
// Purpose: Mappers for converting API responses to analytics domain models
// Dependencies: Analytics domain models

package com.dealervait.data.mappers

import com.dealervait.domain.model.*

object AnalyticsMappers {

    // Dashboard mapping
    fun Map<String, Any?>.toDashboard(dateRange: DateRange): AnalyticsDashboard {
        return AnalyticsDashboard(
            summary = (this["summary"] as? Map<String, Any?>)?.toSummary() 
                ?: AnalyticsSummary(0.0, 0, 0.0, 0.0, 0, 0, 0.0, 0.0),
            salesTrends = (this["salesTrends"] as? Map<String, Any?>)?.toSalesTrends() 
                ?: SalesTrendData(emptyList(), emptyList(), emptyList(), emptyList(), emptyList(), emptyList()),
            inventoryMetrics = (this["inventoryMetrics"] as? Map<String, Any?>)?.toInventoryAnalytics() 
                ?: InventoryAnalytics(0.0, 0.0, emptyList(), emptyList(), emptyList(), emptyList(), emptyList()),
            leadMetrics = (this["leadMetrics"] as? Map<String, Any?>)?.toLeadAnalytics() 
                ?: LeadAnalytics(0, 0, 0, emptyList(), emptyList(), emptyList(), 0.0, emptyList()),
            performanceMetrics = (this["performanceMetrics"] as? Map<String, Any?>)?.toPerformanceMetrics() 
                ?: PerformanceMetrics(emptyList(), emptyList(), 0.0, 0.0, 0.0, emptyList()),
            dateRange = dateRange,
            lastUpdated = System.currentTimeMillis()
        )
    }

    // Summary metrics mapping
    fun Map<String, Any?>.toSummary(): AnalyticsSummary {
        return AnalyticsSummary(
            totalRevenue = (this["totalRevenue"] as? Number)?.toDouble() ?: 0.0,
            totalSales = (this["totalSales"] as? Number)?.toInt() ?: 0,
            averageDealValue = (this["averageDealValue"] as? Number)?.toDouble() ?: 0.0,
            conversionRate = (this["conversionRate"] as? Number)?.toDouble() ?: 0.0,
            activeLeads = (this["activeLeads"] as? Number)?.toInt() ?: 0,
            totalInventory = (this["totalInventory"] as? Number)?.toInt() ?: 0,
            revenueGrowth = (this["revenueGrowth"] as? Number)?.toDouble() ?: 0.0,
            salesGrowth = (this["salesGrowth"] as? Number)?.toDouble() ?: 0.0,
            period = this["period"] as? String ?: "This Month"
        )
    }

    // Sales trends mapping
    fun Map<String, Any?>.toSalesTrends(): SalesTrendData {
        return SalesTrendData(
            dailySales = (this["dailySales"] as? List<Map<String, Any?>>)?.map { it.toDataPoint() } ?: emptyList(),
            weeklySales = (this["weeklySales"] as? List<Map<String, Any?>>)?.map { it.toDataPoint() } ?: emptyList(),
            monthlySales = (this["monthlySales"] as? List<Map<String, Any?>>)?.map { it.toDataPoint() } ?: emptyList(),
            salesByCategory = (this["salesByCategory"] as? List<Map<String, Any?>>)?.map { it.toCategoryData() } ?: emptyList(),
            salesBySource = (this["salesBySource"] as? List<Map<String, Any?>>)?.map { it.toCategoryData() } ?: emptyList(),
            topPerformers = (this["topPerformers"] as? List<Map<String, Any?>>)?.map { it.toSalesPersonData() } ?: emptyList()
        )
    }

    // Inventory analytics mapping
    fun Map<String, Any?>.toInventoryAnalytics(): InventoryAnalytics {
        return InventoryAnalytics(
            inventoryTurnover = (this["inventoryTurnover"] as? Number)?.toDouble() ?: 0.0,
            averageDaysOnLot = (this["averageDaysOnLot"] as? Number)?.toDouble() ?: 0.0,
            inventoryByMake = (this["inventoryByMake"] as? List<Map<String, Any?>>)?.map { it.toCategoryData() } ?: emptyList(),
            inventoryByPriceRange = (this["inventoryByPriceRange"] as? List<Map<String, Any?>>)?.map { it.toCategoryData() } ?: emptyList(),
            agingAnalysis = (this["agingAnalysis"] as? List<Map<String, Any?>>)?.map { it.toAgingData() } ?: emptyList(),
            popularModels = (this["popularModels"] as? List<Map<String, Any?>>)?.map { it.toModelData() } ?: emptyList(),
            slowMovingVehicles = (this["slowMovingVehicles"] as? List<Map<String, Any?>>)?.map { it.toVehicleSummary() } ?: emptyList()
        )
    }

    // Lead analytics mapping
    fun Map<String, Any?>.toLeadAnalytics(): LeadAnalytics {
        return LeadAnalytics(
            totalLeads = (this["totalLeads"] as? Number)?.toInt() ?: 0,
            qualifiedLeads = (this["qualifiedLeads"] as? Number)?.toInt() ?: 0,
            convertedLeads = (this["convertedLeads"] as? Number)?.toInt() ?: 0,
            leadSources = (this["leadSources"] as? List<Map<String, Any?>>)?.map { it.toCategoryData() } ?: emptyList(),
            conversionFunnel = (this["conversionFunnel"] as? List<Map<String, Any?>>)?.map { it.toFunnelData() } ?: emptyList(),
            leadsByStatus = (this["leadsByStatus"] as? List<Map<String, Any?>>)?.map { it.toCategoryData() } ?: emptyList(),
            averageResponseTime = (this["averageResponseTime"] as? Number)?.toDouble() ?: 0.0,
            leadsOverTime = (this["leadsOverTime"] as? List<Map<String, Any?>>)?.map { it.toDataPoint() } ?: emptyList()
        )
    }

    // Performance metrics mapping
    fun Map<String, Any?>.toPerformanceMetrics(): PerformanceMetrics {
        return PerformanceMetrics(
            salesTeamPerformance = (this["salesTeamPerformance"] as? List<Map<String, Any?>>)?.map { it.toSalesPersonData() } ?: emptyList(),
            dealershipComparison = (this["dealershipComparison"] as? List<Map<String, Any?>>)?.map { it.toComparisonData() } ?: emptyList(),
            customerSatisfaction = (this["customerSatisfaction"] as? Number)?.toDouble() ?: 0.0,
            repeatCustomerRate = (this["repeatCustomerRate"] as? Number)?.toDouble() ?: 0.0,
            averageMargin = (this["averageMargin"] as? Number)?.toDouble() ?: 0.0,
            kpiMetrics = (this["kpiMetrics"] as? List<Map<String, Any?>>)?.map { it.toKpiMetric() } ?: emptyList()
        )
    }

    // Data point mapping
    fun Map<String, Any?>.toDataPoint(): DataPoint {
        return DataPoint(
            label = this["label"] as? String ?: "",
            value = (this["value"] as? Number)?.toDouble() ?: 0.0,
            timestamp = (this["timestamp"] as? Number)?.toLong(),
            metadata = this["metadata"] as? Map<String, Any> ?: emptyMap()
        )
    }

    // Category data mapping
    fun Map<String, Any?>.toCategoryData(): CategoryData {
        return CategoryData(
            category = this["category"] as? String ?: "",
            value = (this["value"] as? Number)?.toDouble() ?: 0.0,
            count = (this["count"] as? Number)?.toInt() ?: 0,
            percentage = (this["percentage"] as? Number)?.toDouble() ?: 0.0,
            color = this["color"] as? String
        )
    }

    // Sales person data mapping
    fun Map<String, Any?>.toSalesPersonData(): SalesPersonData {
        return SalesPersonData(
            id = (this["id"] as? Number)?.toInt() ?: 0,
            name = this["name"] as? String ?: "",
            totalSales = (this["totalSales"] as? Number)?.toDouble() ?: 0.0,
            unitsSold = (this["unitsSold"] as? Number)?.toInt() ?: 0,
            conversionRate = (this["conversionRate"] as? Number)?.toDouble() ?: 0.0,
            averageDealValue = (this["averageDealValue"] as? Number)?.toDouble() ?: 0.0,
            rank = (this["rank"] as? Number)?.toInt() ?: 0,
            avatar = this["avatar"] as? String
        )
    }

    // Aging data mapping
    fun Map<String, Any?>.toAgingData(): AgingData {
        return AgingData(
            ageRange = this["ageRange"] as? String ?: "",
            count = (this["count"] as? Number)?.toInt() ?: 0,
            value = (this["value"] as? Number)?.toDouble() ?: 0.0,
            percentage = (this["percentage"] as? Number)?.toDouble() ?: 0.0
        )
    }

    // Model data mapping
    fun Map<String, Any?>.toModelData(): ModelData {
        return ModelData(
            make = this["make"] as? String ?: "",
            model = this["model"] as? String ?: "",
            soldCount = (this["soldCount"] as? Number)?.toInt() ?: 0,
            averagePrice = (this["averagePrice"] as? Number)?.toDouble() ?: 0.0,
            averageDaysOnLot = (this["averageDaysOnLot"] as? Number)?.toDouble() ?: 0.0,
            popularityScore = (this["popularityScore"] as? Number)?.toDouble() ?: 0.0
        )
    }

    // Vehicle summary mapping
    fun Map<String, Any?>.toVehicleSummary(): VehicleSummary {
        return VehicleSummary(
            id = (this["id"] as? Number)?.toInt() ?: 0,
            make = this["make"] as? String ?: "",
            model = this["model"] as? String ?: "",
            year = (this["year"] as? Number)?.toInt() ?: 0,
            daysOnLot = (this["daysOnLot"] as? Number)?.toInt() ?: 0,
            price = (this["price"] as? Number)?.toDouble() ?: 0.0,
            viewCount = (this["viewCount"] as? Number)?.toInt() ?: 0
        )
    }

    // Funnel data mapping
    fun Map<String, Any?>.toFunnelData(): FunnelData {
        return FunnelData(
            stage = this["stage"] as? String ?: "",
            count = (this["count"] as? Number)?.toInt() ?: 0,
            conversionRate = (this["conversionRate"] as? Number)?.toDouble() ?: 0.0,
            dropOffRate = (this["dropOffRate"] as? Number)?.toDouble() ?: 0.0
        )
    }

    // Comparison data mapping
    fun Map<String, Any?>.toComparisonData(): ComparisonData {
        return ComparisonData(
            dealershipName = this["dealershipName"] as? String ?: "",
            metric = this["metric"] as? String ?: "",
            value = (this["value"] as? Number)?.toDouble() ?: 0.0,
            rank = (this["rank"] as? Number)?.toInt() ?: 0,
            isCurrentDealership = this["isCurrentDealership"] as? Boolean ?: false
        )
    }

    // KPI metric mapping
    fun Map<String, Any?>.toKpiMetric(): KpiMetric {
        return KpiMetric(
            name = this["name"] as? String ?: "",
            value = (this["value"] as? Number)?.toDouble() ?: 0.0,
            target = (this["target"] as? Number)?.toDouble() ?: 0.0,
            unit = this["unit"] as? String ?: "",
            trend = when (this["trend"] as? String) {
                "UP" -> TrendDirection.UP
                "DOWN" -> TrendDirection.DOWN
                else -> TrendDirection.STABLE
            },
            trendPercentage = (this["trendPercentage"] as? Number)?.toDouble() ?: 0.0
        )
    }

    // Date range mapping
    fun Map<String, Any?>.toDateRange(): DateRange {
        return DateRange(
            startDate = (this["startDate"] as? Number)?.toLong() ?: 0L,
            endDate = (this["endDate"] as? Number)?.toLong() ?: 0L,
            preset = when (this["preset"] as? String) {
                "TODAY" -> DateRangePreset.TODAY
                "YESTERDAY" -> DateRangePreset.YESTERDAY
                "LAST_7_DAYS" -> DateRangePreset.LAST_7_DAYS
                "LAST_30_DAYS" -> DateRangePreset.LAST_30_DAYS
                "THIS_MONTH" -> DateRangePreset.THIS_MONTH
                "LAST_MONTH" -> DateRangePreset.LAST_MONTH
                "THIS_QUARTER" -> DateRangePreset.THIS_QUARTER
                "LAST_QUARTER" -> DateRangePreset.LAST_QUARTER
                "THIS_YEAR" -> DateRangePreset.THIS_YEAR
                "LAST_YEAR" -> DateRangePreset.LAST_YEAR
                "CUSTOM" -> DateRangePreset.CUSTOM
                else -> DateRangePreset.LAST_30_DAYS
            }
        )
    }
}
