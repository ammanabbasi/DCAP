/**
 * Document Model
 * Defines the structure and validation for document entities
 */

import { z } from 'zod';

export const DocumentEntityType = z.enum(['vehicle', 'customer', 'deal', 'general']);
export const DocumentCategory = z.enum([
  'contract',
  'invoice',
  'registration',
  'insurance',
  'inspection',
  'other'
]);

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  dealership_id: z.string().uuid(),
  uploaded_by: z.string().uuid(),
  entity_type: DocumentEntityType,
  entity_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  file_path: z.string(),
  file_size: z.number().int().min(0),
  mime_type: z.string(),
  category: DocumentCategory,
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(false),
  download_count: z.number().int().min(0).default(0),
  created_at: z.date(),
  updated_at: z.date()
});

export type Document = z.infer<typeof DocumentSchema>;
export type DocumentEntityType = z.infer<typeof DocumentEntityType>;
export type DocumentCategory = z.infer<typeof DocumentCategory>;

export const CreateDocumentSchema = DocumentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  download_count: true
});

export const UpdateDocumentSchema = CreateDocumentSchema.partial().omit({
  file_path: true,
  file_size: true,
  mime_type: true
});