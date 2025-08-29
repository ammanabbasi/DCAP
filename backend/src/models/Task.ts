/**
 * Task Model
 * Defines the structure and validation for task entities
 */

import { z } from 'zod';

export const TaskPriority = z.enum(['low', 'medium', 'high', 'urgent']);
export const TaskStatus = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);
export const TaskRelatedType = z.enum(['lead', 'customer', 'vehicle', 'deal']);

export const TaskSchema = z.object({
  id: z.string().uuid(),
  dealership_id: z.string().uuid(),
  assigned_to: z.string().uuid(),
  assigned_by: z.string().uuid(),
  related_to_type: TaskRelatedType.optional(),
  related_to_id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: TaskPriority,
  status: TaskStatus,
  due_date: z.date(),
  completed_at: z.date().optional(),
  reminder: z.date().optional(),
  notes: z.string().max(5000).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskPriority = z.infer<typeof TaskPriority>;
export type TaskStatus = z.infer<typeof TaskStatus>;

export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  completed_at: true
});

export const UpdateTaskSchema = CreateTaskSchema.partial();