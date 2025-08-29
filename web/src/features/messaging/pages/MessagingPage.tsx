import React from 'react';
import {
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Divider,
  Badge,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
  Phone as PhoneIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import { useGetConversationsQuery, useSendMessageMutation } from '@/store/api/baseApi';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

interface Conversation {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

export const MessagingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedConversation, setSelectedConversation] = React.useState<string | null>('1');
  const [messageText, setMessageText] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');

  // API hooks
  const { data: conversations = [], isLoading } = useGetConversationsQuery();
  const [sendMessage] = useSendMessageMutation();

  // Mock data for demonstration
  const mockConversations: Conversation[] = [
    {
      id: '1',
      participantName: 'John Smith',
      lastMessage: 'Thanks for the information about the Honda Civic',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      isOnline: true,
      messages: [
        {
          id: '1',
          senderId: 'user',
          content: 'Hi John! I have some information about the 2023 Honda Civic you were interested in.',
          timestamp: '2024-01-16T10:00:00Z',
          type: 'text',
        },
        {
          id: '2',
          senderId: '1',
          content: 'That sounds great! What can you tell me about the pricing?',
          timestamp: '2024-01-16T10:05:00Z',
          type: 'text',
        },
        {
          id: '3',
          senderId: 'user',
          content: 'The Honda Civic is priced at $25,000. It includes all standard features plus navigation system.',
          timestamp: '2024-01-16T10:10:00Z',
          type: 'text',
        },
        {
          id: '4',
          senderId: '1',
          content: 'Thanks for the information about the Honda Civic',
          timestamp: '2024-01-16T10:15:00Z',
          type: 'text',
        },
      ],
    },
    {
      id: '2',
      participantName: 'Sarah Johnson',
      lastMessage: 'Can we schedule a test drive?',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      isOnline: false,
      messages: [
        {
          id: '1',
          senderId: '2',
          content: 'Hi, I saw the Toyota Camry on your website. Is it still available?',
          timestamp: '2024-01-16T09:00:00Z',
          type: 'text',
        },
        {
          id: '2',
          senderId: 'user',
          content: 'Yes, the 2024 Toyota Camry is still available. Would you like to know more about it?',
          timestamp: '2024-01-16T09:05:00Z',
          type: 'text',
        },
        {
          id: '3',
          senderId: '2',
          content: 'Can we schedule a test drive?',
          timestamp: '2024-01-16T09:10:00Z',
          type: 'text',
        },
      ],
    },
    {
      id: '3',
      participantName: 'Mike Davis',
      lastMessage: 'What financing options do you have?',
      lastMessageTime: '3 hours ago',
      unreadCount: 1,
      isOnline: true,
      messages: [
        {
          id: '1',
          senderId: '3',
          content: 'I\'m interested in the Ford F-150. What financing options do you have?',
          timestamp: '2024-01-16T07:00:00Z',
          type: 'text',
        },
      ],
    },
  ];

  const displayConversations = conversations.length > 0 ? conversations : mockConversations;
  const currentConversation = displayConversations.find(c => c.id === selectedConversation);

  const filteredConversations = displayConversations.filter(conversation =>
    conversation.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedConversation) {
      try {
        await sendMessage({
          conversationId: selectedConversation,
          message: messageText.trim(),
        });
        setMessageText('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Messages
      </Typography>

      <Grid container spacing={0} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: { xs: 0, md: '8px 0 0 8px' },
            }}
          >
            {/* Search */}
            <Box sx={{ p: 2 }}>
              <TextField
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Divider />

            {/* Conversations */}
            <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
              {filteredConversations.map((conversation) => (
                <ListItem
                  key={conversation.id}
                  button
                  selected={selectedConversation === conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="success"
                      variant="dot"
                      invisible={!conversation.isOnline}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      <Avatar>
                        {conversation.participantName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {conversation.participantName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {conversation.lastMessageTime}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px',
                          }}
                        >
                          {conversation.lastMessage}
                        </Typography>
                        {conversation.unreadCount > 0 && (
                          <Badge
                            badgeContent={conversation.unreadCount}
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: { xs: 0, md: '0 8px 8px 0' },
            }}
          >
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge
                      color="success"
                      variant="dot"
                      invisible={!currentConversation.isOnline}
                    >
                      <Avatar>
                        {currentConversation.participantName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {currentConversation.participantName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentConversation.isOnline ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton>
                      <PhoneIcon />
                    </IconButton>
                    <IconButton>
                      <VideoCallIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Messages */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {currentConversation.messages.map((message) => {
                    const isFromUser = message.senderId === 'user';
                    return (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isFromUser ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: isFromUser
                              ? theme.palette.primary.main
                              : theme.palette.grey[100],
                            color: isFromUser
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.primary,
                          }}
                        >
                          <Typography variant="body2">{message.content}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.7,
                              display: 'block',
                              mt: 0.5,
                              textAlign: 'right',
                            }}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {/* Message Input */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton size="small">
                            <AttachFileIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleSendMessage}
                            disabled={!messageText.trim()}
                            color="primary"
                          >
                            <SendIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};