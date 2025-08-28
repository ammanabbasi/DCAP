import express from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import logger from '../utils/logger';
import { io } from '../server';

const router = express.Router();

// Apply auth middleware to all messaging routes
router.use(authMiddleware);

// @route   GET /api/messaging/conversations
// @desc    Get user conversations
// @access  Private
router.get('/conversations', async (req, res) => {
  try {
    const user = (req as any).user;

    const mockConversations = [
      {
        id: 'conv-1',
        participantId: 'lead-1',
        participantName: 'John Smith',
        participantAvatar: null,
        lastMessage: {
          id: 'msg-1',
          content: 'Thank you for the information about the Honda Accord',
          senderId: 'lead-1',
          timestamp: '2024-01-15T10:30:00Z'
        },
        unreadCount: 2,
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'conv-2',
        participantId: 'lead-2',
        participantName: 'Sarah Johnson',
        participantAvatar: null,
        lastMessage: {
          id: 'msg-2',
          content: 'Can we schedule a test drive?',
          senderId: 'lead-2',
          timestamp: '2024-01-15T09:45:00Z'
        },
        unreadCount: 0,
        updatedAt: '2024-01-15T09:45:00Z'
      }
    ];

    res.json({
      success: true,
      data: {
        conversations: mockConversations
      }
    });

  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

// @route   GET /api/messaging/conversations/:id/messages
// @desc    Get messages for a conversation
// @access  Private
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const mockMessages = [
      {
        id: 'msg-1',
        conversationId: id,
        content: 'Hi, I\'m interested in the Honda Accord you have listed.',
        senderId: 'lead-1',
        senderName: 'John Smith',
        timestamp: '2024-01-15T09:00:00Z',
        type: 'text'
      },
      {
        id: 'msg-2',
        conversationId: id,
        content: 'Hello John! Thank you for your interest. The 2021 Honda Accord is in excellent condition with only 15,000 miles.',
        senderId: user.userId,
        senderName: 'Demo User',
        timestamp: '2024-01-15T09:15:00Z',
        type: 'text'
      },
      {
        id: 'msg-3',
        conversationId: id,
        content: 'That sounds great! What are the financing options?',
        senderId: 'lead-1',
        senderName: 'John Smith',
        timestamp: '2024-01-15T09:30:00Z',
        type: 'text'
      }
    ];

    res.json({
      success: true,
      data: {
        messages: mockMessages
      }
    });

  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// @route   POST /api/messaging/conversations/:id/messages
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:id/messages', [
  body('content').notEmpty().withMessage('Message content is required'),
  body('type').optional().isIn(['text', 'image', 'document'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { content, type = 'text' } = req.body;
    const user = (req as any).user;

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId: id,
      content,
      senderId: user.userId,
      senderName: 'Demo User', // TODO: Get from database
      timestamp: new Date().toISOString(),
      type
    };

    // TODO: Save message to database

    // Emit real-time message via Socket.IO
    io.to(`conversation-${id}`).emit('new-message', newMessage);

    logger.info(`Message sent in conversation ${id} by user ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: newMessage
      }
    });

  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

export default router;
