// User-related enums
export enum UserRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  SALESPERSON = 'salesperson',
  ADMIN = 'admin',
}

// Vehicle-related enums
export enum VehicleStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RESERVED = 'reserved',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}

export enum VehicleCondition {
  NEW = 'new',
  USED = 'used',
  CERTIFIED = 'certified',
  DAMAGED = 'damaged',
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  HYBRID = 'hybrid',
  ELECTRIC = 'electric',
  OTHER = 'other',
}

export enum TransmissionType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  CVT = 'cvt',
}

export enum BodyType {
  SEDAN = 'sedan',
  SUV = 'suv',
  TRUCK = 'truck',
  COUPE = 'coupe',
  HATCHBACK = 'hatchback',
  CONVERTIBLE = 'convertible',
  WAGON = 'wagon',
  VAN = 'van',
}

// Document-related enums
export enum DocumentType {
  TITLE = 'title',
  REGISTRATION = 'registration',
  INSPECTION = 'inspection',
  CARFAX = 'carfax',
  PHOTO = 'photo',
  OTHER = 'other',
}

// Customer-related enums
export enum CustomerStatus {
  PROSPECT = 'prospect',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DO_NOT_CONTACT = 'do_not_contact',
}

export enum NoteType {
  GENERAL = 'general',
  FOLLOWUP = 'followup',
  MEETING = 'meeting',
  PHONE_CALL = 'phone_call',
  EMAIL = 'email',
}

// Lead-related enums
export enum LeadSource {
  WEBSITE = 'website',
  PHONE = 'phone',
  REFERRAL = 'referral',
  WALK_IN = 'walk_in',
  SOCIAL_MEDIA = 'social_media',
  ADVERTISING = 'advertising',
  OTHER = 'other',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Activity-related enums
export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  NOTE = 'note',
  TASK = 'task',
  FOLLOW_UP = 'follow_up',
}

// Task-related enums
export enum TaskType {
  FOLLOW_UP = 'follow_up',
  VEHICLE_PREP = 'vehicle_prep',
  PAPERWORK = 'paperwork',
  INSPECTION = 'inspection',
  DELIVERY = 'delivery',
  GENERAL = 'general',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// WebSocket event types
export enum WebSocketEventType {
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  NEW_MESSAGE = 'new_message',
  LEAD_UPDATE = 'lead_update',
  TASK_UPDATE = 'task_update',
  VEHICLE_UPDATE = 'vehicle_update',
  CUSTOMER_UPDATE = 'customer_update',
  NOTIFICATION = 'notification',
}

// HTTP Status Codes (commonly used)
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// File types
export enum FileType {
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_PNG = 'image/png',
  IMAGE_WEBP = 'image/webp',
  APPLICATION_PDF = 'application/pdf',
  TEXT_PLAIN = 'text/plain',
}

// Pagination defaults
export enum PaginationDefaults {
  PAGE_SIZE = 25,
  MAX_PAGE_SIZE = 100,
  MIN_PAGE_SIZE = 5,
}