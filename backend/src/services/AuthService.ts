import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository, RefreshTokenRepository, User } from '../repositories/UserRepository';
import { config } from '../config/env';
import logger from '../utils/logger';
import cache, { CacheKeys, CacheTTL } from '../config/redis';

export interface LoginResult {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  dealershipId?: string;
}

export class AuthService {
  private userRepo: UserRepository;
  private refreshTokenRepo: RefreshTokenRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.refreshTokenRepo = new RefreshTokenRepository();
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    dealership_id?: string;
    role?: User['role'];
  }): Promise<Partial<User>> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepo.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const user = await this.userRepo.createUser({
        ...userData,
        password_hash: userData.password,
        username: userData.email.split('@')[0],
        role: userData.role || 'customer',
        is_active: true,
        is_verified: false,
        verification_token: verificationToken,
        verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        failed_login_attempts: 0,
      });

      // TODO: Send verification email

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      logger.error('Error during registration:', error);
      throw error;
    }
  }

  async login(
    email: string,
    password: string,
    deviceInfo?: {
      device_id?: string;
      device_type?: string;
      ip_address?: string;
      user_agent?: string;
    }
  ): Promise<LoginResult> {
    try {
      // Find user
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if account is locked
      if (await this.userRepo.isAccountLocked(user)) {
        throw new Error('Account is locked. Please try again later.');
      }

      // Verify password
      const isValidPassword = await this.userRepo.verifyPassword(user, password);
      if (!isValidPassword) {
        await this.userRepo.incrementFailedAttempts(user.id);
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      // Reset failed attempts and update last login
      await this.userRepo.resetFailedAttempts(user.id);
      await this.userRepo.updateLastLogin(user.id);

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user, deviceInfo);

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: this.getExpiresInSeconds(),
      };
    } catch (error) {
      logger.error('Error during login:', error);
      throw error;
    }
  }

  async refreshAccessToken(
    refreshToken: string,
    deviceInfo?: {
      ip_address?: string;
      user_agent?: string;
    }
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      // Find and validate refresh token
      const tokenRecord = await this.refreshTokenRepo.findValidToken(refreshToken);
      if (!tokenRecord) {
        throw new Error('Invalid or expired refresh token');
      }

      // Get user
      const user = await this.userRepo.findById(tokenRecord.user_id);
      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      // Update refresh token metadata if provided
      if (deviceInfo) {
        await this.refreshTokenRepo.update(tokenRecord.id, {
          ip_address: deviceInfo.ip_address,
          user_agent: deviceInfo.user_agent,
        });
      }

      return {
        accessToken,
        expiresIn: this.getExpiresInSeconds(),
      };
    } catch (error) {
      logger.error('Error refreshing access token:', error);
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await this.refreshTokenRepo.revokeToken(refreshToken, 'User logged out');
    } catch (error) {
      logger.error('Error during logout:', error);
      throw error;
    }
  }

  async logoutAllDevices(userId: string): Promise<void> {
    try {
      await this.refreshTokenRepo.revokeAllUserTokens(userId, 'Logged out from all devices');
      
      // Clear user cache
      await cache.deletePattern(`${CacheKeys.USER}${userId}*`);
    } catch (error) {
      logger.error('Error logging out all devices:', error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      return await this.userRepo.verifyUser(token);
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const success = await this.userRepo.setResetToken(email, resetToken, 1);

      if (success) {
        // TODO: Send password reset email
      }

      return success;
    } catch (error) {
      logger.error('Error requesting password reset:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.userRepo.findByResetToken(token);
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      return await this.userRepo.updatePassword(user.id, newPassword);
    } catch (error) {
      logger.error('Error resetting password:', error);
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await this.userRepo.verifyPassword(user, currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      return await this.userRepo.updatePassword(userId, newPassword);
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, config.security.jwt.secret) as TokenPayload;
      
      // Check if user exists and is active
      const user = await this.userRepo.findById(decoded.userId);
      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      }
      throw error;
    }
  }

  private async generateTokens(
    user: User,
    deviceInfo?: {
      device_id?: string;
      device_type?: string;
      ip_address?: string;
      user_agent?: string;
    }
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Generate access token
    const accessToken = this.generateAccessToken(user);

    // Generate refresh token
    const refreshTokenString = crypto.randomBytes(64).toString('hex');
    
    // Calculate expiration
    const expiresAt = new Date();
    const daysToAdd = parseInt(config.security.jwt.refreshExpiresIn.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + daysToAdd);

    // Save refresh token to database
    await this.refreshTokenRepo.createToken({
      user_id: user.id,
      token: refreshTokenString,
      device_id: deviceInfo?.device_id,
      device_type: deviceInfo?.device_type,
      ip_address: deviceInfo?.ip_address,
      user_agent: deviceInfo?.user_agent,
      expires_at: expiresAt,
      is_revoked: false,
    });

    return { accessToken, refreshToken: refreshTokenString };
  }

  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      dealershipId: user.dealership_id,
    };

    return jwt.sign(payload, config.security.jwt.secret, {
      expiresIn: config.security.jwt.expiresIn,
    });
  }

  private getExpiresInSeconds(): number {
    const expiresIn = config.security.jwt.expiresIn;
    const match = expiresIn.match(/(\d+)([dhms])/);
    
    if (!match) return 86400; // Default to 24 hours

    const [, value, unit] = match;
    const num = parseInt(value);

    switch (unit) {
      case 'd': return num * 86400;
      case 'h': return num * 3600;
      case 'm': return num * 60;
      case 's': return num;
      default: return 86400;
    }
  }
}