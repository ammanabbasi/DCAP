/**
 * Dealership Model
 * Defines the structure and validation for dealership entities
 */

import { z } from 'zod';

export const DealershipSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/),
  email: z.string().email(),
  website: z.string().url().optional(),
  license_number: z.string().optional(),
  tax_id: z.string().optional(),
  logo_url: z.string().url().optional(),
  settings: z.record(z.any()).optional(),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date()
});

export type Dealership = z.infer<typeof DealershipSchema>;

export const CreateDealershipSchema = DealershipSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const UpdateDealershipSchema = CreateDealershipSchema.partial();