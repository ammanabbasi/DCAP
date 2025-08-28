import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('dealershipName').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, dealershipName, phone, role = 'salesperson' } = req.body;

    // Check if user already exists
    // TODO: Implement database check
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    // TODO: Implement database insertion

    const token = jwt.sign(
      { 
        userId: 'temp-user-id',
        email,
        role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: 'temp-user-id',
          email,
          firstName,
          lastName,
          dealershipName,
          phone,
          role,
          createdAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password format',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // TODO: Get user from database
    // For now, using mock data
    const mockUser = {
      id: 'user-123',
      email: 'demo@dealerscloud.com',
      password: await bcrypt.hash('demo123', 12), // demo123
      firstName: 'Demo',
      lastName: 'User',
      dealershipName: 'Demo Dealership',
      role: 'manager',
      isActive: true
    };

    // Validate password
    const isValidPassword = await bcrypt.compare(password, mockUser.password);
    
    if (email !== mockUser.email || !isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!mockUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: mockUser.id },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: '7d' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          dealershipName: mockUser.dealershipName,
          role: mockUser.role
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
    ) as any;

    // TODO: Check if refresh token exists in database and is valid

    // Generate new access token
    const newToken = jwt.sign(
      { 
        userId: decoded.userId,
        email: 'demo@dealerscloud.com', // TODO: Get from database
        role: 'manager' // TODO: Get from database
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Valid email required',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // TODO: Generate password reset token and send email
    logger.info(`Password reset requested for: ${email}`);

    // Always return success for security (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    // TODO: Get full user profile from database
    res.json({
      success: true,
      data: {
        user: {
          id: user.userId,
          email: user.email,
          firstName: 'Demo',
          lastName: 'User',
          dealershipName: 'Demo Dealership',
          role: user.role,
          lastLogin: new Date().toISOString()
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

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate token)
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    // TODO: Add token to blacklist in database
    logger.info(`User logged out: ${user.email}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

export default router;
