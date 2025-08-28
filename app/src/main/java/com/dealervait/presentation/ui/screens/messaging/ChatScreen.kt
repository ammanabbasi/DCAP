// File: app/src/main/java/com/dealervait/presentation/ui/screens/messaging/ChatScreen.kt
// Purpose: Complete chat screen UI with message bubbles, attachments, typing indicators, and real-time updates
// Dependencies: Jetpack Compose, Material 3, Paging 3, ViewModel, Hilt

package com.dealervait.presentation.ui.screens.messaging

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.paging.compose.collectAsLazyPagingItems
import androidx.paging.compose.items
import com.dealervait.domain.model.*
import com.dealervait.presentation.ui.theme.DealerVaitTheme
import com.dealervait.presentation.viewmodels.messaging.ChatViewModel
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    conversationId: String,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ChatViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val messages = viewModel.messages.collectAsLazyPagingItems()
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    
    var messageText by remember { mutableStateOf("") }
    var isTyping by remember { mutableStateOf(false) }
    var replyToMessage by remember { mutableStateOf<Message?>(null) }

    LaunchedEffect(conversationId) {
        viewModel.initialize(conversationId)
    }

    LaunchedEffect(messageText) {
        if (messageText.isNotEmpty() && !isTyping) {
            isTyping = true
            viewModel.startTyping()
        } else if (messageText.isEmpty() && isTyping) {
            isTyping = false
            viewModel.stopTyping()
        }
    }

    Scaffold(
        topBar = {
            ChatTopAppBar(
                conversation = uiState.conversation,
                onNavigateBack = onNavigateBack,
                onShowInfo = { /* TODO: Navigate to conversation info */ },
                isOnline = uiState.isOnline,
                typingIndicators = uiState.typingIndicators
            )
        }
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Messages list
            Box(
                modifier = Modifier.weight(1f)
            ) {
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    reverseLayout = true, // New messages at bottom
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(messages) { message ->
                        message?.let { msg ->
                            MessageBubble(
                                message = msg,
                                isFromCurrentUser = msg.senderId == uiState.currentUserId,
                                onReply = { replyToMessage = msg },
                                onEdit = { /* TODO: Implement edit */ },
                                onDelete = { viewModel.deleteMessage(msg.id) },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }

                    // Loading indicator for pagination
                    if (messages.loadState.append.endOfPaginationReached.not()) {
                        item {
                            Box(
                                modifier = Modifier.fillMaxWidth(),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }
                    }
                }

                // Scroll to bottom FAB
                if (listState.firstVisibleItemIndex > 5) {
                    FloatingActionButton(
                        onClick = {
                            scope.launch {
                                listState.animateScrollToItem(0)
                            }
                        },
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(16.dp),
                        containerColor = MaterialTheme.colorScheme.primary
                    ) {
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = "Scroll to bottom"
                        )
                    }
                }
            }

            // Reply preview
            AnimatedVisibility(
                visible = replyToMessage != null,
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                replyToMessage?.let { reply ->
                    ReplyPreview(
                        message = reply,
                        onDismiss = { replyToMessage = null },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                }
            }

            // Message input
            MessageInput(
                text = messageText,
                onTextChange = { messageText = it },
                onSendMessage = {
                    viewModel.sendMessage(
                        content = messageText,
                        replyToMessageId = replyToMessage?.id
                    )
                    messageText = ""
                    replyToMessage = null
                    isTyping = false
                    viewModel.stopTyping()
                },
                onAttachFile = { /* TODO: Implement file attachment */ },
                onTakePhoto = { /* TODO: Implement photo capture */ },
                onRecordVoice = { /* TODO: Implement voice recording */ },
                isLoading = uiState.isSendingMessage,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ChatTopAppBar(
    conversation: Conversation?,
    onNavigateBack: () -> Unit,
    onShowInfo: () -> Unit,
    isOnline: Boolean,
    typingIndicators: List<TypingIndicator>,
    modifier: Modifier = Modifier
) {
    TopAppBar(
        title = {
            Column {
                Text(
                    text = conversation?.title ?: "Loading...",
                    style = MaterialTheme.typography.titleMedium
                )
                
                when {
                    typingIndicators.isNotEmpty() -> {
                        val typingUsers = typingIndicators.joinToString { it.username }
                        Text(
                            text = if (typingIndicators.size == 1) {
                                "$typingUsers is typing..."
                            } else {
                                "$typingUsers are typing..."
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    
                    conversation?.type == ConversationType.DIRECT -> {
                        Text(
                            text = if (isOnline) "Online" else "Last seen recently",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    
                    else -> {
                        Text(
                            text = "${conversation?.participants?.size ?: 0} participants",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        },
        navigationIcon = {
            IconButton(onClick = onNavigateBack) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back"
                )
            }
        },
        actions = {
            IconButton(onClick = onShowInfo) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = "Conversation info"
                )
            }
        },
        modifier = modifier
    )
}

@Composable
private fun MessageBubble(
    message: Message,
    isFromCurrentUser: Boolean,
    onReply: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = if (isFromCurrentUser) Alignment.End else Alignment.Start
    ) {
        // Show sender name for group chats when not from current user
        if (!isFromCurrentUser) {
            Text(
                text = message.senderName,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
            )
        }

        // Reply context
        message.replyToMessageId?.let {
            // TODO: Show reply context
        }

        // Message content
        Card(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clickable { /* TODO: Show message options */ },
            colors = CardDefaults.cardColors(
                containerColor = if (isFromCurrentUser) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.surfaceVariant
                }
            ),
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (isFromCurrentUser) 16.dp else 4.dp,
                bottomEnd = if (isFromCurrentUser) 4.dp else 16.dp
            )
        ) {
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                when (message.messageType) {
                    MessageType.TEXT -> {
                        Text(
                            text = message.content,
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (isFromCurrentUser) {
                                MaterialTheme.colorScheme.onPrimary
                            } else {
                                MaterialTheme.colorScheme.onSurfaceVariant
                            }
                        )
                    }
                    
                    MessageType.IMAGE -> {
                        // TODO: Show image
                        Text(
                            text = "\uD83D\uDCF7 Image",
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (isFromCurrentUser) {
                                MaterialTheme.colorScheme.onPrimary
                            } else {
                                MaterialTheme.colorScheme.onSurfaceVariant
                            }
                        )
                    }
                    
                    MessageType.DOCUMENT -> {
                        // TODO: Show document
                        message.attachments.firstOrNull()?.let { attachment ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Description,
                                    contentDescription = null,
                                    modifier = Modifier.size(24.dp),
                                    tint = if (isFromCurrentUser) {
                                        MaterialTheme.colorScheme.onPrimary
                                    } else {
                                        MaterialTheme.colorScheme.onSurfaceVariant
                                    }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = attachment.fileName,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = if (isFromCurrentUser) {
                                        MaterialTheme.colorScheme.onPrimary
                                    } else {
                                        MaterialTheme.colorScheme.onSurfaceVariant
                                    }
                                )
                            }
                        }
                    }
                    
                    MessageType.VOICE -> {
                        // TODO: Show voice message player
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Mic,
                                contentDescription = null,
                                modifier = Modifier.size(24.dp),
                                tint = if (isFromCurrentUser) {
                                    MaterialTheme.colorScheme.onPrimary
                                } else {
                                    MaterialTheme.colorScheme.onSurfaceVariant
                                }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Voice message",
                                style = MaterialTheme.typography.bodyMedium,
                                color = if (isFromCurrentUser) {
                                    MaterialTheme.colorScheme.onPrimary
                                } else {
                                    MaterialTheme.colorScheme.onSurfaceVariant
                                }
                            )
                        }
                    }
                    
                    MessageType.SYSTEM -> {
                        Text(
                            text = message.content,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                            fontWeight = FontWeight.Normal
                        )
                    }
                }

                // Message timestamp and status
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (message.isEdited) {
                        Text(
                            text = "edited",
                            style = MaterialTheme.typography.labelSmall,
                            color = if (isFromCurrentUser) {
                                MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                            } else {
                                MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                            }
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                    }

                    Text(
                        text = formatMessageTime(message.timestamp),
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isFromCurrentUser) {
                            MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                        } else {
                            MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                        }
                    )

                    // Message status for current user messages
                    if (isFromCurrentUser) {
                        Spacer(modifier = Modifier.width(4.dp))
                        when {
                            message.readBy.size > 1 -> { // More than just sender
                                Icon(
                                    imageVector = Icons.Default.DoneAll,
                                    contentDescription = "Read",
                                    modifier = Modifier.size(16.dp),
                                    tint = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                                )
                            }
                            else -> {
                                Icon(
                                    imageVector = Icons.Default.Done,
                                    contentDescription = "Sent",
                                    modifier = Modifier.size(16.dp),
                                    tint = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ReplyPreview(
    message: Message,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .height(48.dp)
                    .background(
                        MaterialTheme.colorScheme.primary,
                        RoundedCornerShape(2.dp)
                    )
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "Replying to ${message.senderName}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = message.content,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2
                )
            }
            
            IconButton(onClick = onDismiss) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Cancel reply"
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MessageInput(
    text: String,
    onTextChange: (String) -> Unit,
    onSendMessage: () -> Unit,
    onAttachFile: () -> Unit,
    onTakePhoto: () -> Unit,
    onRecordVoice: () -> Unit,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        shape = RoundedCornerShape(0.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.Bottom
        ) {
            // Attachment button
            IconButton(
                onClick = onAttachFile,
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.AttachFile,
                    contentDescription = "Attach file"
                )
            }

            // Message input field
            OutlinedTextField(
                value = text,
                onValueChange = onTextChange,
                modifier = Modifier.weight(1f),
                placeholder = { Text("Type a message...") },
                maxLines = 5,
                shape = RoundedCornerShape(24.dp)
            )

            Spacer(modifier = Modifier.width(8.dp))

            // Send/Voice button
            if (text.isNotEmpty()) {
                FloatingActionButton(
                    onClick = onSendMessage,
                    modifier = Modifier.size(40.dp),
                    containerColor = MaterialTheme.colorScheme.primary
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = "Send message",
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                }
            } else {
                IconButton(
                    onClick = onRecordVoice,
                    modifier = Modifier.size(40.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "Record voice message"
                    )
                }
            }
        }
    }
}

private fun formatMessageTime(timestamp: Long): String {
    val now = System.currentTimeMillis()
    val diff = now - timestamp
    
    return when {
        diff < 60_000 -> "now"
        diff < 3600_000 -> "${diff / 60_000}m"
        diff < 86400_000 -> {
            val dateFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            dateFormat.format(Date(timestamp))
        }
        else -> {
            val dateFormat = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault())
            dateFormat.format(Date(timestamp))
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun ChatScreenPreview() {
    DealerVaitTheme {
        // Preview would need mock data
        ChatScreen(
            conversationId = "1",
            onNavigateBack = {}
        )
    }
}
