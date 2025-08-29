import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/AuthService';
import { authValidation } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();
const authService = new AuthService();

// Rate limiters for sensitive endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for login from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.'
    });
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset requests. Please try again later.',
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for password reset from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests. Please try again later.'
    });
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour
  message: 'Too many registration attempts. Please try again later.',
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for registration from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts. Please try again later.'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerLimiter, authValidation.register, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, dealershipName, phone, role } = req.body;

    const user = await authService.register({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone,
      role: role || 'customer',
      // Note: dealership_id should be handled separately in production
    });

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          dealershipName,
          role: user.role,
          createdAt: user.created_at
        }
      }
    });

  } catch (error: any) {
    logger.error('Registration error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginLimiter, authValidation.login, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Get device info from request
    const deviceInfo = {
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      device_type: req.get('x-device-type'), // Custom header from mobile app
      device_id: req.get('x-device-id') // Custom header for device identification
    };

    const result = await authService.login(email, password, deviceInfo);

    logger.info(`User logged in successfully: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.first_name,
          lastName: result.user.last_name,
          role: result.user.role,
          dealershipId: result.user.dealership_id,
          isVerified: result.user.is_verified,
          lastLogin: result.user.last_login
        }
      }
    });

  } catch (error: any) {
    logger.error('Login error:', error);

    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (error.message.includes('locked')) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to multiple failed attempts. Please try again later.'
      });
    }

    if (error.message.includes('deactivated')) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Public
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const deviceInfo = {
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    };

    const result = await authService.refreshAccessToken(refreshToken, deviceInfo);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: result.accessToken,
        expiresIn: result.expiresIn
      }
    });

  } catch (error: any) {
    logger.error('Token refresh error:', error);

    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Private
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const user = (req as any).user;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    logger.info(`User logged out: ${user.email}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    // Even if logout fails, return success to clear client state
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    await authService.logoutAllDevices(user.userId);

    logger.info(`User logged out from all devices: ${user.email}`);

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    logger.error('Logout all devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout from all devices'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', passwordResetLimiter, authValidation.forgotPassword, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    logger.info(`Password reset requested for: ${email}`);

    // Always return success for security (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    // Still return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', authValidation.resetPassword, async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const success = await authService.resetPassword(token, password);

    if (success) {
      logger.info('Password reset successful');
      res.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to reset password. Token may be invalid or expired.'
      });
    }

  } catch (error: any) {
    logger.error('Reset password error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password for logged in user
// @access  Private
router.post('/change-password', authMiddleware, authValidation.changePassword, async (req: Request, res: Response) => {
  try {
    const { currentPassword, password: newPassword } = req.body;
    const user = (req as any).user;

    const success = await authService.changePassword(user.userId, currentPassword, newPassword);

    if (success) {
      logger.info(`Password changed for user: ${user.email}`);
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to change password'
      });
    }

  } catch (error: any) {
    logger.error('Change password error:', error);
    
    if (error.message.includes('incorrect')) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.post('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const success = await authService.verifyEmail(token);

    if (success) {
      res.json({
        success: true,
        message: 'Email verified successfully. You can now login.'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // The user object from authMiddleware contains basic info from token
    // You might want to fetch complete user data from database here
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.userId,
          email: user.email,
          role: user.role,
          dealershipId: user.dealershipId,
          // Additional fields can be fetched from database if needed
        }
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify if a token is valid
// @access  Private
router.get('/verify-token', authMiddleware, (req: Request, res: Response) => {
  // If the request reaches here, the token is valid (validated by authMiddleware)
  const user = (req as any).user;
  
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      userId: user.userId,
      email: user.email,
      role: user.role
    }
  });
});

export default router;