import { BaseRepository, QueryOptions } from './BaseRepository';
import { CacheKeys } from '../config/redis';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';
import logger from '../utils/logger';

export interface User {
  id: string;
  email: string;
  username?: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'super_admin' | 'dealer_admin' | 'sales_manager' | 'sales_rep' | 'finance_manager' | 'service_advisor' | 'customer';
  dealership_id?: string;
  is_active: boolean;
  is_verified: boolean;
  verification_token?: string;
  verification_expires?: Date;
  reset_token?: string;
  reset_token_expires?: Date;
  failed_login_attempts: number;
  locked_until?: Date;
  last_login?: Date;
  preferences?: any;
  permissions?: any;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  device_id?: string;
  device_type?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  is_revoked: boolean;
  revoked_at?: Date;
  revoked_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users', CacheKeys.USER);
  }

  async findByEmail(email: string, options?: QueryOptions): Promise<User | null> {
    try {
      const cacheKey = this.getCacheKey(`email:${email}`);
      const cached = await this.cache.get<User>(cacheKey);
      if (cached) return cached;

      const user = await this.findOneByCondition({ email }, options);
      
      if (user) {
        await this.cache.set(cacheKey, user, this.cacheTTL);
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByUsername(username: string, options?: QueryOptions): Promise<User | null> {
    try {
      const cacheKey = this.getCacheKey(`username:${username}`);
      const cached = await this.cache.get<User>(cacheKey);
      if (cached) return cached;

      const user = await this.findOneByCondition({ username }, options);
      
      if (user) {
        await this.cache.set(cacheKey, user, this.cacheTTL);
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user by username:', error);
      throw error;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(
        userData.password_hash,
        config.security.bcrypt.rounds
      );

      const user = await this.create({
        ...userData,
        password_hash: hashedPassword,
      });

      // Remove password from return
      delete (user as any).password_hash;
      
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      logger.error('Error verifying password:', error);
      return false;
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(
        newPassword,
        config.security.bcrypt.rounds
      );

      const result = await this.update(userId, {
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      });

      return !!result;
    } catch (error) {
      logger.error('Error updating password:', error);
      throw error;
    }
  }

  async incrementFailedAttempts(userId: string): Promise<void> {
    try {
      const user = await this.findById(userId);
      if (!user) return;

      const attempts = user.failed_login_attempts + 1;
      const updates: Partial<User> = {
        failed_login_attempts: attempts,
      };

      // Lock account if max attempts reached
      if (attempts >= config.security.session.maxLoginAttempts) {
        const lockoutMinutes = config.security.session.lockoutDurationMinutes;
        updates.locked_until = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      }

      await this.update(userId, updates);
    } catch (error) {
      logger.error('Error incrementing failed attempts:', error);
      throw error;
    }
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await this.update(userId, {
        failed_login_attempts: 0,
        locked_until: null,
      });
    } catch (error) {
      logger.error('Error resetting failed attempts:', error);
      throw error;
    }
  }

  async isAccountLocked(user: User): Promise<boolean> {
    return !!(user.locked_until && user.locked_until > new Date());
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.update(userId, {
        last_login: new Date(),
      });
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw error;
    }
  }

  async findByDealership(
    dealershipId: string,
    options?: QueryOptions
  ): Promise<User[]> {
    try {
      return await this.findByCondition({ dealership_id: dealershipId }, options);
    } catch (error) {
      logger.error('Error finding users by dealership:', error);
      throw error;
    }
  }

  async findByRole(role: User['role'], options?: QueryOptions): Promise<User[]> {
    try {
      return await this.findByCondition({ role }, options);
    } catch (error) {
      logger.error('Error finding users by role:', error);
      throw error;
    }
  }

  async setVerificationToken(userId: string, token: string, expiresIn: number = 24): Promise<void> {
    try {
      await this.update(userId, {
        verification_token: token,
        verification_expires: new Date(Date.now() + expiresIn * 60 * 60 * 1000),
      });
    } catch (error) {
      logger.error('Error setting verification token:', error);
      throw error;
    }
  }

  async verifyUser(token: string): Promise<boolean> {
    try {
      const user = await this.findOneByCondition({
        verification_token: token,
      });

      if (!user || !user.verification_expires) return false;
      if (user.verification_expires < new Date()) return false;

      await this.update(user.id, {
        is_verified: true,
        verification_token: null,
        verification_expires: null,
      });

      return true;
    } catch (error) {
      logger.error('Error verifying user:', error);
      throw error;
    }
  }

  async setResetToken(email: string, token: string, expiresIn: number = 1): Promise<boolean> {
    try {
      const user = await this.findByEmail(email);
      if (!user) return false;

      await this.update(user.id, {
        reset_token: token,
        reset_token_expires: new Date(Date.now() + expiresIn * 60 * 60 * 1000),
      });

      return true;
    } catch (error) {
      logger.error('Error setting reset token:', error);
      throw error;
    }
  }

  async findByResetToken(token: string): Promise<User | null> {
    try {
      const user = await this.findOneByCondition({
        reset_token: token,
      });

      if (!user || !user.reset_token_expires) return null;
      if (user.reset_token_expires < new Date()) return null;

      return user;
    } catch (error) {
      logger.error('Error finding user by reset token:', error);
      throw error;
    }
  }

  private get cache() {
    return require('../config/redis').default;
  }
}

export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super('refresh_tokens', CacheKeys.SESSION);
  }

  async createToken(tokenData: Omit<RefreshToken, 'id' | 'created_at' | 'updated_at'>): Promise<RefreshToken> {
    try {
      return await this.create(tokenData);
    } catch (error) {
      logger.error('Error creating refresh token:', error);
      throw error;
    }
  }

  async findValidToken(token: string): Promise<RefreshToken | null> {
    try {
      const refreshToken = await this.findOneByCondition({ token });
      
      if (!refreshToken) return null;
      if (refreshToken.is_revoked) return null;
      if (refreshToken.expires_at < new Date()) return null;
      
      return refreshToken;
    } catch (error) {
      logger.error('Error finding valid token:', error);
      throw error;
    }
  }

  async revokeToken(token: string, reason?: string): Promise<boolean> {
    try {
      const result = await this.updateByCondition(
        { token },
        {
          is_revoked: true,
          revoked_at: new Date(),
          revoked_reason: reason,
        }
      );
      
      return result > 0;
    } catch (error) {
      logger.error('Error revoking token:', error);
      throw error;
    }
  }

  async revokeAllUserTokens(userId: string, reason?: string): Promise<number> {
    try {
      return await this.updateByCondition(
        { user_id: userId, is_revoked: false },
        {
          is_revoked: true,
          revoked_at: new Date(),
          revoked_reason: reason,
        }
      );
    } catch (error) {
      logger.error('Error revoking all user tokens:', error);
      throw error;
    }
  }

  async cleanupExpiredTokens(): Promise<number> {
    try {
      return await this.deleteByCondition({
        expires_at: { $lt: new Date() } as any,
      });
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }
}