// File: app/src/main/java/com/dealervait/data/local/dao/ConversationDao.kt
// Purpose: DAO for ConversationEntity, providing CRUD operations for local conversation data
// Dependencies: Room, Flow, ConversationEntity, ConversationType

import androidx.room.*
import com.dealervait.data.local.entities.ConversationEntity
import com.dealervait.domain.model.ConversationType
import kotlinx.coroutines.flow.Flow

@Dao
interface ConversationDao {

    // Insert operations
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertConversation(conversation: ConversationEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertConversations(conversations: List<ConversationEntity>)

    // Query operations
    @Query("SELECT * FROM conversations WHERE id = :conversationId")
    suspend fun getConversationById(conversationId: String): ConversationEntity?

    @Query("SELECT * FROM conversations WHERE id = :conversationId")
    fun getConversationByIdFlow(conversationId: String): Flow<ConversationEntity?>

    @Query("""
        SELECT * FROM conversations 
        WHERE isArchived = 0
        ORDER BY lastActivity DESC
    """)
    fun getAllActiveConversations(): Flow<List<ConversationEntity>>

    @Query("""
        SELECT * FROM conversations 
        WHERE isArchived = 1
        ORDER BY lastActivity DESC
    """)
    fun getArchivedConversations(): Flow<List<ConversationEntity>>

    @Query("""
        SELECT * FROM conversations 
        WHERE type = :type 
        AND isArchived = 0
        ORDER BY lastActivity DESC
    """)
    fun getConversationsByType(type: ConversationType): Flow<List<ConversationEntity>>

    @Query("""
        SELECT * FROM conversations 
        WHERE entityType = :entityType 
        AND entityId = :entityId 
        AND isArchived = 0
        ORDER BY lastActivity DESC
    """)
    fun getConversationsForEntity(
        entityType: String,
        entityId: String
    ): Flow<List<ConversationEntity>>

    @Query("""
        SELECT * FROM conversations 
        WHERE title LIKE :searchQuery 
        AND isArchived = 0
        ORDER BY lastActivity DESC
        LIMIT :limit
    """)
    suspend fun searchConversations(
        searchQuery: String,
        limit: Int = 50
    ): List<ConversationEntity>

    @Query("""
        SELECT * FROM conversations 
        WHERE participants LIKE :userIdPattern
        AND type = :type
        AND isArchived = 0
        ORDER BY lastActivity DESC
    """)
    fun getDirectConversationsForUser(
        userIdPattern: String, // Use "%\"userId\":$userId%" format
        type: ConversationType = ConversationType.DIRECT
    ): Flow<List<ConversationEntity>>

    @Query("SELECT COUNT(*) FROM conversations WHERE isArchived = 0")
    suspend fun getActiveConversationCount(): Int

    @Query("""
        SELECT SUM(unreadCount) FROM conversations 
        WHERE isArchived = 0 
        AND isMuted = 0
    """)
    suspend fun getTotalUnreadCount(): Int

    @Query("""
        SELECT * FROM conversations 
        WHERE needsSync = 1
        ORDER BY lastActivity DESC
    """)
    suspend fun getUnsyncedConversations(): List<ConversationEntity>

    // Update operations
    @Update
    suspend fun updateConversation(conversation: ConversationEntity)

    @Query("""
        UPDATE conversations 
        SET lastMessageId = :messageId,
            lastMessageContent = :content,
            lastMessageTimestamp = :timestamp,
            lastActivity = :timestamp
        WHERE id = :conversationId
    """)
    suspend fun updateLastMessage(
        conversationId: String,
        messageId: String,
        content: String,
        timestamp: Long
    )

    @Query("UPDATE conversations SET unreadCount = :count WHERE id = :conversationId")
    suspend fun updateUnreadCount(conversationId: String, count: Int)

    @Query("UPDATE conversations SET unreadCount = unreadCount + 1 WHERE id = :conversationId")
    suspend fun incrementUnreadCount(conversationId: String)

    @Query("UPDATE conversations SET unreadCount = 0 WHERE id = :conversationId")
    suspend fun markConversationAsRead(conversationId: String)

    @Query("UPDATE conversations SET isArchived = :isArchived WHERE id = :conversationId")
    suspend fun setConversationArchived(conversationId: String, isArchived: Boolean)

    @Query("UPDATE conversations SET isMuted = :isMuted WHERE id = :conversationId")
    suspend fun setConversationMuted(conversationId: String, isMuted: Boolean)

    @Query("UPDATE conversations SET syncedAt = :syncedAt WHERE id = :conversationId")
    suspend fun markConversationSynced(
        conversationId: String,
        syncedAt: Long = System.currentTimeMillis()
    )

    @Query("UPDATE conversations SET needsSync = :needsSync WHERE id = :conversationId")
    suspend fun setConversationSyncFlag(conversationId: String, needsSync: Boolean)

    @Query("UPDATE conversations SET title = :title, needsSync = 1 WHERE id = :conversationId")
    suspend fun updateConversationTitle(conversationId: String, title: String)

    @Query("""
        UPDATE conversations 
        SET participants = :participants, needsSync = 1 
        WHERE id = :conversationId
    """)
    suspend fun updateConversationParticipants(conversationId: String, participants: String)

    // Delete operations
    @Delete
    suspend fun deleteConversation(conversation: ConversationEntity)

    @Query("DELETE FROM conversations WHERE id = :conversationId")
    suspend fun deleteConversationById(conversationId: String)

    @Query("DELETE FROM conversations WHERE isArchived = 1 AND lastActivity < :beforeTimestamp")
    suspend fun deleteOldArchivedConversations(beforeTimestamp: Long)

    @Query("DELETE FROM conversations")
    suspend fun deleteAllConversations()

    // Utility operations
    @Query("""
        SELECT EXISTS(
            SELECT 1 FROM conversations 
            WHERE participants LIKE :userPattern1 
            AND participants LIKE :userPattern2
            AND type = 'DIRECT'
            AND isArchived = 0
        )
    """)
    suspend fun doesDirectConversationExist(
        userPattern1: String, // "%\"userId\":$userId1%"
        userPattern2: String  // "%\"userId\":$userId2%"
    ): Boolean

    @Query("""
        SELECT * FROM conversations 
        WHERE participants LIKE :userPattern1 
        AND participants LIKE :userPattern2
        AND type = 'DIRECT'
        AND isArchived = 0
        LIMIT 1
    """)
    suspend fun findDirectConversation(
        userPattern1: String,
        userPattern2: String
    ): ConversationEntity?
}
