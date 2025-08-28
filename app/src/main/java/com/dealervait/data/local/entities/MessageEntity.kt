// File: app/src/main/java/com/dealervait/data/local/entities/MessageEntity.kt
// Purpose: Room entity for storing messages in local database
// Dependencies: Room, MessageType, AttachmentType

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import com.dealervait.domain.model.AttachmentType
import com.dealervait.domain.model.MessageAttachment
import com.dealervait.domain.model.MessageReadReceipt
import com.dealervait.domain.model.MessageType
import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory

@Entity(tableName = "messages")
@TypeConverters(MessageTypeConverters::class)
data class MessageEntity(
    @PrimaryKey
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
    val metadata: Map<String, String> = emptyMap(),
    val syncedAt: Long? = null,
    val needsSync: Boolean = false,
    val localId: String? = null // For offline messages before sync
)

class MessageTypeConverters {
    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    @TypeConverter
    fun fromMessageType(messageType: MessageType): String = messageType.name

    @TypeConverter
    fun toMessageType(messageType: String): MessageType = MessageType.valueOf(messageType)

    @TypeConverter
    fun fromAttachmentsList(attachments: List<MessageAttachment>): String {
        val adapter: JsonAdapter<List<MessageAttachment>> = moshi.adapter(
            Types.newParameterizedType(List::class.java, MessageAttachment::class.java)
        )
        return adapter.toJson(attachments)
    }

    @TypeConverter
    fun toAttachmentsList(attachmentsJson: String): List<MessageAttachment> {
        val adapter: JsonAdapter<List<MessageAttachment>> = moshi.adapter(
            Types.newParameterizedType(List::class.java, MessageAttachment::class.java)
        )
        return adapter.fromJson(attachmentsJson) ?: emptyList()
    }

    @TypeConverter
    fun fromReadReceiptsList(readReceipts: List<MessageReadReceipt>): String {
        val adapter: JsonAdapter<List<MessageReadReceipt>> = moshi.adapter(
            Types.newParameterizedType(List::class.java, MessageReadReceipt::class.java)
        )
        return adapter.toJson(readReceipts)
    }

    @TypeConverter
    fun toReadReceiptsList(readReceiptsJson: String): List<MessageReadReceipt> {
        val adapter: JsonAdapter<List<MessageReadReceipt>> = moshi.adapter(
            Types.newParameterizedType(List::class.java, MessageReadReceipt::class.java)
        )
        return adapter.fromJson(readReceiptsJson) ?: emptyList()
    }

    @TypeConverter
    fun fromStringMap(map: Map<String, String>): String {
        val adapter: JsonAdapter<Map<String, String>> = moshi.adapter(
            Types.newParameterizedType(Map::class.java, String::class.java, String::class.java)
        )
        return adapter.toJson(map)
    }

    @TypeConverter
    fun toStringMap(mapJson: String): Map<String, String> {
        val adapter: JsonAdapter<Map<String, String>> = moshi.adapter(
            Types.newParameterizedType(Map::class.java, String::class.java, String::class.java)
        )
        return adapter.fromJson(mapJson) ?: emptyMap()
    }
}
