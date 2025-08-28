// File: app/src/main/java/com/dealervait/data/local/dao/MessageDao.kt
// Purpose: DAO for MessageEntity, providing CRUD operations for local message data
// Dependencies: Room, Flow, MessageEntity

import androidx.room.*
import com.dealervait.data.local.entities.MessageEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MessageDao {

    // Insert operations
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: MessageEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessages(messages: List<MessageEntity>)

    // Query operations
    @Query("SELECT * FROM messages WHERE id = :messageId")
    suspend fun getMessageById(messageId: String): MessageEntity?

    @Query("""
        SELECT * FROM messages 
        WHERE conversationId = :conversationId 
        AND isDeleted = 0
        ORDER BY timestamp DESC 
        LIMIT :limit OFFSET :offset
    """)
    fun getMessagesForConversation(
        conversationId: String,
        limit: Int = 50,
        offset: Int = 0
    ): Flow<List<MessageEntity>>

    @Query("""
        SELECT * FROM messages 
        WHERE conversationId = :conversationId 
        AND isDeleted = 0
        ORDER BY timestamp DESC 
        LIMIT 1
    """)
    suspend fun getLastMessageForConversation(conversationId: String): MessageEntity?

    @Query("""
        SELECT * FROM messages 
        WHERE conversationId = :conversationId 
        AND timestamp > :afterTimestamp 
        AND isDeleted = 0
        ORDER BY timestamp ASC
    """)
    suspend fun getMessagesAfterTimestamp(
        conversationId: String,
        afterTimestamp: Long
    ): List<MessageEntity>

    @Query("""
        SELECT * FROM messages 
        WHERE conversationId IN (:conversationIds)
        AND isDeleted = 0
        GROUP BY conversationId
        HAVING timestamp = MAX(timestamp)
        ORDER BY timestamp DESC
    """)
    suspend fun getLastMessagesForConversations(conversationIds: List<String>): List<MessageEntity>

    @Query("""
        SELECT * FROM messages 
        WHERE content LIKE :searchQuery 
        AND conversationId = :conversationId
        AND isDeleted = 0
        ORDER BY timestamp DESC
        LIMIT :limit
    """)
    suspend fun searchMessagesInConversation(
        conversationId: String,
        searchQuery: String,
        limit: Int = 50
    ): List<MessageEntity>

    @Query("""
        SELECT COUNT(*) FROM messages 
        WHERE conversationId = :conversationId 
        AND isDeleted = 0
    """)
    suspend fun getMessageCountForConversation(conversationId: String): Int

    @Query("""
        SELECT * FROM messages 
        WHERE needsSync = 1
        ORDER BY timestamp ASC
    """)
    suspend fun getUnsyncedMessages(): List<MessageEntity>

    @Query("""
        SELECT * FROM messages 
        WHERE localId IS NOT NULL 
        AND syncedAt IS NULL
        ORDER BY timestamp ASC
    """)
    suspend fun getLocalMessages(): List<MessageEntity>

    // Update operations
    @Update
    suspend fun updateMessage(message: MessageEntity)

    @Query("UPDATE messages SET syncedAt = :syncedAt WHERE id = :messageId")
    suspend fun markMessageSynced(messageId: String, syncedAt: Long = System.currentTimeMillis())

    @Query("UPDATE messages SET needsSync = :needsSync WHERE id = :messageId")
    suspend fun setMessageSyncFlag(messageId: String, needsSync: Boolean)

    @Query("""
        UPDATE messages 
        SET content = :newContent, isEdited = 1, editedAt = :editedAt, needsSync = 1
        WHERE id = :messageId
    """)
    suspend fun editMessage(messageId: String, newContent: String, editedAt: Long)

    @Query("""
        UPDATE messages 
        SET isDeleted = 1, deletedAt = :deletedAt, needsSync = 1
        WHERE id = :messageId
    """)
    suspend fun softDeleteMessage(messageId: String, deletedAt: Long = System.currentTimeMillis())

    @Query("""
        UPDATE messages 
        SET readBy = :readReceipts, needsSync = 1
        WHERE id = :messageId
    """)
    suspend fun updateMessageReadReceipts(messageId: String, readReceipts: String)

    // Delete operations
    @Delete
    suspend fun deleteMessage(message: MessageEntity)

    @Query("DELETE FROM messages WHERE id = :messageId")
    suspend fun deleteMessageById(messageId: String)

    @Query("DELETE FROM messages WHERE conversationId = :conversationId")
    suspend fun deleteAllMessagesInConversation(conversationId: String)

    @Query("DELETE FROM messages WHERE timestamp < :beforeTimestamp")
    suspend fun deleteMessagesBeforeTimestamp(beforeTimestamp: Long)

    @Query("DELETE FROM messages")
    suspend fun deleteAllMessages()

    // Utility operations
    @Query("""
        SELECT COUNT(*) FROM messages 
        WHERE conversationId = :conversationId 
        AND timestamp > :lastReadTimestamp
        AND senderId != :currentUserId
        AND isDeleted = 0
    """)
    suspend fun getUnreadMessageCount(
        conversationId: String,
        lastReadTimestamp: Long,
        currentUserId: Int
    ): Int

    @Query("""
        SELECT * FROM messages 
        WHERE replyToMessageId = :messageId 
        AND isDeleted = 0
        ORDER BY timestamp ASC
    """)
    suspend fun getRepliesForMessage(messageId: String): List<MessageEntity>
}
