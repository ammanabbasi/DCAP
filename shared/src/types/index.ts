// Common types shared across all platforms

// User types
export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: UserRole
  dealershipId: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  profile?: UserProfile
}

export interface UserProfile {
  avatar?: string
  phone?: string
  address?: Address
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: NotificationPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  marketing: boolean
}

// Address type
export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// Vehicle types
export interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  trim?: string
  color?: string
  mileage: number
  price: number
  status: VehicleStatus
  condition: VehicleCondition
  fuelType: FuelType
  transmission: TransmissionType
  bodyType: BodyType
  images: string[]
  documents: VehicleDocument[]
  features: string[]
  dealershipId: string
  createdAt: Date
  updatedAt: Date
}

export interface VehicleDocument {
  id: string
  type: DocumentType
  name: string
  url: string
  uploadedAt: Date
  uploadedBy: string
}

// Customer/CRM types
export interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: Address
  dateOfBirth?: Date
  driversLicense?: string
  creditScore?: number
  leadSource?: string
  status: CustomerStatus
  tags: string[]
  notes: CustomerNote[]
  vehicles: CustomerVehicle[]
  dealershipId: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomerNote {
  id: string
  content: string
  type: NoteType
  createdBy: string
  createdAt: Date
}

export interface CustomerVehicle {
  vehicleId: string
  relationship: 'owned' | 'interested' | 'traded'
  purchaseDate?: Date
  salePrice?: number
  notes?: string
}

// Lead types
export interface Lead {
  id: string
  customerId?: string
  vehicleId?: string
  source: LeadSource
  status: LeadStatus
  priority: LeadPriority
  assignedTo?: string
  expectedCloseDate?: Date
  estimatedValue?: number
  notes: string
  activities: LeadActivity[]
  dealershipId: string
  createdAt: Date
  updatedAt: Date
}

export interface LeadActivity {
  id: string
  type: ActivityType
  description: string
  scheduledAt?: Date
  completedAt?: Date
  createdBy: string
  createdAt: Date
}

// Task types
export interface Task {
  id: string
  title: string
  description?: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string
  assignedBy: string
  dueDate?: Date
  completedAt?: Date
  tags: string[]
  attachments: string[]
  relatedEntityType?: 'customer' | 'vehicle' | 'lead'
  relatedEntityId?: string
  dealershipId: string
  createdAt: Date
  updatedAt: Date
}

// Dealership types
export interface Dealership {
  id: string
  name: string
  address: Address
  phone: string
  email: string
  website?: string
  logo?: string
  settings: DealershipSettings
  subscription: SubscriptionInfo
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DealershipSettings {
  businessHours: BusinessHours
  currency: string
  taxRate: number
  features: DealershipFeatures
}

export interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  isOpen: boolean
  openTime?: string
  closeTime?: string
}

export interface DealershipFeatures {
  inventory: boolean
  crm: boolean
  financing: boolean
  serviceScheduling: boolean
  marketing: boolean
  reporting: boolean
}

export interface SubscriptionInfo {
  plan: string
  status: 'active' | 'inactive' | 'suspended'
  startDate: Date
  endDate: Date
  autoRenew: boolean
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: ApiError[]
  pagination?: PaginationInfo
}

export interface ApiError {
  field?: string
  code: string
  message: string
}

export interface PaginationInfo {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// WebSocket types
export interface WebSocketMessage<T = unknown> {
  type: string
  payload: T
  timestamp: Date
  userId?: string
  dealershipId?: string
}

// File upload types
export interface FileUpload {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedBy: string
  uploadedAt: Date
}

// Enums (will be moved to separate file)
export type UserRole = 'owner' | 'manager' | 'salesperson' | 'admin'
export type VehicleStatus = 'available' | 'sold' | 'reserved' | 'pending' | 'inactive'
export type VehicleCondition = 'new' | 'used' | 'certified' | 'damaged'
export type FuelType = 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other'
export type TransmissionType = 'automatic' | 'manual' | 'cvt'
export type BodyType = 'sedan' | 'suv' | 'truck' | 'coupe' | 'hatchback' | 'convertible' | 'wagon' | 'van'
export type DocumentType = 'title' | 'registration' | 'inspection' | 'carfax' | 'photo' | 'other'
export type CustomerStatus = 'prospect' | 'active' | 'inactive' | 'do_not_contact'
export type NoteType = 'general' | 'followup' | 'meeting' | 'phone_call' | 'email'
export type LeadSource = 'website' | 'phone' | 'referral' | 'walk_in' | 'social_media' | 'advertising' | 'other'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'follow_up'
export type TaskType = 'follow_up' | 'vehicle_prep' | 'paperwork' | 'inspection' | 'delivery' | 'general'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'