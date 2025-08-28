// File: data/models/request/LoginRequest.kt
// Purpose: Request models for authentication and API calls
// Dependencies: None

package com.dealervait.data.models.request

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Login request payload
 */
@JsonClass(generateAdapter = true)
data class LoginRequest(
    @Json(name = "username") val username: String,
    @Json(name = "password") val password: String
)

/**
 * Add lead request payload
 */
@JsonClass(generateAdapter = true)
data class AddLeadRequest(
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "businessTypeID") val businessTypeId: Int,
    @Json(name = "statusID") val statusId: Int,
    @Json(name = "typeID") val typeId: Int,
    @Json(name = "leadSourceID") val leadSourceId: Int,
    @Json(name = "phoneNumber") val phoneNumber: String,
    @Json(name = "emailAddress") val emailAddress: String,
    @Json(name = "street") val street: String? = null,
    @Json(name = "city") val city: String? = null,
    @Json(name = "state") val state: String? = null,
    @Json(name = "coBuyerFirstName") val coBuyerFirstName: String? = null,
    @Json(name = "coBuyerLastName") val coBuyerLastName: String? = null,
    @Json(name = "coBuyerPhoneNumber") val coBuyerPhoneNumber: String? = null,
    @Json(name = "coBuyerEmailAddress") val coBuyerEmailAddress: String? = null
)

/**
 * Add vehicle request payload
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
 * Send message request payload
 */
@JsonClass(generateAdapter = true)
data class SendMessageRequest(
    @Json(name = "message") val message: String,
    @Json(name = "isTextMessage") val isTextMessage: Boolean = true,
    @Json(name = "senderId") val senderId: Int,
    @Json(name = "receiverId") val receiverId: Int,
    @Json(name = "messageDate") val messageDate: String
)

/**
 * Update vehicle request payload
 */
@JsonClass(generateAdapter = true)
data class UpdateVehicleRequest(
    @Json(name = "stockNumber") val stockNumber: String? = null,
    @Json(name = "year") val year: Int? = null,
    @Json(name = "make") val make: String? = null,
    @Json(name = "model") val model: String? = null,
    @Json(name = "price") val price: Double? = null,
    @Json(name = "cost") val cost: Double? = null,
    @Json(name = "mileage") val mileage: Int? = null,
    @Json(name = "vin") val vin: String? = null,
    @Json(name = "color") val color: String? = null,
    @Json(name = "transmission") val transmission: String? = null,
    @Json(name = "fuelType") val fuelType: String? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "features") val features: List<String>? = null
)
