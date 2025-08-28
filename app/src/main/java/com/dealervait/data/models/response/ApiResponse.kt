// File: data/models/response/ApiResponse.kt
// Purpose: Response models for API calls
// Dependencies: Moshi for JSON parsing

package com.dealervait.data.models.response

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Generic API response wrapper
 */
@JsonClass(generateAdapter = true)
data class ApiResponse<T>(
    @Json(name = "data") val data: T? = null,
    @Json(name = "message") val message: String? = null,
    @Json(name = "error") val error: String? = null,
    @Json(name = "statusCode") val statusCode: Int? = null
)

/**
 * Login response with user details and token
 */
@JsonClass(generateAdapter = true)
data class LoginResponse(
    @Json(name = "id") val id: Int,
    @Json(name = "username") val username: String,
    @Json(name = "token") val token: String,
    @Json(name = "message") val message: String? = null,
    @Json(name = "DealershipID") val dealershipId: Int? = null,
    @Json(name = "role") val role: String? = null,
    @Json(name = "email") val email: String? = null
)

/**
 * Dashboard data response
 */
@JsonClass(generateAdapter = true)
data class DashboardResponse(
    @Json(name = "InventoryAndCRM") val inventoryAndCrm: InventoryAndCrmData,
    @Json(name = "InventoryAge") val inventoryAge: List<InventoryAgeData>,
    @Json(name = "LeadsStatus") val leadsStatus: LeadsStatusData
)

@JsonClass(generateAdapter = true)
data class InventoryAndCrmData(
    @Json(name = "Inventory") val inventory: Int,
    @Json(name = "CRM") val crm: Int
)

@JsonClass(generateAdapter = true)
data class InventoryAgeData(
    @Json(name = "AgeBucket") val ageBucket: String,
    @Json(name = "Cash") val cash: Int,
    @Json(name = "FloorPlan") val floorPlan: Int,
    @Json(name = "Consignment") val consignment: Int
)

@JsonClass(generateAdapter = true)
data class LeadsStatusData(
    @Json(name = "AwaitingResponse") val awaitingResponse: Int,
    @Json(name = "Responded") val responded: Int,
    @Json(name = "NotResponded") val notResponded: Int
)

/**
 * Vehicle/Inventory response
 */
@JsonClass(generateAdapter = true)
data class VehicleResponse(
    @Json(name = "vehicles") val vehicles: List<Vehicle>,
    @Json(name = "pagination") val pagination: Pagination
)

@JsonClass(generateAdapter = true)
data class Vehicle(
    @Json(name = "id") val id: Int,
    @Json(name = "stockNumber") val stockNumber: String,
    @Json(name = "year") val year: Int,
    @Json(name = "make") val make: String,
    @Json(name = "model") val model: String,
    @Json(name = "price") val price: Double,
    @Json(name = "mileage") val mileage: Int? = null,
    @Json(name = "status") val status: String,
    @Json(name = "images") val images: List<String>? = null,
    @Json(name = "createdAt") val createdAt: String,
    @Json(name = "vin") val vin: String? = null,
    @Json(name = "color") val color: String? = null,
    @Json(name = "transmission") val transmission: String? = null,
    @Json(name = "fuelType") val fuelType: String? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "features") val features: List<String>? = null,
    @Json(name = "cost") val cost: Double? = null
)

@JsonClass(generateAdapter = true)
data class Pagination(
    @Json(name = "currentPage") val currentPage: Int,
    @Json(name = "totalPages") val totalPages: Int,
    @Json(name = "totalRecords") val totalRecords: Int,
    @Json(name = "hasMore") val hasMore: Boolean
)

/**
 * Lead response
 */
@JsonClass(generateAdapter = true)
data class LeadResponse(
    @Json(name = "leadID") val leadId: Int,
    @Json(name = "leadDetails") val leadDetails: LeadDetails
)

@JsonClass(generateAdapter = true)
data class LeadDetails(
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "emailAddress") val emailAddress: String,
    @Json(name = "phoneNumber") val phoneNumber: String? = null,
    @Json(name = "businessTypeID") val businessTypeId: Int? = null,
    @Json(name = "statusID") val statusId: Int? = null,
    @Json(name = "typeID") val typeId: Int? = null,
    @Json(name = "leadSourceID") val leadSourceId: Int? = null
)

/**
 * Message response
 */
@JsonClass(generateAdapter = true)
data class MessageResponse(
    @Json(name = "messageId") val messageId: Int,
    @Json(name = "message") val message: String,
    @Json(name = "timestamp") val timestamp: String
)

/**
 * Chat list response
 */
@JsonClass(generateAdapter = true)
data class ChatListResponse(
    @Json(name = "chats") val chats: List<Chat>
)

@JsonClass(generateAdapter = true)
data class Chat(
    @Json(name = "chatId") val chatId: String,
    @Json(name = "participantId") val participantId: Int,
    @Json(name = "participantName") val participantName: String,
    @Json(name = "lastMessage") val lastMessage: String,
    @Json(name = "lastMessageTime") val lastMessageTime: String,
    @Json(name = "unreadCount") val unreadCount: Int,
    @Json(name = "status") val status: String
)

/**
 * Conversation response
 */
@JsonClass(generateAdapter = true)
data class ConversationResponse(
    @Json(name = "messages") val messages: List<Message>
)

@JsonClass(generateAdapter = true)
data class Message(
    @Json(name = "id") val id: Int,
    @Json(name = "message") val message: String,
    @Json(name = "senderId") val senderId: Int,
    @Json(name = "receiverId") val receiverId: Int,
    @Json(name = "timestamp") val timestamp: String,
    @Json(name = "isTextMessage") val isTextMessage: Boolean,
    @Json(name = "isRead") val isRead: Boolean = false
)

/**
 * Document upload response
 */
@JsonClass(generateAdapter = true)
data class DocumentResponse(
    @Json(name = "documentId") val documentId: String,
    @Json(name = "fileName") val fileName: String,
    @Json(name = "fileUrl") val fileUrl: String,
    @Json(name = "uploadedAt") val uploadedAt: String
)

/**
 * Generic success response
 */
@JsonClass(generateAdapter = true)
data class SuccessResponse(
    @Json(name = "message") val message: String,
    @Json(name = "success") val success: Boolean = true
)
