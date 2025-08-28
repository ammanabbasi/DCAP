// File: data/local/dao/VehicleDao.kt
// Purpose: Data Access Objects for Room database operations
// Dependencies: Room, Coroutines, Flow

package com.dealervait.data.local.dao

import androidx.room.*
import com.dealervait.data.local.entities.*
import kotlinx.coroutines.flow.Flow

/**
 * Vehicle DAO for database operations
 */
@Dao
interface VehicleDao {
    
    @Query("SELECT * FROM vehicles ORDER BY updated_at DESC")
    fun getAllVehicles(): Flow<List<VehicleEntity>>
    
    @Query("SELECT * FROM vehicles WHERE id = :vehicleId")
    suspend fun getVehicleById(vehicleId: Int): VehicleEntity?
    
    @Query("SELECT * FROM vehicles WHERE id = :vehicleId")
    fun getVehicleByIdFlow(vehicleId: Int): Flow<VehicleEntity?>
    
    @Query("SELECT * FROM vehicles WHERE stock_number = :stockNumber")
    suspend fun getVehicleByStockNumber(stockNumber: String): VehicleEntity?
    
    @Query("""
        SELECT * FROM vehicles 
        WHERE (:make IS NULL OR make LIKE '%' || :make || '%')
        AND (:model IS NULL OR model LIKE '%' || :model || '%')
        AND (:year IS NULL OR year = :year)
        AND (:status IS NULL OR status = :status)
        AND (:minPrice IS NULL OR price >= :minPrice)
        AND (:maxPrice IS NULL OR price <= :maxPrice)
        ORDER BY updated_at DESC
        LIMIT :limit OFFSET :offset
    """)
    fun getFilteredVehicles(
        make: String?,
        model: String?, 
        year: Int?,
        status: String?,
        minPrice: Double?,
        maxPrice: Double?,
        limit: Int,
        offset: Int
    ): Flow<List<VehicleEntity>>
    
    @Query("SELECT COUNT(*) FROM vehicles")
    suspend fun getVehicleCount(): Int
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVehicle(vehicle: VehicleEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVehicles(vehicles: List<VehicleEntity>)
    
    @Update
    suspend fun updateVehicle(vehicle: VehicleEntity)
    
    @Delete
    suspend fun deleteVehicle(vehicle: VehicleEntity)
    
    @Query("DELETE FROM vehicles WHERE id = :vehicleId")
    suspend fun deleteVehicleById(vehicleId: Int)

    @Query("DELETE FROM vehicles")
    suspend fun deleteAllVehicles()

    @Query("SELECT COUNT(*) FROM vehicles")
    suspend fun getVehicleCount(): Int

    @Query("SELECT * FROM vehicles WHERE synced_at IS NULL OR synced_at < updated_at")
    suspend fun getUnsyncedVehicles(): List<VehicleEntity>

    @Query("""
        SELECT * FROM vehicles 
        WHERE (:make IS NULL OR make = :make)
        AND (:model IS NULL OR model = :model)
        AND (:year IS NULL OR year = :year)
        AND (:status IS NULL OR status = :status)
        AND (:minPrice IS NULL OR price >= :minPrice)
        AND (:maxPrice IS NULL OR price <= :maxPrice)
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    fun getFilteredVehicles(
        make: String?,
        model: String?,
        year: Int?,
        status: String?,
        minPrice: Double?,
        maxPrice: Double?,
        limit: Int,
        offset: Int
    ): Flow<List<VehicleEntity>>
    
    @Query("UPDATE vehicles SET synced_at = :syncedAt WHERE id = :vehicleId")
    suspend fun markVehicleSynced(vehicleId: Int, syncedAt: Long = System.currentTimeMillis())
}

/**
 * User DAO for database operations
 */
@Dao
interface UserDao {
    
    @Query("SELECT * FROM users WHERE id = :userId")
    suspend fun getUserById(userId: Int): UserEntity?
    
    @Query("SELECT * FROM users WHERE username = :username")
    suspend fun getUserByUsername(username: String): UserEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)
    
    @Update
    suspend fun updateUser(user: UserEntity)
    
    @Delete
    suspend fun deleteUser(user: UserEntity)
    
    @Query("DELETE FROM users")
    suspend fun deleteAllUsers()
}

/**
 * Lead DAO for database operations
 */
@Dao
interface LeadDao {
    
    @Query("SELECT * FROM leads ORDER BY created_at DESC")
    fun getAllLeads(): Flow<List<LeadEntity>>
    
    @Query("SELECT * FROM leads WHERE id = :leadId")
    suspend fun getLeadById(leadId: Int): LeadEntity?
    
    @Query("SELECT * FROM leads WHERE id = :leadId")
    fun getLeadByIdFlow(leadId: Int): Flow<LeadEntity?>
    
    @Query("SELECT * FROM leads WHERE email_address = :email")
    suspend fun getLeadByEmail(email: String): LeadEntity?
    
    @Query("""
        SELECT * FROM leads 
        WHERE (:status IS NULL OR status_id = :status)
        AND (:sourceId IS NULL OR lead_source_id = :sourceId)
        AND (:fromDate IS NULL OR created_at >= :fromDate)
        AND (:toDate IS NULL OR created_at <= :toDate)
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    fun getFilteredLeads(
        status: Int?,
        sourceId: Int?,
        fromDate: Long?,
        toDate: Long?,
        limit: Int,
        offset: Int
    ): Flow<List<LeadEntity>>
    
    @Query("SELECT COUNT(*) FROM leads")
    suspend fun getLeadCount(): Int
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLead(lead: LeadEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLeads(leads: List<LeadEntity>)
    
    @Update
    suspend fun updateLead(lead: LeadEntity)
    
    @Delete
    suspend fun deleteLead(lead: LeadEntity)
    
    @Query("DELETE FROM leads WHERE id = :leadId")
    suspend fun deleteLeadById(leadId: Int)
    
    @Query("DELETE FROM leads")
    suspend fun deleteAllLeads()
    
    @Query("SELECT * FROM leads WHERE synced_at < updated_at")
    suspend fun getUnsyncedLeads(): List<LeadEntity>
    
    @Query("UPDATE leads SET synced_at = :syncedAt WHERE id = :leadId")
    suspend fun markLeadSynced(leadId: Int, syncedAt: Long = System.currentTimeMillis())
}

/**
 * Dashboard Cache DAO for database operations
 */
@Dao
interface DashboardCacheDao {
    
    @Query("SELECT * FROM dashboard_cache WHERE cache_key = :key AND expires_at > :currentTime")
    suspend fun getCachedData(key: String, currentTime: Long = System.currentTimeMillis()): DashboardCacheEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCachedData(cache: DashboardCacheEntity)
    
    @Query("DELETE FROM dashboard_cache WHERE cache_key = :key")
    suspend fun deleteCachedData(key: String)
    
    @Query("DELETE FROM dashboard_cache WHERE expires_at <= :currentTime")
    suspend fun deleteExpiredCache(currentTime: Long = System.currentTimeMillis())
    
    @Query("DELETE FROM dashboard_cache")
    suspend fun deleteAllCache()
}

/**
 * Message DAO for database operations
 */
@Dao
interface MessageDao {
    
    @Query("""
        SELECT * FROM messages 
        WHERE (sender_id = :userId1 AND receiver_id = :userId2) 
        OR (sender_id = :userId2 AND receiver_id = :userId1)
        ORDER BY timestamp ASC
    """)
    fun getConversation(userId1: Int, userId2: Int): Flow<List<MessageEntity>>
    
    @Query("""
        SELECT * FROM messages 
        WHERE (sender_id = :userId1 AND receiver_id = :userId2) 
        OR (sender_id = :userId2 AND receiver_id = :userId1)
        ORDER BY timestamp DESC
        LIMIT :limit OFFSET :offset
    """)
    suspend fun getConversationPaged(
        userId1: Int, 
        userId2: Int, 
        limit: Int, 
        offset: Int
    ): List<MessageEntity>
    
    @Query("SELECT * FROM messages WHERE id = :messageId")
    suspend fun getMessageById(messageId: Int): MessageEntity?
    
    @Query("""
        SELECT DISTINCT 
            CASE 
                WHEN sender_id = :currentUserId THEN receiver_id 
                ELSE sender_id 
            END as participant_id,
            MAX(timestamp) as last_message_time
        FROM messages 
        WHERE sender_id = :currentUserId OR receiver_id = :currentUserId
        GROUP BY participant_id
        ORDER BY last_message_time DESC
    """)
    suspend fun getChatParticipants(currentUserId: Int): List<ChatParticipant>
    
    @Query("""
        SELECT COUNT(*) FROM messages 
        WHERE receiver_id = :userId AND is_read = 0
    """)
    suspend fun getUnreadMessageCount(userId: Int): Int
    
    @Query("""
        SELECT COUNT(*) FROM messages 
        WHERE sender_id = :senderId AND receiver_id = :receiverId AND is_read = 0
    """)
    suspend fun getUnreadMessageCountFromUser(senderId: Int, receiverId: Int): Int
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: MessageEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE) 
    suspend fun insertMessages(messages: List<MessageEntity>)
    
    @Update
    suspend fun updateMessage(message: MessageEntity)
    
    @Query("UPDATE messages SET is_read = 1 WHERE id = :messageId")
    suspend fun markMessageAsRead(messageId: Int)
    
    @Query("""
        UPDATE messages SET is_read = 1 
        WHERE sender_id = :senderId AND receiver_id = :receiverId AND is_read = 0
    """)
    suspend fun markConversationAsRead(senderId: Int, receiverId: Int)
    
    @Delete
    suspend fun deleteMessage(message: MessageEntity)
    
    @Query("DELETE FROM messages WHERE id = :messageId")
    suspend fun deleteMessageById(messageId: Int)
    
    @Query("DELETE FROM messages")
    suspend fun deleteAllMessages()
    
    @Query("SELECT * FROM messages WHERE is_sent = 0")
    suspend fun getUnsentMessages(): List<MessageEntity>
    
    @Query("UPDATE messages SET is_sent = 1 WHERE id = :messageId")
    suspend fun markMessageAsSent(messageId: Int)
}

/**
 * Document DAO for database operations
 */
@Dao
interface DocumentDao {
    
    @Query("SELECT * FROM documents ORDER BY uploaded_at DESC")
    fun getAllDocuments(): Flow<List<DocumentEntity>>
    
    @Query("SELECT * FROM documents WHERE id = :documentId")
    suspend fun getDocumentById(documentId: String): DocumentEntity?
    
    @Query("SELECT * FROM documents WHERE vehicle_id = :vehicleId")
    fun getDocumentsByVehicle(vehicleId: Int): Flow<List<DocumentEntity>>
    
    @Query("SELECT * FROM documents WHERE customer_id = :customerId")
    fun getDocumentsByCustomer(customerId: Int): Flow<List<DocumentEntity>>
    
    @Query("SELECT * FROM documents WHERE document_type = :type")
    fun getDocumentsByType(type: String): Flow<List<DocumentEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDocument(document: DocumentEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDocuments(documents: List<DocumentEntity>)
    
    @Update
    suspend fun updateDocument(document: DocumentEntity)
    
    @Delete
    suspend fun deleteDocument(document: DocumentEntity)
    
    @Query("DELETE FROM documents WHERE id = :documentId")
    suspend fun deleteDocumentById(documentId: String)
    
    @Query("DELETE FROM documents")
    suspend fun deleteAllDocuments()
}

/**
 * Data class for chat participants query result
 */
data class ChatParticipant(
    val participantId: Int,
    val lastMessageTime: Long
)
