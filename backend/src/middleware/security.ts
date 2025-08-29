/**
 * Comprehensive Security Middleware for DealersCloud Platform
 * Implements OWASP Top 10 protection measures
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import validator from 'validator';
import sanitizeHtml from 'sanitize-html';
import crypto from 'crypto';
import logger from '../utils/logger';

/**
 * Enhanced Helmet Configuration with strict CSP
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "wss:", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: false
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

/**
 * Request Sanitization Middleware
 * Sanitizes all incoming request data to prevent XSS and injection attacks
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Request sanitization error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid request data',
      code: 'INVALID_REQUEST'
    });
  }
};

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    // Skip sanitization for specific fields that need to preserve formatting
    const skipFields = ['password', 'token', 'hash', 'signature'];
    return skipFields.some(field => obj.toLowerCase().includes(field)) 
      ? obj 
      : sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Prevent prototype pollution
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          continue;
        }
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitize individual strings
 */
function sanitizeString(str: string): string {
  // Remove any HTML tags
  let sanitized = sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  });

  // Escape special characters
  sanitized = validator.escape(sanitized);
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * MongoDB Injection Prevention
 */
export const mongoInjectionPrevention = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }: any) => {
    logger.warn(`MongoDB injection attempt blocked from IP: ${req.ip}, Key: ${key}`);
  }
});

/**
 * SQL Injection Prevention Middleware
 */
export const sqlInjectionPrevention = (req: Request, res: Response, next: NextFunction): void | Response => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT)\b)/gi,
    /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/gi,
    /(--|\#|\/\*|\*\/)/g,
    /(\bWHERE\b.*\b1\s*=\s*1\b)/gi,
    /(\bSLEEP\s*\(\s*\d+\s*\))/gi,
    /(\bBENCHMARK\s*\()/gi,
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (checkValue(value)) return true;
        if (typeof value === 'object' && checkObject(value)) return true;
      }
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    logger.warn(`SQL injection attempt blocked from IP: ${req.ip}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid request data detected',
      code: 'SQL_INJECTION_DETECTED'
    });
  }

  next();
};

/**
 * XSS Protection Middleware
 */
export const xssProtection = (_req: Request, res: Response, next: NextFunction): void => {
  // Set additional XSS protection headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  next();
};

/**
 * HPP (HTTP Parameter Pollution) Prevention
 */
export const hppProtection = hpp({
  whitelist: ['sort', 'filter', 'page', 'limit'], // Allow these parameters to have arrays
  checkQuery: true,
  checkBody: true
});

/**
 * Enhanced Rate Limiting per User and IP
 */
export const createRateLimiter = (options?: {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options?.max || 100, // 100 requests per window default
    message: options?.message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options?.keyGenerator || ((req: Request) => {
      // Use user ID if authenticated, otherwise use IP
      const authReq = req as any;
      return authReq.user?.userId || req.ip || 'unknown';
    }),
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: res.getHeader('Retry-After')
      });
    }
  });
};

/**
 * API-specific rate limiters
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 auth attempts per window
  message: 'Too many authentication attempts'
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'API rate limit exceeded'
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many file uploads'
});

/**
 * Speed Limiter - Slows down responses instead of blocking
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window at full speed
  delayMs: (hits: number) => hits * 100, // Add 100ms delay per request after delayAfter
  maxDelayMs: 2000, // Maximum delay of 2 seconds
  keyGenerator: (req: Request) => {
    const authReq = req as any;
    return authReq.user?.userId || req.ip || 'unknown';
  }
});

/**
 * CSRF Protection Configuration
 * Note: Requires session middleware to be configured first
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for API routes that use JWT authentication
  if (req.path.startsWith('/api/') && req.headers.authorization) {
    return next();
  }

  // For non-API routes, implement double submit cookie pattern
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const cookie = req.cookies?.['csrf-token'];

  if (!token || !cookie || token !== cookie) {
    logger.warn(`CSRF validation failed for ${req.ip} on ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      code: 'CSRF_VALIDATION_FAILED'
    });
  }

  next();
};

/**
 * Security Headers Middleware
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  // Additional security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Remove fingerprinting headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

/**
 * Request ID Middleware for tracking and audit
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = crypto.randomBytes(16).toString('hex');
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * IP Validation and Blocking Middleware
 */
const blockedIPs = new Set<string>();
const suspiciousActivity = new Map<string, number>();

export const ipValidation = (req: Request, res: Response, next: NextFunction): void | Response => {
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';

  // Check if IP is blocked
  if (blockedIPs.has(clientIP)) {
    logger.warn(`Blocked IP attempted access: ${clientIP}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      code: 'IP_BLOCKED'
    });
  }

  // Track suspicious activity
  const activityCount = suspiciousActivity.get(clientIP) || 0;
  if (activityCount > 10) {
    blockedIPs.add(clientIP);
    logger.warn(`IP automatically blocked due to suspicious activity: ${clientIP}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied due to suspicious activity',
      code: 'SUSPICIOUS_ACTIVITY_BLOCKED'
    });
  }

  next();
};

/**
 * Record suspicious activity
 */
export const recordSuspiciousActivity = (ip: string) => {
  const count = suspiciousActivity.get(ip) || 0;
  suspiciousActivity.set(ip, count + 1);
  
  // Clear count after 1 hour
  setTimeout(() => {
    suspiciousActivity.delete(ip);
  }, 60 * 60 * 1000);
};

/**
 * Combined Security Middleware
 * Apply all security middlewares in the correct order
 */
export const applySecurity = [
  requestIdMiddleware,
  ipValidation,
  helmetConfig,
  securityHeaders,
  mongoInjectionPrevention,
  sqlInjectionPrevention,
  xssProtection,
  hppProtection,
  sanitizeRequest,
  speedLimiter
];