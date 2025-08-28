// File: app/src/main/java/com/dealervait/presentation/viewmodels/messaging/NewChatViewModel.kt
// Purpose: ViewModel for managing new chat creation state and user selection
// Dependencies: BaseViewModel, MessageRepository, NetworkResult

package com.dealervait.presentation.viewmodels.messaging

import androidx.lifecycle.viewModelScope
import com.dealervait.core.base.BaseViewModel
import com.dealervait.core.error.NetworkResult
import com.dealervait.domain.model.ConversationType
import com.dealervait.domain.repository.MessageRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

data class NewChatUiState(
    val users: List<Any> = emptyList(), // Placeholder - would be List<User>
    val filteredUsers: List<Any> = emptyList(),
    val selectedUserIds: Set<Int> = emptySet(),
    val searchQuery: String = "",
    val conversationType: String = "DIRECT", // "DIRECT" or "GROUP"
    val groupTitle: String = "",
    val isLoading: Boolean = false,
    val isCreating: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class NewChatViewModel @Inject constructor(
    private val messageRepository: MessageRepository
) : BaseViewModel() {

    private val _uiState = MutableStateFlow(NewChatUiState())
    val uiState: StateFlow<NewChatUiState> = _uiState.asStateFlow()

    init {
        loadUsers()
    }

    fun loadUsers() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                // TODO: Implement actual user loading from API
                // For now, using placeholder data
                val mockUsers = listOf<Any>() // Would be actual User objects
                
                _uiState.value = _uiState.value.copy(
                    users = mockUsers,
                    filteredUsers = mockUsers,
                    isLoading = false,
                    error = null
                )
                
                Timber.d("Users loaded successfully")
            } catch (e: Exception) {
                Timber.e(e, "Error loading users")
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to load users: ${e.message}"
                )
            }
        }
    }

    fun searchUsers(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        
        val filteredUsers = if (query.isBlank()) {
            _uiState.value.users
        } else {
            // TODO: Implement actual user filtering based on User model
            // For now, returning all users
            _uiState.value.users
        }
        
        _uiState.value = _uiState.value.copy(filteredUsers = filteredUsers)
    }

    fun selectUser(userId: Int) {
        val currentSelected = _uiState.value.selectedUserIds.toMutableSet()
        
        // For direct messages, only allow one user selection
        if (_uiState.value.conversationType == "DIRECT") {
            currentSelected.clear()
        }
        
        currentSelected.add(userId)
        _uiState.value = _uiState.value.copy(selectedUserIds = currentSelected)
        
        Timber.d("User $userId selected")
    }

    fun deselectUser(userId: Int) {
        val currentSelected = _uiState.value.selectedUserIds.toMutableSet()
        currentSelected.remove(userId)
        _uiState.value = _uiState.value.copy(selectedUserIds = currentSelected)
        
        Timber.d("User $userId deselected")
    }

    fun setConversationType(type: String) {
        _uiState.value = _uiState.value.copy(
            conversationType = type,
            selectedUserIds = emptySet() // Clear selection when changing type
        )
        
        Timber.d("Conversation type set to: $type")
    }

    fun setGroupTitle(title: String) {
        _uiState.value = _uiState.value.copy(groupTitle = title)
    }

    fun createConversation(onSuccess: (String) -> Unit) {
        val selectedUserIds = _uiState.value.selectedUserIds
        val conversationType = _uiState.value.conversationType
        
        if (selectedUserIds.isEmpty()) {
            _uiState.value = _uiState.value.copy(error = "Please select at least one user")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCreating = true, error = null)
            
            try {
                val result = when (conversationType) {
                    "DIRECT" -> {
                        val targetUserId = selectedUserIds.first()
                        messageRepository.startDirectMessage(targetUserId)
                    }
                    
                    "GROUP" -> {
                        val title = if (_uiState.value.groupTitle.isNotBlank()) {
                            _uiState.value.groupTitle
                        } else {
                            "Group Chat" // Default title
                        }
                        
                        messageRepository.createGroup(
                            title = title,
                            participantIds = selectedUserIds.toList()
                        )
                    }
                    
                    else -> {
                        _uiState.value = _uiState.value.copy(
                            isCreating = false,
                            error = "Invalid conversation type"
                        )
                        return@launch
                    }
                }

                when (result) {
                    is NetworkResult.Success -> {
                        _uiState.value = _uiState.value.copy(
                            isCreating = false,
                            error = null
                        )
                        
                        Timber.d("Conversation created successfully: ${result.data.id}")
                        onSuccess(result.data.id)
                    }
                    
                    is NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isCreating = false,
                            error = result.message
                        )
                        Timber.e("Error creating conversation: ${result.message}")
                    }
                    
                    is NetworkResult.NetworkError -> {
                        _uiState.value = _uiState.value.copy(
                            isCreating = false,
                            error = result.message
                        )
                        Timber.w("Network error creating conversation")
                    }
                    
                    is NetworkResult.Loading -> {
                        // Keep creating state
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Exception creating conversation")
                _uiState.value = _uiState.value.copy(
                    isCreating = false,
                    error = "Failed to create conversation: ${e.message}"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    // Helper function for getting conversation type enum
    private fun getConversationType(type: String): ConversationType {
        return when (type) {
            "DIRECT" -> ConversationType.DIRECT
            "GROUP" -> ConversationType.GROUP
            "CUSTOMER" -> ConversationType.CUSTOMER
            "VEHICLE_DISCUSSION" -> ConversationType.VEHICLE_DISCUSSION
            else -> ConversationType.DIRECT
        }
    }
}
