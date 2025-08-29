/**
 * Transaction Model
 * Defines the structure and validation for transaction entities
 */

import { z } from 'zod';

export const TransactionType = z.enum(['sale', 'lease', 'trade-in', 'service']);
export const TransactionStatus = z.enum(['pending', 'approved', 'completed', 'cancelled']);

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  dealership_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  vehicle_id: z.string().uuid().optional(),
  salesperson_id: z.string().uuid(),
  finance_manager_id: z.string().uuid().optional(),
  type: TransactionType,
  status: TransactionStatus,
  sale_price: z.number().min(0).optional(),
  down_payment: z.number().min(0).optional(),
  trade_in_value: z.number().min(0).optional(),
  financing_amount: z.number().min(0).optional(),
  monthly_payment: z.number().min(0).optional(),
  interest_rate: z.number().min(0).max(100).optional(),
  term_months: z.number().int().min(0).optional(),
  gross_profit: z.number().optional(),
  commission_amount: z.number().min(0).optional(),
  contract_date: z.date().optional(),
  delivery_date: z.date().optional(),
  notes: z.string().max(5000).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionType = z.infer<typeof TransactionType>;
export type TransactionStatus = z.infer<typeof TransactionStatus>;

export const CreateTransactionSchema = TransactionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  gross_profit: true
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial();