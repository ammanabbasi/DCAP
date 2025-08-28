// File: data/local/entities/UserEntity.kt
// Purpose: Room entities for local database storage
// Dependencies: Room, Kotlin serialization

package com.dealervait.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * User entity for local storage
 */
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: Int,
    
    @ColumnInfo(name = "username")
    val username: String,
    
    @ColumnInfo(name = "email")
    val email: String? = null,
    
    @ColumnInfo(name = "role")
    val role: String? = null,
    
    @ColumnInfo(name = "dealership_id")
    val dealershipId: Int? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)

/**
 * Vehicle entity for local storage
 */
@Entity(
    tableName = "vehicles",
    indices = [
        androidx.room.Index(value = ["stock_number"], unique = true),
        androidx.room.Index(value = ["make", "model"]),
        androidx.room.Index(value = ["year"]),
        androidx.room.Index(value = ["status"])
    ]
)
data class VehicleEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: Int,
    
    @ColumnInfo(name = "stock_number")
    val stockNumber: String,
    
    @ColumnInfo(name = "year")
    val year: Int,
    
    @ColumnInfo(name = "make")
    val make: String,
    
    @ColumnInfo(name = "model")
    val model: String,
    
    @ColumnInfo(name = "price")
    val price: Double,
    
    @ColumnInfo(name = "cost")
    val cost: Double? = null,
    
    @ColumnInfo(name = "mileage")
    val mileage: Int? = null,
    
    @ColumnInfo(name = "vin")
    val vin: String? = null,
    
    @ColumnInfo(name = "color")
    val color: String? = null,
    
    @ColumnInfo(name = "transmission")
    val transmission: String? = null,
    
    @ColumnInfo(name = "fuel_type")
    val fuelType: String? = null,
    
    @ColumnInfo(name = "status")
    val status: String,
    
    @ColumnInfo(name = "description")
    val description: String? = null,
    
    @ColumnInfo(name = "features")
    val features: String? = null, // JSON string of features array
    
    @ColumnInfo(name = "images")
    val images: String? = null, // JSON string of image URLs array
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis(),
    
    @ColumnInfo(name = "synced_at")
    val syncedAt: Long = System.currentTimeMillis()
)

/**
 * Lead/Customer entity for local storage
 */
@Entity(
    tableName = "leads",
    indices = [
        androidx.room.Index(value = ["email_address"], unique = true),
        androidx.room.Index(value = ["phone_number"]),
        androidx.room.Index(value = ["status_id"]),
        androidx.room.Index(value = ["lead_source_id"]),
        androidx.room.Index(value = ["created_at"])
    ]
)
data class LeadEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: Int,
    
    @ColumnInfo(name = "first_name")
    val firstName: String,
    
    @ColumnInfo(name = "last_name")
    val lastName: String,
    
    @ColumnInfo(name = "email_address")
    val emailAddress: String,
    
    @ColumnInfo(name = "phone_number")
    val phoneNumber: String? = null,
    
    @ColumnInfo(name = "business_type_id")
    val businessTypeId: Int? = null,
    
    @ColumnInfo(name = "status_id")
    val statusId: Int? = null,
    
    @ColumnInfo(name = "type_id")
    val typeId: Int? = null,
    
    @ColumnInfo(name = "lead_source_id")
    val leadSourceId: Int? = null,
    
    @ColumnInfo(name = "street")
    val street: String? = null,
    
    @ColumnInfo(name = "city")
    val city: String? = null,
    
    @ColumnInfo(name = "state")
    val state: String? = null,
    
    @ColumnInfo(name = "co_buyer_first_name")
    val coBuyerFirstName: String? = null,
    
    @ColumnInfo(name = "co_buyer_last_name")
    val coBuyerLastName: String? = null,
    
    @ColumnInfo(name = "co_buyer_phone_number")
    val coBuyerPhoneNumber: String? = null,
    
    @ColumnInfo(name = "co_buyer_email_address")
    val coBuyerEmailAddress: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis(),
    
    @ColumnInfo(name = "synced_at")
    val syncedAt: Long = System.currentTimeMillis()
)

/**
 * Dashboard metrics cache entity
 */
@Entity(
    tableName = "dashboard_cache",
    indices = [
        androidx.room.Index(value = ["cache_key"], unique = true)
    ]
)
data class DashboardCacheEntity(
    @PrimaryKey
    @ColumnInfo(name = "cache_key")
    val cacheKey: String,
    
    @ColumnInfo(name = "data")
    val data: String, // JSON string of dashboard data
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    
    @ColumnInfo(name = "expires_at")
    val expiresAt: Long
)

/**
 * Message entity for local chat storage
 */
@Entity(
    tableName = "messages",
    indices = [
        androidx.room.Index(value = ["sender_id", "receiver_id"]),
        androidx.room.Index(value = ["timestamp"]),
        androidx.room.Index(value = ["is_read"])
    ]
)
data class MessageEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: Int,
    
    @ColumnInfo(name = "message")
    val message: String,
    
    @ColumnInfo(name = "sender_id")
    val senderId: Int,
    
    @ColumnInfo(name = "receiver_id")
    val receiverId: Int,
    
    @ColumnInfo(name = "timestamp")
    val timestamp: Long,
    
    @ColumnInfo(name = "is_text_message")
    val isTextMessage: Boolean = true,
    
    @ColumnInfo(name = "is_read")
    val isRead: Boolean = false,
    
    @ColumnInfo(name = "is_sent")
    val isSent: Boolean = false,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)

/**
 * Document entity for local storage
 */
@Entity(
    tableName = "documents",
    indices = [
        androidx.room.Index(value = ["vehicle_id"]),
        androidx.room.Index(value = ["customer_id"]),
        androidx.room.Index(value = ["document_type"])
    ]
)
data class DocumentEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String,
    
    @ColumnInfo(name = "file_name")
    val fileName: String,
    
    @ColumnInfo(name = "file_url")
    val fileUrl: String,
    
    @ColumnInfo(name = "local_path")
    val localPath: String? = null,
    
    @ColumnInfo(name = "document_type")
    val documentType: String? = null,
    
    @ColumnInfo(name = "vehicle_id")
    val vehicleId: Int? = null,
    
    @ColumnInfo(name = "customer_id")
    val customerId: Int? = null,
    
    @ColumnInfo(name = "file_size")
    val fileSize: Long? = null,
    
    @ColumnInfo(name = "mime_type")
    val mimeType: String? = null,
    
    @ColumnInfo(name = "uploaded_at")
    val uploadedAt: Long,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)
