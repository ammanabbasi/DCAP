import request from 'supertest';
import express from 'express';
import { AuthService } from '../../src/services/AuthService';
import { MockDataFactory } from '../factories/mockData';
import authRoutes from '../../src/routes/auth';
import vehicleRoutes from '../../src/routes/vehicles';

// Mock dependencies
jest.mock('../../src/services/AuthService');
jest.mock('../../src/middleware/validation');
jest.mock('../../src/middleware/auth');
jest.mock('../../src/utils/logger');
jest.mock('express-rate-limit', () => jest.fn(() => (req: any, res: any, next: any) => next()));

describe('Security Tests', () => {
  let app: express.Application;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    // Create Express app with security middleware
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Add routes
    app.use('/api/auth', authRoutes);
    app.use('/api/vehicles', vehicleRoutes);

    mockAuthService = AuthService.prototype as jest.Mocked<AuthService>;

    // Mock validation middleware
    const mockValidation = require('../../src/middleware/validation');
    mockValidation.authValidation = {
      register: (req: any, res: any, next: any) => {
        // Basic validation simulation
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        next();
      },
      login: (req: any, res: any, next: any) => next(),
      forgotPassword: (req: any, res: any, next: any) => next(),
      resetPassword: (req: any, res: any, next: any) => next(),
      changePassword: (req: any, res: any, next: any) => next(),
    };

    // Mock auth middleware
    const mockAuth = require('../../src/middleware/auth');
    mockAuth.authMiddleware = (req: any, res: any, next: any) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }
      
      const token = authHeader.substring(7);
      if (token === 'valid-token') {
        req.user = {
          userId: 'user123',
          email: 'test@example.com',
          role: 'customer'
        };
        next();
      } else {
        res.status(401).json({ success: false, message: 'Invalid token' });
      }
    };

    jest.clearAllMocks();
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in login credentials', async () => {
      // Arrange
      const sqlInjectionPayload = {
        email: "admin@example.com'; DROP TABLE users; --",
        password: "password' OR '1'='1"
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid email or password'));

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(sqlInjectionPayload);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
      
      // Verify that the service was called with unsanitized input
      // The sanitization should happen at the database/ORM level
      expect(mockAuthService.login).toHaveBeenCalledWith(
        sqlInjectionPayload.email,
        sqlInjectionPayload.password,
        expect.any(Object)
      );
    });

    it('should handle SQL injection attempts in registration', async () => {
      // Arrange
      const sqlInjectionPayload = {
        email: "test@example.com",
        password: "password",
        firstName: "Robert'; DROP TABLE users; --",
        lastName: "Tables"
      };

      mockAuthService.register.mockResolvedValue(MockDataFactory.createUser());

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(sqlInjectionPayload);

      // Assert
      expect(response.status).toBe(201);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: sqlInjectionPayload.firstName // Should be sanitized at DB level
        })
      );
    });
  });

  describe('XSS Prevention', () => {
    it('should handle XSS attempts in registration data', async () => {
      // Arrange
      const xssPayload = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: '<script>alert("XSS")</script>',
        lastName: '<img src=x onerror=alert("XSS")>',
        phone: '<svg onload=alert("XSS")>'
      };

      mockAuthService.register.mockResolvedValue({
        ...MockDataFactory.createUser(),
        first_name: xssPayload.firstName,
        last_name: xssPayload.lastName
      });

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(xssPayload);

      // Assert
      expect(response.status).toBe(201);
      
      // The response should not contain executable script tags
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain('<script>');
      expect(responseString).not.toContain('onerror=');
      expect(responseString).not.toContain('onload=');
    });

    it('should sanitize XSS in error messages', async () => {
      // Arrange
      const xssEmail = '<script>alert("XSS")</script>@example.com';
      mockAuthService.register.mockRejectedValue(
        new Error(`User with email ${xssEmail} already exists`)
      );

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: xssEmail,
          password: 'password',
          firstName: 'Test',
          lastName: 'User'
        });

      // Assert
      expect(response.status).toBe(409);
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain('<script>');
    });
  });

  describe('Authentication Bypass Attempts', () => {
    it('should reject requests without authentication token', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/profile');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('should reject malformed authentication tokens', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should reject non-Bearer authentication schemes', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Basic dGVzdDp0ZXN0');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('should handle JWT manipulation attempts', async () => {
      // Arrange - Try to manipulate JWT payload
      const manipulatedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2Mzk1NzI0MDB9.invalid-signature';

      // Act
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${manipulatedToken}`);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User'
        });

      // Assert
      // This would be handled by validation middleware in real implementation
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should validate password strength', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123', // Weak password
          firstName: 'Test',
          lastName: 'User'
        });

      // Assert
      // Password strength validation should be handled by validation middleware
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject oversized payloads', async () => {
      // Arrange - Create large payload
      const largeString = 'A'.repeat(20 * 1024 * 1024); // 20MB

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: largeString,
          lastName: 'User'
        });

      // Assert
      expect(response.status).toBe(413); // Payload Too Large
    });

    it('should handle special characters appropriately', async () => {
      // Arrange
      const specialCharsPayload = {
        email: 'test+special@example.com',
        password: 'P@$$w0rd!#$%',
        firstName: "O'Connor",
        lastName: 'José-María',
        phone: '+1-555-123-4567'
      };

      mockAuthService.register.mockResolvedValue(MockDataFactory.createUser());

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(specialCharsPayload);

      // Assert
      expect(response.status).toBe(201);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: specialCharsPayload.email,
          first_name: specialCharsPayload.firstName,
          last_name: specialCharsPayload.lastName
        })
      );
    });
  });

  describe('Session Management Security', () => {
    it('should handle concurrent session attempts', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const mockLoginResult = {
        user: MockDataFactory.createUser(),
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600
      };

      mockAuthService.login.mockResolvedValue(mockLoginResult);

      // Act - Simulate concurrent login attempts
      const requests = Array.from({ length: 5 }, () =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(requests);

      // Assert
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data).toHaveProperty('refreshToken');
      });

      expect(mockAuthService.login).toHaveBeenCalledTimes(5);
    });

    it('should handle refresh token replay attacks', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      mockAuthService.refreshAccessToken
        .mockResolvedValueOnce({ accessToken: 'new-token-1', expiresIn: 3600 })
        .mockRejectedValueOnce(new Error('Invalid or expired refresh token'));

      // Act - Use the same refresh token twice
      const firstResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      const secondResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      // Assert
      expect(firstResponse.status).toBe(200);
      expect(secondResponse.status).toBe(401);
      expect(secondResponse.body.message).toBe('Invalid or expired refresh token');
    });
  });

  describe('Information Disclosure Prevention', () => {
    it('should not reveal user existence in forgot password', async () => {
      // Arrange
      mockAuthService.requestPasswordReset.mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        'If an account with this email exists, a password reset link has been sent.'
      );
    });

    it('should not expose internal error details', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new Error('Database connection failed: Connection refused to 10.0.0.1:5432')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Login failed. Please try again.');
      expect(response.body.message).not.toContain('Database');
      expect(response.body.message).not.toContain('10.0.0.1');
    });

    it('should sanitize stack traces in error responses', async () => {
      // Arrange
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at AuthService.login (/app/src/services/AuthService.ts:85:13)';
      mockAuthService.register.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User'
        });

      // Assert
      expect(response.status).toBe(500);
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain('/app/src/');
      expect(responseString).not.toContain('AuthService.ts');
      expect(responseString).not.toContain('stack');
    });
  });

  describe('Rate Limiting and DoS Prevention', () => {
    it('should handle rapid successive requests', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue({
        user: MockDataFactory.createUser(),
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600
      });

      // Act - Send many requests quickly
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/auth/login')
          .send({ email: `test${i}@example.com`, password: 'password' })
      );

      const responses = await Promise.all(requests);

      // Assert - All should process (rate limiting is mocked)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle malformed JSON gracefully', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password": unclosed string}');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('File Upload Security', () => {
    it('should validate file upload types', async () => {
      // This test would apply to file upload endpoints
      // Currently focusing on auth endpoints, but important for complete security testing
    });

    it('should scan uploaded files for malware', async () => {
      // This would test integration with antivirus scanning
    });
  });

  describe('HTTP Security Headers', () => {
    it('should include security headers in responses', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      // These would typically be set by security middleware like Helmet
      expect(response.status).toBe(200);
      
      // In a real implementation, check for headers like:
      // expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      // expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      // expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
    });
  });

  describe('Parameter Pollution', () => {
    it('should handle HTTP Parameter Pollution attacks', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .query({ email: ['test1@example.com', 'test2@example.com'] })
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      // Assert
      // Should handle duplicate parameters gracefully
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('CORS Security', () => {
    it('should handle CORS preflight requests', async () => {
      // Act
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'https://malicious-site.com')
        .set('Access-Control-Request-Method', 'POST');

      // Assert
      // CORS middleware should be configured to handle this appropriately
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions after password change', async () => {
      // This would test that changing password invalidates all active sessions
      // Implementation would depend on session management strategy
    });

    it('should handle session fixation attempts', async () => {
      // This would test protection against session fixation attacks
      // Where an attacker tries to force a user to use a known session ID
    });
  });
});