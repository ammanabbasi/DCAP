// File: app/src/main/java/com/dealervait/domain/model/Conversation.kt
// Purpose: Domain model for conversations in the in-app messaging system
// Dependencies: Message

data class Conversation(
    val id: String,
    val title: String,
    val type: ConversationType,
    val participants: List<ConversationParticipant>,
    val lastMessage: Message? = null,
    val lastActivity: Long,
    val createdAt: Long,
    val createdBy: Int,
    val isArchived: Boolean = false,
    val isMuted: Boolean = false,
    val unreadCount: Int = 0,
    val entityType: String? = null, // "vehicle", "lead", "customer", etc.
    val entityId: String? = null, // ID of the associated entity
    val metadata: Map<String, String> = emptyMap()
)

enum class ConversationType {
    DIRECT, // 1-on-1 conversation
    GROUP, // Group conversation
    CUSTOMER, // Conversation with a customer/lead
    VEHICLE_DISCUSSION // Discussion about a specific vehicle
}

data class ConversationParticipant(
    val userId: Int,
    val username: String,
    val fullName: String,
    val avatar: String? = null,
    val role: ParticipantRole,
    val joinedAt: Long,
    val isOnline: Boolean = false,
    val lastSeenAt: Long? = null,
    val isTyping: Boolean = false,
    val permissions: Set<ConversationPermission> = emptySet()
)

enum class ParticipantRole {
    OWNER,
    ADMIN,
    MEMBER,
    GUEST // For customers or external users
}

enum class ConversationPermission {
    SEND_MESSAGES,
    UPLOAD_FILES,
    DELETE_MESSAGES,
    INVITE_USERS,
    REMOVE_USERS,
    EDIT_CONVERSATION
}

data class TypingIndicator(
    val conversationId: String,
    val userId: Int,
    val username: String,
    val timestamp: Long
)
