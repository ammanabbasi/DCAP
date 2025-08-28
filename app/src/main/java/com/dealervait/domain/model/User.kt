// File: domain/model/User.kt
// Purpose: Domain model for User - clean business logic representation
// Dependencies: None (pure domain model)

package com.dealervait.domain.model

/**
 * Domain model representing a user in the system
 * This is the clean architecture representation - no external dependencies
 */
data class User(
    val id: Int,
    val username: String,
    val email: String? = null,
    val role: String? = null,
    val dealershipId: Int? = null,
    val dealershipName: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val phoneNumber: String? = null,
    val isActive: Boolean = true,
    val lastLoginAt: Long? = null,
    val createdAt: Long? = null
) {
    /**
     * Get display name for UI
     */
    val displayName: String
        get() = when {
            !firstName.isNullOrBlank() && !lastName.isNullOrBlank() -> "$firstName $lastName"
            !firstName.isNullOrBlank() -> firstName
            !lastName.isNullOrBlank() -> lastName
            else -> username
        }

    /**
     * Get user initials for avatar
     */
    val initials: String
        get() = when {
            !firstName.isNullOrBlank() && !lastName.isNullOrBlank() -> 
                "${firstName.first().uppercaseChar()}${lastName.first().uppercaseChar()}"
            !firstName.isNullOrBlank() -> 
                firstName.take(2).uppercase()
            else -> 
                username.take(2).uppercase()
        }

    /**
     * Check if user has admin privileges
     */
    val isAdmin: Boolean
        get() = role?.lowercase() == "admin" || role?.lowercase() == "administrator"

    /**
     * Check if user has manager privileges
     */
    val isManager: Boolean
        get() = isAdmin || role?.lowercase() == "manager"

    /**
     * Get role display name
     */
    val roleDisplayName: String
        get() = role?.replaceFirstChar { it.uppercaseChar() } ?: "User"
}

/**
 * Domain model for dashboard metrics
 */
data class DashboardMetrics(
    val inventoryCount: Int,
    val crmCount: Int,
    val inventoryAge: List<InventoryAgeMetric>,
    val leadsStatus: LeadsStatusMetric,
    val lastUpdated: Long = System.currentTimeMillis()
)

/**
 * Inventory age breakdown
 */
data class InventoryAgeMetric(
    val ageBucket: String,
    val cash: Int,
    val floorPlan: Int,
    val consignment: Int
) {
    val total: Int get() = cash + floorPlan + consignment
}

/**
 * Leads status metrics
 */
data class LeadsStatusMetric(
    val awaitingResponse: Int,
    val responded: Int,
    val notResponded: Int
) {
    val total: Int get() = awaitingResponse + responded + notResponded
}

/**
 * Domain model for a vehicle
 */
data class Vehicle(
    val id: Int,
    val stockNumber: String,
    val year: Int,
    val make: String,
    val model: String,
    val price: Double,
    val cost: Double? = null,
    val mileage: Int? = null,
    val vin: String? = null,
    val color: String? = null,
    val transmission: String? = null,
    val fuelType: String? = null,
    val status: String,
    val description: String? = null,
    val features: List<String> = emptyList(),
    val images: List<String> = emptyList(),
    val createdAt: Long,
    val updatedAt: Long
) {
    /**
     * Get vehicle display title
     */
    val title: String
        get() = "$year $make $model"

    /**
     * Get formatted price string
     */
    val formattedPrice: String
        get() = "$${String.format("%,.0f", price)}"

    /**
     * Get formatted mileage string
     */
    val formattedMileage: String?
        get() = mileage?.let { "${String.format("%,d", it)} miles" }

    /**
     * Check if vehicle is available for sale
     */
    val isAvailable: Boolean
        get() = status.lowercase() == "available"

    /**
     * Get profit margin if cost is available
     */
    val profitMargin: Double?
        get() = cost?.let { (price - it) / it * 100 }
}

/**
 * Domain model for a customer lead
 */
data class Lead(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val emailAddress: String,
    val phoneNumber: String? = null,
    val businessTypeId: Int? = null,
    val statusId: Int? = null,
    val typeId: Int? = null,
    val leadSourceId: Int? = null,
    val street: String? = null,
    val city: String? = null,
    val state: String? = null,
    val coBuyerFirstName: String? = null,
    val coBuyerLastName: String? = null,
    val coBuyerPhoneNumber: String? = null,
    val coBuyerEmailAddress: String? = null,
    val notes: String? = null,
    val createdAt: Long,
    val updatedAt: Long
) {
    /**
     * Get full name
     */
    val fullName: String
        get() = "$firstName $lastName"

    /**
     * Get initials for avatar
     */
    val initials: String
        get() = "${firstName.first().uppercaseChar()}${lastName.first().uppercaseChar()}"

    /**
     * Get formatted address
     */
    val formattedAddress: String?
        get() = listOfNotNull(street, city, state).takeIf { it.isNotEmpty() }?.joinToString(", ")

    /**
     * Check if lead has co-buyer
     */
    val hasCoBuyer: Boolean
        get() = !coBuyerFirstName.isNullOrBlank() && !coBuyerLastName.isNullOrBlank()

    /**
     * Get co-buyer full name if available
     */
    val coBuyerFullName: String?
        get() = if (hasCoBuyer) "$coBuyerFirstName $coBuyerLastName" else null
}
