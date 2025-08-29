import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/AuthService';
import logger from '../utils/logger';
import cache, { CacheKeys } from '../config/redis';

export interface AuthRequest extends Request {
  user?: TokenPayload;
  token?: string;
}

const authService = new AuthService();

export const authMiddleware = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Extract token from header
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Check token blacklist (for logged out tokens)
    const isBlacklisted = await cache.exists(`${CacheKeys.SESSION}blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked.',
        code: 'TOKEN_REVOKED'
      });
    }

    // Verify token
    const decoded = await authService.verifyAccessToken(token);
    
    // Attach user info and token to request
    req.user = decoded;
    req.token = token;

    next();

  } catch (error: any) {
    logger.error('Auth middleware error:', error);
    
    if (error.message === 'Invalid access token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.message === 'Access token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message === 'User not found or inactive') {
      return res.status(401).json({
        success: false,
        message: 'User account not found or has been deactivated.',
        code: 'USER_INACTIVE'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      code: 'AUTH_ERROR'
    });
  }
};

export const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.userId} with role ${req.user.role}. Required roles: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access this resource.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Optional auth middleware - doesn't fail if no token
export const optionalAuth = async (
  req: AuthRequest, 
  _res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      const decoded = await authService.verifyAccessToken(token);
      req.user = decoded;
      req.token = token;
    }

    next();
  } catch (error) {
    // Log error but continue without auth
    logger.debug('Optional auth failed:', error);
    next();
  }
};

// Dealership access middleware
export const dealershipAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  const dealershipId = req.params.dealershipId || req.body.dealership_id;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  // Super admins can access any dealership
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check if user belongs to the dealership
  if (req.user.dealershipId !== dealershipId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You do not have access to this dealership.',
      code: 'DEALERSHIP_ACCESS_DENIED'
    });
  }

  next();
};
