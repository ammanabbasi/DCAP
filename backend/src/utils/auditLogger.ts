/**
 * Audit Logging System for DealersCloud
 * Comprehensive audit trail for compliance and security monitoring
 */

import winston from 'winston';
import crypto from 'crypto';
import { Request } from 'express';
import knex from '../config/database';
import cache from '../config/redis';

/**
 * Audit event types for automotive dealership operations
 */
export enum AuditEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // User Management Events
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  PERMISSIONS_UPDATED = 'PERMISSIONS_UPDATED',
  
  // Data Access Events
  DATA_VIEWED = 'DATA_VIEWED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_DOWNLOADED = 'DATA_DOWNLOADED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  
  // Customer Data Events
  CUSTOMER_CREATED = 'CUSTOMER_CREATED',
  CUSTOMER_UPDATED = 'CUSTOMER_UPDATED',
  CUSTOMER_DELETED = 'CUSTOMER_DELETED',
  CUSTOMER_PII_ACCESSED = 'CUSTOMER_PII_ACCESSED',
  CUSTOMER_SSN_VIEWED = 'CUSTOMER_SSN_VIEWED',
  CUSTOMER_CREDIT_PULLED = 'CUSTOMER_CREDIT_PULLED',
  CUSTOMER_DOCUMENT_UPLOADED = 'CUSTOMER_DOCUMENT_UPLOADED',
  CUSTOMER_DOCUMENT_VIEWED = 'CUSTOMER_DOCUMENT_VIEWED',
  CUSTOMER_DATA_ANONYMIZED = 'CUSTOMER_DATA_ANONYMIZED',
  
  // Vehicle Events
  VEHICLE_ADDED = 'VEHICLE_ADDED',
  VEHICLE_UPDATED = 'VEHICLE_UPDATED',
  VEHICLE_DELETED = 'VEHICLE_DELETED',
  VEHICLE_SOLD = 'VEHICLE_SOLD',
  VEHICLE_PRICE_CHANGED = 'VEHICLE_PRICE_CHANGED',
  VIN_DECODED = 'VIN_DECODED',
  CARFAX_PULLED = 'CARFAX_PULLED',
  
  // Financial Events
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  REFUND_ISSUED = 'REFUND_ISSUED',
  FINANCING_APPROVED = 'FINANCING_APPROVED',
  FINANCING_DENIED = 'FINANCING_DENIED',
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
  
  // System Events
  CONFIGURATION_CHANGED = 'CONFIGURATION_CHANGED',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  
  // Security Events
  SECURITY_ALERT = 'SECURITY_ALERT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ACCESS_DENIED = 'ACCESS_DENIED',
  IP_BLOCKED = 'IP_BLOCKED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  CSRF_ATTEMPT = 'CSRF_ATTEMPT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_BREACH_DETECTED = 'DATA_BREACH_DETECTED',
  
  // Compliance Events
  GDPR_DATA_REQUEST = 'GDPR_DATA_REQUEST',
  GDPR_DATA_DELETION = 'GDPR_DATA_DELETION',
  CCPA_DATA_REQUEST = 'CCPA_DATA_REQUEST',
  CCPA_OPT_OUT = 'CCPA_OPT_OUT',
  COMPLIANCE_AUDIT = 'COMPLIANCE_AUDIT',
  
  // File Events
  FILE_UPLOADED = 'FILE_UPLOADED',
  FILE_DOWNLOADED = 'FILE_DOWNLOADED',
  FILE_DELETED = 'FILE_DELETED',
  FILE_SCANNED = 'FILE_SCANNED',
  MALWARE_DETECTED = 'MALWARE_DETECTED'
}

/**
 * Audit event severity levels
 */
export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  id?: string;
  timestamp: Date;
  event_type: AuditEventType;
  severity: AuditSeverity;
  user_id?: string;
  user_email?: string;
  user_role?: string;
  dealership_id?: string;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  session_id?: string;
  resource_type?: string;
  resource_id?: string;
  action?: string;
  details?: Record<string, any>;
  changes?: {
    before?: any;
    after?: any;
  };
  result: 'SUCCESS' | 'FAILURE';
  error_message?: string;
  metadata?: Record<string, any>;
  hash?: string;
  previous_hash?: string;
}

/**
 * Audit Logger Configuration
 */
const auditTransport = new winston.transports.File({
  filename: 'logs/audit.log',
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  maxsize: 10485760, // 10MB
  maxFiles: 100,
  tailable: true,
  zippedArchive: true
});

const securityTransport = new winston.transports.File({
  filename: 'logs/security.log',
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  maxsize: 10485760, // 10MB
  maxFiles: 50,
  tailable: true,
  zippedArchive: true
});

const criticalTransport = new winston.transports.File({
  filename: 'logs/critical.log',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  maxsize: 10485760, // 10MB
  maxFiles: 30,
  tailable: true,
  zippedArchive: true
});

/**
 * Create Winston logger for audit logs
 */
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    auditTransport,
    securityTransport,
    criticalTransport
  ],
  exitOnError: false
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  auditLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Calculate hash for audit log entry (for tamper detection)
 */
function calculateHash(entry: AuditLogEntry, previousHash?: string): string {
  const data = JSON.stringify({
    timestamp: entry.timestamp,
    event_type: entry.event_type,
    user_id: entry.user_id,
    details: entry.details,
    previous_hash: previousHash
  });
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Get the last audit log hash from cache or database
 */
async function getLastHash(): Promise<string | null> {
  try {
    // Try cache first
    const cachedHash = await cache.get('audit:last_hash');
    if (cachedHash) return cachedHash;
    
    // Fallback to database
    const lastEntry = await knex('audit_logs')
      .orderBy('timestamp', 'desc')
      .first('hash');
    
    if (lastEntry?.hash) {
      // Update cache
      await cache.set('audit:last_hash', lastEntry.hash, 3600);
      return lastEntry.hash;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting last hash:', error);
    return null;
  }
}

/**
 * Main audit logging class
 */
export class AuditLogger {
  private static instance: AuditLogger;
  
  private constructor() {}
  
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }
  
  /**
   * Log an audit event
   */
  public async log(entry: Partial<AuditLogEntry>): Promise<void> {
    try {
      // Generate ID and timestamp
      const fullEntry: AuditLogEntry = {
        id: crypto.randomBytes(16).toString('hex'),
        timestamp: new Date(),
        severity: AuditSeverity.INFO,
        result: 'SUCCESS',
        ...entry
      } as AuditLogEntry;
      
      // Calculate hash for integrity
      const previousHash = await getLastHash();
      fullEntry.hash = calculateHash(fullEntry, previousHash || undefined);
      fullEntry.previous_hash = previousHash || undefined;
      
      // Mask sensitive data in details
      if (fullEntry.details) {
        fullEntry.details = this.maskSensitiveData(fullEntry.details);
      }
      
      // Log to file
      auditLogger.info('Audit Event', fullEntry);
      
      // Store in database
      await this.storeInDatabase(fullEntry);
      
      // Update last hash in cache
      await cache.set('audit:last_hash', fullEntry.hash!, 3600);
      
      // Alert on critical events
      if (fullEntry.severity === AuditSeverity.CRITICAL) {
        await this.alertCriticalEvent(fullEntry);
      }
      
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Never throw - audit logging should not break the application
    }
  }
  
  /**
   * Log authentication event
   */
  public async logAuth(
    eventType: AuditEventType,
    userId?: string,
    details?: any,
    req?: Request
  ): Promise<void> {
    const entry: Partial<AuditLogEntry> = {
      event_type: eventType,
      user_id: userId,
      details,
      ip_address: req?.ip,
      user_agent: req?.headers['user-agent'],
      request_id: (req as any)?.requestId,
      session_id: (req as any)?.sessionID
    };
    
    // Determine severity based on event type
    if ([
      AuditEventType.ACCOUNT_LOCKED,
      AuditEventType.LOGIN_FAILED,
      AuditEventType.UNAUTHORIZED_ACCESS
    ].includes(eventType)) {
      entry.severity = AuditSeverity.WARNING;
    }
    
    await this.log(entry);
  }
  
  /**
   * Log data access event
   */
  public async logDataAccess(
    eventType: AuditEventType,
    resourceType: string,
    resourceId: string,
    userId: string,
    details?: any,
    req?: Request
  ): Promise<void> {
    const entry: Partial<AuditLogEntry> = {
      event_type: eventType,
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: req?.ip,
      user_agent: req?.headers['user-agent'],
      request_id: (req as any)?.requestId
    };
    
    // Mark PII access as WARNING
    if ([
      AuditEventType.CUSTOMER_PII_ACCESSED,
      AuditEventType.CUSTOMER_SSN_VIEWED,
      AuditEventType.CUSTOMER_CREDIT_PULLED
    ].includes(eventType)) {
      entry.severity = AuditSeverity.WARNING;
    }
    
    await this.log(entry);
  }
  
  /**
   * Log security event
   */
  public async logSecurity(
    eventType: AuditEventType,
    severity: AuditSeverity,
    details: any,
    req?: Request
  ): Promise<void> {
    const entry: Partial<AuditLogEntry> = {
      event_type: eventType,
      severity,
      details,
      ip_address: req?.ip,
      user_agent: req?.headers['user-agent'],
      request_id: (req as any)?.requestId,
      result: 'FAILURE'
    };
    
    await this.log(entry);
  }
  
  /**
   * Log data modification event
   */
  public async logDataModification(
    eventType: AuditEventType,
    resourceType: string,
    resourceId: string,
    userId: string,
    changes: { before: any; after: any },
    req?: Request
  ): Promise<void> {
    const entry: Partial<AuditLogEntry> = {
      event_type: eventType,
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      changes: {
        before: this.maskSensitiveData(changes.before),
        after: this.maskSensitiveData(changes.after)
      },
      ip_address: req?.ip,
      user_agent: req?.headers['user-agent'],
      request_id: (req as any)?.requestId
    };
    
    await this.log(entry);
  }
  
  /**
   * Mask sensitive data in audit logs
   */
  private maskSensitiveData(data: any): any {
    if (!data) return data;
    
    const sensitiveFields = [
      'password', 'ssn', 'social_security_number', 'credit_card',
      'card_number', 'cvv', 'drivers_license', 'license_number',
      'bank_account', 'routing_number', 'tax_id', 'ein'
    ];
    
    const masked = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in masked) {
        if (typeof masked[field] === 'string') {
          // Keep first and last 2 characters for reference
          const value = masked[field];
          if (value.length > 4) {
            masked[field] = value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
          } else {
            masked[field] = '*'.repeat(value.length);
          }
        } else {
          masked[field] = '[REDACTED]';
        }
      }
    }
    
    // Recursively mask nested objects
    for (const key in masked) {
      if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    }
    
    return masked;
  }
  
  /**
   * Store audit log in database
   */
  private async storeInDatabase(entry: AuditLogEntry): Promise<void> {
    try {
      await knex('audit_logs').insert({
        id: entry.id,
        timestamp: entry.timestamp,
        event_type: entry.event_type,
        severity: entry.severity,
        user_id: entry.user_id,
        user_email: entry.user_email,
        user_role: entry.user_role,
        dealership_id: entry.dealership_id,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
        request_id: entry.request_id,
        session_id: entry.session_id,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        action: entry.action,
        details: JSON.stringify(entry.details),
        changes: JSON.stringify(entry.changes),
        result: entry.result,
        error_message: entry.error_message,
        metadata: JSON.stringify(entry.metadata),
        hash: entry.hash,
        previous_hash: entry.previous_hash
      });
    } catch (error) {
      console.error('Failed to store audit log in database:', error);
    }
  }
  
  /**
   * Alert on critical events
   */
  private async alertCriticalEvent(entry: AuditLogEntry): Promise<void> {
    try {
      // Send alert to monitoring system
      console.error('CRITICAL SECURITY EVENT:', {
        event: entry.event_type,
        user: entry.user_id,
        ip: entry.ip_address,
        details: entry.details
      });
      
      // TODO: Integrate with alerting service (PagerDuty, Slack, etc.)
      
    } catch (error) {
      console.error('Failed to send critical alert:', error);
    }
  }
  
  /**
   * Query audit logs
   */
  public async query(filters: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    eventType?: AuditEventType;
    severity?: AuditSeverity;
    resourceType?: string;
    resourceId?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogEntry[]> {
    try {
      let query = knex('audit_logs');
      
      if (filters.startDate) {
        query = query.where('timestamp', '>=', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.where('timestamp', '<=', filters.endDate);
      }
      
      if (filters.userId) {
        query = query.where('user_id', filters.userId);
      }
      
      if (filters.eventType) {
        query = query.where('event_type', filters.eventType);
      }
      
      if (filters.severity) {
        query = query.where('severity', filters.severity);
      }
      
      if (filters.resourceType) {
        query = query.where('resource_type', filters.resourceType);
      }
      
      if (filters.resourceId) {
        query = query.where('resource_id', filters.resourceId);
      }
      
      query = query.orderBy('timestamp', 'desc');
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.offset(filters.offset);
      }
      
      const results = await query;
      
      return results.map(row => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : undefined,
        changes: row.changes ? JSON.parse(row.changes) : undefined,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined
      }));
      
    } catch (error) {
      console.error('Failed to query audit logs:', error);
      return [];
    }
  }
  
  /**
   * Verify audit log integrity
   */
  public async verifyIntegrity(startDate?: Date, endDate?: Date): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    try {
      let query = knex('audit_logs').orderBy('timestamp', 'asc');
      
      if (startDate) {
        query = query.where('timestamp', '>=', startDate);
      }
      
      if (endDate) {
        query = query.where('timestamp', '<=', endDate);
      }
      
      const logs = await query;
      const errors: string[] = [];
      let previousHash: string | undefined;
      
      for (const log of logs) {
        const expectedHash = calculateHash(log, previousHash);
        
        if (log.hash !== expectedHash) {
          errors.push(`Hash mismatch for log ${log.id} at ${log.timestamp}`);
        }
        
        if (log.previous_hash !== previousHash) {
          errors.push(`Previous hash mismatch for log ${log.id}`);
        }
        
        previousHash = log.hash;
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
      
    } catch (error) {
      console.error('Failed to verify audit log integrity:', error);
      return {
        valid: false,
        errors: ['Failed to verify integrity: ' + error]
      };
    }
  }
  
  /**
   * Generate compliance report
   */
  public async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    reportType: 'GDPR' | 'CCPA' | 'PCI' | 'GENERAL'
  ): Promise<any> {
    const relevantEvents: AuditEventType[] = [];
    
    switch (reportType) {
      case 'GDPR':
        relevantEvents.push(
          AuditEventType.GDPR_DATA_REQUEST,
          AuditEventType.GDPR_DATA_DELETION,
          AuditEventType.CUSTOMER_DATA_ANONYMIZED,
          AuditEventType.CUSTOMER_PII_ACCESSED
        );
        break;
      case 'CCPA':
        relevantEvents.push(
          AuditEventType.CCPA_DATA_REQUEST,
          AuditEventType.CCPA_OPT_OUT,
          AuditEventType.CUSTOMER_PII_ACCESSED
        );
        break;
      case 'PCI':
        relevantEvents.push(
          AuditEventType.PAYMENT_PROCESSED,
          AuditEventType.REFUND_ISSUED,
          AuditEventType.CUSTOMER_CREDIT_PULLED
        );
        break;
    }
    
    const logs = await this.query({
      startDate,
      endDate,
      eventType: relevantEvents[0] // This needs enhancement to support multiple types
    });
    
    return {
      reportType,
      period: { start: startDate, end: endDate },
      totalEvents: logs.length,
      events: logs,
      summary: this.generateSummary(logs),
      generated: new Date()
    };
  }
  
  private generateSummary(logs: AuditLogEntry[]): any {
    const summary: any = {
      byEventType: {},
      bySeverity: {},
      byUser: {},
      failures: 0,
      successes: 0
    };
    
    for (const log of logs) {
      // Count by event type
      summary.byEventType[log.event_type] = (summary.byEventType[log.event_type] || 0) + 1;
      
      // Count by severity
      summary.bySeverity[log.severity] = (summary.bySeverity[log.severity] || 0) + 1;
      
      // Count by user
      if (log.user_id) {
        summary.byUser[log.user_id] = (summary.byUser[log.user_id] || 0) + 1;
      }
      
      // Count successes/failures
      if (log.result === 'SUCCESS') {
        summary.successes++;
      } else {
        summary.failures++;
      }
    }
    
    return summary;
  }
}

// Export singleton instance
export const auditLog = AuditLogger.getInstance();

// Export middleware for Express
export const auditMiddleware = (eventType: AuditEventType) => {
  return async (req: Request, res: Response, next: any) => {
    const startTime = Date.now();
    const authReq = req as any;
    
    // Capture original send
    const originalSend = res.send;
    
    res.send = function(data: any) {
      res.send = originalSend;
      
      // Log the audit event
      auditLog.log({
        event_type: eventType,
        user_id: authReq.user?.userId,
        user_email: authReq.user?.email,
        user_role: authReq.user?.role,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        request_id: authReq.requestId,
        action: `${req.method} ${req.path}`,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          responseTime: Date.now() - startTime,
          statusCode: res.statusCode
        },
        result: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
        severity: res.statusCode >= 500 ? AuditSeverity.ERROR : AuditSeverity.INFO
      }).catch(console.error);
      
      return res.send.call(this, data);
    };
    
    next();
  };
};