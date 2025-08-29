import Joi from 'joi';

// Password validation pattern (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const authValidators = {
  register: Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(passwordPattern)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
    
    first_name: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 100 characters',
        'any.required': 'First name is required',
      }),
    
    last_name: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 100 characters',
        'any.required': 'Last name is required',
      }),
    
    phone: Joi.string()
      .pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
      }),
    
    dealership_id: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Invalid dealership ID',
      }),
    
    role: Joi.string()
      .valid('customer', 'sales_rep', 'sales_manager', 'finance_manager', 'service_advisor')
      .optional()
      .default('customer')
      .messages({
        'any.only': 'Invalid role selected',
      }),
    
    terms_accepted: Joi.boolean()
      .valid(true)
      .required()
      .messages({
        'any.only': 'You must accept the terms and conditions',
        'any.required': 'Terms acceptance is required',
      }),
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
    
    remember_me: Joi.boolean()
      .optional()
      .default(false),
    
    device_info: Joi.object({
      device_id: Joi.string().optional(),
      device_type: Joi.string().optional(),
      ip_address: Joi.string().ip().optional(),
      user_agent: Joi.string().max(500).optional(),
    }).optional(),
  }),

  refreshToken: Joi.object({
    refresh_token: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required',
      }),
    
    device_info: Joi.object({
      ip_address: Joi.string().ip().optional(),
      user_agent: Joi.string().max(500).optional(),
    }).optional(),
  }),

  logout: Joi.object({
    refresh_token: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required',
      }),
  }),

  verifyEmail: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Verification token is required',
      }),
  }),

  requestPasswordReset: Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
  }),

  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required',
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(passwordPattern)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
  }),

  changePassword: Joi.object({
    current_password: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required',
      }),
    
    new_password: Joi.string()
      .min(8)
      .pattern(passwordPattern)
      .invalid(Joi.ref('current_password'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.invalid': 'New password must be different from current password',
        'any.required': 'New password is required',
      }),
    
    confirm_password: Joi.string()
      .valid(Joi.ref('new_password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
  }),

  updateProfile: Joi.object({
    first_name: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .optional()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 100 characters',
      }),
    
    last_name: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .optional()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 100 characters',
      }),
    
    phone: Joi.string()
      .pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
      }),
    
    avatar_url: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Please provide a valid URL for avatar',
      }),
    
    preferences: Joi.object()
      .optional(),
  }),
};