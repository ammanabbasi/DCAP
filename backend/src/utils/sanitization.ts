/**
 * Input Sanitization and Validation Utilities
 * Comprehensive data sanitization for automotive dealership data
 */

import validator from 'validator';
import sanitizeHtml from 'sanitize-html';
import xss from 'xss';
import crypto from 'crypto';

/**
 * Sanitization options for different data types
 */
export interface SanitizationOptions {
  allowHtml?: boolean;
  maxLength?: number;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  preserveWhitespace?: boolean;
}

/**
 * VIN (Vehicle Identification Number) validation
 */
export const validateVIN = (vin: string): boolean => {
  // VIN must be exactly 17 characters
  if (!vin || vin.length !== 17) return false;
  
  // VIN cannot contain I, O, or Q
  if (/[IOQ]/i.test(vin)) return false;
  
  // VIN must be alphanumeric
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return false;
  
  // Validate check digit (9th position)
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const transliteration: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9
  };
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin[i]?.toUpperCase();
    if (!char) continue;
    const value = /\d/.test(char) ? parseInt(char) : (transliteration[char] || 0);
    sum += value * weights[i]!;
  }
  
  const checkDigit = sum % 11;
  const expectedCheckDigit = checkDigit === 10 ? 'X' : checkDigit.toString();
  
  return vin[8].toUpperCase() === expectedCheckDigit;
};

/**
 * Sanitize and validate email
 */
export const sanitizeEmail = (email: string): string | null => {
  if (!email) return null;
  
  const sanitized = email.toLowerCase().trim();
  
  if (!validator.isEmail(sanitized)) {
    return null;
  }
  
  return validator.normalizeEmail(sanitized) || null;
};

/**
 * Sanitize and validate phone number
 */
export const sanitizePhone = (phone: string, locale: string = 'en-US'): string | null => {
  if (!phone) return null;
  
  // Remove all non-numeric characters except + for international
  let sanitized = phone.replace(/[^\d+]/g, '');
  
  // Validate based on locale
  if (locale === 'en-US') {
    // US phone number validation
    if (sanitized.length === 10) {
      sanitized = `+1${sanitized}`;
    } else if (sanitized.length === 11 && sanitized.startsWith('1')) {
      sanitized = `+${sanitized}`;
    }
    
    if (!validator.isMobilePhone(sanitized, 'en-US')) {
      return null;
    }
  }
  
  return sanitized;
};

/**
 * Sanitize and validate SSN (Social Security Number)
 * Returns masked SSN for storage
 */
export const sanitizeSSN = (ssn: string): string | null => {
  if (!ssn) return null;
  
  // Remove all non-numeric characters
  const sanitized = ssn.replace(/\D/g, '');
  
  // SSN must be 9 digits
  if (sanitized.length !== 9) return null;
  
  // Invalid SSN patterns
  const invalidPatterns = [
    /^000/, /^666/, /^9[0-9]{2}/, // Invalid area numbers
    /^[0-9]{3}00/, // Invalid group numbers
    /^[0-9]{5}0000/, // Invalid serial numbers
    /^123456789$/, /^987654321$/ // Common test SSNs
  ];
  
  if (invalidPatterns.some(pattern => pattern.test(sanitized))) {
    return null;
  }
  
  // Return masked format: XXX-XX-1234
  return `XXX-XX-${sanitized.slice(-4)}`;
};

/**
 * Sanitize credit card number
 * Returns masked card number for storage
 */
export const sanitizeCreditCard = (cardNumber: string): string | null => {
  if (!cardNumber) return null;
  
  // Remove all non-numeric characters
  const sanitized = cardNumber.replace(/\D/g, '');
  
  // Validate using Luhn algorithm
  if (!validator.isCreditCard(sanitized)) {
    return null;
  }
  
  // Return masked format: **** **** **** 1234
  return `**** **** **** ${sanitized.slice(-4)}`;
};

/**
 * Sanitize driver's license number
 */
export const sanitizeDriversLicense = (license: string, state?: string): string | null => {
  if (!license) return null;
  
  // Remove special characters but keep alphanumeric
  const sanitized = license.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // State-specific validation (example patterns)
  const statePatterns: Record<string, RegExp> = {
    CA: /^[A-Z]\d{7}$/, // California
    TX: /^\d{8}$/, // Texas
    FL: /^[A-Z]\d{12}$/, // Florida
    NY: /^[A-Z]\d{7}$|^\d{9}$/, // New York
    // Add more states as needed
  };
  
  if (state && statePatterns[state]) {
    if (!statePatterns[state].test(sanitized)) {
      return null;
    }
  }
  
  // Return masked format: first 2 and last 2 characters visible
  if (sanitized.length > 4) {
    const masked = sanitized.slice(0, 2) + '*'.repeat(sanitized.length - 4) + sanitized.slice(-2);
    return masked;
  }
  
  return sanitized;
};

/**
 * Sanitize text input
 */
export const sanitizeText = (text: string, options: SanitizationOptions = {}): string => {
  if (!text) return '';
  
  const {
    allowHtml = false,
    maxLength = 1000,
    allowedTags = [],
    allowedAttributes = {},
    preserveWhitespace = false
  } = options;
  
  let sanitized = text;
  
  // Trim and limit length
  if (!preserveWhitespace) {
    sanitized = sanitized.trim();
  }
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove HTML if not allowed
  if (!allowHtml) {
    sanitized = sanitizeHtml(sanitized, {
      allowedTags: [],
      allowedAttributes: {}
    });
  } else {
    sanitized = sanitizeHtml(sanitized, {
      allowedTags,
      allowedAttributes,
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesByTag: {},
      allowProtocolRelative: false
    });
  }
  
  // Additional XSS protection
  sanitized = xss(sanitized, {
    whiteList: allowHtml ? allowedTags.reduce((acc, tag) => {
      acc[tag] = allowedAttributes[tag] || [];
      return acc;
    }, {} as Record<string, string[]>) : {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
  });
  
  // Remove null bytes and other dangerous characters
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
};

/**
 * Sanitize URL
 */
export const sanitizeURL = (url: string): string | null => {
  if (!url) return null;
  
  const sanitized = url.trim();
  
  // Check if valid URL
  if (!validator.isURL(sanitized, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    allow_fragments: true,
    allow_query_components: true
  })) {
    return null;
  }
  
  // Prevent javascript: and data: protocols
  if (/^(javascript|data|vbscript|file):/i.test(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Sanitize file name
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return '';
  
  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '');
  
  // Remove special characters except dots, dashes, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  
  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const extension = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, maxLength - extension.length - 1) + '.' + extension;
  }
  
  return sanitized;
};

/**
 * Sanitize and validate monetary amount
 */
export const sanitizeMoney = (amount: string | number): number | null => {
  if (amount === null || amount === undefined) return null;
  
  let sanitized: string;
  
  if (typeof amount === 'number') {
    sanitized = amount.toString();
  } else {
    // Remove currency symbols and commas
    sanitized = amount.replace(/[$,]/g, '').trim();
  }
  
  // Validate decimal format
  if (!/^\d+(\.\d{0,2})?$/.test(sanitized)) {
    return null;
  }
  
  const parsed = parseFloat(sanitized);
  
  // Check for reasonable bounds (up to $10 million)
  if (parsed < 0 || parsed > 10000000) {
    return null;
  }
  
  // Round to 2 decimal places
  return Math.round(parsed * 100) / 100;
};

/**
 * Sanitize date input
 */
export const sanitizeDate = (date: string): Date | null => {
  if (!date) return null;
  
  const sanitized = date.trim();
  
  // Check if valid ISO date
  if (!validator.isISO8601(sanitized)) {
    // Try common date formats
    const parsedDate = new Date(sanitized);
    if (isNaN(parsedDate.getTime())) {
      return null;
    }
    return parsedDate;
  }
  
  return new Date(sanitized);
};

/**
 * Sanitize ZIP code
 */
export const sanitizeZipCode = (zip: string, country: string = 'US'): string | null => {
  if (!zip) return null;
  
  const sanitized = zip.trim().toUpperCase();
  
  if (country === 'US') {
    // US ZIP code (5 digits or 5+4 format)
    if (!/^\d{5}(-\d{4})?$/.test(sanitized)) {
      return null;
    }
  } else if (country === 'CA') {
    // Canadian postal code
    if (!/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(sanitized)) {
      return null;
    }
  }
  
  return sanitized;
};

/**
 * Sanitize and hash password
 */
export const sanitizePassword = (password: string): { valid: boolean; hash?: string; errors?: string[] } => {
  const errors: string[] = [];
  
  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }
  
  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common patterns
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^admin/i,
    /^letmein/i
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password is too common');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Generate secure hash
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  
  return { valid: true, hash: `${salt}:${hash}` };
};

/**
 * Batch sanitization for complex objects
 */
export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  rules: Record<keyof T, (value: any) => any>
): T => {
  const sanitized = {} as T;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const rule = rules[key];
      if (rule) {
        sanitized[key] = rule(obj[key]);
      } else {
        // Default sanitization for unspecified fields
        if (typeof obj[key] === 'string') {
          sanitized[key] = sanitizeText(obj[key]) as T[Extract<keyof T, string>];
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
  }
  
  return sanitized;
};

/**
 * Validate and sanitize dealership-specific data
 */
export const sanitizeDealershipData = (data: any) => {
  return sanitizeObject(data, {
    name: (v) => sanitizeText(v, { maxLength: 100 }),
    license_number: (v) => sanitizeText(v, { maxLength: 50 }),
    tax_id: (v) => sanitizeText(v, { maxLength: 20 }),
    address: (v) => sanitizeText(v, { maxLength: 200 }),
    city: (v) => sanitizeText(v, { maxLength: 50 }),
    state: (v) => sanitizeText(v, { maxLength: 2 }),
    zip: (v) => sanitizeZipCode(v),
    phone: (v) => sanitizePhone(v),
    email: (v) => sanitizeEmail(v),
    website: (v) => sanitizeURL(v)
  });
};

/**
 * Validate and sanitize vehicle data
 */
export const sanitizeVehicleData = (data: any) => {
  return sanitizeObject(data, {
    vin: (v) => validateVIN(v) ? v : null,
    make: (v) => sanitizeText(v, { maxLength: 50 }),
    model: (v) => sanitizeText(v, { maxLength: 50 }),
    year: (v) => {
      const year = parseInt(v);
      return (year >= 1900 && year <= new Date().getFullYear() + 1) ? year : null;
    },
    mileage: (v) => {
      const mileage = parseInt(v);
      return (mileage >= 0 && mileage <= 1000000) ? mileage : null;
    },
    price: (v) => sanitizeMoney(v),
    color: (v) => sanitizeText(v, { maxLength: 30 }),
    license_plate: (v) => sanitizeText(v, { maxLength: 20 }),
    description: (v) => sanitizeText(v, { maxLength: 5000, allowHtml: false })
  });
};

/**
 * Validate and sanitize customer data
 */
export const sanitizeCustomerData = (data: any) => {
  return sanitizeObject(data, {
    first_name: (v) => sanitizeText(v, { maxLength: 50 }),
    last_name: (v) => sanitizeText(v, { maxLength: 50 }),
    email: (v) => sanitizeEmail(v),
    phone: (v) => sanitizePhone(v),
    ssn: (v) => sanitizeSSN(v),
    drivers_license: (v) => sanitizeDriversLicense(v, data.license_state),
    date_of_birth: (v) => sanitizeDate(v),
    address: (v) => sanitizeText(v, { maxLength: 200 }),
    city: (v) => sanitizeText(v, { maxLength: 50 }),
    state: (v) => sanitizeText(v, { maxLength: 2 }),
    zip: (v) => sanitizeZipCode(v),
    income: (v) => sanitizeMoney(v),
    credit_score: (v) => {
      const score = parseInt(v);
      return (score >= 300 && score <= 850) ? score : null;
    }
  });
};

export default {
  validateVIN,
  sanitizeEmail,
  sanitizePhone,
  sanitizeSSN,
  sanitizeCreditCard,
  sanitizeDriversLicense,
  sanitizeText,
  sanitizeURL,
  sanitizeFileName,
  sanitizeMoney,
  sanitizeDate,
  sanitizeZipCode,
  sanitizePassword,
  sanitizeObject,
  sanitizeDealershipData,
  sanitizeVehicleData,
  sanitizeCustomerData
};