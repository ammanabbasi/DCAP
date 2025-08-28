// File: app/src/main/java/com/dealervait/presentation/ui/screens/messaging/NewChatScreen.kt
// Purpose: Screen for creating new conversations and selecting participants
// Dependencies: Jetpack Compose, Material 3, ViewModel

package com.dealervait.presentation.ui.screens.messaging

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.dealervait.presentation.ui.theme.DealerVaitTheme
import com.dealervait.presentation.viewmodels.messaging.NewChatViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewChatScreen(
    onNavigateBack: () -> Unit,
    onNavigateToChat: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NewChatViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadUsers()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New Conversation") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            // Search bar
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = viewModel::searchUsers,
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search users...") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null
                    )
                },
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Conversation type selection
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = uiState.conversationType == "DIRECT",
                    onClick = { viewModel.setConversationType("DIRECT") },
                    label = { Text("Direct Message") }
                )
                FilterChip(
                    selected = uiState.conversationType == "GROUP",
                    onClick = { viewModel.setConversationType("GROUP") },
                    label = { Text("Group Chat") }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Users list
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(uiState.filteredUsers) { user ->
                        UserItem(
                            user = user,
                            isSelected = user.id in uiState.selectedUserIds,
                            onSelectionChange = { selected ->
                                if (selected) {
                                    viewModel.selectUser(user.id)
                                } else {
                                    viewModel.deselectUser(user.id)
                                }
                            }
                        )
                    }
                }
            }

            // Create conversation button
            if (uiState.selectedUserIds.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                
                Button(
                    onClick = {
                        viewModel.createConversation { conversationId ->
                            onNavigateToChat(conversationId)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !uiState.isCreating
                ) {
                    if (uiState.isCreating) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                    Text(
                        if (uiState.conversationType == "DIRECT") {
                            "Start Direct Message"
                        } else {
                            "Create Group Chat"
                        }
                    )
                }
            }

            // Error message
            uiState.error?.let { error ->
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = error,
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun UserItem(
    user: Any, // Placeholder - would be User domain model
    isSelected: Boolean,
    onSelectionChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = { onSelectionChange(!isSelected) },
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) {
                MaterialTheme.colorScheme.primaryContainer
            } else {
                MaterialTheme.colorScheme.surface
            }
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // User avatar placeholder
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .padding(end = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(24.dp)
                )
            }

            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "User Name", // Placeholder
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = "@username", // Placeholder
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = "Selected",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun NewChatScreenPreview() {
    DealerVaitTheme {
        NewChatScreen(
            onNavigateBack = {},
            onNavigateToChat = {}
        )
    }
}
