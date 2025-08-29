import { AuthService, LoginResult, TokenPayload } from '../AuthService';
import { UserRepository, RefreshTokenRepository, User } from '../../repositories/UserRepository';
import { MockDataFactory } from '../../../tests/factories/mockData';
import { TestHelpers } from '../../../tests/utils/testHelpers';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Mock dependencies
jest.mock('../../repositories/UserRepository');
jest.mock('../../utils/logger');
jest.mock('../../config/redis');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockRefreshTokenRepo: jest.Mocked<RefreshTokenRepository>;
  let mockUser: User;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create service instance
    authService = new AuthService();
    
    // Get mock repositories
    mockUserRepo = authService['userRepo'] as jest.Mocked<UserRepository>;
    mockRefreshTokenRepo = authService['refreshTokenRepo'] as jest.Mocked<RefreshTokenRepository>;
    
    // Create mock user
    mockUser = {
      ...MockDataFactory.createUser(),
      password_hash: 'hashed_password',
      is_active: true,
      is_verified: true,
      failed_login_attempts: 0,
      created_at: new Date(),
      updated_at: new Date()
    } as User;
  });

  describe('register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      first_name: 'John',
      last_name: 'Doe',
      phone: '555-1234',
      role: 'customer' as User['role']
    };

    it('should successfully register a new user', async () => {
      // Arrange
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.createUser.mockResolvedValue(mockUser);

      // Act
      const result = await authService.register(validRegistrationData);

      // Assert
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(validRegistrationData.email);
      expect(mockUserRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validRegistrationData.email,
          password_hash: validRegistrationData.password,
          first_name: validRegistrationData.first_name,
          last_name: validRegistrationData.last_name,
          phone: validRegistrationData.phone,
          role: validRegistrationData.role,
          is_active: true,
          is_verified: false,
          failed_login_attempts: 0,
          verification_token: expect.any(String),
          verification_expires: expect.any(Date)
        })
      );
      expect(result).not.toHaveProperty('password_hash');
      expect(result.email).toBe(validRegistrationData.email);
    });

    it('should throw error when user already exists', async () => {
      // Arrange
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(validRegistrationData))
        .rejects
        .toThrow('User with this email already exists');
      
      expect(mockUserRepo.createUser).not.toHaveBeenCalled();
    });

    it('should generate unique verification token', async () => {
      // Arrange
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.createUser.mockResolvedValue(mockUser);
      
      const cryptoSpy = jest.spyOn(crypto, 'randomBytes')
        .mockReturnValue(Buffer.from('mock-token'));

      // Act
      await authService.register(validRegistrationData);

      // Assert
      expect(cryptoSpy).toHaveBeenCalledWith(32);
      expect(mockUserRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          verification_token: 'mock-token',
          verification_expires: expect.any(Date)
        })
      );
    });

    it('should set default role to customer when not provided', async () => {
      // Arrange
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.createUser.mockResolvedValue(mockUser);
      
      const dataWithoutRole = { ...validRegistrationData };
      delete dataWithoutRole.role;

      // Act
      await authService.register(dataWithoutRole);

      // Assert
      expect(mockUserRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'customer'
        })
      );
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockUserRepo.findByEmail.mockRejectedValue(error);

      // Act & Assert
      await expect(authService.register(validRegistrationData))
        .rejects
        .toThrow('Database connection failed');
    });
  });

  describe('login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'SecurePassword123!'
    };

    const deviceInfo = {
      device_id: 'device123',
      device_type: 'mobile',
      ip_address: '192.168.1.1',
      user_agent: 'Test-Agent/1.0'
    };

    beforeEach(() => {
      // Mock token generation methods
      jest.spyOn(authService as any, 'generateTokens').mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });
      jest.spyOn(authService as any, 'getExpiresInSeconds').mockReturnValue(3600);
    });

    it('should successfully login with valid credentials', async () => {
      // Arrange
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      mockUserRepo.isAccountLocked.mockResolvedValue(false);
      mockUserRepo.verifyPassword.mockResolvedValue(true);

      // Act
      const result: LoginResult = await authService.login(
        loginCredentials.email,
        loginCredentials.password,
        deviceInfo
      );

      // Assert
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(loginCredentials.email);
      expect(mockUserRepo.isAccountLocked).toHaveBeenCalledWith(mockUser);
      expect(mockUserRepo.verifyPassword).toHaveBeenCalledWith(mockUser, loginCredentials.password);
      expect(mockUserRepo.resetFailedAttempts).toHaveBeenCalledWith(mockUser.id);
      expect(mockUserRepo.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      
      expect(result).toEqual({
        user: expect.objectContaining({
          email: mockUser.email,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name
        }),
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      });
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw error when user does not exist', async () => {
      // Arrange
      mockUserRepo.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginCredentials.email, loginCredentials.password))
        .rejects
        .toThrow('Invalid email or password');
      
      expect(mockUserRepo.isAccountLocked).not.toHaveBeenCalled();
      expect(mockUserRepo.verifyPassword).not.toHaveBeenCalled();
    });

    it('should throw error when account is locked', async () => {
      // Arrange
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      mockUserRepo.isAccountLocked.mockResolvedValue(true);

      // Act & Assert
      await expect(authService.login(loginCredentials.email, loginCredentials.password))
        .rejects
        .toThrow('Account is locked. Please try again later.');
      
      expect(mockUserRepo.verifyPassword).not.toHaveBeenCalled();
    });

    it('should increment failed attempts on invalid password', async () => {
      // Arrange
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      mockUserRepo.isAccountLocked.mockResolvedValue(false);
      mockUserRepo.verifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginCredentials.email, loginCredentials.password))
        .rejects
        .toThrow('Invalid email or password');
      
      expect(mockUserRepo.incrementFailedAttempts).toHaveBeenCalledWith(mockUser.id);
      expect(mockUserRepo.resetFailedAttempts).not.toHaveBeenCalled();
    });

    it('should throw error when account is not active', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, is_active: false };
      mockUserRepo.findByEmail.mockResolvedValue(inactiveUser);
      mockUserRepo.isAccountLocked.mockResolvedValue(false);
      mockUserRepo.verifyPassword.mockResolvedValue(true);

      // Act & Assert
      await expect(authService.login(loginCredentials.email, loginCredentials.password))
        .rejects
        .toThrow('Account is deactivated');
    });

    it('should handle login without device info', async () => {
      // Arrange
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      mockUserRepo.isAccountLocked.mockResolvedValue(false);
      mockUserRepo.verifyPassword.mockResolvedValue(true);

      // Act
      const result = await authService.login(loginCredentials.email, loginCredentials.password);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        user: expect.any(Object),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number)
      }));
    });
  });

  describe('refreshAccessToken', () => {
    const mockRefreshToken = 'valid-refresh-token';
    const mockTokenRecord = {
      id: '1',
      user_id: mockUser.id,
      token: mockRefreshToken,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      is_revoked: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    beforeEach(() => {
      jest.spyOn(authService as any, 'generateAccessToken')
        .mockReturnValue('new-access-token');
      jest.spyOn(authService as any, 'getExpiresInSeconds')
        .mockReturnValue(3600);
    });

    it('should successfully refresh access token', async () => {
      // Arrange
      mockRefreshTokenRepo.findValidToken.mockResolvedValue(mockTokenRecord);
      mockUserRepo.findById.mockResolvedValue(mockUser);

      // Act
      const result = await authService.refreshAccessToken(mockRefreshToken);

      // Assert
      expect(mockRefreshTokenRepo.findValidToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockUserRepo.findById).toHaveBeenCalledWith(mockTokenRecord.user_id);
      expect(result).toEqual({
        accessToken: 'new-access-token',
        expiresIn: 3600
      });
    });

    it('should throw error when refresh token is invalid', async () => {
      // Arrange
      mockRefreshTokenRepo.findValidToken.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshAccessToken(mockRefreshToken))
        .rejects
        .toThrow('Invalid or expired refresh token');
      
      expect(mockUserRepo.findById).not.toHaveBeenCalled();
    });

    it('should throw error when user is not found or inactive', async () => {
      // Arrange
      mockRefreshTokenRepo.findValidToken.mockResolvedValue(mockTokenRecord);
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshAccessToken(mockRefreshToken))
        .rejects
        .toThrow('User not found or inactive');
    });

    it('should update token metadata when device info provided', async () => {
      // Arrange
      const deviceInfo = { ip_address: '192.168.1.2', user_agent: 'Updated-Agent/2.0' };
      mockRefreshTokenRepo.findValidToken.mockResolvedValue(mockTokenRecord);
      mockUserRepo.findById.mockResolvedValue(mockUser);

      // Act
      await authService.refreshAccessToken(mockRefreshToken, deviceInfo);

      // Assert
      expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
        mockTokenRecord.id,
        deviceInfo
      );
    });
  });

  describe('logout', () => {
    it('should successfully revoke refresh token', async () => {
      // Arrange
      const refreshToken = 'token-to-revoke';

      // Act
      await authService.logout(refreshToken);

      // Assert
      expect(mockRefreshTokenRepo.revokeToken).toHaveBeenCalledWith(
        refreshToken,
        'User logged out'
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRefreshTokenRepo.revokeToken.mockRejectedValue(error);

      // Act & Assert
      await expect(authService.logout('token')).rejects.toThrow('Database error');
    });
  });

  describe('logoutAllDevices', () => {
    it('should revoke all user tokens and clear cache', async () => {
      // Arrange
      const userId = 'user123';
      const mockCache = {
        deletePattern: jest.fn().mockResolvedValue(undefined)
      };
      require('../../config/redis').default = mockCache;

      // Act
      await authService.logoutAllDevices(userId);

      // Assert
      expect(mockRefreshTokenRepo.revokeAllUserTokens).toHaveBeenCalledWith(
        userId,
        'Logged out from all devices'
      );
      expect(mockCache.deletePattern).toHaveBeenCalledWith(`user:${userId}*`);
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email with valid token', async () => {
      // Arrange
      const verificationToken = 'valid-token';
      mockUserRepo.verifyUser.mockResolvedValue(true);

      // Act
      const result = await authService.verifyEmail(verificationToken);

      // Assert
      expect(mockUserRepo.verifyUser).toHaveBeenCalledWith(verificationToken);
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      // Arrange
      mockUserRepo.verifyUser.mockResolvedValue(false);

      // Act
      const result = await authService.verifyEmail('invalid-token');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('requestPasswordReset', () => {
    it('should set reset token for existing email', async () => {
      // Arrange
      const email = 'user@example.com';
      mockUserRepo.setResetToken.mockResolvedValue(true);
      const cryptoSpy = jest.spyOn(crypto, 'randomBytes')
        .mockReturnValue(Buffer.from('reset-token'));

      // Act
      const result = await authService.requestPasswordReset(email);

      // Assert
      expect(cryptoSpy).toHaveBeenCalledWith(32);
      expect(mockUserRepo.setResetToken).toHaveBeenCalledWith(
        email,
        'reset-token',
        1
      );
      expect(result).toBe(true);
    });

    it('should return false for non-existent email', async () => {
      // Arrange
      mockUserRepo.setResetToken.mockResolvedValue(false);

      // Act
      const result = await authService.requestPasswordReset('nonexistent@example.com');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      // Arrange
      const resetToken = 'valid-reset-token';
      const newPassword = 'NewPassword123!';
      mockUserRepo.findByResetToken.mockResolvedValue(mockUser);
      mockUserRepo.updatePassword.mockResolvedValue(true);

      // Act
      const result = await authService.resetPassword(resetToken, newPassword);

      // Assert
      expect(mockUserRepo.findByResetToken).toHaveBeenCalledWith(resetToken);
      expect(mockUserRepo.updatePassword).toHaveBeenCalledWith(mockUser.id, newPassword);
      expect(result).toBe(true);
    });

    it('should throw error for invalid or expired token', async () => {
      // Arrange
      mockUserRepo.findByResetToken.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.resetPassword('invalid-token', 'NewPassword123!'))
        .rejects
        .toThrow('Invalid or expired reset token');
    });
  });

  describe('changePassword', () => {
    it('should successfully change password with correct current password', async () => {
      // Arrange
      const userId = 'user123';
      const currentPassword = 'CurrentPassword123!';
      const newPassword = 'NewPassword123!';
      
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.verifyPassword.mockResolvedValue(true);
      mockUserRepo.updatePassword.mockResolvedValue(true);

      // Act
      const result = await authService.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(mockUserRepo.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepo.verifyPassword).toHaveBeenCalledWith(mockUser, currentPassword);
      expect(mockUserRepo.updatePassword).toHaveBeenCalledWith(userId, newPassword);
      expect(result).toBe(true);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.changePassword('nonexistent', 'old', 'new'))
        .rejects
        .toThrow('User not found');
    });

    it('should throw error when current password is incorrect', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.verifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.changePassword(mockUser.id, 'wrong', 'new'))
        .rejects
        .toThrow('Current password is incorrect');
    });
  });

  describe('verifyAccessToken', () => {
    const mockPayload: TokenPayload = {
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      dealershipId: mockUser.dealership_id
    };

    beforeEach(() => {
      // Mock JWT secret from config
      const mockConfig = {
        security: {
          jwt: {
            secret: 'test-secret'
          }
        }
      };
      jest.mock('../../config/env', () => ({ config: mockConfig }));
    });

    it('should successfully verify valid access token', async () => {
      // Arrange
      const validToken = TestHelpers.generateJWT(mockPayload);
      mockUserRepo.findById.mockResolvedValue(mockUser);
      
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);

      // Act
      const result = await authService.verifyAccessToken(validToken);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(validToken, 'test-secret');
      expect(mockUserRepo.findById).toHaveBeenCalledWith(mockPayload.userId);
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid token', async () => {
      // Arrange
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      // Act & Assert
      await expect(authService.verifyAccessToken('invalid-token'))
        .rejects
        .toThrow('Invalid access token');
    });

    it('should throw error for expired token', async () => {
      // Arrange
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      // Act & Assert
      await expect(authService.verifyAccessToken('expired-token'))
        .rejects
        .toThrow('Access token expired');
    });

    it('should throw error when user is not found or inactive', async () => {
      // Arrange
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.verifyAccessToken('valid-token'))
        .rejects
        .toThrow('User not found or inactive');
    });
  });

  describe('private methods', () => {
    describe('getExpiresInSeconds', () => {
      it('should parse different time units correctly', () => {
        // Note: We need to access private method for testing
        const service = authService as any;
        
        // Mock different expiry formats
        const mockConfig = (expiresIn: string) => ({
          security: { jwt: { expiresIn } }
        });

        // Test days
        jest.doMock('../../config/env', () => ({ config: mockConfig('7d') }));
        expect(service.getExpiresInSeconds()).toBe(604800); // 7 * 24 * 60 * 60

        // Test hours
        jest.doMock('../../config/env', () => ({ config: mockConfig('24h') }));
        expect(service.getExpiresInSeconds()).toBe(86400); // 24 * 60 * 60

        // Test minutes
        jest.doMock('../../config/env', () => ({ config: mockConfig('30m') }));
        expect(service.getExpiresInSeconds()).toBe(1800); // 30 * 60

        // Test seconds
        jest.doMock('../../config/env', () => ({ config: mockConfig('3600s') }));
        expect(service.getExpiresInSeconds()).toBe(3600);
      });

      it('should default to 24 hours for invalid format', () => {
        const service = authService as any;
        const mockConfig = {
          security: { jwt: { expiresIn: 'invalid' } }
        };
        jest.doMock('../../config/env', () => ({ config: mockConfig }));
        
        expect(service.getExpiresInSeconds()).toBe(86400); // 24 hours
      });
    });
  });

  describe('error handling', () => {
    it('should handle and re-throw repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockUserRepo.findByEmail.mockRejectedValue(error);

      // Act & Assert
      await expect(authService.login('test@example.com', 'password'))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should handle JWT verification errors', async () => {
      // Arrange
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Unexpected JWT error');
      });

      // Act & Assert
      await expect(authService.verifyAccessToken('token'))
        .rejects
        .toThrow('Unexpected JWT error');
    });
  });
});