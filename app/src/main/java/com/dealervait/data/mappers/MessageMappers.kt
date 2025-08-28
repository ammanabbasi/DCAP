// File: app/src/main/java/com/dealervait/data/mappers/MessageMappers.kt
// Purpose: Mappers for converting between message domain models and data entities
// Dependencies: Domain models, Data entities

package com.dealervait.data.mappers

import com.dealervait.data.local.entities.ConversationEntity
import com.dealervait.data.local.entities.MessageEntity
import com.dealervait.domain.model.*

object MessageMappers {

    // Message mappings
    fun MessageEntity.toDomain(): Message {
        return Message(
            id = id,
            conversationId = conversationId,
            senderId = senderId,
            senderName = senderName,
            senderAvatar = senderAvatar,
            content = content,
            messageType = messageType,
            timestamp = timestamp,
            isEdited = isEdited,
            editedAt = editedAt,
            replyToMessageId = replyToMessageId,
            attachments = attachments,
            readBy = readBy,
            isDeleted = isDeleted,
            deletedAt = deletedAt,
            metadata = metadata
        )
    }

    fun Message.toEntity(): MessageEntity {
        return MessageEntity(
            id = id,
            conversationId = conversationId,
            senderId = senderId,
            senderName = senderName,
            senderAvatar = senderAvatar,
            content = content,
            messageType = messageType,
            timestamp = timestamp,
            isEdited = isEdited,
            editedAt = editedAt,
            replyToMessageId = replyToMessageId,
            attachments = attachments,
            readBy = readBy,
            isDeleted = isDeleted,
            deletedAt = deletedAt,
            metadata = metadata,
            syncedAt = null,
            needsSync = false,
            localId = null
        )
    }

    // Conversation mappings
    fun ConversationEntity.toDomain(): Conversation {
        val lastMessage = if (lastMessageId != null && lastMessageContent != null && lastMessageTimestamp != null) {
            Message(
                id = lastMessageId!!,
                conversationId = id,
                senderId = 0, // We don't store sender info in conversation entity
                senderName = "Unknown",
                content = lastMessageContent!!,
                messageType = MessageType.TEXT,
                timestamp = lastMessageTimestamp!!
            )
        } else null

        return Conversation(
            id = id,
            title = title,
            type = type,
            participants = participants,
            lastMessage = lastMessage,
            lastActivity = lastActivity,
            createdAt = createdAt,
            createdBy = createdBy,
            isArchived = isArchived,
            isMuted = isMuted,
            unreadCount = unreadCount,
            entityType = entityType,
            entityId = entityId,
            metadata = metadata
        )
    }

    fun Conversation.toEntity(): ConversationEntity {
        return ConversationEntity(
            id = id,
            title = title,
            type = type,
            participants = participants,
            lastMessageId = lastMessage?.id,
            lastMessageContent = lastMessage?.content,
            lastMessageTimestamp = lastMessage?.timestamp,
            lastActivity = lastActivity,
            createdAt = createdAt,
            createdBy = createdBy,
            isArchived = isArchived,
            isMuted = isMuted,
            unreadCount = unreadCount,
            entityType = entityType,
            entityId = entityId,
            metadata = metadata,
            syncedAt = null,
            needsSync = false
        )
    }

    // API Response mappings (these would map from API response DTOs to domain models)
    // For now, these are placeholders assuming the API returns the same structure
    
    fun Map<String, Any?>.toConversationDomain(): Conversation {
        return Conversation(
            id = this["id"] as String,
            title = this["title"] as String,
            type = ConversationType.valueOf(this["type"] as String),
            participants = (this["participants"] as List<Map<String, Any?>>).map { it.toParticipantDomain() },
            lastActivity = this["lastActivity"] as Long,
            createdAt = this["createdAt"] as Long,
            createdBy = this["createdBy"] as Int,
            isArchived = this["isArchived"] as? Boolean ?: false,
            isMuted = this["isMuted"] as? Boolean ?: false,
            unreadCount = this["unreadCount"] as? Int ?: 0,
            entityType = this["entityType"] as? String,
            entityId = this["entityId"] as? String,
            metadata = this["metadata"] as? Map<String, String> ?: emptyMap()
        )
    }

    fun Map<String, Any?>.toMessageDomain(): Message {
        return Message(
            id = this["id"] as String,
            conversationId = this["conversationId"] as String,
            senderId = this["senderId"] as Int,
            senderName = this["senderName"] as String,
            senderAvatar = this["senderAvatar"] as? String,
            content = this["content"] as String,
            messageType = MessageType.valueOf(this["messageType"] as String),
            timestamp = this["timestamp"] as Long,
            isEdited = this["isEdited"] as? Boolean ?: false,
            editedAt = this["editedAt"] as? Long,
            replyToMessageId = this["replyToMessageId"] as? String,
            attachments = (this["attachments"] as? List<Map<String, Any?>>)?.map { it.toAttachmentDomain() } ?: emptyList(),
            readBy = (this["readBy"] as? List<Map<String, Any?>>)?.map { it.toReadReceiptDomain() } ?: emptyList(),
            isDeleted = this["isDeleted"] as? Boolean ?: false,
            deletedAt = this["deletedAt"] as? Long,
            metadata = this["metadata"] as? Map<String, String> ?: emptyMap()
        )
    }

    private fun Map<String, Any?>.toParticipantDomain(): ConversationParticipant {
        return ConversationParticipant(
            userId = this["userId"] as Int,
            username = this["username"] as String,
            fullName = this["fullName"] as String,
            avatar = this["avatar"] as? String,
            role = ParticipantRole.valueOf(this["role"] as String),
            joinedAt = this["joinedAt"] as Long,
            isOnline = this["isOnline"] as? Boolean ?: false,
            lastSeenAt = this["lastSeenAt"] as? Long,
            isTyping = this["isTyping"] as? Boolean ?: false,
            permissions = (this["permissions"] as? List<String>)?.map { 
                ConversationPermission.valueOf(it) 
            }?.toSet() ?: emptySet()
        )
    }

    private fun Map<String, Any?>.toAttachmentDomain(): MessageAttachment {
        return MessageAttachment(
            id = this["id"] as String,
            type = AttachmentType.valueOf(this["type"] as String),
            fileName = this["fileName"] as String,
            fileSize = this["fileSize"] as Long,
            mimeType = this["mimeType"] as String,
            url = this["url"] as String,
            thumbnailUrl = this["thumbnailUrl"] as? String,
            duration = this["duration"] as? Long
        )
    }

    private fun Map<String, Any?>.toReadReceiptDomain(): MessageReadReceipt {
        return MessageReadReceipt(
            userId = this["userId"] as Int,
            readAt = this["readAt"] as Long
        )
    }
}
