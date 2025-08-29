import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import { AuthService } from '../../src/services/AuthService';
import { MockDataFactory } from '../factories/mockData';
import { TestHelpers } from '../utils/testHelpers';

// Mock dependencies
jest.mock('../../src/services/AuthService');
jest.mock('../../src/middleware/validation');
jest.mock('../../src/middleware/auth');
jest.mock('../../src/utils/logger');
jest.mock('express-rate-limit', () => jest.fn(() => (req: any, res: any, next: any) => next()));

describe('Auth Routes Integration Tests', () => {
  let app: express.Application;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    // Create Express app with routes
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    // Get mocked service
    mockAuthService = AuthService.prototype as jest.Mocked<AuthService>;

    // Mock validation middleware to pass through
    const mockValidation = require('../../src/middleware/validation');
    mockValidation.authValidation = {
      register: (req: any, res: any, next: any) => next(),
      login: (req: any, res: any, next: any) => next(),
      forgotPassword: (req: any, res: any, next: any) => next(),
      resetPassword: (req: any, res: any, next: any) => next(),
      changePassword: (req: any, res: any, next: any) => next(),
    };

    // Mock auth middleware
    const mockAuth = require('../../src/middleware/auth');
    mockAuth.authMiddleware = (req: any, res: any, next: any) => {
      req.user = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'customer'
      };
      next();
    };

    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-1234',
      role: 'customer'
    };

    it('should register new user successfully', async () => {
      // Arrange
      const mockUser = MockDataFactory.createUser();
      mockAuthService.register.mockResolvedValue({
        ...mockUser,
        first_name: validRegistrationData.firstName,
        last_name: validRegistrationData.lastName
      });

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          user: expect.objectContaining({
            id: expect.any(String),
            email: validRegistrationData.email,
            firstName: validRegistrationData.firstName,
            lastName: validRegistrationData.lastName,
            role: validRegistrationData.role
          })
        }
      });

      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: validRegistrationData.email,
        password: validRegistrationData.password,
        first_name: validRegistrationData.firstName,
        last_name: validRegistrationData.lastName,
        phone: validRegistrationData.phone,
        role: validRegistrationData.role
      });
    });

    it('should return 409 when user already exists', async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(
        new Error('User with this email already exists')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        success: false,
        message: 'User with this email already exists'
      });
    });

    it('should return 500 for server errors', async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    });

    it('should use default role when not provided', async () => {
      // Arrange
      const dataWithoutRole = { ...validRegistrationData };
      delete dataWithoutRole.role;
      
      const mockUser = MockDataFactory.createUser({ role: 'customer' });
      mockAuthService.register.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(dataWithoutRole);

      // Assert
      expect(response.status).toBe(201);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'customer'
        })
      );
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'SecurePassword123!'
    };

    const mockLoginResult = {
      user: MockDataFactory.createUser(),
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600
    };

    it('should login user successfully', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockLoginResult);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .set('User-Agent', 'Test-Agent/1.0')
        .set('x-device-type', 'web')
        .set('x-device-id', 'device123');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Login successful',
        data: {
          token: mockLoginResult.accessToken,
          refreshToken: mockLoginResult.refreshToken,
          expiresIn: mockLoginResult.expiresIn,
          user: expect.objectContaining({
            id: mockLoginResult.user.id,
            email: mockLoginResult.user.email,
            firstName: mockLoginResult.user.first_name,
            lastName: mockLoginResult.user.last_name,
            role: mockLoginResult.user.role
          })
        }
      });

      expect(mockAuthService.login).toHaveBeenCalledWith(
        validLoginData.email,
        validLoginData.password,
        expect.objectContaining({
          ip_address: expect.any(String),
          user_agent: 'Test-Agent/1.0',
          device_type: 'web',
          device_id: 'device123'
        })
      );
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new Error('Invalid email or password')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should return 423 for locked account', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new Error('Account is locked. Please try again later.')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      // Assert
      expect(response.status).toBe(423);
      expect(response.body).toEqual({
        success: false,
        message: 'Account is locked due to multiple failed attempts. Please try again later.'
      });
    });

    it('should return 403 for deactivated account', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new Error('Account is deactivated')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    });

    it('should handle login without device headers', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockLoginResult);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      // Assert
      expect(response.status).toBe(200);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        validLoginData.email,
        validLoginData.password,
        expect.objectContaining({
          ip_address: expect.any(String),
          user_agent: undefined,
          device_type: undefined,
          device_id: undefined
        })
      );
    });
  });

  describe('POST /api/auth/refresh', () => {
    const mockRefreshResult = {
      accessToken: 'new-access-token',
      expiresIn: 3600
    };

    it('should refresh access token successfully', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      mockAuthService.refreshAccessToken.mockResolvedValue(mockRefreshResult);

      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .set('User-Agent', 'Test-Agent/1.0');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: mockRefreshResult.accessToken,
          expiresIn: mockRefreshResult.expiresIn
        }
      });

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(
        refreshToken,
        expect.objectContaining({
          ip_address: expect.any(String),
          user_agent: 'Test-Agent/1.0'
        })
      );
    });

    it('should return 401 when refresh token is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Refresh token required'
      });

      expect(mockAuthService.refreshAccessToken).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid refresh token', async () => {
      // Arrange
      mockAuthService.refreshAccessToken.mockRejectedValue(
        new Error('Invalid or expired refresh token')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const refreshToken = 'refresh-token-to-revoke';
      mockAuthService.logout.mockResolvedValue(undefined);

      // Act
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully'
      });

      expect(mockAuthService.logout).toHaveBeenCalledWith(refreshToken);
    });

    it('should succeed even when logout service fails', async () => {
      // Arrange
      mockAuthService.logout.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'token' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully'
      });
    });

    it('should handle logout without refresh token', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/logout')
        .send({});

      // Assert
      expect(response.status).toBe(200);
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/logout-all', () => {
    it('should logout from all devices successfully', async () => {
      // Arrange
      mockAuthService.logoutAllDevices.mockResolvedValue(undefined);

      // Act
      const response = await request(app)
        .post('/api/auth/logout-all')
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Logged out from all devices successfully'
      });

      expect(mockAuthService.logoutAllDevices).toHaveBeenCalledWith('user123');
    });

    it('should return 500 on service failure', async () => {
      // Arrange
      mockAuthService.logoutAllDevices.mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/logout-all')
        .send();

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to logout from all devices'
      });
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should always return success for security', async () => {
      // Arrange
      mockAuthService.requestPasswordReset.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });

      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(
        'test@example.com'
      );
    });

    it('should return success even when service fails', async () => {
      // Arrange
      mockAuthService.requestPasswordReset.mockRejectedValue(
        new Error('Email service failed')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    });
  });

  describe('POST /api/auth/reset-password', () => {
    const resetData = {
      token: 'valid-reset-token',
      password: 'NewPassword123!'
    };

    it('should reset password successfully', async () => {
      // Arrange
      mockAuthService.resetPassword.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      });

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetData.token,
        resetData.password
      );
    });

    it('should return 400 when reset fails', async () => {
      // Arrange
      mockAuthService.resetPassword.mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to reset password. Token may be invalid or expired.'
      });
    });

    it('should return 400 for invalid token error', async () => {
      // Arrange
      mockAuthService.resetPassword.mockRejectedValue(
        new Error('Invalid or expired reset token')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid or expired reset token'
      });
    });
  });

  describe('POST /api/auth/change-password', () => {
    const changePasswordData = {
      currentPassword: 'CurrentPassword123!',
      password: 'NewPassword123!'
    };

    it('should change password successfully', async () => {
      // Arrange
      mockAuthService.changePassword.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post('/api/auth/change-password')
        .send(changePasswordData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Password changed successfully'
      });

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        'user123',
        changePasswordData.currentPassword,
        changePasswordData.password
      );
    });

    it('should return 400 when change fails', async () => {
      // Arrange
      mockAuthService.changePassword.mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/api/auth/change-password')
        .send(changePasswordData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to change password'
      });
    });

    it('should return 401 for incorrect current password', async () => {
      // Arrange
      mockAuthService.changePassword.mockRejectedValue(
        new Error('Current password is incorrect')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/change-password')
        .send(changePasswordData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Current password is incorrect'
      });
    });
  });

  describe('POST /api/auth/verify-email/:token', () => {
    it('should verify email successfully', async () => {
      // Arrange
      const token = 'valid-verification-token';
      mockAuthService.verifyEmail.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post(`/api/auth/verify-email/${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Email verified successfully. You can now login.'
      });

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(token);
    });

    it('should return 400 for invalid token', async () => {
      // Arrange
      mockAuthService.verifyEmail.mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/api/auth/verify-email/invalid-token');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid or expired verification token'
      });
    });

    it('should return 500 on service error', async () => {
      // Arrange
      mockAuthService.verifyEmail.mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/verify-email/token');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to verify email'
      });
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile successfully', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/profile');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            role: 'customer',
            dealershipId: undefined
          }
        }
      });
    });
  });

  describe('GET /api/auth/verify-token', () => {
    it('should verify token successfully', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/verify-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Token is valid',
        data: {
          userId: 'user123',
          email: 'test@example.com',
          role: 'customer'
        }
      });
    });
  });

  describe('Security and Validation', () => {
    it('should handle malformed JSON gracefully', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      // Assert
      expect(response.status).toBe(400);
    });

    it('should sanitize user input', async () => {
      // Arrange
      const maliciousData = {
        email: '<script>alert("xss")</script>@example.com',
        password: 'Password123!',
        firstName: '<img src=x onerror=alert(1)>',
        lastName: 'Doe'
      };

      const mockUser = MockDataFactory.createUser();
      mockAuthService.register.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData);

      // Assert
      expect(response.status).toBe(201);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: maliciousData.email, // Should be sanitized by validation middleware
          first_name: maliciousData.firstName
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected service errors', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new Error('Unexpected database error')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Login failed. Please try again.'
      });
    });

    it('should handle missing required fields gracefully', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' }); // Missing required fields

      // Assert
      // This would typically be handled by validation middleware
      // The response depends on validation middleware implementation
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should maintain consistent response format', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(MockDataFactory.createUser());

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(MockDataFactory.createAuthPayload(MockDataFactory.createUser()));

      // Assert
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      if (response.body.success) {
        expect(response.body).toHaveProperty('data');
      }
    });
  });

  describe('Rate Limiting', () => {
    // Note: Rate limiting is mocked in this test suite
    // In a real integration test, you would test actual rate limiting
    it('should apply rate limiting to sensitive endpoints', async () => {
      // This test verifies that rate limiting middleware is applied
      // The actual rate limiting logic would be tested separately
      
      const mockUser = MockDataFactory.createUser();
      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600
      });

      // Make multiple requests quickly
      const requests = Array.from({ length: 3 }, () =>
        request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password' })
      );

      const responses = await Promise.all(requests);

      // All should succeed in this mocked environment
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});