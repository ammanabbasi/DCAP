/**
 * Enhanced Authentication Service with 2FA and Advanced Security Features
 * Implements account lockout, 2FA, secure session management, and password policies
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { UserRepository, User } from '../repositories/UserRepository';
import { config } from '../config/env';
import cache from '../config/redis';
import { auditLog, AuditEventType, AuditSeverity } from '../utils/auditLogger';
import { sanitizePassword, sanitizeEmail } from '../utils/sanitization';
import logger from '../utils/logger';

/**
 * Account lockout configuration
 */
const LOCKOUT_CONFIG = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minutes
  PROGRESSIVE_DELAYS: [0, 2000, 5000, 10000, 20000] // Progressive delays in ms
};

/**
 * Password policy configuration
 */
const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARS: '!@#$%^&*(),.?":{}|<>',
  HISTORY_COUNT: 5, // Number of previous passwords to check
  MAX_AGE_DAYS: 90, // Password expiry
  MIN_AGE_HOURS: 24, // Minimum time before password change
  COMMON_PASSWORDS_CHECK: true,
  DICTIONARY_CHECK: true
};

/**
 * Session configuration
 */
const SESSION_CONFIG = {
  MAX_SESSIONS: 5, // Maximum concurrent sessions per user
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes idle timeout
  REFRESH_THRESHOLD: 15 * 60 * 1000 // Refresh token if less than 15 min remaining
};

/**
 * Two-Factor Authentication types
 */
export enum TwoFactorMethod {
  TOTP = 'TOTP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  BACKUP_CODES = 'BACKUP_CODES'
}

/**
 * Enhanced authentication result
 */
export interface EnhancedAuthResult {
  success: boolean;
  requiresTwoFactor?: boolean;
  twoFactorMethods?: TwoFactorMethod[];
  sessionToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: Partial<User>;
  passwordExpired?: boolean;
  passwordExpiresIn?: number;
  message?: string;
  retryAfter?: number;
}

/**
 * Session data structure
 */
interface SessionData {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: number;
  lastActivity: number;
  twoFactorVerified: boolean;
  deviceTrusted: boolean;
  deviceFingerprint?: string;
}

/**
 * Enhanced Authentication Service
 */
export class EnhancedAuthService {
  private userRepo: UserRepository;
  private failedAttempts: Map<string, { count: number; timestamps: number[] }> = new Map();
  private trustedDevices: Map<string, Set<string>> = new Map(); // userId -> Set<deviceFingerprint>

  constructor() {
    this.userRepo = new UserRepository();
    this.startCleanupInterval();
  }

  /**
   * Enhanced login with progressive delays and 2FA
   */
  async login(
    email: string,
    password: string,
    req: Request,
    deviceFingerprint?: string
  ): Promise<EnhancedAuthResult> {
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeEmail(email);
      if (!sanitizedEmail) {
        await this.recordFailedAttempt(email, req);
        return { success: false, message: 'Invalid email format' };
      }

      // Check for account lockout
      const lockoutStatus = await this.checkLockout(sanitizedEmail);
      if (lockoutStatus.locked) {
        await auditLog.logAuth(
          AuditEventType.LOGIN_FAILED,
          undefined,
          { reason: 'Account locked', email: sanitizedEmail },
          req
        );
        return {
          success: false,
          message: 'Account is locked due to multiple failed attempts',
          retryAfter: lockoutStatus.retryAfter
        };
      }

      // Apply progressive delay
      await this.applyProgressiveDelay(sanitizedEmail);

      // Find user
      const user = await this.userRepo.findByEmail(sanitizedEmail);
      if (!user) {
        await this.recordFailedAttempt(sanitizedEmail, req);
        return { success: false, message: 'Invalid credentials' };
      }

      // Verify password with timing attack prevention
      const isValidPassword = await this.verifyPasswordSecure(password, user.password_hash);
      if (!isValidPassword) {
        await this.recordFailedAttempt(sanitizedEmail, req);
        await auditLog.logAuth(
          AuditEventType.LOGIN_FAILED,
          user.id,
          { reason: 'Invalid password' },
          req
        );
        return { success: false, message: 'Invalid credentials' };
      }

      // Check if account is active
      if (!user.is_active) {
        await auditLog.logAuth(
          AuditEventType.LOGIN_FAILED,
          user.id,
          { reason: 'Account inactive' },
          req
        );
        return { success: false, message: 'Account is inactive' };
      }

      // Check password expiry
      const passwordAge = await this.checkPasswordAge(user.id);
      if (passwordAge.expired) {
        return {
          success: false,
          passwordExpired: true,
          passwordExpiresIn: 0,
          message: 'Password has expired. Please reset your password.'
        };
      }

      // Clear failed attempts
      await this.clearFailedAttempts(sanitizedEmail);

      // Check if device is trusted
      const deviceTrusted = deviceFingerprint ? 
        await this.isDeviceTrusted(user.id, deviceFingerprint) : false;

      // Check 2FA requirement
      if (user.two_factor_enabled && !deviceTrusted) {
        // Generate temporary session token for 2FA
        const tempToken = await this.generateTempToken(user.id, req);
        
        return {
          success: true,
          requiresTwoFactor: true,
          twoFactorMethods: await this.getAvailable2FAMethods(user.id),
          sessionToken: tempToken,
          message: 'Two-factor authentication required'
        };
      }

      // Create full session
      const session = await this.createSession(user, req, deviceFingerprint, true);
      
      // Update last login
      await this.userRepo.updateLastLogin(user.id);
      
      // Log successful login
      await auditLog.logAuth(
        AuditEventType.LOGIN_SUCCESS,
        user.id,
        { twoFactorUsed: user.two_factor_enabled },
        req
      );

      return {
        success: true,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: this.sanitizeUserData(user),
        passwordExpiresIn: passwordAge.daysRemaining
      };

    } catch (error) {
      logger.error('Enhanced login error:', error);
      await auditLog.logSecurity(
        AuditEventType.SECURITY_ALERT,
        AuditSeverity.ERROR,
        { error: error.message, email },
        req
      );
      return { success: false, message: 'Login failed' };
    }
  }

  /**
   * Verify 2FA code
   */
  async verify2FA(
    sessionToken: string,
    code: string,
    method: TwoFactorMethod,
    req: Request,
    trustDevice?: boolean,
    deviceFingerprint?: string
  ): Promise<EnhancedAuthResult> {
    try {
      // Verify temp session token
      const tempSession = await this.verifyTempToken(sessionToken);
      if (!tempSession) {
        return { success: false, message: 'Invalid or expired session' };
      }

      const user = await this.userRepo.findById(tempSession.userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      let isValid = false;

      switch (method) {
        case TwoFactorMethod.TOTP:
          isValid = await this.verifyTOTP(user.id, code);
          break;
        case TwoFactorMethod.SMS:
          isValid = await this.verifySMSCode(user.id, code);
          break;
        case TwoFactorMethod.EMAIL:
          isValid = await this.verifyEmailCode(user.id, code);
          break;
        case TwoFactorMethod.BACKUP_CODES:
          isValid = await this.verifyBackupCode(user.id, code);
          break;
      }

      if (!isValid) {
        await auditLog.logAuth(
          AuditEventType.LOGIN_FAILED,
          user.id,
          { reason: '2FA verification failed', method },
          req
        );
        return { success: false, message: 'Invalid verification code' };
      }

      // Trust device if requested
      if (trustDevice && deviceFingerprint) {
        await this.trustDevice(user.id, deviceFingerprint);
      }

      // Create full session
      const session = await this.createSession(user, req, deviceFingerprint, true);
      
      // Log successful 2FA
      await auditLog.logAuth(
        AuditEventType.LOGIN_SUCCESS,
        user.id,
        { twoFactorMethod: method, deviceTrusted: trustDevice },
        req
      );

      return {
        success: true,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: this.sanitizeUserData(user)
      };

    } catch (error) {
      logger.error('2FA verification error:', error);
      return { success: false, message: '2FA verification failed' };
    }
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(userId: string, method: TwoFactorMethod): Promise<{
    success: boolean;
    secret?: string;
    qrCode?: string;
    backupCodes?: string[];
  }> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (method === TwoFactorMethod.TOTP) {
        // Generate TOTP secret
        const secret = speakeasy.generateSecret({
          name: `DealersCloud (${user.email})`,
          issuer: 'DealersCloud',
          length: 32
        });

        // Store encrypted secret
        await this.storeTOTPSecret(userId, secret.base32);

        // Generate QR code
        const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

        // Generate backup codes
        const backupCodes = await this.generateBackupCodes(userId);

        // Update user
        await this.userRepo.update(userId, {
          two_factor_enabled: true,
          two_factor_method: method
        });

        await auditLog.logAuth(
          AuditEventType.TWO_FACTOR_ENABLED,
          userId,
          { method }
        );

        return {
          success: true,
          secret: secret.base32,
          qrCode,
          backupCodes
        };
      }

      // Handle other 2FA methods (SMS, EMAIL)
      await this.userRepo.update(userId, {
        two_factor_enabled: true,
        two_factor_method: method
      });

      const backupCodes = await this.generateBackupCodes(userId);

      return {
        success: true,
        backupCodes
      };

    } catch (error) {
      logger.error('Enable 2FA error:', error);
      return { success: false };
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, password: string): Promise<boolean> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) return false;

      // Verify password
      const isValid = await this.verifyPasswordSecure(password, user.password_hash);
      if (!isValid) return false;

      // Update user
      await this.userRepo.update(userId, {
        two_factor_enabled: false,
        two_factor_method: null
      });

      // Clear 2FA data
      await cache.delete(`2fa:secret:${userId}`);
      await cache.delete(`2fa:backup:${userId}`);

      await auditLog.logAuth(
        AuditEventType.TWO_FACTOR_DISABLED,
        userId,
        {}
      );

      return true;
    } catch (error) {
      logger.error('Disable 2FA error:', error);
      return false;
    }
  }

  /**
   * Change password with policy enforcement
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return { success: false, errors: ['User not found'] };
      }

      // Verify current password
      const isValid = await this.verifyPasswordSecure(currentPassword, user.password_hash);
      if (!isValid) {
        return { success: false, errors: ['Current password is incorrect'] };
      }

      // Check minimum password age
      const lastChange = await this.getLastPasswordChange(userId);
      if (lastChange) {
        const hoursSinceChange = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60);
        if (hoursSinceChange < PASSWORD_POLICY.MIN_AGE_HOURS) {
          return {
            success: false,
            errors: [`Password can only be changed once every ${PASSWORD_POLICY.MIN_AGE_HOURS} hours`]
          };
        }
      }

      // Validate new password
      const validation = await this.validatePassword(newPassword, userId);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      // Check password history
      const isReused = await this.checkPasswordHistory(userId, newPassword);
      if (isReused) {
        return {
          success: false,
          errors: ['Password has been used recently. Please choose a different password.']
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Store in password history
      await this.addToPasswordHistory(userId, hashedPassword);

      // Update user password
      await this.userRepo.updatePassword(userId, newPassword);

      // Invalidate all sessions
      await this.invalidateAllSessions(userId);

      await auditLog.logAuth(
        AuditEventType.PASSWORD_CHANGED,
        userId,
        {}
      );

      return { success: true };

    } catch (error) {
      logger.error('Change password error:', error);
      return { success: false, errors: ['Failed to change password'] };
    }
  }

  /**
   * Secure password verification with timing attack prevention
   */
  private async verifyPasswordSecure(password: string, hash: string): Promise<boolean> {
    // Add random delay to prevent timing attacks
    const randomDelay = crypto.randomInt(100, 500);
    await new Promise(resolve => setTimeout(resolve, randomDelay));

    try {
      return await bcrypt.compare(password, hash);
    } catch {
      // Compare with dummy hash to maintain consistent timing
      await bcrypt.compare(password, '$2a$12$dummy.hash.to.prevent.timing.attacks');
      return false;
    }
  }

  /**
   * Check account lockout status
   */
  private async checkLockout(email: string): Promise<{
    locked: boolean;
    retryAfter?: number;
  }> {
    const key = `lockout:${email}`;
    const lockoutData = await cache.get(key);

    if (lockoutData) {
      const data = JSON.parse(lockoutData);
      const remaining = LOCKOUT_CONFIG.LOCKOUT_DURATION - (Date.now() - data.lockedAt);
      
      if (remaining > 0) {
        return {
          locked: true,
          retryAfter: Math.ceil(remaining / 1000)
        };
      }
    }

    const attempts = this.failedAttempts.get(email);
    if (attempts && attempts.count >= LOCKOUT_CONFIG.MAX_ATTEMPTS) {
      // Lock the account
      await cache.set(
        key,
        JSON.stringify({ lockedAt: Date.now() }),
        LOCKOUT_CONFIG.LOCKOUT_DURATION / 1000
      );

      await auditLog.logAuth(
        AuditEventType.ACCOUNT_LOCKED,
        undefined,
        { email, attempts: attempts.count }
      );

      return {
        locked: true,
        retryAfter: LOCKOUT_CONFIG.LOCKOUT_DURATION / 1000
      };
    }

    return { locked: false };
  }

  /**
   * Record failed login attempt
   */
  private async recordFailedAttempt(email: string, req: Request): Promise<void> {
    let attempts = this.failedAttempts.get(email);
    
    if (!attempts) {
      attempts = { count: 0, timestamps: [] };
      this.failedAttempts.set(email, attempts);
    }

    const now = Date.now();
    
    // Remove old timestamps outside the window
    attempts.timestamps = attempts.timestamps.filter(
      ts => now - ts < LOCKOUT_CONFIG.ATTEMPT_WINDOW
    );

    attempts.timestamps.push(now);
    attempts.count = attempts.timestamps.length;

    // Log suspicious activity if nearing lockout
    if (attempts.count >= LOCKOUT_CONFIG.MAX_ATTEMPTS - 1) {
      await auditLog.logSecurity(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        AuditSeverity.WARNING,
        { email, attempts: attempts.count, ip: req.ip },
        req
      );
    }
  }

  /**
   * Apply progressive delay based on failed attempts
   */
  private async applyProgressiveDelay(email: string): Promise<void> {
    const attempts = this.failedAttempts.get(email);
    if (!attempts) return;

    const delayIndex = Math.min(attempts.count, LOCKOUT_CONFIG.PROGRESSIVE_DELAYS.length - 1);
    const delay = LOCKOUT_CONFIG.PROGRESSIVE_DELAYS[delayIndex];

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Clear failed attempts
   */
  private async clearFailedAttempts(email: string): Promise<void> {
    this.failedAttempts.delete(email);
    await cache.delete(`lockout:${email}`);
  }

  /**
   * Verify TOTP code
   */
  private async verifyTOTP(userId: string, token: string): Promise<boolean> {
    try {
      const secret = await this.getTOTPSecret(userId);
      if (!secret) return false;

      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2
      });
    } catch {
      return false;
    }
  }

  /**
   * Store TOTP secret (encrypted)
   */
  private async storeTOTPSecret(userId: string, secret: string): Promise<void> {
    // Encrypt secret before storing
    const encrypted = this.encryptData(secret);
    await cache.set(`2fa:secret:${userId}`, encrypted);
  }

  /**
   * Get TOTP secret
   */
  private async getTOTPSecret(userId: string): Promise<string | null> {
    const encrypted = await cache.get(`2fa:secret:${userId}`);
    if (!encrypted) return null;
    return this.decryptData(encrypted);
  }

  /**
   * Generate backup codes
   */
  private async generateBackupCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
      hashedCodes.push(await bcrypt.hash(code, 10));
    }

    // Store hashed codes
    await cache.set(`2fa:backup:${userId}`, JSON.stringify(hashedCodes));

    return codes;
  }

  /**
   * Verify backup code
   */
  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const stored = await cache.get(`2fa:backup:${userId}`);
      if (!stored) return false;

      const hashedCodes: string[] = JSON.parse(stored);
      
      for (let i = 0; i < hashedCodes.length; i++) {
        if (await bcrypt.compare(code.toUpperCase(), hashedCodes[i])) {
          // Remove used code
          hashedCodes.splice(i, 1);
          await cache.set(`2fa:backup:${userId}`, JSON.stringify(hashedCodes));
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Verify SMS code (placeholder - integrate with SMS provider)
   */
  private async verifySMSCode(userId: string, code: string): Promise<boolean> {
    // TODO: Integrate with SMS provider (Twilio, etc.)
    const storedCode = await cache.get(`2fa:sms:${userId}`);
    return storedCode === code;
  }

  /**
   * Verify email code
   */
  private async verifyEmailCode(userId: string, code: string): Promise<boolean> {
    const storedCode = await cache.get(`2fa:email:${userId}`);
    return storedCode === code;
  }

  /**
   * Get available 2FA methods for user
   */
  private async getAvailable2FAMethods(userId: string): Promise<TwoFactorMethod[]> {
    const methods: TwoFactorMethod[] = [];
    const user = await this.userRepo.findById(userId);
    
    if (user?.two_factor_method) {
      methods.push(user.two_factor_method as TwoFactorMethod);
    }

    // Check for backup codes
    const backupCodes = await cache.get(`2fa:backup:${userId}`);
    if (backupCodes) {
      methods.push(TwoFactorMethod.BACKUP_CODES);
    }

    return methods;
  }

  /**
   * Trust a device
   */
  private async trustDevice(userId: string, deviceFingerprint: string): Promise<void> {
    if (!this.trustedDevices.has(userId)) {
      this.trustedDevices.set(userId, new Set());
    }
    this.trustedDevices.get(userId)!.add(deviceFingerprint);
    
    // Store in cache with expiry
    await cache.set(
      `trusted:${userId}:${deviceFingerprint}`,
      '1',
      30 * 24 * 60 * 60 // 30 days
    );
  }

  /**
   * Check if device is trusted
   */
  private async isDeviceTrusted(userId: string, deviceFingerprint: string): Promise<boolean> {
    // Check memory cache
    if (this.trustedDevices.get(userId)?.has(deviceFingerprint)) {
      return true;
    }

    // Check Redis cache
    const trusted = await cache.get(`trusted:${userId}:${deviceFingerprint}`);
    return trusted === '1';
  }

  /**
   * Generate temporary token for 2FA
   */
  private async generateTempToken(userId: string, req: Request): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const data: SessionData = {
      userId,
      sessionId: crypto.randomBytes(16).toString('hex'),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      twoFactorVerified: false,
      deviceTrusted: false
    };

    await cache.set(`temp:${token}`, JSON.stringify(data), 5 * 60); // 5 minutes
    return token;
  }

  /**
   * Verify temporary token
   */
  private async verifyTempToken(token: string): Promise<SessionData | null> {
    const data = await cache.get(`temp:${token}`);
    if (!data) return null;

    await cache.delete(`temp:${token}`);
    return JSON.parse(data);
  }

  /**
   * Create full session
   */
  private async createSession(
    user: User,
    req: Request,
    deviceFingerprint?: string,
    twoFactorVerified: boolean = false
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Check max sessions
    const sessions = await this.getUserSessions(user.id);
    if (sessions.length >= SESSION_CONFIG.MAX_SESSIONS) {
      // Remove oldest session
      await this.removeOldestSession(user.id);
    }

    const sessionId = crypto.randomBytes(16).toString('hex');
    const sessionData: SessionData = {
      userId: user.id,
      sessionId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      twoFactorVerified,
      deviceTrusted: deviceFingerprint ? await this.isDeviceTrusted(user.id, deviceFingerprint) : false,
      deviceFingerprint
    };

    // Store session
    await cache.set(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      SESSION_CONFIG.SESSION_TIMEOUT / 1000
    );

    // Add to user's session list
    await cache.sadd(`sessions:${user.id}`, sessionId);

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
        dealershipId: user.dealership_id
      },
      config.security.jwt.secret,
      { expiresIn: config.security.jwt.expiresIn }
    );

    const refreshToken = crypto.randomBytes(64).toString('hex');
    await cache.set(
      `refresh:${refreshToken}`,
      JSON.stringify({ userId: user.id, sessionId }),
      7 * 24 * 60 * 60 // 7 days
    );

    return { accessToken, refreshToken };
  }

  /**
   * Get user sessions
   */
  private async getUserSessions(userId: string): Promise<string[]> {
    const sessions = await cache.smembers(`sessions:${userId}`);
    return sessions || [];
  }

  /**
   * Remove oldest session
   */
  private async removeOldestSession(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    let oldest: { id: string; createdAt: number } | null = null;

    for (const sessionId of sessions) {
      const data = await cache.get(`session:${sessionId}`);
      if (data) {
        const session = JSON.parse(data);
        if (!oldest || session.createdAt < oldest.createdAt) {
          oldest = { id: sessionId, createdAt: session.createdAt };
        }
      }
    }

    if (oldest) {
      await cache.delete(`session:${oldest.id}`);
      await cache.srem(`sessions:${userId}`, oldest.id);
    }
  }

  /**
   * Invalidate all sessions
   */
  private async invalidateAllSessions(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    
    for (const sessionId of sessions) {
      await cache.delete(`session:${sessionId}`);
    }
    
    await cache.delete(`sessions:${userId}`);
  }

  /**
   * Validate password against policy
   */
  private async validatePassword(
    password: string,
    userId?: string
  ): Promise<{ valid: boolean; errors?: string[] }> {
    const result = sanitizePassword(password);
    
    if (!result.valid) {
      return result;
    }

    const errors: string[] = [];

    // Check against common passwords
    if (PASSWORD_POLICY.COMMON_PASSWORDS_CHECK) {
      const commonPasswords = [
        'password123', 'admin123', 'letmein', 'welcome123',
        'dealer123', 'dealerscloud', 'automotive123'
      ];
      
      if (commonPasswords.some(common => 
        password.toLowerCase().includes(common.toLowerCase())
      )) {
        errors.push('Password is too common or contains common patterns');
      }
    }

    // Check if password contains user info
    if (userId) {
      const user = await this.userRepo.findById(userId);
      if (user) {
        const userInfo = [
          user.email.split('@')[0],
          user.first_name,
          user.last_name
        ].filter(Boolean).map(s => s.toLowerCase());

        if (userInfo.some(info => password.toLowerCase().includes(info))) {
          errors.push('Password should not contain personal information');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Check password age
   */
  private async checkPasswordAge(userId: string): Promise<{
    expired: boolean;
    daysRemaining: number;
  }> {
    const lastChange = await this.getLastPasswordChange(userId);
    
    if (!lastChange) {
      return { expired: false, daysRemaining: PASSWORD_POLICY.MAX_AGE_DAYS };
    }

    const daysSinceChange = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
    const daysRemaining = PASSWORD_POLICY.MAX_AGE_DAYS - daysSinceChange;

    return {
      expired: daysRemaining <= 0,
      daysRemaining: Math.max(0, Math.floor(daysRemaining))
    };
  }

  /**
   * Get last password change date
   */
  private async getLastPasswordChange(userId: string): Promise<Date | null> {
    const data = await cache.get(`password:lastchange:${userId}`);
    return data ? new Date(data) : null;
  }

  /**
   * Check password history
   */
  private async checkPasswordHistory(userId: string, password: string): Promise<boolean> {
    const history = await cache.get(`password:history:${userId}`);
    if (!history) return false;

    const hashes: string[] = JSON.parse(history);
    
    for (const hash of hashes) {
      if (await bcrypt.compare(password, hash)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Add password to history
   */
  private async addToPasswordHistory(userId: string, hash: string): Promise<void> {
    const historyKey = `password:history:${userId}`;
    let history = await cache.get(historyKey);
    
    const hashes: string[] = history ? JSON.parse(history) : [];
    hashes.unshift(hash);
    
    // Keep only the configured number of passwords
    if (hashes.length > PASSWORD_POLICY.HISTORY_COUNT) {
      hashes.pop();
    }

    await cache.set(historyKey, JSON.stringify(hashes));
    await cache.set(`password:lastchange:${userId}`, new Date().toISOString());
  }

  /**
   * Sanitize user data for response
   */
  private sanitizeUserData(user: User): Partial<User> {
    const { password_hash, two_factor_secret, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Encrypt sensitive data
   */
  private encryptData(data: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(config.security.encryptionKey || 'default-key-change-in-production', 'utf-8').slice(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  private decryptData(encryptedData: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(config.security.encryptionKey || 'default-key-change-in-production', 'utf-8').slice(0, 32);
    
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Cleanup interval for expired data
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      // Clean up old failed attempts
      const now = Date.now();
      for (const [email, attempts] of this.failedAttempts.entries()) {
        attempts.timestamps = attempts.timestamps.filter(
          ts => now - ts < LOCKOUT_CONFIG.ATTEMPT_WINDOW
        );
        
        if (attempts.timestamps.length === 0) {
          this.failedAttempts.delete(email);
        } else {
          attempts.count = attempts.timestamps.length;
        }
      }
    }, 60000); // Run every minute
  }
}

export default new EnhancedAuthService();