// File: data/models/request/VehicleRequests.kt
// Purpose: Request models for vehicle API operations
// Dependencies: Moshi annotations

package com.dealervait.data.models.request

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Request model for adding a new vehicle
 */
@JsonClass(generateAdapter = true)
data class AddVehicleRequest(
    @Json(name = "stockNumber") val stockNumber: String,
    @Json(name = "year") val year: Int,
    @Json(name = "make") val make: String,
    @Json(name = "model") val model: String,
    @Json(name = "price") val price: Double,
    @Json(name = "cost") val cost: Double? = null,
    @Json(name = "mileage") val mileage: Int? = null,
    @Json(name = "vin") val vin: String? = null,
    @Json(name = "color") val color: String? = null,
    @Json(name = "transmission") val transmission: String? = null,
    @Json(name = "fuelType") val fuelType: String? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "features") val features: List<String>? = null
)

/**
 * Request model for updating an existing vehicle
 */
@JsonClass(generateAdapter = true)
data class UpdateVehicleRequest(
    @Json(name = "stockNumber") val stockNumber: String,
    @Json(name = "year") val year: Int,
    @Json(name = "make") val make: String,
    @Json(name = "model") val model: String,
    @Json(name = "price") val price: Double,
    @Json(name = "cost") val cost: Double? = null,
    @Json(name = "mileage") val mileage: Int? = null,
    @Json(name = "vin") val vin: String? = null,
    @Json(name = "color") val color: String? = null,
    @Json(name = "transmission") val transmission: String? = null,
    @Json(name = "fuelType") val fuelType: String? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "features") val features: List<String>? = null,
    @Json(name = "status") val status: String? = null
)
