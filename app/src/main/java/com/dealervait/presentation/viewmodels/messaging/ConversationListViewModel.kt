// File: app/src/main/java/com/dealervait/presentation/viewmodels/messaging/ConversationListViewModel.kt
// Purpose: ViewModel for managing conversation list state, search, and filters
// Dependencies: BaseViewModel, MessageRepository, NetworkResult

package com.dealervait.presentation.viewmodels.messaging

import androidx.lifecycle.viewModelScope
import com.dealervait.core.base.BaseViewModel
import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.Conversation
import com.dealervait.domain.model.ConversationType
import com.dealervait.domain.repository.MessageRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

data class ConversationListUiState(
    val conversations: List<Conversation> = emptyList(),
    val filteredConversations: List<Conversation> = emptyList(),
    val selectedType: ConversationType? = null,
    val showUnreadOnly: Boolean = false,
    val searchQuery: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val totalUnreadCount: Int = 0
)

@HiltViewModel
class ConversationListViewModel @Inject constructor(
    private val messageRepository: MessageRepository
) : BaseViewModel() {

    private val _uiState = MutableStateFlow(ConversationListUiState())
    val uiState: StateFlow<ConversationListUiState> = _uiState.asStateFlow()

    private var searchJob: Job? = null

    init {
        loadConversations()
        observeUnreadCount()
    }

    fun loadConversations() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // Observe conversations from repository (includes real-time updates)
            messageRepository.getConversationsFlow()
                .catch { throwable ->
                    Timber.e(throwable, "Error observing conversations")
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "Failed to load conversations: ${throwable.message}"
                    )
                }
                .collect { conversations ->
                    _uiState.value = _uiState.value.copy(
                        conversations = conversations.sortedByDescending { it.lastActivity },
                        isLoading = false,
                        error = null
                    )
                    applyFilters()
                }
        }
    }

    fun refreshConversations() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            when (val result = messageRepository.getConversations()) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        conversations = result.data.sortedByDescending { it.lastActivity },
                        isLoading = false,
                        error = null
                    )
                    applyFilters()
                    Timber.d("Conversations refreshed successfully")
                }
                
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                    Timber.e("Error refreshing conversations: ${result.message}")
                }
                
                is NetworkResult.NetworkError -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                    Timber.w("Network error refreshing conversations")
                }
                
                is NetworkResult.Loading -> {
                    // Keep loading state
                }
            }
        }
    }

    fun searchConversations(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        
        // Cancel previous search job
        searchJob?.cancel()
        
        // Debounce search
        searchJob = viewModelScope.launch {
            delay(300) // Wait 300ms for user to stop typing
            
            if (query.isBlank()) {
                applyFilters()
            } else {
                // Search locally first
                val localResults = _uiState.value.conversations.filter { conversation ->
                    conversation.title.contains(query, ignoreCase = true) ||
                    conversation.lastMessage?.content?.contains(query, ignoreCase = true) == true ||
                    conversation.participants.any { participant ->
                        participant.fullName.contains(query, ignoreCase = true) ||
                        participant.username.contains(query, ignoreCase = true)
                    }
                }
                
                _uiState.value = _uiState.value.copy(
                    filteredConversations = localResults
                )
                
                // Also search via API for more comprehensive results
                searchConversationsViaApi(query)
            }
        }
    }

    private suspend fun searchConversationsViaApi(query: String) {
        try {
            when (val result = messageRepository.searchConversations(query)) {
                is NetworkResult.Success -> {
                    val apiResults = result.data.sortedByDescending { it.lastActivity }
                    
                    // Combine local and API results, removing duplicates
                    val currentResults = _uiState.value.filteredConversations
                    val combinedResults = (currentResults + apiResults)
                        .distinctBy { it.id }
                        .sortedByDescending { it.lastActivity }
                    
                    _uiState.value = _uiState.value.copy(
                        filteredConversations = combinedResults
                    )
                }
                
                is NetworkResult.Error -> {
                    Timber.w("API search failed: ${result.message}")
                    // Keep local results
                }
                
                is NetworkResult.NetworkError -> {
                    Timber.w("Network error during search")
                    // Keep local results
                }
                
                is NetworkResult.Loading -> {
                    // Keep current state
                }
            }
        } catch (e: Exception) {
            Timber.e(e, "Exception during API search")
            // Keep local results
        }
    }

    fun filterByType(type: ConversationType?) {
        val newSelectedType = if (_uiState.value.selectedType == type) null else type
        _uiState.value = _uiState.value.copy(selectedType = newSelectedType)
        applyFilters()
    }

    fun toggleUnreadOnly() {
        _uiState.value = _uiState.value.copy(
            showUnreadOnly = !_uiState.value.showUnreadOnly
        )
        applyFilters()
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun markConversationAsRead(conversationId: String) {
        viewModelScope.launch {
            try {
                when (val result = messageRepository.markConversationAsRead(conversationId)) {
                    is NetworkResult.Success -> {
                        // Update local state immediately for better UX
                        val updatedConversations = _uiState.value.conversations.map { conversation ->
                            if (conversation.id == conversationId) {
                                conversation.copy(unreadCount = 0)
                            } else {
                                conversation
                            }
                        }
                        
                        _uiState.value = _uiState.value.copy(conversations = updatedConversations)
                        applyFilters()
                        
                        Timber.d("Conversation $conversationId marked as read")
                    }
                    
                    is NetworkResult.Error -> {
                        Timber.w("Failed to mark conversation as read: ${result.message}")
                    }
                    
                    is NetworkResult.NetworkError -> {
                        Timber.w("Network error marking conversation as read")
                    }
                    
                    is NetworkResult.Loading -> {
                        // Handle loading state if needed
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Exception marking conversation as read")
            }
        }
    }

    fun archiveConversation(conversationId: String, archive: Boolean = true) {
        viewModelScope.launch {
            try {
                when (val result = messageRepository.archiveConversation(conversationId, archive)) {
                    is NetworkResult.Success -> {
                        // Remove from local list immediately
                        val updatedConversations = if (archive) {
                            _uiState.value.conversations.filter { it.id != conversationId }
                        } else {
                            // If unarchiving, we'd need to reload the list
                            _uiState.value.conversations
                        }
                        
                        _uiState.value = _uiState.value.copy(conversations = updatedConversations)
                        applyFilters()
                        
                        Timber.d("Conversation $conversationId ${if (archive) "archived" else "unarchived"}")
                    }
                    
                    is NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            error = "Failed to ${if (archive) "archive" else "unarchive"} conversation"
                        )
                        Timber.w("Failed to archive conversation: ${result.message}")
                    }
                    
                    is NetworkResult.NetworkError -> {
                        _uiState.value = _uiState.value.copy(
                            error = "Network error. Please try again."
                        )
                        Timber.w("Network error archiving conversation")
                    }
                    
                    is NetworkResult.Loading -> {
                        // Handle loading state if needed
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Exception archiving conversation")
                _uiState.value = _uiState.value.copy(
                    error = "An error occurred. Please try again."
                )
            }
        }
    }

    fun muteConversation(conversationId: String, mute: Boolean = true) {
        viewModelScope.launch {
            try {
                when (val result = messageRepository.muteConversation(conversationId, mute)) {
                    is NetworkResult.Success -> {
                        // Update local state
                        val updatedConversations = _uiState.value.conversations.map { conversation ->
                            if (conversation.id == conversationId) {
                                conversation.copy(isMuted = mute)
                            } else {
                                conversation
                            }
                        }
                        
                        _uiState.value = _uiState.value.copy(conversations = updatedConversations)
                        applyFilters()
                        
                        Timber.d("Conversation $conversationId ${if (mute) "muted" else "unmuted"}")
                    }
                    
                    is NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            error = "Failed to ${if (mute) "mute" else "unmute"} conversation"
                        )
                        Timber.w("Failed to mute conversation: ${result.message}")
                    }
                    
                    is NetworkResult.NetworkError -> {
                        _uiState.value = _uiState.value.copy(
                            error = "Network error. Please try again."
                        )
                        Timber.w("Network error muting conversation")
                    }
                    
                    is NetworkResult.Loading -> {
                        // Handle loading state if needed
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Exception muting conversation")
                _uiState.value = _uiState.value.copy(
                    error = "An error occurred. Please try again."
                )
            }
        }
    }

    private fun applyFilters() {
        var filtered = _uiState.value.conversations

        // Apply search filter
        if (_uiState.value.searchQuery.isNotBlank()) {
            val query = _uiState.value.searchQuery
            filtered = filtered.filter { conversation ->
                conversation.title.contains(query, ignoreCase = true) ||
                conversation.lastMessage?.content?.contains(query, ignoreCase = true) == true ||
                conversation.participants.any { participant ->
                    participant.fullName.contains(query, ignoreCase = true) ||
                    participant.username.contains(query, ignoreCase = true)
                }
            }
        }

        // Apply type filter
        _uiState.value.selectedType?.let { type ->
            filtered = filtered.filter { it.type == type }
        }

        // Apply unread filter
        if (_uiState.value.showUnreadOnly) {
            filtered = filtered.filter { it.unreadCount > 0 }
        }

        _uiState.value = _uiState.value.copy(
            filteredConversations = filtered.sortedByDescending { it.lastActivity }
        )
    }

    private fun observeUnreadCount() {
        viewModelScope.launch {
            // This could be implemented to observe total unread count from repository
            try {
                while (true) {
                    val unreadCount = messageRepository.getTotalUnreadCount()
                    _uiState.value = _uiState.value.copy(totalUnreadCount = unreadCount)
                    delay(30000) // Check every 30 seconds
                }
            } catch (e: Exception) {
                Timber.e(e, "Error observing unread count")
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        searchJob?.cancel()
    }
}
