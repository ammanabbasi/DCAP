// File: app/src/main/java/com/dealervait/data/local/entities/ConversationEntity.kt
// Purpose: Room entity for storing conversations in local database
// Dependencies: Room, ConversationType, ConversationParticipant

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import com.dealervait.domain.model.ConversationParticipant
import com.dealervait.domain.model.ConversationType
import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory

@Entity(tableName = "conversations")
@TypeConverters(ConversationTypeConverters::class)
data class ConversationEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val type: ConversationType,
    val participants: List<ConversationParticipant>,
    val lastMessageId: String? = null,
    val lastMessageContent: String? = null,
    val lastMessageTimestamp: Long? = null,
    val lastActivity: Long,
    val createdAt: Long,
    val createdBy: Int,
    val isArchived: Boolean = false,
    val isMuted: Boolean = false,
    val unreadCount: Int = 0,
    val entityType: String? = null,
    val entityId: String? = null,
    val metadata: Map<String, String> = emptyMap(),
    val syncedAt: Long? = null,
    val needsSync: Boolean = false
)

class ConversationTypeConverters {
    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    @TypeConverter
    fun fromConversationType(type: ConversationType): String = type.name

    @TypeConverter
    fun toConversationType(type: String): ConversationType = ConversationType.valueOf(type)

    @TypeConverter
    fun fromParticipantsList(participants: List<ConversationParticipant>): String {
        val adapter: JsonAdapter<List<ConversationParticipant>> = moshi.adapter(
            Types.newParameterizedType(List::class.java, ConversationParticipant::class.java)
        )
        return adapter.toJson(participants)
    }

    @TypeConverter
    fun toParticipantsList(participantsJson: String): List<ConversationParticipant> {
        val adapter: JsonAdapter<List<ConversationParticipant>> = moshi.adapter(
            Types.newParameterizedType(List::class.java, ConversationParticipant::class.java)
        )
        return adapter.fromJson(participantsJson) ?: emptyList()
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
