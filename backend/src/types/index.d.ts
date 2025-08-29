// Global type definitions for DealersCloud Backend

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

export interface ErrorResponse {
  error: {
    message: string;
    status: number;
    code?: string;
    details?: any;
    timestamp: string;
    path?: string;
    requestId?: string;
  };
}

// Database Models
export interface BaseModel {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Dealership extends BaseModel {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website?: string;
  license_number?: string;
  tax_id?: string;
  logo_url?: string;
  settings?: Record<string, any>;
  is_active: boolean;
}

export interface Vehicle extends BaseModel {
  vin: string;
  dealership_id: string;
  stock_number?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  body_style?: string;
  exterior_color?: string;
  interior_color?: string;
  mileage: number;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuel_type?: string;
  mpg_city?: number;
  mpg_highway?: number;
  price: number;
  msrp?: number;
  cost?: number;
  status: 'available' | 'pending' | 'sold' | 'wholesale' | 'service';
  condition: 'new' | 'used' | 'certified';
  description?: string;
  features?: string[];
  images?: string[];
  carfax_url?: string;
  autocheck_url?: string;
  location?: string;
  purchase_date?: Date;
  sale_date?: Date;
  days_in_inventory?: number;
}

export interface Lead extends BaseModel {
  dealership_id: string;
  assigned_to?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  source: 'website' | 'phone' | 'walk-in' | 'referral' | 'social-media' | 'email' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'negotiation' | 'closed-won' | 'closed-lost';
  score?: number;
  interested_vehicles?: string[];
  budget_min?: number;
  budget_max?: number;
  trade_in?: boolean;
  financing_needed?: boolean;
  notes?: string;
  last_contact?: Date;
  next_follow_up?: Date;
  conversion_date?: Date;
}

export interface Customer extends BaseModel {
  dealership_id: string;
  lead_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  alternate_phone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  date_of_birth?: Date;
  ssn_last_four?: string;
  driver_license?: string;
  driver_license_state?: string;
  employer?: string;
  job_title?: string;
  income?: number;
  credit_score?: number;
  tags?: string[];
  notes?: string;
  preferred_contact_method?: 'email' | 'phone' | 'text';
  lifetime_value?: number;
  purchase_count?: number;
  last_purchase_date?: Date;
}

export interface Task extends BaseModel {
  dealership_id: string;
  assigned_to: string;
  assigned_by: string;
  related_to_type?: 'lead' | 'customer' | 'vehicle' | 'deal';
  related_to_id?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: Date;
  completed_at?: Date;
  reminder?: Date;
  notes?: string;
}

export interface Document extends BaseModel {
  dealership_id: string;
  uploaded_by: string;
  entity_type: 'vehicle' | 'customer' | 'deal' | 'general';
  entity_id?: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: 'contract' | 'invoice' | 'registration' | 'insurance' | 'inspection' | 'other';
  description?: string;
  is_public: boolean;
  download_count: number;
}

export interface Message extends BaseModel {
  dealership_id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id?: string;
  message_type: 'text' | 'email' | 'sms' | 'note';
  subject?: string;
  body: string;
  attachments?: string[];
  is_read: boolean;
  read_at?: Date;
  is_archived: boolean;
}

export interface Transaction extends BaseModel {
  dealership_id: string;
  customer_id: string;
  vehicle_id?: string;
  salesperson_id: string;
  finance_manager_id?: string;
  type: 'sale' | 'lease' | 'trade-in' | 'service';
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  sale_price?: number;
  down_payment?: number;
  trade_in_value?: number;
  financing_amount?: number;
  monthly_payment?: number;
  interest_rate?: number;
  term_months?: number;
  gross_profit?: number;
  commission_amount?: number;
  contract_date?: Date;
  delivery_date?: Date;
  notes?: string;
}

// Service types
export interface ServiceConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  port: number;
  nodeEnv: string;
  clientUrl: string;
  database: DatabaseConfig;
  security: SecurityConfig;
  email: EmailConfig;
  redis: RedisConfig;
  aws: AWSConfig;
  logging: LoggingConfig;
}

export interface DatabaseConfig {
  url?: string;
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export interface SecurityConfig {
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  bcrypt: {
    rounds: number;
  };
  session: {
    secret?: string;
    timeoutHours: number;
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
  };
  cors: {
    origins: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export interface EmailConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  from?: string;
  fromName?: string;
}

export interface RedisConfig {
  url?: string;
  host: string;
  port: number;
  password?: string;
}

export interface AWSConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  s3Bucket?: string;
}

export interface LoggingConfig {
  level: string;
  filePath?: string;
}

// Export all types
export * from './express';