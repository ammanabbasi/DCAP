// File: app/src/main/java/com/dealervait/domain/model/Message.kt
// Purpose: Domain model for messages in the in-app messaging system
// Dependencies: None

data class Message(
    val id: String,
    val conversationId: String,
    val senderId: Int,
    val senderName: String,
    val senderAvatar: String? = null,
    val content: String,
    val messageType: MessageType,
    val timestamp: Long,
    val isEdited: Boolean = false,
    val editedAt: Long? = null,
    val replyToMessageId: String? = null,
    val attachments: List<MessageAttachment> = emptyList(),
    val readBy: List<MessageReadReceipt> = emptyList(),
    val isDeleted: Boolean = false,
    val deletedAt: Long? = null,
    val metadata: Map<String, String> = emptyMap()
)

enum class MessageType {
    TEXT,
    IMAGE,
    DOCUMENT,
    VOICE,
    SYSTEM // For system messages like "User joined", "Document uploaded", etc.
}

data class MessageAttachment(
    val id: String,
    val type: AttachmentType,
    val fileName: String,
    val fileSize: Long,
    val mimeType: String,
    val url: String,
    val thumbnailUrl: String? = null,
    val duration: Long? = null // For voice messages in milliseconds
)

enum class AttachmentType {
    IMAGE,
    DOCUMENT,
    VOICE,
    VIDEO
}

data class MessageReadReceipt(
    val userId: Int,
    val readAt: Long
)
