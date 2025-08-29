/**
 * Message Model
 * Defines the structure and validation for message entities
 */

import { z } from 'zod';

export const MessageType = z.enum(['text', 'email', 'sms', 'note']);

export const MessageSchema = z.object({
  id: z.string().uuid(),
  dealership_id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  recipient_id: z.string().uuid().optional(),
  message_type: MessageType,
  subject: z.string().max(200).optional(),
  body: z.string().max(10000),
  attachments: z.array(z.string().url()).optional(),
  is_read: z.boolean().default(false),
  read_at: z.date().optional(),
  is_archived: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date()
});

export type Message = z.infer<typeof MessageSchema>;
export type MessageType = z.infer<typeof MessageType>;

export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  is_read: true,
  read_at: true
});

export const UpdateMessageSchema = CreateMessageSchema.partial();