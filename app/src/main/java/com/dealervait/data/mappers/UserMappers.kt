// File: data/mappers/UserMappers.kt
// Purpose: Mappers to convert between data models and domain models
// Dependencies: Data models, domain models, entities

package com.dealervait.data.mappers

import com.dealervait.data.local.entities.*
import com.dealervait.data.models.response.*
import com.dealervait.domain.model.*
import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import timber.log.Timber

/**
 * Extension functions to convert between different representations
 */

// ================================
// USER MAPPERS
// ================================

/**
 * Convert LoginResponse to User domain model
 */
fun LoginResponse.toUser(): User {
    return User(
        id = id,
        username = username,
        email = email,
        role = role,
        dealershipId = dealershipId,
        isActive = true,
        lastLoginAt = System.currentTimeMillis(),
        createdAt = System.currentTimeMillis()
    )
}

/**
 * Convert User domain model to UserEntity
 */
fun User.toEntity(): UserEntity {
    return UserEntity(
        id = id,
        username = username,
        email = email,
        role = role,
        dealershipId = dealershipId,
        createdAt = createdAt ?: System.currentTimeMillis(),
        updatedAt = System.currentTimeMillis()
    )
}

/**
 * Convert UserEntity to User domain model
 */
fun UserEntity.toUser(): User {
    return User(
        id = id,
        username = username,
        email = email,
        role = role,
        dealershipId = dealershipId,
        isActive = true,
        createdAt = createdAt
    )
}

// ================================
// DASHBOARD MAPPERS
// ================================

/**
 * Convert DashboardResponse to DashboardMetrics domain model
 */
fun DashboardResponse.toDashboardMetrics(): DashboardMetrics {
    return DashboardMetrics(
        inventoryCount = inventoryAndCrm.inventory,
        crmCount = inventoryAndCrm.crm,
        inventoryAge = inventoryAge.map { it.toInventoryAgeMetric() },
        leadsStatus = leadsStatus.toLeadsStatusMetric(),
        lastUpdated = System.currentTimeMillis()
    )
}

/**
 * Convert InventoryAgeData to InventoryAgeMetric
 */
fun InventoryAgeData.toInventoryAgeMetric(): InventoryAgeMetric {
    return InventoryAgeMetric(
        ageBucket = ageBucket,
        cash = cash,
        floorPlan = floorPlan,
        consignment = consignment
    )
}

/**
 * Convert LeadsStatusData to LeadsStatusMetric
 */
fun LeadsStatusData.toLeadsStatusMetric(): LeadsStatusMetric {
    return LeadsStatusMetric(
        awaitingResponse = awaitingResponse,
        responded = responded,
        notResponded = notResponded
    )
}

// ================================
// VEHICLE MAPPERS
// ================================

/**
 * Convert Vehicle API response to domain model
 */
fun com.dealervait.data.models.response.Vehicle.toDomainModel(): Vehicle {
    return Vehicle(
        id = id,
        stockNumber = stockNumber,
        year = year,
        make = make,
        model = model,
        price = price,
        cost = cost,
        mileage = mileage,
        vin = vin,
        color = color,
        transmission = transmission,
        fuelType = fuelType,
        status = status,
        description = description,
        features = features ?: emptyList(),
        images = images ?: emptyList(),
        createdAt = parseTimestamp(createdAt),
        updatedAt = System.currentTimeMillis()
    )
}

/**
 * Convert Vehicle domain model to VehicleEntity
 */
fun Vehicle.toEntity(): VehicleEntity {
    return VehicleEntity(
        id = id,
        stockNumber = stockNumber,
        year = year,
        make = make,
        model = model,
        price = price,
        cost = cost,
        mileage = mileage,
        vin = vin,
        color = color,
        transmission = transmission,
        fuelType = fuelType,
        status = status,
        description = description,
        features = features.toJsonString(),
        images = images.toJsonString(),
        createdAt = createdAt,
        updatedAt = updatedAt,
        syncedAt = System.currentTimeMillis()
    )
}

/**
 * Convert VehicleEntity to Vehicle domain model
 */
fun VehicleEntity.toDomainModel(): Vehicle {
    return Vehicle(
        id = id,
        stockNumber = stockNumber,
        year = year,
        make = make,
        model = model,
        price = price,
        cost = cost,
        mileage = mileage,
        vin = vin,
        color = color,
        transmission = transmission,
        fuelType = fuelType,
        status = status,
        description = description,
        features = features?.fromJsonStringToList() ?: emptyList(),
        images = images?.fromJsonStringToList() ?: emptyList(),
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

// ================================
// LEAD MAPPERS
// ================================

/**
 * Convert LeadDetails API response to Lead domain model
 */
fun LeadDetails.toDomainModel(): Lead {
    return Lead(
        id = 0, // API response doesn't include ID
        firstName = firstName,
        lastName = lastName,
        emailAddress = emailAddress,
        phoneNumber = phoneNumber,
        businessTypeId = businessTypeId,
        statusId = statusId,
        typeId = typeId,
        leadSourceId = leadSourceId,
        createdAt = System.currentTimeMillis(),
        updatedAt = System.currentTimeMillis()
    )
}

/**
 * Convert Lead domain model to LeadEntity
 */
fun Lead.toEntity(): LeadEntity {
    return LeadEntity(
        id = id,
        firstName = firstName,
        lastName = lastName,
        emailAddress = emailAddress,
        phoneNumber = phoneNumber,
        businessTypeId = businessTypeId,
        statusId = statusId,
        typeId = typeId,
        leadSourceId = leadSourceId,
        street = street,
        city = city,
        state = state,
        coBuyerFirstName = coBuyerFirstName,
        coBuyerLastName = coBuyerLastName,
        coBuyerPhoneNumber = coBuyerPhoneNumber,
        coBuyerEmailAddress = coBuyerEmailAddress,
        createdAt = createdAt,
        updatedAt = updatedAt,
        syncedAt = System.currentTimeMillis()
    )
}

/**
 * Convert LeadEntity to Lead domain model
 */
fun LeadEntity.toDomainModel(): Lead {
    return Lead(
        id = id,
        firstName = firstName,
        lastName = lastName,
        emailAddress = emailAddress,
        phoneNumber = phoneNumber,
        businessTypeId = businessTypeId,
        statusId = statusId,
        typeId = typeId,
        leadSourceId = leadSourceId,
        street = street,
        city = city,
        state = state,
        coBuyerFirstName = coBuyerFirstName,
        coBuyerLastName = coBuyerLastName,
        coBuyerPhoneNumber = coBuyerPhoneNumber,
        coBuyerEmailAddress = coBuyerEmailAddress,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Parse timestamp string to milliseconds
 */
private fun parseTimestamp(timestamp: String): Long {
    return try {
        // Try different timestamp formats
        when {
            timestamp.contains("T") -> {
                // ISO format: "2024-01-15T10:30:00.000Z"
                java.time.Instant.parse(timestamp).toEpochMilli()
            }
            else -> {
                // Fallback to current time if parsing fails
                System.currentTimeMillis()
            }
        }
    } catch (e: Exception) {
        Timber.w(e, "Failed to parse timestamp: $timestamp")
        System.currentTimeMillis()
    }
}

/**
 * Convert List<String> to JSON string for database storage
 */
private fun List<String>.toJsonString(): String? {
    return if (isEmpty()) {
        null
    } else {
        try {
            val moshi = Moshi.Builder().build()
            val type = Types.newParameterizedType(List::class.java, String::class.java)
            val adapter: JsonAdapter<List<String>> = moshi.adapter(type)
            adapter.toJson(this)
        } catch (e: Exception) {
            Timber.e(e, "Failed to convert list to JSON")
            null
        }
    }
}

/**
 * Convert JSON string to List<String>
 */
private fun String.fromJsonStringToList(): List<String> {
    return try {
        val moshi = Moshi.Builder().build()
        val type = Types.newParameterizedType(List::class.java, String::class.java)
        val adapter: JsonAdapter<List<String>> = moshi.adapter(type)
        adapter.fromJson(this) ?: emptyList()
    } catch (e: Exception) {
        Timber.e(e, "Failed to parse JSON to list: $this")
        emptyList()
    }
}
