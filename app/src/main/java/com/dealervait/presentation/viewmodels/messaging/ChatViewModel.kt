// File: app/src/main/java/com/dealervait/presentation/viewmodels/messaging/ChatViewModel.kt
// Purpose: ViewModel for managing chat screen state, messages, and real-time updates
// Dependencies: BaseViewModel, MessageRepository, NetworkResult, Paging

package com.dealervait.presentation.viewmodels.messaging

import androidx.lifecycle.viewModelScope
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.dealervait.core.base.BaseViewModel
import com.dealervait.core.error.NetworkResult
import com.dealervait.core.storage.TokenManager
import com.dealervait.domain.model.*
import com.dealervait.domain.repository.MessageRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

data class ChatUiState(
    val conversation: Conversation? = null,
    val currentUserId: Int = 0,
    val isSendingMessage: Boolean = false,
    val isOnline: Boolean = true,
    val typingIndicators: List<TypingIndicator> = emptyList(),
    val error: String? = null,
    val isLoading: Boolean = false
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val messageRepository: MessageRepository,
    private val tokenManager: TokenManager
) : BaseViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    private var currentConversationId: String? = null
    
    // Messages flow with paging
    private val _messages = MutableStateFlow<Flow<PagingData<Message>>?>(null)
    val messages: Flow<PagingData<Message>> = _messages
        .filterNotNull()
        .flattenLatest()
        .cachedIn(viewModelScope)

    fun initialize(conversationId: String) {
        if (currentConversationId == conversationId) return
        
        currentConversationId = conversationId
        
        // Set current user ID
        val userId = tokenManager.getCurrentUserId() ?: 0
        _uiState.value = _uiState.value.copy(currentUserId = userId)
        
        // Load conversation details
        loadConversation(conversationId)
        
        // Load messages with paging
        loadMessages(conversationId)
        
        // Observe typing indicators
        observeTypingIndicators(conversationId)
        
        // Mark conversation as read
        markConversationAsRead(conversationId)
    }

    private fun loadConversation(conversationId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                when (val result = messageRepository.getConversationById(conversationId)) {
                    is NetworkResult.Success -> {
                        _uiState.value = _uiState.value.copy(
                            conversation = result.data,
                            isLoading = false,
                            error = null
                        )
                        Timber.d("Conversation loaded: ${result.data.title}")
                    }
                    
                    is NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = result.message
                        )
                        Timber.e("Error loading conversation: ${result.message}")
                    }
                    
                    is NetworkResult.NetworkError -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = result.message
                        )
                        Timber.w("Network error loading conversation")
                    }
                    
                    is NetworkResult.Loading -> {
                        // Keep loading state
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Exception loading conversation")
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to load conversation"
                )
            }
        }
    }

    private fun loadMessages(conversationId: String) {
        _messages.value = messageRepository.getMessagesForConversation(conversationId)
    }

    private fun observeTypingIndicators(conversationId: String) {
        viewModelScope.launch {
            messageRepository.getTypingIndicators(conversationId)
                .catch { throwable ->
                    Timber.e(throwable, "Error observing typing indicators")
                }
                .collect { indicators ->
                    // Filter out current user's typing indicator
                    val filteredIndicators = indicators.filter { 
                        it.userId != _uiState.value.currentUserId 
                    }
                    
                    _uiState.value = _uiState.value.copy(
                        typingIndicators = filteredIndicators
                    )
                }
        }
    }

    private fun markConversationAsRead(conversationId: String) {
        viewModelScope.launch {
            try {
                messageRepository.markConversationAsRead(conversationId)
                Timber.d("Conversation marked as read")
            } catch (e: Exception) {
                Timber.w(e, "Failed to mark conversation as read")
            }
        }
    }

    fun sendMessage(
        content: String,
        messageType: MessageType = MessageType.TEXT,
        replyToMessageId: String? = null,
        attachments: List<MessageAttachment> = emptyList()
    ) {
        val conversationId = currentConversationId ?: return
        
        if (content.isBlank() && attachments.isEmpty()) {
            Timber.w("Cannot send empty message")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSendingMessage = true, error = null)
            
            try {
                when (val result = messageRepository.sendMessage(
                    conversationId = conversationId,
                    content = content.trim(),
                    messageType = messageType,
                    replyToMessageId = replyToMessageId,
                    attachments = attachments
                )) {
                    is NetworkResult.Success -> {
                        _uiState.value = _uiState.value.copy(
                            isSendingMessage = false,
                            error = null
                        )
                        Timber.d("Message sent successfully")
                    }
                    
                    is NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isSendingMessage = false,
                            error = result.message
                        )
                        Timber.e("Error sending message: ${result.message}")
                    }
                    
                    is NetworkResult.NetworkError -> {
                        _uiState.value = _uiState.value.copy(
                            isSendingMessage = false,
                            error = "Message will be sent when connection is restored"
                        )
                        Timber.w("Network error sending message - queued for retry")
                    }
                    
                    is NetworkResult.Loading -> {
                        // Keep sending state
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Exception sending message")
                _uiState.value = _uiState.value.copy(
                    isSendingMessage = false,
                    error = "Failed to send message"
                )
            }
        }
    }

    fun editMessage(messageId: String, newContent: String) {
        viewModelScope.launch {
            try {
                when (val result = messageRepository.editMessage(messageId, newContent.trim())) {
                    is NetworkResult.Success -> {
                        Timber.d("Message edited successfully")
                    }
                    
                    is NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            error = "Failed to edit message: ${result.message}"
                        )
                        Timber.e("Error editing message: ${result.message}")
                    }
                    
                    is NetworkResult.NetworkError -> {
                        _uiState.value = _uiState.value.copy(
                            error = "Cannot edit message while offline"
                        )
                        Timber.w("Network error editing message")
                    }
                    
                    is NetworkResult.Loading -> {
                        // Handle loading state if needed
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Exception editing message")
                _uiState.value = _uiState.value.copy(
                    error = "Failed to edit message"
                )
            }
        }
    }

    fun deleteMessage(messageId: String) {
        viewModelScope.launch {
            try {
                when (val result = messageRepository.deleteMessage(messageId)) {
                    is NetworkResult.Success -> {
                        Timber.d("Message deleted successfully")
                    }
                    
                    is NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            error = "Failed to delete message: ${result.message}"
                        )
                        Timber.e("Error deleting message: ${result.message}")
                    }
                    
                    is NetworkResult.NetworkError -> {
                        _uiState.value = _uiState.value.copy(
                            error = "Cannot delete message while offline"
                        )
                        Timber.w("Network error deleting message")
                    }
                    
                    is NetworkResult.Loading -> {
                        // Handle loading state if needed
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Exception deleting message")
                _uiState.value = _uiState.value.copy(
                    error = "Failed to delete message"
                )
            }
        }
    }

    fun startTyping() {
        val conversationId = currentConversationId ?: return
        
        viewModelScope.launch {
            try {
                messageRepository.startTyping(conversationId)
            } catch (e: Exception) {
                Timber.w(e, "Failed to send typing indicator")
            }
        }
    }

    fun stopTyping() {
        val conversationId = currentConversationId ?: return
        
        viewModelScope.launch {
            try {
                messageRepository.stopTyping(conversationId)
            } catch (e: Exception) {
                Timber.w(e, "Failed to stop typing indicator")
            }
        }
    }

    fun markMessageAsRead(messageId: String) {
        viewModelScope.launch {
            try {
                messageRepository.markMessageAsRead(messageId)
                Timber.d("Message marked as read")
            } catch (e: Exception) {
                Timber.w(e, "Failed to mark message as read")
            }
        }
    }

    fun uploadAttachment(filePath: String, fileName: String, mimeType: String) {
        val conversationId = currentConversationId ?: return
        
        viewModelScope.launch {
            try {
                when (val result = messageRepository.uploadAttachment(conversationId, filePath, fileName, mimeType)) {
                    is NetworkResult.Success -> {
                        val attachment = result.data
                        
                        // Send message with attachment
                        sendMessage(
                            content = "", // Empty text for attachment-only message
                            messageType = when (attachment.type) {
                                AttachmentType.IMAGE -> MessageType.IMAGE
                                AttachmentType.DOCUMENT -> MessageType.DOCUMENT
                                AttachmentType.VOICE -> MessageType.VOICE
                                AttachmentType.VIDEO -> MessageType.DOCUMENT // Treat video as document for now
                            },
                            attachments = listOf(attachment)
                        )
                        
                        Timber.d("Attachment uploaded and sent successfully")
                    }
                    
                    is NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            error = "Failed to upload file: ${result.message}"
                        )
                        Timber.e("Error uploading attachment: ${result.message}")
                    }
                    
                    is NetworkResult.NetworkError -> {
                        _uiState.value = _uiState.value.copy(
                            error = "Cannot upload files while offline"
                        )
                        Timber.w("Network error uploading attachment")
                    }
                    
                    is NetworkResult.Loading -> {
                        // Handle loading state if needed
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Exception uploading attachment")
                _uiState.value = _uiState.value.copy(
                    error = "Failed to upload file"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun refreshMessages() {
        val conversationId = currentConversationId ?: return
        loadMessages(conversationId)
    }

    fun updateOnlineStatus(isOnline: Boolean) {
        _uiState.value = _uiState.value.copy(isOnline = isOnline)
    }

    override fun onCleared() {
        super.onCleared()
        // Stop typing when leaving the chat
        stopTyping()
        Timber.d("ChatViewModel cleared")
    }
}
