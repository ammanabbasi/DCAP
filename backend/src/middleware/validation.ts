import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import logger from '../utils/logger';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void | Response => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : undefined,
      message: error.msg,
      value: (error as any).value
    }));

    logger.warn('Validation failed', {
      path: req.path,
      method: req.method,
      errors: formattedErrors,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * Custom sanitizers
 */
export const sanitizers = {
  // Remove any HTML/script tags
  sanitizeHtml: (value: string) => {
    if (!value) return value;
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  },
  
  // Sanitize file paths to prevent directory traversal
  sanitizePath: (value: string) => {
    if (!value) return value;
    return value.replace(/\.\./g, '').replace(/[^a-zA-Z0-9\-\_\.\/]/g, '');
  },
  
  // Sanitize SQL-like input
  sanitizeSql: (value: string) => {
    if (!value) return value;
    const sqlKeywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT', 'UNION', 'WHERE', 'FROM'];
    let sanitized = value;
    sqlKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    return sanitized;
  }
};

/**
 * Common validation rules
 */
export const commonValidations = {
  // Email validation with additional checks
  email: () => 
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email too long')
      .custom((value) => {
        // Additional email validation
        const disposableEmailDomains = ['tempmail.com', 'throwaway.email', 'guerrillamail.com'];
        const domain = value.split('@')[1];
        if (disposableEmailDomains.includes(domain)) {
          throw new Error('Disposable email addresses are not allowed');
        }
        return true;
      }),
  
  // Password validation with complexity requirements
  password: () =>
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character')
      .custom((value) => {
        // Check for common weak passwords
        const weakPasswords = ['password123', 'admin123', 'qwerty123', '12345678'];
        if (weakPasswords.includes(value.toLowerCase())) {
          throw new Error('This password is too common. Please choose a stronger password.');
        }
        return true;
      }),
  
  // Phone number validation
  phone: () =>
    body('phone')
      .optional()
      .trim()
      .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
      .withMessage('Invalid phone number format'),
  
  // VIN validation
  vin: () =>
    body('vin')
      .trim()
      .isLength({ min: 17, max: 17 })
      .withMessage('VIN must be exactly 17 characters')
      .isAlphanumeric()
      .withMessage('VIN must contain only letters and numbers')
      .toUpperCase(),
  
  // MongoDB ObjectId validation
  mongoId: (field: string) =>
    param(field)
      .isMongoId()
      .withMessage('Invalid ID format'),
  
  // Pagination validation
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  
  // Date validation
  date: (field: string) =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage('Invalid date format. Use ISO 8601 format'),
  
  // Price/Amount validation
  amount: (field: string) =>
    body(field)
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number')
      .toFloat(),
  
  // File upload validation
  fileUpload: () => [
    body('filename')
      .optional()
      .matches(/^[a-zA-Z0-9\-\_\.]+$/)
      .withMessage('Invalid filename'),
    body('mimetype')
      .optional()
      .isIn(['image/jpeg', 'image/png', 'image/gif', 'application/pdf'])
      .withMessage('Invalid file type')
  ]
};

/**
 * Authentication validation rules
 */
export const authValidation = {
  register: [
    commonValidations.email(),
    commonValidations.password(),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s\-']+$/)
      .withMessage('First name contains invalid characters')
      .customSanitizer(sanitizers.sanitizeHtml),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s\-']+$/)
      .withMessage('Last name contains invalid characters')
      .customSanitizer(sanitizers.sanitizeHtml),
    body('dealershipName')
      .trim()
      .notEmpty()
      .withMessage('Dealership name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Dealership name must be between 2 and 100 characters')
      .customSanitizer(sanitizers.sanitizeHtml),
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'salesperson', 'finance', 'service'])
      .withMessage('Invalid role'),
    commonValidations.phone(),
    handleValidationErrors
  ],
  
  login: [
    commonValidations.email(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  
  forgotPassword: [
    commonValidations.email(),
    handleValidationErrors
  ],
  
  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required')
      .isLength({ min: 32 })
      .withMessage('Invalid reset token'),
    commonValidations.password(),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
    handleValidationErrors
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password(),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
    handleValidationErrors
  ]
};

/**
 * Vehicle validation rules
 */
export const vehicleValidation = {
  create: [
    commonValidations.vin(),
    body('make')
      .trim()
      .notEmpty()
      .withMessage('Make is required')
      .isLength({ max: 50 })
      .customSanitizer(sanitizers.sanitizeHtml),
    body('model')
      .trim()
      .notEmpty()
      .withMessage('Model is required')
      .isLength({ max: 50 })
      .customSanitizer(sanitizers.sanitizeHtml),
    body('year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Invalid year'),
    body('mileage')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Invalid mileage'),
    commonValidations.amount('price'),
    body('color')
      .optional()
      .trim()
      .isLength({ max: 30 })
      .customSanitizer(sanitizers.sanitizeHtml),
    body('stockNumber')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .matches(/^[A-Z0-9\-]+$/)
      .withMessage('Invalid stock number format'),
    handleValidationErrors
  ],
  
  update: [
    param('id').isMongoId().withMessage('Invalid vehicle ID'),
    // Same validations as create but all optional
    body('vin')
      .optional()
      .trim()
      .isLength({ min: 17, max: 17 })
      .withMessage('VIN must be exactly 17 characters')
      .isAlphanumeric()
      .toUpperCase(),
    body('make')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .customSanitizer(sanitizers.sanitizeHtml),
    body('model')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .customSanitizer(sanitizers.sanitizeHtml),
    body('year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    handleValidationErrors
  ],
  
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .customSanitizer(sanitizers.sanitizeSql),
    query('make')
      .optional()
      .trim()
      .customSanitizer(sanitizers.sanitizeHtml),
    query('model')
      .optional()
      .trim()
      .customSanitizer(sanitizers.sanitizeHtml),
    query('yearMin')
      .optional()
      .isInt({ min: 1900 }),
    query('yearMax')
      .optional()
      .isInt({ max: new Date().getFullYear() + 1 }),
    query('priceMin')
      .optional()
      .isFloat({ min: 0 }),
    query('priceMax')
      .optional()
      .isFloat({ min: 0 }),
    ...commonValidations.pagination(),
    handleValidationErrors
  ]
};

/**
 * CRM validation rules
 */
export const crmValidation = {
  createLead: [
    commonValidations.email(),
    body('firstName')
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .customSanitizer(sanitizers.sanitizeHtml),
    body('lastName')
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .customSanitizer(sanitizers.sanitizeHtml),
    commonValidations.phone(),
    body('source')
      .optional()
      .isIn(['website', 'phone', 'walk-in', 'referral', 'social-media', 'email'])
      .withMessage('Invalid lead source'),
    body('status')
      .optional()
      .isIn(['new', 'contacted', 'qualified', 'negotiation', 'closed-won', 'closed-lost'])
      .withMessage('Invalid lead status'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .customSanitizer(sanitizers.sanitizeHtml),
    handleValidationErrors
  ],
  
  updateLead: [
    param('id').isMongoId().withMessage('Invalid lead ID'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail(),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .customSanitizer(sanitizers.sanitizeHtml),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .customSanitizer(sanitizers.sanitizeHtml),
    handleValidationErrors
  ]
};

/**
 * Document validation rules
 */
export const documentValidation = {
  upload: [
    body('category')
      .notEmpty()
      .isIn(['contract', 'invoice', 'registration', 'insurance', 'inspection', 'other'])
      .withMessage('Invalid document category'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .customSanitizer(sanitizers.sanitizeHtml),
    handleValidationErrors
  ],
  
  search: [
    query('category')
      .optional()
      .isIn(['contract', 'invoice', 'registration', 'insurance', 'inspection', 'other']),
    query('vehicleId')
      .optional()
      .isMongoId(),
    query('customerId')
      .optional()
      .isMongoId(),
    ...commonValidations.pagination(),
    handleValidationErrors
  ]
};

/**
 * Rate limiting validation for sensitive operations
 */
export const rateLimitValidation = {
  // For login attempts - stricter limit
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // For password reset requests
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: 'Too many password reset requests. Please try again later.',
  },
  
  // For API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests. Please try again later.',
  }
};

export default {
  handleValidationErrors,
  sanitizers,
  commonValidations,
  authValidation,
  vehicleValidation,
  crmValidation,
  documentValidation,
  rateLimitValidation
};