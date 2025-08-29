import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import logger from '../utils/logger';

export const validate = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      // Validate request body
      const validated = await schema.validateAsync(req.body, {
        abortEarly: false, // Return all errors
        stripUnknown: true, // Remove unknown keys
        convert: true, // Perform type conversion
      });

      // Replace request body with validated data
      req.body = validated;
      
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
        }));

        logger.warn('Validation failed', {
          path: req.path,
          method: req.method,
          errors,
          ip: req.ip,
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      // If not a Joi error, pass to error handler
      next(error);
    }
  };
};

// Validate query parameters
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const validated = await schema.validateAsync(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
        }));

        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors,
        });
      }

      next(error);
    }
  };
};

// Validate URL parameters
export const validateParams = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const validated = await schema.validateAsync(req.params, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
        }));

        return res.status(400).json({
          success: false,
          message: 'Invalid URL parameters',
          errors,
        });
      }

      next(error);
    }
  };
};

// Combined validation for body, query, and params
export const validateRequest = (schemas: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const errors: any[] = [];

      // Validate body
      if (schemas.body) {
        try {
          req.body = await schemas.body.validateAsync(req.body, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
          });
        } catch (error) {
          if (error instanceof Joi.ValidationError) {
            errors.push(...error.details.map(detail => ({
              location: 'body',
              field: detail.path.join('.'),
              message: detail.message,
              type: detail.type,
            })));
          }
        }
      }

      // Validate query
      if (schemas.query) {
        try {
          req.query = await schemas.query.validateAsync(req.query, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
          });
        } catch (error) {
          if (error instanceof Joi.ValidationError) {
            errors.push(...error.details.map(detail => ({
              location: 'query',
              field: detail.path.join('.'),
              message: detail.message,
              type: detail.type,
            })));
          }
        }
      }

      // Validate params
      if (schemas.params) {
        try {
          req.params = await schemas.params.validateAsync(req.params, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
          });
        } catch (error) {
          if (error instanceof Joi.ValidationError) {
            errors.push(...error.details.map(detail => ({
              location: 'params',
              field: detail.path.join('.'),
              message: detail.message,
              type: detail.type,
            })));
          }
        }
      }

      if (errors.length > 0) {
        logger.warn('Request validation failed', {
          path: req.path,
          method: req.method,
          errors,
          ip: req.ip,
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Remove HTML tags and scripts
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  
  return input;
};

// Middleware to sanitize all inputs
export const sanitizeAll = (req: Request, _res: Response, next: NextFunction): void => {
  req.body = sanitizeInput(req.body);
  req.query = sanitizeInput(req.query);
  req.params = sanitizeInput(req.params);
  next();
};