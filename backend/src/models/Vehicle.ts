/**
 * Vehicle Model
 * Defines the structure and validation for vehicle entities
 */

import { z } from 'zod';

// Vehicle status enum
export const VehicleStatus = z.enum([
  'available',
  'pending',
  'sold',
  'wholesale',
  'service'
]);

// Vehicle condition enum
export const VehicleCondition = z.enum([
  'new',
  'used',
  'certified'
]);

// Vehicle schema validation
export const VehicleSchema = z.object({
  id: z.string().uuid(),
  vin: z.string().length(17).toUpperCase(),
  dealership_id: z.string().uuid(),
  stock_number: z.string().max(50).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  trim: z.string().max(50).optional(),
  body_style: z.string().max(50).optional(),
  exterior_color: z.string().max(50).optional(),
  interior_color: z.string().max(50).optional(),
  mileage: z.number().int().min(0),
  engine: z.string().max(100).optional(),
  transmission: z.string().max(50).optional(),
  drivetrain: z.string().max(50).optional(),
  fuel_type: z.string().max(50).optional(),
  mpg_city: z.number().int().min(0).max(100).optional(),
  mpg_highway: z.number().int().min(0).max(100).optional(),
  price: z.number().min(0),
  msrp: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  status: VehicleStatus,
  condition: VehicleCondition,
  description: z.string().max(5000).optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  carfax_url: z.string().url().optional(),
  autocheck_url: z.string().url().optional(),
  location: z.string().max(100).optional(),
  purchase_date: z.date().optional(),
  sale_date: z.date().optional(),
  days_in_inventory: z.number().int().min(0).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Type inference
export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehicleStatus = z.infer<typeof VehicleStatus>;
export type VehicleCondition = z.infer<typeof VehicleCondition>;

// Create vehicle input validation
export const CreateVehicleSchema = VehicleSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  days_in_inventory: true
});

// Update vehicle input validation
export const UpdateVehicleSchema = CreateVehicleSchema.partial();

// Vehicle search schema
export const VehicleSearchSchema = z.object({
  q: z.string().max(100).optional(),
  make: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  year_min: z.number().int().min(1900).optional(),
  year_max: z.number().int().max(new Date().getFullYear() + 1).optional(),
  price_min: z.number().min(0).optional(),
  price_max: z.number().min(0).optional(),
  mileage_max: z.number().int().min(0).optional(),
  condition: VehicleCondition.optional(),
  status: VehicleStatus.optional(),
  body_style: z.string().optional(),
  color: z.string().optional(),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  features: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['price', 'year', 'mileage', 'make', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Vehicle import schema (for bulk imports)
export const VehicleImportSchema = z.object({
  vehicles: z.array(CreateVehicleSchema),
  update_existing: z.boolean().default(false),
  validate_only: z.boolean().default(false)
});

// Vehicle pricing update schema
export const VehiclePricingSchema = z.object({
  price: z.number().min(0),
  msrp: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  special_price: z.number().min(0).optional(),
  special_price_expires: z.date().optional(),
  discount_amount: z.number().min(0).optional(),
  discount_percentage: z.number().min(0).max(100).optional()
});

// Vehicle image schema
export const VehicleImageSchema = z.object({
  url: z.string().url(),
  type: z.enum(['exterior', 'interior', 'engine', 'other']).default('exterior'),
  is_primary: z.boolean().default(false),
  caption: z.string().max(200).optional(),
  order: z.number().int().min(0).default(0)
});

// Helper functions

/**
 * Calculate days in inventory
 */
export function calculateDaysInInventory(vehicle: Vehicle): number {
  if (vehicle.sale_date) {
    const purchaseDate = vehicle.purchase_date || vehicle.created_at;
    return Math.floor((vehicle.sale_date.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  const purchaseDate = vehicle.purchase_date || vehicle.created_at;
  return Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate profit margin
 */
export function calculateProfitMargin(vehicle: Vehicle): number | null {
  if (!vehicle.cost || !vehicle.price) return null;
  return ((vehicle.price - vehicle.cost) / vehicle.price) * 100;
}

/**
 * Format VIN for display
 */
export function formatVIN(vin: string): string {
  return vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Validate VIN checksum (basic validation)
 */
export function validateVIN(vin: string): boolean {
  if (vin.length !== 17) return false;
  
  // Basic VIN format validation
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
}

/**
 * Get vehicle display name
 */
export function getVehicleDisplayName(vehicle: Vehicle): string {
  const parts = [vehicle.year, vehicle.make, vehicle.model];
  if (vehicle.trim) parts.push(vehicle.trim);
  return parts.join(' ');
}

/**
 * Get vehicle age category
 */
export function getVehicleAgeCategory(year: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  
  if (age === 0) return 'Current Year';
  if (age === 1) return 'Last Year';
  if (age <= 3) return 'Recent';
  if (age <= 5) return 'Late Model';
  if (age <= 10) return 'Used';
  return 'Older';
}