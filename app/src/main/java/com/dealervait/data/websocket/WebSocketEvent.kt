// File: data/websocket/WebSocketEvent.kt
// Purpose: WebSocket event models for real-time updates
// Dependencies: Moshi, domain models

package com.dealervait.data.websocket

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Base class for all WebSocket events
 */
@JsonClass(generateAdapter = true)
data class WebSocketMessage(
    @Json(name = "type") val type: String,
    @Json(name = "data") val data: Any?,
    @Json(name = "timestamp") val timestamp: Long = System.currentTimeMillis(),
    @Json(name = "userId") val userId: Int? = null
)

/**
 * WebSocket event types
 */
object WebSocketEventType {
    const val CONNECTION_ESTABLISHED = "connection_established"
    const val HEARTBEAT = "heartbeat"
    const val NEW_LEAD = "new_lead"
    const val LEAD_UPDATED = "lead_updated"
    const val VEHICLE_SOLD = "vehicle_sold"
    const val VEHICLE_PRICE_CHANGED = "vehicle_price_changed"
    const val NEW_MESSAGE = "new_message"
    const val DASHBOARD_UPDATE = "dashboard_update"
    const val USER_TYPING = "user_typing"
    const val DOCUMENT_UPLOADED = "document_uploaded"
    const val INVENTORY_LOW = "inventory_low"
    const val CONFLICT_DETECTED = "conflict_detected"
    const val USER_ONLINE = "user_online"
    const val USER_OFFLINE = "user_offline"
}

/**
 * Real-time event data classes
 */
@JsonClass(generateAdapter = true)
data class NewLeadEvent(
    @Json(name = "leadId") val leadId: Int,
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "emailAddress") val emailAddress: String,
    @Json(name = "phoneNumber") val phoneNumber: String?,
    @Json(name = "source") val source: String?
)

@JsonClass(generateAdapter = true)
data class LeadUpdatedEvent(
    @Json(name = "leadId") val leadId: Int,
    @Json(name = "field") val field: String,
    @Json(name = "oldValue") val oldValue: String?,
    @Json(name = "newValue") val newValue: String?,
    @Json(name = "updatedBy") val updatedBy: Int
)

@JsonClass(generateAdapter = true)
data class VehicleSoldEvent(
    @Json(name = "vehicleId") val vehicleId: Int,
    @Json(name = "soldPrice") val soldPrice: Double,
    @Json(name = "soldTo") val soldTo: String,
    @Json(name = "soldBy") val soldBy: Int,
    @Json(name = "saleDate") val saleDate: Long
)

@JsonClass(generateAdapter = true)
data class VehiclePriceChangedEvent(
    @Json(name = "vehicleId") val vehicleId: Int,
    @Json(name = "oldPrice") val oldPrice: Double,
    @Json(name = "newPrice") val newPrice: Double,
    @Json(name = "changedBy") val changedBy: Int
)

@JsonClass(generateAdapter = true)
data class NewMessageEvent(
    @Json(name = "messageId") val messageId: String,
    @Json(name = "conversationId") val conversationId: String,
    @Json(name = "senderId") val senderId: Int,
    @Json(name = "senderName") val senderName: String,
    @Json(name = "message") val message: String,
    @Json(name = "messageType") val messageType: String,
    @Json(name = "timestamp") val timestamp: Long
)

@JsonClass(generateAdapter = true)
data class DashboardUpdateEvent(
    @Json(name = "inventoryCount") val inventoryCount: Int,
    @Json(name = "crmCount") val crmCount: Int,
    @Json(name = "totalValue") val totalValue: Double,
    @Json(name = "monthlyTarget") val monthlyTarget: Double?
)

@JsonClass(generateAdapter = true)
data class UserTypingEvent(
    @Json(name = "conversationId") val conversationId: String,
    @Json(name = "userId") val userId: Int,
    @Json(name = "userName") val userName: String,
    @Json(name = "isTyping") val isTyping: Boolean
)

@JsonClass(generateAdapter = true)
data class DocumentUploadedEvent(
    @Json(name = "documentId") val documentId: String,
    @Json(name = "fileName") val fileName: String,
    @Json(name = "category") val category: String,
    @Json(name = "entityType") val entityType: String, // "vehicle", "customer", "deal"
    @Json(name = "entityId") val entityId: Int,
    @Json(name = "uploadedBy") val uploadedBy: Int
)

@JsonClass(generateAdapter = true)
data class ConflictDetectedEvent(
    @Json(name = "entityType") val entityType: String, // "vehicle", "lead"
    @Json(name = "entityId") val entityId: Int,
    @Json(name = "conflictField") val conflictField: String,
    @Json(name = "yourValue") val yourValue: String,
    @Json(name = "serverValue") val serverValue: String,
    @Json(name = "conflictUser") val conflictUser: String
)

@JsonClass(generateAdapter = true)
data class UserStatusEvent(
    @Json(name = "userId") val userId: Int,
    @Json(name = "userName") val userName: String,
    @Json(name = "isOnline") val isOnline: Boolean,
    @Json(name = "lastSeen") val lastSeen: Long?
)

/**
 * WebSocket connection states
 */
enum class WebSocketConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    RECONNECTING,
    FAILED
}

/**
 * Reconnection policy for WebSocket
 */
data class ReconnectionPolicy(
    val initialDelayMs: Long = 1000,
    val maxDelayMs: Long = 30000,
    val multiplier: Double = 2.0,
    val maxRetries: Int = 10
)
