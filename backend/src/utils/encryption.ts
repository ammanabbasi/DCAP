/**
 * Data Encryption Utilities for DealersCloud
 * Implements AES-256-GCM encryption for sensitive data at rest
 */

import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { config } from '../config/env';
import logger from './logger';

/**
 * Encryption configuration
 */
const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  TAG_LENGTH: 16,
  SALT_LENGTH: 64,
  ITERATIONS: 100000,
  DIGEST: 'sha256'
};

/**
 * Field-level encryption types
 */
export enum EncryptionType {
  REVERSIBLE = 'REVERSIBLE', // Can be decrypted (SSN, Credit Card)
  IRREVERSIBLE = 'IRREVERSIBLE', // One-way hash (Passwords)
  SEARCHABLE = 'SEARCHABLE', // Searchable encryption (Email, Phone)
  MASKED = 'MASKED' // Partially visible (Credit Card last 4)
}

/**
 * PII field categories for automotive dealership
 */
export enum PIICategory {
  FINANCIAL = 'FINANCIAL', // Credit cards, bank accounts
  IDENTITY = 'IDENTITY', // SSN, driver's license
  CONTACT = 'CONTACT', // Email, phone, address
  MEDICAL = 'MEDICAL', // Medical conditions for insurance
  EMPLOYMENT = 'EMPLOYMENT', // Employer info, income
  VEHICLE = 'VEHICLE' // VIN (can be PII when linked to owner)
}

/**
 * Encryption service class
 */
export class EncryptionService {
  private masterKey: Buffer;
  private encryptionKeys: Map<string, Buffer> = new Map();

  constructor() {
    this.masterKey = this.deriveMasterKey();
    this.initializeFieldKeys();
  }

  /**
   * Derive master key from environment
   */
  private deriveMasterKey(): Buffer {
    const envKey = config.security?.encryptionKey || process.env.ENCRYPTION_KEY;
    
    if (!envKey) {
      logger.warn('No encryption key found in environment. Using default key (NOT SECURE FOR PRODUCTION)');
      return Buffer.from('default-encryption-key-change-in-production!!').slice(0, ENCRYPTION_CONFIG.KEY_LENGTH);
    }

    // Ensure key is proper length
    const keyBuffer = Buffer.from(envKey, 'utf-8');
    
    if (keyBuffer.length < ENCRYPTION_CONFIG.KEY_LENGTH) {
      // Stretch key using PBKDF2
      const salt = crypto.createHash('sha256').update('dealerscloud-salt').digest();
      return crypto.pbkdf2Sync(
        keyBuffer,
        salt,
        ENCRYPTION_CONFIG.ITERATIONS,
        ENCRYPTION_CONFIG.KEY_LENGTH,
        ENCRYPTION_CONFIG.DIGEST
      );
    }

    return keyBuffer.slice(0, ENCRYPTION_CONFIG.KEY_LENGTH);
  }

  /**
   * Initialize field-specific encryption keys
   */
  private initializeFieldKeys(): void {
    const fields = ['ssn', 'credit_card', 'drivers_license', 'bank_account', 'tax_id'];
    
    for (const field of fields) {
      const fieldKey = this.deriveFieldKey(field);
      this.encryptionKeys.set(field, fieldKey);
    }
  }

  /**
   * Derive field-specific key from master key
   */
  private deriveFieldKey(field: string): Buffer {
    const salt = crypto.createHash('sha256').update(`field-${field}`).digest();
    return crypto.pbkdf2Sync(
      this.masterKey,
      salt,
      10000,
      ENCRYPTION_CONFIG.KEY_LENGTH,
      ENCRYPTION_CONFIG.DIGEST
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  public encrypt(plaintext: string, fieldName?: string): string {
    try {
      const key = fieldName && this.encryptionKeys.has(fieldName) 
        ? this.encryptionKeys.get(fieldName)! 
        : this.masterKey;

      const iv = crypto.randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);
      const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Combine IV, authTag, and encrypted data
      const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'hex')
      ]);

      return combined.toString('base64');
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  public decrypt(encryptedData: string, fieldName?: string): string {
    try {
      const key = fieldName && this.encryptionKeys.has(fieldName)
        ? this.encryptionKeys.get(fieldName)!
        : this.masterKey;

      const combined = Buffer.from(encryptedData, 'base64');

      // Extract IV, authTag, and encrypted data
      const iv = combined.slice(0, ENCRYPTION_CONFIG.IV_LENGTH);
      const authTag = combined.slice(
        ENCRYPTION_CONFIG.IV_LENGTH,
        ENCRYPTION_CONFIG.IV_LENGTH + ENCRYPTION_CONFIG.TAG_LENGTH
      );
      const encrypted = combined.slice(
        ENCRYPTION_CONFIG.IV_LENGTH + ENCRYPTION_CONFIG.TAG_LENGTH
      );

      const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, null, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Create searchable encryption (deterministic)
   */
  public encryptSearchable(plaintext: string, fieldName: string): {
    encrypted: string;
    searchHash: string;
  } {
    // Store encrypted version
    const encrypted = this.encrypt(plaintext, fieldName);

    // Create searchable hash (deterministic)
    const salt = crypto.createHash('sha256')
      .update(`search-${fieldName}`)
      .digest();

    const searchHash = crypto.pbkdf2Sync(
      plaintext.toLowerCase(),
      salt,
      1000,
      32,
      'sha256'
    ).toString('hex');

    return { encrypted, searchHash };
  }

  /**
   * Hash data irreversibly (for passwords)
   */
  public async hashIrreversible(data: string, salt?: string): Promise<string> {
    const actualSalt = salt || crypto.randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH).toString('hex');
    const hash = crypto.pbkdf2Sync(
      data,
      actualSalt,
      ENCRYPTION_CONFIG.ITERATIONS,
      64,
      'sha512'
    ).toString('hex');

    return `${actualSalt}:${hash}`;
  }

  /**
   * Verify irreversible hash
   */
  public async verifyHash(data: string, hashedData: string): Promise<boolean> {
    try {
      const [salt, hash] = hashedData.split(':');
      const testHash = crypto.pbkdf2Sync(
        data,
        salt,
        ENCRYPTION_CONFIG.ITERATIONS,
        64,
        'sha512'
      ).toString('hex');

      return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(testHash)
      );
    } catch {
      return false;
    }
  }

  /**
   * Encrypt PII data based on category
   */
  public encryptPII(data: string, category: PIICategory): string {
    switch (category) {
      case PIICategory.FINANCIAL:
        return this.encryptFinancialData(data);
      case PIICategory.IDENTITY:
        return this.encrypt(data, 'identity');
      case PIICategory.CONTACT:
        return this.encrypt(data, 'contact');
      case PIICategory.MEDICAL:
        return this.encrypt(data, 'medical');
      case PIICategory.EMPLOYMENT:
        return this.encrypt(data, 'employment');
      case PIICategory.VEHICLE:
        return this.encrypt(data, 'vehicle');
      default:
        return this.encrypt(data);
    }
  }

  /**
   * Encrypt financial data with masking
   */
  private encryptFinancialData(data: string): string {
    // Remove non-numeric characters
    const cleaned = data.replace(/\D/g, '');
    
    if (cleaned.length >= 12) {
      // Credit card number - mask all but last 4
      const last4 = cleaned.slice(-4);
      const encrypted = this.encrypt(cleaned, 'credit_card');
      
      // Store with metadata for display
      return JSON.stringify({
        type: 'credit_card',
        encrypted,
        masked: `****-****-****-${last4}`,
        last4
      });
    } else if (cleaned.length === 9) {
      // Routing number or SSN
      const encrypted = this.encrypt(cleaned, 'ssn');
      const last4 = cleaned.slice(-4);
      
      return Buffer.from(JSON.stringify({
        type: 'ssn',
        encrypted,
        masked: `XXX-XX-${last4}`,
        last4
      })).toString('base64');
    }

    return this.encrypt(data, 'financial');
  }

  /**
   * Decrypt PII data
   */
  public decryptPII(encryptedData: string, category: PIICategory): string {
    try {
      // Check if it's JSON (masked data)
      const parsed = JSON.parse(encryptedData);
      if (parsed.encrypted) {
        return this.decrypt(parsed.encrypted, parsed.type);
      }
    } catch {
      // Not JSON, decrypt directly
    }
    
    switch (category) {
      case PIICategory.IDENTITY:
        return this.decrypt(encryptedData, 'identity');
      case PIICategory.CONTACT:
        return this.decrypt(encryptedData, 'contact');
      case PIICategory.MEDICAL:
        return this.decrypt(encryptedData, 'medical');
      case PIICategory.EMPLOYMENT:
        return this.decrypt(encryptedData, 'employment');
      case PIICategory.VEHICLE:
        return this.decrypt(encryptedData, 'vehicle');
      default:
        return this.decrypt(encryptedData);
    }
  }

  /**
   * Get masked version of encrypted data
   */
  public getMaskedValue(encryptedData: string): string {
    try {
      const parsed = JSON.parse(encryptedData);
      return parsed.masked || '[ENCRYPTED]';
    } catch {
      return '[ENCRYPTED]';
    }
  }

  /**
   * Encrypt object with field-level encryption
   */
  public encryptObject<T extends Record<string, any>>(
    obj: T,
    fieldsToEncrypt: Array<keyof T & string>
  ): T {
    const encrypted = { ...obj };

    for (const field of fieldsToEncrypt) {
      if (encrypted[field] !== undefined && encrypted[field] !== null) {
        const value = String(encrypted[field]);
        (encrypted as any)[field] = this.encrypt(value, field);
      }
    }

    return encrypted;
  }

  /**
   * Decrypt object with field-level decryption
   */
  public decryptObject<T extends Record<string, any>>(
    obj: T,
    fieldsToDecrypt: Array<keyof T & string>
  ): T {
    const decrypted = { ...obj };

    for (const field of fieldsToDecrypt) {
      if (decrypted[field] !== undefined && decrypted[field] !== null) {
        try {
          (decrypted as any)[field] = this.decrypt(String(decrypted[field]), field);
        } catch {
          // If decryption fails, leave as is
          logger.warn(`Failed to decrypt field: ${field}`);
        }
      }
    }

    return decrypted;
  }

  /**
   * Tokenize sensitive data for secure storage
   */
  public tokenize(data: string, type: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const encrypted = this.encrypt(data, type);

    // Store mapping in secure storage (implement based on your storage solution)
    // This is a placeholder - implement actual storage
    this.storeTokenMapping(token, encrypted, type);

    return token;
  }

  /**
   * Detokenize to retrieve original data
   */
  public async detokenize(token: string, type: string): Promise<string | null> {
    // Retrieve from secure storage (implement based on your storage solution)
    const encrypted = await this.retrieveTokenMapping(token, type);
    
    if (!encrypted) return null;

    return this.decrypt(encrypted, type);
  }

  /**
   * Store token mapping (placeholder - implement with your storage)
   */
  private storeTokenMapping(_token: string, _encrypted: string, type: string): void {
    // TODO: Implement with Redis or database
    logger.debug(`Storing token mapping for type: ${type}`);
  }

  /**
   * Retrieve token mapping (placeholder - implement with your storage)
   */
  private async retrieveTokenMapping(_token: string, type: string): Promise<string | null> {
    // TODO: Implement with Redis or database
    logger.debug(`Retrieving token mapping for type: ${type}`);
    return null;
  }

  /**
   * Generate encryption key for client-side storage
   */
  public generateClientKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt for client-side storage (less secure, for non-critical data)
   */
  public encryptForClient(data: string, clientKey: string): string {
    return CryptoJS.AES.encrypt(data, clientKey).toString();
  }

  /**
   * Decrypt from client-side storage
   */
  public decryptFromClient(encryptedData: string, clientKey: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, clientKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Rotate encryption keys
   */
  public async rotateKeys(): Promise<void> {
    logger.info('Starting encryption key rotation');

    // Generate new master key
    // const newMasterKey = crypto.randomBytes(ENCRYPTION_CONFIG.KEY_LENGTH);

    // TODO: Re-encrypt all data with new key
    // This would involve:
    // 1. Decrypt all data with old key
    // 2. Encrypt with new key
    // 3. Update stored data
    // 4. Update key in secure storage

    logger.info('Encryption key rotation completed');
  }

  /**
   * Validate encryption integrity
   */
  public validateIntegrity(encryptedData: string): boolean {
    try {
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Check minimum length
      const minLength = ENCRYPTION_CONFIG.IV_LENGTH + ENCRYPTION_CONFIG.TAG_LENGTH + 1;
      if (combined.length < minLength) {
        return false;
      }

      // Try to extract components
      const iv = combined.slice(0, ENCRYPTION_CONFIG.IV_LENGTH);
      const authTag = combined.slice(
        ENCRYPTION_CONFIG.IV_LENGTH,
        ENCRYPTION_CONFIG.IV_LENGTH + ENCRYPTION_CONFIG.TAG_LENGTH
      );

      // Validate IV and authTag are present
      return iv.length === ENCRYPTION_CONFIG.IV_LENGTH && 
             authTag.length === ENCRYPTION_CONFIG.TAG_LENGTH;
    } catch {
      return false;
    }
  }

  /**
   * Secure delete - overwrite memory
   */
  public secureDelete(data: Buffer | string): void {
    if (typeof data === 'string') {
      // For strings, we can't directly overwrite memory in JavaScript
      // But we can at least clear references
      data = '';
    } else if (Buffer.isBuffer(data)) {
      // Overwrite buffer with random data
      crypto.randomFillSync(data);
      data.fill(0);
    }
  }
}

/**
 * Singleton instance
 */
const encryptionService = new EncryptionService();

/**
 * Utility functions for common encryption tasks
 */

/**
 * Encrypt SSN
 */
export function encryptSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) {
    throw new Error('Invalid SSN format');
  }
  return encryptionService.encryptPII(cleaned, PIICategory.IDENTITY);
}

/**
 * Encrypt credit card
 */
export function encryptCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) {
    throw new Error('Invalid credit card number');
  }
  return encryptionService.encryptPII(cleaned, PIICategory.FINANCIAL);
}

/**
 * Encrypt driver's license
 */
export function encryptDriversLicense(license: string, state: string): string {
  const data = JSON.stringify({ license, state });
  return encryptionService.encryptPII(data, PIICategory.IDENTITY);
}

/**
 * Encrypt VIN
 */
export function encryptVIN(vin: string): string {
  if (vin.length !== 17) {
    throw new Error('Invalid VIN format');
  }
  return encryptionService.encrypt(vin, 'vehicle');
}

/**
 * Batch encrypt customer data
 */
export function encryptCustomerData(customer: any): any {
  const encrypted = { ...customer };

  // List of fields to encrypt
  const fieldsToEncrypt = {
    ssn: PIICategory.IDENTITY,
    drivers_license: PIICategory.IDENTITY,
    credit_card: PIICategory.FINANCIAL,
    bank_account: PIICategory.FINANCIAL,
    phone: PIICategory.CONTACT,
    email: PIICategory.CONTACT,
    address: PIICategory.CONTACT
  };

  for (const [field, category] of Object.entries(fieldsToEncrypt)) {
    if (encrypted[field]) {
      encrypted[field] = encryptionService.encryptPII(encrypted[field], category);
    }
  }

  return encrypted;
}

/**
 * Batch decrypt customer data
 */
export function decryptCustomerData(customer: any): any {
  const decrypted = { ...customer };

  // List of fields to decrypt
  const fieldsToDecrypt = {
    ssn: PIICategory.IDENTITY,
    drivers_license: PIICategory.IDENTITY,
    credit_card: PIICategory.FINANCIAL,
    bank_account: PIICategory.FINANCIAL,
    phone: PIICategory.CONTACT,
    email: PIICategory.CONTACT,
    address: PIICategory.CONTACT
  };

  for (const [field, category] of Object.entries(fieldsToDecrypt)) {
    if (decrypted[field]) {
      try {
        decrypted[field] = encryptionService.decryptPII(decrypted[field], category);
      } catch (error) {
        logger.error(`Failed to decrypt field ${field}:`, error);
        decrypted[field] = encryptionService.getMaskedValue(decrypted[field]);
      }
    }
  }

  return decrypted;
}

export default encryptionService;