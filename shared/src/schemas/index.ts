import { z } from 'zod'

// Common validation schemas using Zod

// Base schemas
export const EmailSchema = z.string().email('Invalid email address')
export const PasswordSchema = z.string().min(8, 'Password must be at least 8 characters long')
export const PhoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number')
export const VINSchema = z.string().length(17, 'VIN must be exactly 17 characters long')
export const ZipCodeSchema = z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')

// Address schema
export const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
  zipCode: ZipCodeSchema,
  country: z.string().default('US'),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
})

// User schemas
export const UserCreateSchema = z.object({
  email: EmailSchema,
  username: z.string().min(3).max(30),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: PasswordSchema,
  role: z.enum(['owner', 'manager', 'salesperson', 'admin']),
  dealershipId: z.string().uuid(),
})

export const UserUpdateSchema = UserCreateSchema.partial().omit({ password: true })

export const UserLoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Vehicle schemas
export const VehicleCreateSchema = z.object({
  vin: VINSchema,
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  trim: z.string().optional(),
  color: z.string().optional(),
  mileage: z.number().int().min(0),
  price: z.number().positive('Price must be positive'),
  status: z.enum(['available', 'sold', 'reserved', 'pending', 'inactive']),
  condition: z.enum(['new', 'used', 'certified', 'damaged']),
  fuelType: z.enum(['gasoline', 'diesel', 'hybrid', 'electric', 'other']),
  transmission: z.enum(['automatic', 'manual', 'cvt']),
  bodyType: z.enum(['sedan', 'suv', 'truck', 'coupe', 'hatchback', 'convertible', 'wagon', 'van']),
  features: z.array(z.string()).default([]),
  dealershipId: z.string().uuid(),
})

export const VehicleUpdateSchema = VehicleCreateSchema.partial()

export const VehicleSearchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  yearFrom: z.number().int().min(1900).optional(),
  yearTo: z.number().int().max(new Date().getFullYear() + 2).optional(),
  priceFrom: z.number().min(0).optional(),
  priceTo: z.number().min(0).optional(),
  mileageFrom: z.number().min(0).optional(),
  mileageTo: z.number().min(0).optional(),
  condition: z.enum(['new', 'used', 'certified', 'damaged']).optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'hybrid', 'electric', 'other']).optional(),
  transmission: z.enum(['automatic', 'manual', 'cvt']).optional(),
  bodyType: z.enum(['sedan', 'suv', 'truck', 'coupe', 'hatchback', 'convertible', 'wagon', 'van']).optional(),
  status: z.enum(['available', 'sold', 'reserved', 'pending', 'inactive']).optional(),
})

// Customer schemas
export const CustomerCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  address: AddressSchema.optional(),
  dateOfBirth: z.coerce.date().optional(),
  driversLicense: z.string().optional(),
  leadSource: z.string().optional(),
  tags: z.array(z.string()).default([]),
  dealershipId: z.string().uuid(),
})

export const CustomerUpdateSchema = CustomerCreateSchema.partial()

// Lead schemas
export const LeadCreateSchema = z.object({
  customerId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  source: z.enum(['website', 'phone', 'referral', 'walk_in', 'social_media', 'advertising', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('new'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().uuid().optional(),
  expectedCloseDate: z.coerce.date().optional(),
  estimatedValue: z.number().positive().optional(),
  notes: z.string().default(''),
  dealershipId: z.string().uuid(),
})

export const LeadUpdateSchema = LeadCreateSchema.partial()

// Task schemas
export const TaskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['follow_up', 'vehicle_prep', 'paperwork', 'inspection', 'delivery', 'general']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'overdue']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().uuid(),
  dueDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  relatedEntityType: z.enum(['customer', 'vehicle', 'lead']).optional(),
  relatedEntityId: z.string().uuid().optional(),
  dealershipId: z.string().uuid(),
})

export const TaskUpdateSchema = TaskCreateSchema.partial()

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(5).max(100).default(25),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

// File upload schema
export const FileUploadSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive().max(10 * 1024 * 1024, 'File too large'), // 10MB max
})

// API Response schema
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    errors: z.array(
      z.object({
        field: z.string().optional(),
        code: z.string(),
        message: z.string(),
      })
    ).optional(),
    pagination: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      totalItems: z.number().int().min(0),
      totalPages: z.number().int().min(0),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }).optional(),
  })

// WebSocket message schema
export const WebSocketMessageSchema = <T extends z.ZodType>(payloadSchema: T) =>
  z.object({
    type: z.string(),
    payload: payloadSchema,
    timestamp: z.coerce.date(),
    userId: z.string().uuid().optional(),
    dealershipId: z.string().uuid().optional(),
  })

// Dealership schemas
export const DealershipCreateSchema = z.object({
  name: z.string().min(1, 'Dealership name is required'),
  address: AddressSchema,
  phone: PhoneSchema,
  email: EmailSchema,
  website: z.string().url().optional(),
})

export const DealershipUpdateSchema = DealershipCreateSchema.partial()

// Business hours schema
export const BusinessHoursSchema = z.object({
  monday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  tuesday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  wednesday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  thursday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  friday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  saturday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
  sunday: z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  }),
})