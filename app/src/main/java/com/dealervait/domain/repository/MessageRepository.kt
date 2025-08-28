// File: app/src/main/java/com/dealervait/domain/repository/MessageRepository.kt
// Purpose: Repository interface for managing messaging functionality
// Dependencies: Flow, NetworkResult, Message, Conversation, TypingIndicator

import androidx.paging.PagingData
import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.*
import kotlinx.coroutines.flow.Flow

interface MessageRepository {

    // Conversation management
    suspend fun getConversations(): NetworkResult<List<Conversation>>
    fun getConversationsFlow(): Flow<List<Conversation>>
    suspend fun getConversationById(conversationId: String): NetworkResult<Conversation>
    suspend fun createConversation(
        title: String,
        type: ConversationType,
        participantIds: List<Int>,
        entityType: String? = null,
        entityId: String? = null
    ): NetworkResult<Conversation>
    suspend fun updateConversation(conversation: Conversation): NetworkResult<Conversation>
    suspend fun deleteConversation(conversationId: String): NetworkResult<Unit>
    suspend fun archiveConversation(conversationId: String, archive: Boolean): NetworkResult<Unit>
    suspend fun muteConversation(conversationId: String, mute: Boolean): NetworkResult<Unit>

    // Message management
    fun getMessagesForConversation(conversationId: String): Flow<PagingData<Message>>
    suspend fun sendMessage(
        conversationId: String,
        content: String,
        messageType: MessageType = MessageType.TEXT,
        replyToMessageId: String? = null,
        attachments: List<MessageAttachment> = emptyList()
    ): NetworkResult<Message>
    suspend fun editMessage(messageId: String, newContent: String): NetworkResult<Message>
    suspend fun deleteMessage(messageId: String): NetworkResult<Unit>
    suspend fun markMessageAsRead(messageId: String): NetworkResult<Unit>
    suspend fun markConversationAsRead(conversationId: String): NetworkResult<Unit>

    // Search and filtering
    suspend fun searchMessages(
        query: String,
        conversationId: String? = null
    ): NetworkResult<List<Message>>
    suspend fun searchConversations(query: String): NetworkResult<List<Conversation>>

    // Real-time features
    suspend fun startTyping(conversationId: String): NetworkResult<Unit>
    suspend fun stopTyping(conversationId: String): NetworkResult<Unit>
    fun getTypingIndicators(conversationId: String): Flow<List<TypingIndicator>>

    // Attachment handling
    suspend fun uploadAttachment(
        conversationId: String,
        filePath: String,
        fileName: String,
        mimeType: String
    ): NetworkResult<MessageAttachment>

    // Participant management
    suspend fun addParticipant(conversationId: String, userId: Int): NetworkResult<Unit>
    suspend fun removeParticipant(conversationId: String, userId: Int): NetworkResult<Unit>
    suspend fun updateParticipantRole(
        conversationId: String,
        userId: Int,
        role: ParticipantRole
    ): NetworkResult<Unit>

    // Offline and sync
    suspend fun syncConversations(): NetworkResult<Unit>
    suspend fun syncMessages(conversationId: String): NetworkResult<Unit>
    suspend fun hasUnsyncedMessages(): Boolean
    suspend fun getUnreadCount(): Int
    suspend fun getTotalUnreadCount(): Int

    // Direct messaging
    suspend fun startDirectMessage(userId: Int): NetworkResult<Conversation>
    suspend fun findDirectConversation(userId: Int): NetworkResult<Conversation?>

    // Group conversations
    suspend fun createGroup(
        title: String,
        participantIds: List<Int>
    ): NetworkResult<Conversation>

    // Entity conversations (for vehicles, leads, etc.)
    suspend fun getConversationsForEntity(
        entityType: String,
        entityId: String
    ): NetworkResult<List<Conversation>>
    suspend fun createEntityConversation(
        title: String,
        entityType: String,
        entityId: String,
        participantIds: List<Int>
    ): NetworkResult<Conversation>

    // Utility functions
    suspend fun clearConversationHistory(conversationId: String): NetworkResult<Unit>
    suspend fun exportConversation(conversationId: String): NetworkResult<String> // Returns file path
}