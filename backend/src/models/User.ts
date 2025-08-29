/**
 * User Model
 * Defines the structure and validation for user entities
 */

import { z } from 'zod';

// User role enum
export const UserRole = z.enum([
  'super_admin',
  'dealer_admin',
  'sales_manager',
  'sales_rep',
  'finance_manager',
  'service_advisor',
  'customer'
]);

// User schema validation
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(50).optional(),
  password_hash: z.string(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).optional(),
  avatar_url: z.string().url().optional(),
  role: UserRole,
  dealership_id: z.string().uuid().optional(),
  is_active: z.boolean().default(true),
  is_verified: z.boolean().default(false),
  verification_token: z.string().optional(),
  verification_expires: z.date().optional(),
  reset_token: z.string().optional(),
  reset_token_expires: z.date().optional(),
  failed_login_attempts: z.number().int().min(0).default(0),
  locked_until: z.date().optional(),
  last_login: z.date().optional(),
  preferences: z.record(z.any()).optional(),
  permissions: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Type inference
export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRole>;

// Create user input validation
export const CreateUserSchema = UserSchema.omit({
  id: true,
  password_hash: true,
  created_at: true,
  updated_at: true,
  failed_login_attempts: true,
  locked_until: true,
  last_login: true
}).extend({
  password: z.string().min(8).max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character')
});

// Update user input validation
export const UpdateUserSchema = CreateUserSchema.partial().omit({
  password: true
});

// Password change validation
export const ChangePasswordSchema = z.object({
  current_password: z.string(),
  new_password: z.string().min(8).max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// User permissions
export const UserPermissions = {
  // System permissions
  SYSTEM_ADMIN: 'system.admin',
  SYSTEM_SETTINGS: 'system.settings',
  
  // User management
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  
  // Vehicle management
  VEHICLE_CREATE: 'vehicle.create',
  VEHICLE_READ: 'vehicle.read',
  VEHICLE_UPDATE: 'vehicle.update',
  VEHICLE_DELETE: 'vehicle.delete',
  VEHICLE_PRICING: 'vehicle.pricing',
  
  // Lead/Customer management
  LEAD_CREATE: 'lead.create',
  LEAD_READ: 'lead.read',
  LEAD_UPDATE: 'lead.update',
  LEAD_DELETE: 'lead.delete',
  LEAD_ASSIGN: 'lead.assign',
  
  // Transaction management
  TRANSACTION_CREATE: 'transaction.create',
  TRANSACTION_READ: 'transaction.read',
  TRANSACTION_UPDATE: 'transaction.update',
  TRANSACTION_DELETE: 'transaction.delete',
  TRANSACTION_APPROVE: 'transaction.approve',
  
  // Financial
  FINANCIAL_VIEW: 'financial.view',
  FINANCIAL_EDIT: 'financial.edit',
  FINANCIAL_REPORTS: 'financial.reports',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  
  // Documents
  DOCUMENT_UPLOAD: 'document.upload',
  DOCUMENT_VIEW: 'document.view',
  DOCUMENT_DELETE: 'document.delete'
} as const;

// Role-based default permissions
export const RolePermissions: Record<UserRole, string[]> = {
  super_admin: Object.values(UserPermissions),
  
  dealer_admin: [
    UserPermissions.USER_CREATE,
    UserPermissions.USER_READ,
    UserPermissions.USER_UPDATE,
    UserPermissions.VEHICLE_CREATE,
    UserPermissions.VEHICLE_READ,
    UserPermissions.VEHICLE_UPDATE,
    UserPermissions.VEHICLE_DELETE,
    UserPermissions.VEHICLE_PRICING,
    UserPermissions.LEAD_CREATE,
    UserPermissions.LEAD_READ,
    UserPermissions.LEAD_UPDATE,
    UserPermissions.LEAD_DELETE,
    UserPermissions.LEAD_ASSIGN,
    UserPermissions.TRANSACTION_CREATE,
    UserPermissions.TRANSACTION_READ,
    UserPermissions.TRANSACTION_UPDATE,
    UserPermissions.TRANSACTION_APPROVE,
    UserPermissions.FINANCIAL_VIEW,
    UserPermissions.FINANCIAL_EDIT,
    UserPermissions.FINANCIAL_REPORTS,
    UserPermissions.REPORTS_VIEW,
    UserPermissions.REPORTS_EXPORT,
    UserPermissions.DOCUMENT_UPLOAD,
    UserPermissions.DOCUMENT_VIEW,
    UserPermissions.DOCUMENT_DELETE
  ],
  
  sales_manager: [
    UserPermissions.USER_READ,
    UserPermissions.VEHICLE_READ,
    UserPermissions.VEHICLE_UPDATE,
    UserPermissions.VEHICLE_PRICING,
    UserPermissions.LEAD_CREATE,
    UserPermissions.LEAD_READ,
    UserPermissions.LEAD_UPDATE,
    UserPermissions.LEAD_ASSIGN,
    UserPermissions.TRANSACTION_CREATE,
    UserPermissions.TRANSACTION_READ,
    UserPermissions.TRANSACTION_UPDATE,
    UserPermissions.TRANSACTION_APPROVE,
    UserPermissions.FINANCIAL_VIEW,
    UserPermissions.REPORTS_VIEW,
    UserPermissions.REPORTS_EXPORT,
    UserPermissions.DOCUMENT_UPLOAD,
    UserPermissions.DOCUMENT_VIEW
  ],
  
  sales_rep: [
    UserPermissions.VEHICLE_READ,
    UserPermissions.LEAD_CREATE,
    UserPermissions.LEAD_READ,
    UserPermissions.LEAD_UPDATE,
    UserPermissions.TRANSACTION_CREATE,
    UserPermissions.TRANSACTION_READ,
    UserPermissions.DOCUMENT_UPLOAD,
    UserPermissions.DOCUMENT_VIEW
  ],
  
  finance_manager: [
    UserPermissions.VEHICLE_READ,
    UserPermissions.LEAD_READ,
    UserPermissions.TRANSACTION_READ,
    UserPermissions.TRANSACTION_UPDATE,
    UserPermissions.TRANSACTION_APPROVE,
    UserPermissions.FINANCIAL_VIEW,
    UserPermissions.FINANCIAL_EDIT,
    UserPermissions.FINANCIAL_REPORTS,
    UserPermissions.DOCUMENT_UPLOAD,
    UserPermissions.DOCUMENT_VIEW
  ],
  
  service_advisor: [
    UserPermissions.VEHICLE_READ,
    UserPermissions.LEAD_READ,
    UserPermissions.DOCUMENT_UPLOAD,
    UserPermissions.DOCUMENT_VIEW
  ],
  
  customer: [
    // Limited permissions for customers
    UserPermissions.VEHICLE_READ,
    UserPermissions.DOCUMENT_VIEW
  ]
};

// Helper function to check if user has permission
export function hasPermission(user: User, permission: string): boolean {
  // Super admin has all permissions
  if (user.role === 'super_admin') return true;
  
  // Check user-specific permissions
  if (user.permissions?.includes(permission)) return true;
  
  // Check role-based permissions
  const rolePerms = RolePermissions[user.role];
  return rolePerms.includes(permission);
}

// Helper function to get all permissions for a user
export function getUserPermissions(user: User): string[] {
  if (user.role === 'super_admin') {
    return Object.values(UserPermissions);
  }
  
  const rolePerms = RolePermissions[user.role] || [];
  const userPerms = user.permissions || [];
  
  // Combine and deduplicate
  return [...new Set([...rolePerms, ...userPerms])];
}