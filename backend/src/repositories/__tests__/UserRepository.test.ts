import { UserRepository, RefreshTokenRepository, User, RefreshToken } from '../UserRepository';
import { MockDataFactory } from '../../../tests/factories/mockData';
import { TestHelpers } from '../../../tests/utils/testHelpers';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('../../config/redis');
jest.mock('../../utils/logger');

describe('UserRepository', () => {
  let userRepo: UserRepository;
  let mockDb: any;
  let mockCache: any;
  let mockUser: User;

  beforeEach(() => {
    // Setup mock database
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      whereNot: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      first: jest.fn(),
      returning: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis()
    };

    // Setup mock cache
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      deletePattern: jest.fn()
    };

    // Mock BaseRepository's db and cache
    jest.doMock('../BaseRepository', () => ({
      BaseRepository: class {
        protected db = mockDb;
        protected cache = mockCache;
        protected table = 'users';
        protected cachePrefix = 'user:';
        protected cacheTTL = 3600;

        getCacheKey(suffix: string) {
          return `${this.cachePrefix}${suffix}`;
        }

        async findOneByCondition(conditions: any) {
          return mockDb.select().from(this.table).where(conditions).first();
        }

        async findByCondition(conditions: any) {
          return mockDb.select().from(this.table).where(conditions);
        }

        async create(data: any) {
          return mockDb.insert(data).into(this.table).returning('*');
        }

        async update(id: string, data: any) {
          return mockDb.update(data).where('id', id).returning('*');
        }

        async updateByCondition(conditions: any, data: any) {
          return mockDb.update(data).where(conditions);
        }

        async findById(id: string) {
          return mockDb.select().from(this.table).where('id', id).first();
        }

        async deleteByCondition(conditions: any) {
          return mockDb.delete().from(this.table).where(conditions);
        }
      }
    }));

    userRepo = new UserRepository();
    mockUser = {
      ...MockDataFactory.createUser(),
      password_hash: 'hashed_password',
      is_active: true,
      is_verified: true,
      failed_login_attempts: 0,
      created_at: new Date(),
      updated_at: new Date()
    } as User;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return cached user if available', async () => {
      // Arrange
      const email = 'test@example.com';
      const cachedUser = { ...mockUser, email };
      mockCache.get.mockResolvedValue(cachedUser);

      // Act
      const result = await userRepo.findByEmail(email);

      // Assert
      expect(mockCache.get).toHaveBeenCalledWith('user:email:test@example.com');
      expect(result).toEqual(cachedUser);
      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when not in cache', async () => {
      // Arrange
      const email = 'test@example.com';
      const userFromDb = { ...mockUser, email };
      mockCache.get.mockResolvedValue(null);
      mockDb.first.mockResolvedValue(userFromDb);

      // Act
      const result = await userRepo.findByEmail(email);

      // Assert
      expect(mockCache.get).toHaveBeenCalledWith('user:email:test@example.com');
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalledWith({ email });
      expect(mockDb.first).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith(
        'user:email:test@example.com',
        userFromDb,
        3600
      );
      expect(result).toEqual(userFromDb);
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockCache.get.mockResolvedValue(null);
      mockDb.first.mockResolvedValue(null);

      // Act
      const result = await userRepo.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockCache.get.mockResolvedValue(null);
      mockDb.first.mockRejectedValue(error);

      // Act & Assert
      await expect(userRepo.findByEmail('test@example.com'))
        .rejects
        .toThrow('Database connection failed');
    });
  });

  describe('findByUsername', () => {
    it('should return user by username with caching', async () => {
      // Arrange
      const username = 'testuser';
      const userFromDb = { ...mockUser, username };
      mockCache.get.mockResolvedValue(null);
      mockDb.first.mockResolvedValue(userFromDb);

      // Act
      const result = await userRepo.findByUsername(username);

      // Assert
      expect(mockCache.get).toHaveBeenCalledWith('user:username:testuser');
      expect(mockDb.where).toHaveBeenCalledWith({ username });
      expect(mockCache.set).toHaveBeenCalledWith(
        'user:username:testuser',
        userFromDb,
        3600
      );
      expect(result).toEqual(userFromDb);
    });
  });

  describe('createUser', () => {
    const userData = {
      email: 'new@example.com',
      password_hash: 'plaintextpassword',
      first_name: 'John',
      last_name: 'Doe',
      role: 'customer' as User['role'],
      is_active: true,
      is_verified: false,
      failed_login_attempts: 0
    };

    beforeEach(() => {
      // Mock bcrypt.hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_from_bcrypt');
      
      // Mock config
      const mockConfig = {
        security: {
          bcrypt: {
            rounds: 12
          }
        }
      };
      jest.doMock('../../config/env', () => ({ config: mockConfig }));
    });

    it('should hash password and create user', async () => {
      // Arrange
      const createdUser = { ...userData, id: '1', password_hash: 'hashed_password_from_bcrypt' };
      mockDb.returning.mockResolvedValue([createdUser]);

      // Act
      const result = await userRepo.createUser(userData);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('plaintextpassword', 12);
      expect(mockDb.insert).toHaveBeenCalledWith({
        ...userData,
        password_hash: 'hashed_password_from_bcrypt'
      });
      expect(result).toEqual(createdUser);
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should handle bcrypt errors', async () => {
      // Arrange
      const error = new Error('Bcrypt failed');
      (bcrypt.hash as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(userRepo.createUser(userData))
        .rejects
        .toThrow('Bcrypt failed');
    });

    it('should handle database insert errors', async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const error = new Error('Unique constraint violation');
      mockDb.returning.mockRejectedValue(error);

      // Act & Assert
      await expect(userRepo.createUser(userData))
        .rejects
        .toThrow('Unique constraint violation');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      // Arrange
      const password = 'testpassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await userRepo.verifyPassword(mockUser, password);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password_hash);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      // Arrange
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await userRepo.verifyPassword(mockUser, 'wrongpassword');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false on bcrypt error', async () => {
      // Arrange
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

      // Act
      const result = await userRepo.verifyPassword(mockUser, 'password');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should hash new password and update user', async () => {
      // Arrange
      const userId = 'user123';
      const newPassword = 'newpassword123';
      const hashedPassword = 'new_hashed_password';
      
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockDb.returning.mockResolvedValue([{ id: userId }]);

      // Act
      const result = await userRepo.updatePassword(userId, newPassword);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, expect.any(Number));
      expect(mockDb.update).toHaveBeenCalledWith({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null
      });
      expect(mockDb.where).toHaveBeenCalledWith('id', userId);
      expect(result).toBe(true);
    });

    it('should return false when update fails', async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockDb.returning.mockResolvedValue([]);

      // Act
      const result = await userRepo.updatePassword('user123', 'newpassword');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('incrementFailedAttempts', () => {
    it('should increment failed attempts without locking', async () => {
      // Arrange
      const userId = 'user123';
      const userWithAttempts = { ...mockUser, failed_login_attempts: 2 };
      mockDb.first.mockResolvedValue(userWithAttempts);
      
      // Mock config with max attempts = 5
      const mockConfig = {
        security: {
          session: {
            maxLoginAttempts: 5,
            lockoutDurationMinutes: 30
          }
        }
      };
      jest.doMock('../../config/env', () => ({ config: mockConfig }));

      // Act
      await userRepo.incrementFailedAttempts(userId);

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith({
        failed_login_attempts: 3
      });
      expect(mockDb.where).toHaveBeenCalledWith('id', userId);
    });

    it('should lock account when max attempts reached', async () => {
      // Arrange
      const userId = 'user123';
      const userAtMaxAttempts = { ...mockUser, failed_login_attempts: 4 };
      mockDb.first.mockResolvedValue(userAtMaxAttempts);
      
      const mockConfig = {
        security: {
          session: {
            maxLoginAttempts: 5,
            lockoutDurationMinutes: 30
          }
        }
      };
      jest.doMock('../../config/env', () => ({ config: mockConfig }));

      // Act
      await userRepo.incrementFailedAttempts(userId);

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith({
        failed_login_attempts: 5,
        locked_until: expect.any(Date)
      });
    });

    it('should handle non-existent user', async () => {
      // Arrange
      mockDb.first.mockResolvedValue(null);

      // Act
      await userRepo.incrementFailedAttempts('nonexistent');

      // Assert
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe('resetFailedAttempts', () => {
    it('should reset failed attempts and unlock account', async () => {
      // Arrange
      const userId = 'user123';

      // Act
      await userRepo.resetFailedAttempts(userId);

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith({
        failed_login_attempts: 0,
        locked_until: null
      });
      expect(mockDb.where).toHaveBeenCalledWith('id', userId);
    });
  });

  describe('isAccountLocked', () => {
    it('should return true when account is locked', () => {
      // Arrange
      const lockedUser = {
        ...mockUser,
        locked_until: new Date(Date.now() + 60000) // 1 minute from now
      };

      // Act
      const result = userRepo.isAccountLocked(lockedUser);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when account is not locked', () => {
      // Arrange
      const unlockedUser = { ...mockUser, locked_until: null };

      // Act
      const result = userRepo.isAccountLocked(unlockedUser);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when lock has expired', () => {
      // Arrange
      const expiredLockUser = {
        ...mockUser,
        locked_until: new Date(Date.now() - 60000) // 1 minute ago
      };

      // Act
      const result = userRepo.isAccountLocked(expiredLockUser);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      // Arrange
      const userId = 'user123';
      const beforeTime = new Date();

      // Act
      await userRepo.updateLastLogin(userId);
      const afterTime = new Date();

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith({
        last_login: expect.any(Date)
      });
      
      const updateCall = (mockDb.update as jest.Mock).mock.calls[0][0];
      const lastLogin = updateCall.last_login;
      expect(lastLogin).toBeInstanceOf(Date);
      expect(lastLogin.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(lastLogin.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('findByDealership', () => {
    it('should find users by dealership ID', async () => {
      // Arrange
      const dealershipId = 'dealership123';
      const dealershipUsers = MockDataFactory.createUsers(3, { dealershipId: parseInt(dealershipId) });
      mockDb.where.mockReturnValue(dealershipUsers);

      // Act
      const result = await userRepo.findByDealership(dealershipId);

      // Assert
      expect(mockDb.where).toHaveBeenCalledWith({ dealership_id: dealershipId });
      expect(result).toEqual(dealershipUsers);
    });
  });

  describe('findByRole', () => {
    it('should find users by role', async () => {
      // Arrange
      const role = 'sales_rep' as User['role'];
      const salesUsers = MockDataFactory.createUsers(2, { role });
      mockDb.where.mockReturnValue(salesUsers);

      // Act
      const result = await userRepo.findByRole(role);

      // Assert
      expect(mockDb.where).toHaveBeenCalledWith({ role });
      expect(result).toEqual(salesUsers);
    });
  });

  describe('verification token methods', () => {
    describe('setVerificationToken', () => {
      it('should set verification token with expiration', async () => {
        // Arrange
        const userId = 'user123';
        const token = 'verification-token';
        const expiresIn = 48; // hours

        // Act
        await userRepo.setVerificationToken(userId, token, expiresIn);

        // Assert
        expect(mockDb.update).toHaveBeenCalledWith({
          verification_token: token,
          verification_expires: expect.any(Date)
        });
        
        const updateCall = (mockDb.update as jest.Mock).mock.calls[0][0];
        const expiresAt = updateCall.verification_expires;
        const expectedTime = Date.now() + (48 * 60 * 60 * 1000);
        expect(expiresAt.getTime()).toBeCloseTo(expectedTime, -1000); // Within 1 second
      });

      it('should use default expiration of 24 hours', async () => {
        // Arrange
        const userId = 'user123';
        const token = 'verification-token';

        // Act
        await userRepo.setVerificationToken(userId, token);

        // Assert
        const updateCall = (mockDb.update as jest.Mock).mock.calls[0][0];
        const expiresAt = updateCall.verification_expires;
        const expectedTime = Date.now() + (24 * 60 * 60 * 1000);
        expect(expiresAt.getTime()).toBeCloseTo(expectedTime, -1000);
      });
    });

    describe('verifyUser', () => {
      it('should verify user with valid token', async () => {
        // Arrange
        const token = 'valid-token';
        const userWithToken = {
          ...mockUser,
          verification_token: token,
          verification_expires: new Date(Date.now() + 60000) // 1 minute from now
        };
        mockDb.first.mockResolvedValue(userWithToken);
        mockDb.returning.mockResolvedValue([{ id: mockUser.id }]);

        // Act
        const result = await userRepo.verifyUser(token);

        // Assert
        expect(mockDb.where).toHaveBeenCalledWith({ verification_token: token });
        expect(mockDb.update).toHaveBeenCalledWith({
          is_verified: true,
          verification_token: null,
          verification_expires: null
        });
        expect(result).toBe(true);
      });

      it('should return false for non-existent token', async () => {
        // Arrange
        mockDb.first.mockResolvedValue(null);

        // Act
        const result = await userRepo.verifyUser('invalid-token');

        // Assert
        expect(result).toBe(false);
        expect(mockDb.update).not.toHaveBeenCalled();
      });

      it('should return false for expired token', async () => {
        // Arrange
        const expiredUser = {
          ...mockUser,
          verification_token: 'token',
          verification_expires: new Date(Date.now() - 60000) // 1 minute ago
        };
        mockDb.first.mockResolvedValue(expiredUser);

        // Act
        const result = await userRepo.verifyUser('token');

        // Assert
        expect(result).toBe(false);
        expect(mockDb.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('password reset methods', () => {
    describe('setResetToken', () => {
      it('should set reset token for existing user', async () => {
        // Arrange
        const email = 'user@example.com';
        const token = 'reset-token';
        const expiresIn = 2; // hours
        
        mockDb.first.mockResolvedValue(mockUser);
        mockDb.returning.mockResolvedValue([mockUser]);

        // Act
        const result = await userRepo.setResetToken(email, token, expiresIn);

        // Assert
        expect(result).toBe(true);
        expect(mockDb.update).toHaveBeenCalledWith({
          reset_token: token,
          reset_token_expires: expect.any(Date)
        });
      });

      it('should return false for non-existent user', async () => {
        // Arrange
        mockDb.first.mockResolvedValue(null);

        // Act
        const result = await userRepo.setResetToken('nonexistent@example.com', 'token', 1);

        // Assert
        expect(result).toBe(false);
        expect(mockDb.update).not.toHaveBeenCalled();
      });
    });

    describe('findByResetToken', () => {
      it('should find user with valid reset token', async () => {
        // Arrange
        const token = 'valid-reset-token';
        const userWithResetToken = {
          ...mockUser,
          reset_token: token,
          reset_token_expires: new Date(Date.now() + 60000) // 1 minute from now
        };
        mockDb.first.mockResolvedValue(userWithResetToken);

        // Act
        const result = await userRepo.findByResetToken(token);

        // Assert
        expect(mockDb.where).toHaveBeenCalledWith({ reset_token: token });
        expect(result).toEqual(userWithResetToken);
      });

      it('should return null for expired reset token', async () => {
        // Arrange
        const expiredUser = {
          ...mockUser,
          reset_token: 'token',
          reset_token_expires: new Date(Date.now() - 60000) // 1 minute ago
        };
        mockDb.first.mockResolvedValue(expiredUser);

        // Act
        const result = await userRepo.findByResetToken('token');

        // Assert
        expect(result).toBeNull();
      });

      it('should return null for non-existent token', async () => {
        // Arrange
        mockDb.first.mockResolvedValue(null);

        // Act
        const result = await userRepo.findByResetToken('invalid-token');

        // Assert
        expect(result).toBeNull();
      });
    });
  });
});

describe('RefreshTokenRepository', () => {
  let refreshTokenRepo: RefreshTokenRepository;
  let mockDb: any;
  let mockRefreshToken: RefreshToken;

  beforeEach(() => {
    // Setup mock database (same as UserRepository)
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      whereNot: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      first: jest.fn(),
      returning: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis()
    };

    refreshTokenRepo = new RefreshTokenRepository();
    mockRefreshToken = {
      id: '1',
      user_id: 'user123',
      token: 'refresh-token-string',
      device_id: 'device123',
      device_type: 'mobile',
      ip_address: '192.168.1.1',
      user_agent: 'Test-Agent/1.0',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      is_revoked: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    jest.clearAllMocks();
  });

  describe('createToken', () => {
    it('should create new refresh token', async () => {
      // Arrange
      const tokenData = {
        user_id: 'user123',
        token: 'new-refresh-token',
        device_id: 'device456',
        device_type: 'web',
        ip_address: '10.0.0.1',
        user_agent: 'Browser/1.0',
        expires_at: new Date(),
        is_revoked: false
      };
      
      mockDb.returning.mockResolvedValue([{ ...tokenData, id: '2' }]);

      // Act
      const result = await refreshTokenRepo.createToken(tokenData);

      // Assert
      expect(mockDb.insert).toHaveBeenCalledWith(tokenData);
      expect(result).toEqual({ ...tokenData, id: '2' });
    });
  });

  describe('findValidToken', () => {
    it('should return valid, non-revoked, non-expired token', async () => {
      // Arrange
      const token = 'valid-token';
      const validToken = {
        ...mockRefreshToken,
        token,
        is_revoked: false,
        expires_at: new Date(Date.now() + 60000) // 1 minute from now
      };
      mockDb.first.mockResolvedValue(validToken);

      // Act
      const result = await refreshTokenRepo.findValidToken(token);

      // Assert
      expect(mockDb.where).toHaveBeenCalledWith({ token });
      expect(result).toEqual(validToken);
    });

    it('should return null for non-existent token', async () => {
      // Arrange
      mockDb.first.mockResolvedValue(null);

      // Act
      const result = await refreshTokenRepo.findValidToken('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for revoked token', async () => {
      // Arrange
      const revokedToken = { ...mockRefreshToken, is_revoked: true };
      mockDb.first.mockResolvedValue(revokedToken);

      // Act
      const result = await refreshTokenRepo.findValidToken('revoked-token');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      // Arrange
      const expiredToken = {
        ...mockRefreshToken,
        expires_at: new Date(Date.now() - 60000) // 1 minute ago
      };
      mockDb.first.mockResolvedValue(expiredToken);

      // Act
      const result = await refreshTokenRepo.findValidToken('expired-token');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('revokeToken', () => {
    it('should revoke token with reason', async () => {
      // Arrange
      const token = 'token-to-revoke';
      const reason = 'User logged out';
      mockDb.returning.mockResolvedValue([{ id: '1' }]); // Simulate 1 affected row

      // Act
      const result = await refreshTokenRepo.revokeToken(token, reason);

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith({
        is_revoked: true,
        revoked_at: expect.any(Date),
        revoked_reason: reason
      });
      expect(mockDb.where).toHaveBeenCalledWith({ token });
      expect(result).toBe(true);
    });

    it('should return false when no token found', async () => {
      // Arrange
      mockDb.returning.mockResolvedValue([]); // No affected rows

      // Act
      const result = await refreshTokenRepo.revokeToken('nonexistent-token');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all active tokens for user', async () => {
      // Arrange
      const userId = 'user123';
      const reason = 'Logged out from all devices';
      mockDb.returning.mockResolvedValue([1, 2, 3]); // 3 affected rows

      // Act
      const result = await refreshTokenRepo.revokeAllUserTokens(userId, reason);

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith({
        is_revoked: true,
        revoked_at: expect.any(Date),
        revoked_reason: reason
      });
      expect(mockDb.where).toHaveBeenCalledWith({
        user_id: userId,
        is_revoked: false
      });
      expect(result).toBe(3);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      // Arrange
      mockDb.returning.mockResolvedValue([1, 2]); // 2 deleted rows

      // Act
      const result = await refreshTokenRepo.cleanupExpiredTokens();

      // Assert
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalledWith({
        expires_at: { $lt: expect.any(Date) }
      });
      expect(result).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should handle database errors in createToken', async () => {
      // Arrange
      const error = new Error('Database constraint violation');
      mockDb.returning.mockRejectedValue(error);

      // Act & Assert
      await expect(refreshTokenRepo.createToken({
        user_id: 'user123',
        token: 'token',
        expires_at: new Date(),
        is_revoked: false
      })).rejects.toThrow('Database constraint violation');
    });

    it('should handle database errors in findValidToken', async () => {
      // Arrange
      const error = new Error('Database connection lost');
      mockDb.first.mockRejectedValue(error);

      // Act & Assert
      await expect(refreshTokenRepo.findValidToken('token'))
        .rejects
        .toThrow('Database connection lost');
    });
  });
});