/**
 * Customer Model
 * Defines the structure and validation for customer entities
 */

import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  dealership_id: z.string().uuid(),
  lead_id: z.string().uuid().optional(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  alternate_phone: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  date_of_birth: z.date().optional(),
  ssn_last_four: z.string().length(4).regex(/^\d{4}$/).optional(),
  driver_license: z.string().optional(),
  driver_license_state: z.string().length(2).optional(),
  employer: z.string().optional(),
  job_title: z.string().optional(),
  income: z.number().min(0).optional(),
  credit_score: z.number().int().min(300).max(850).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(5000).optional(),
  preferred_contact_method: z.enum(['email', 'phone', 'text']).optional(),
  lifetime_value: z.number().min(0).optional(),
  purchase_count: z.number().int().min(0).default(0),
  last_purchase_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export type Customer = z.infer<typeof CustomerSchema>;

export const CreateCustomerSchema = CustomerSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  lifetime_value: true,
  purchase_count: true
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();