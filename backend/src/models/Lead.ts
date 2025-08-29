/**
 * Lead Model
 * Defines the structure and validation for lead entities
 */

import { z } from 'zod';

export const LeadSource = z.enum([
  'website',
  'phone',
  'walk-in',
  'referral',
  'social-media',
  'email',
  'other'
]);

export const LeadStatus = z.enum([
  'new',
  'contacted',
  'qualified',
  'negotiation',
  'closed-won',
  'closed-lost'
]);

export const LeadSchema = z.object({
  id: z.string().uuid(),
  dealership_id: z.string().uuid(),
  assigned_to: z.string().uuid().optional(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  source: LeadSource,
  status: LeadStatus,
  score: z.number().int().min(0).max(100).optional(),
  interested_vehicles: z.array(z.string().uuid()).optional(),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  trade_in: z.boolean().default(false),
  financing_needed: z.boolean().default(false),
  notes: z.string().max(5000).optional(),
  last_contact: z.date().optional(),
  next_follow_up: z.date().optional(),
  conversion_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export type Lead = z.infer<typeof LeadSchema>;
export type LeadSource = z.infer<typeof LeadSource>;
export type LeadStatus = z.infer<typeof LeadStatus>;

export const CreateLeadSchema = LeadSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const UpdateLeadSchema = CreateLeadSchema.partial();