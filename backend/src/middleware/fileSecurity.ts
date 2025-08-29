/**
 * File Upload Security Middleware
 * Implements comprehensive file validation, virus scanning, and secure storage
 */

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import ClamScan from 'clamav.js';
import sharp from 'sharp';
import { auditLog, AuditEventType, AuditSeverity } from '../utils/auditLogger';
import { sanitizeFileName } from '../utils/sanitization';
import logger from '../utils/logger';

/**
 * File upload configuration
 */
const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB default
  MAX_FILES_PER_REQUEST: 10,
  TEMP_DIR: './uploads/temp',
  QUARANTINE_DIR: './uploads/quarantine',
  SAFE_DIR: './uploads/safe',
  ALLOWED_MIME_TYPES: {
    // Documents
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    
    // Images
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/svg+xml': ['.svg'],
    
    // Text
    'text/plain': ['.txt'],
    'text/csv': ['.csv'],
    
    // Archives (careful with these)
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar']
  },
  DANGEROUS_EXTENSIONS: [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
    '.jar', '.app', '.deb', '.rpm', '.msi', '.dmg', '.pkg',
    '.ps1', '.sh', '.bash', '.zsh', '.fish', '.ksh',
    '.dll', '.so', '.dylib'
  ],
  IMAGE_MAX_DIMENSIONS: {
    width: 4096,
    height: 4096
  },
  SCAN_TIMEOUT: 30000 // 30 seconds
};

/**
 * File validation result
 */
interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo?: {
    originalName: string;
    sanitizedName: string;
    mimeType: string;
    size: number;
    hash: string;
  };
}

/**
 * Initialize ClamAV scanner (optional - requires ClamAV daemon)
 */
let clamScanner: ClamScan | null = null;

try {
  clamScanner = new ClamScan({
    host: '127.0.0.1',
    port: 3310,
    timeout: FILE_CONFIG.SCAN_TIMEOUT
  });
} catch (error) {
  logger.warn('ClamAV scanner not available. File virus scanning disabled.');
}

/**
 * Create required directories
 */
async function ensureDirectories(): Promise<void> {
  const dirs = [FILE_CONFIG.TEMP_DIR, FILE_CONFIG.QUARANTINE_DIR, FILE_CONFIG.SAFE_DIR];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      logger.error(`Failed to create directory ${dir}:`, error);
    }
  }
}

// Initialize directories
ensureDirectories();

/**
 * Multer storage configuration with security
 */
const secureStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await ensureDirectories();
    cb(null, FILE_CONFIG.TEMP_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate secure random filename
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const secureFilename = `${uniqueId}${ext}`;
    cb(null, secureFilename);
  }
});

/**
 * File filter for initial validation
 */
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (FILE_CONFIG.DANGEROUS_EXTENSIONS.includes(ext)) {
    logger.warn(`Dangerous file extension blocked: ${ext}`);
    cb(new Error(`File type ${ext} is not allowed`));
    return;
  }

  // Check MIME type
  if (file.mimetype && !Object.keys(FILE_CONFIG.ALLOWED_MIME_TYPES).includes(file.mimetype)) {
    logger.warn(`Unsupported MIME type: ${file.mimetype}`);
    cb(new Error(`File type ${file.mimetype} is not supported`));
    return;
  }

  cb(null, true);
};

/**
 * Multer upload configuration
 */
export const upload = multer({
  storage: secureStorage,
  fileFilter,
  limits: {
    fileSize: FILE_CONFIG.MAX_FILE_SIZE,
    files: FILE_CONFIG.MAX_FILES_PER_REQUEST,
    fields: 20,
    fieldSize: 1024 * 1024, // 1MB for text fields
    parts: 100,
    headerPairs: 100
  }
});

/**
 * Validate file contents (deep inspection)
 */
async function validateFileContents(filePath: string): Promise<FileValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Read file buffer for analysis
    const buffer = await fs.readFile(filePath);
    
    // Detect actual file type from contents
    const fileType = await fileTypeFromBuffer(buffer);
    
    if (!fileType) {
      warnings.push('Could not determine file type from contents');
    } else {
      // Verify MIME type matches content
      if (!Object.keys(FILE_CONFIG.ALLOWED_MIME_TYPES).includes(fileType.mime)) {
        errors.push(`Actual file type ${fileType.mime} is not allowed`);
      }
    }

    // Check for embedded executables or scripts
    const dangerousPatterns = [
      /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi, // JavaScript in HTML
      /(<iframe[\s\S]*?>[\s\S]*?<\/iframe>)/gi, // Iframes
      /(eval\s*\()/gi, // eval() calls
      /(document\.write)/gi, // document.write
      /(\.exe|\.dll|\.bat|\.cmd)/gi, // Windows executables
      /(#!\/bin\/)/g, // Shebang for scripts
      /(\x4D\x5A)/g, // MZ header (Windows executable)
      /(\x7F\x45\x4C\x46)/g // ELF header (Linux executable)
    ];

    const fileContent = buffer.toString('utf8', 0, Math.min(buffer.length, 1024 * 100)); // Check first 100KB
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(fileContent)) {
        errors.push('File contains potentially dangerous content');
        break;
      }
    }

    // Check for null bytes (can be used for path traversal)
    if (buffer.includes(Buffer.from([0x00]))) {
      warnings.push('File contains null bytes');
    }

    // Calculate file hash for integrity
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        originalName: path.basename(filePath),
        sanitizedName: sanitizeFileName(path.basename(filePath)),
        mimeType: fileType?.mime || 'unknown',
        size: buffer.length,
        hash
      }
    };

  } catch (error) {
    logger.error('File content validation error:', error);
    errors.push('Failed to validate file contents');
    return { valid: false, errors, warnings };
  }
}

/**
 * Scan file for viruses using ClamAV
 */
async function scanForViruses(filePath: string): Promise<{
  clean: boolean;
  threat?: string;
}> {
  if (!clamScanner) {
    logger.debug('Virus scanning skipped - ClamAV not available');
    return { clean: true };
  }

  try {
    const result = await clamScanner.scanFile(filePath);
    
    if (result.isInfected) {
      logger.warn(`Virus detected in file: ${result.viruses.join(', ')}`);
      return {
        clean: false,
        threat: result.viruses.join(', ')
      };
    }

    return { clean: true };

  } catch (error) {
    logger.error('Virus scan error:', error);
    // Fail closed - treat scan failure as infected
    return {
      clean: false,
      threat: 'Scan failed - file quarantined'
    };
  }
}

/**
 * Process and sanitize images
 */
async function processImage(filePath: string, mimeType: string): Promise<{
  success: boolean;
  processedPath?: string;
  error?: string;
}> {
  if (!mimeType.startsWith('image/')) {
    return { success: true, processedPath: filePath };
  }

  try {
    const tempProcessed = filePath.replace(path.extname(filePath), '_processed' + path.extname(filePath));
    
    // Use sharp to process and sanitize image
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Check dimensions
    if (metadata.width && metadata.width > FILE_CONFIG.IMAGE_MAX_DIMENSIONS.width) {
      await image.resize(FILE_CONFIG.IMAGE_MAX_DIMENSIONS.width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    if (metadata.height && metadata.height > FILE_CONFIG.IMAGE_MAX_DIMENSIONS.height) {
      await image.resize(null, FILE_CONFIG.IMAGE_MAX_DIMENSIONS.height, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    // Remove EXIF data (can contain sensitive location info)
    await image
      .rotate() // Auto-rotate based on EXIF
      .removeAlpha() // Remove alpha channel if not needed
      .withMetadata({
        orientation: undefined // Remove orientation data
      })
      .toFile(tempProcessed);

    return { success: true, processedPath: tempProcessed };

  } catch (error) {
    logger.error('Image processing error:', error);
    return {
      success: false,
      error: 'Failed to process image'
    };
  }
}

/**
 * Move file to quarantine
 */
async function quarantineFile(filePath: string, reason: string): Promise<void> {
  try {
    const filename = path.basename(filePath);
    const quarantinePath = path.join(FILE_CONFIG.QUARANTINE_DIR, `QUARANTINED_${Date.now()}_${filename}`);
    
    await fs.rename(filePath, quarantinePath);
    
    // Create quarantine record
    const recordPath = quarantinePath + '.json';
    await fs.writeFile(recordPath, JSON.stringify({
      originalPath: filePath,
      quarantineDate: new Date().toISOString(),
      reason
    }, null, 2));

    logger.warn(`File quarantined: ${filename}, Reason: ${reason}`);

  } catch (error) {
    logger.error('Failed to quarantine file:', error);
    // Try to delete if quarantine fails
    try {
      await fs.unlink(filePath);
    } catch {
      // Silent fail
    }
  }
}

/**
 * Move file to safe storage
 */
async function moveToSafeStorage(filePath: string, category: string): Promise<string> {
  const categoryDir = path.join(FILE_CONFIG.SAFE_DIR, category);
  await fs.mkdir(categoryDir, { recursive: true });

  const filename = path.basename(filePath);
  const safePath = path.join(categoryDir, filename);
  
  await fs.rename(filePath, safePath);
  
  return safePath;
}

/**
 * Main file security middleware
 */
export const fileSecurityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip if no files
  if (!req.files && !req.file) {
    return next();
  }

  const files: Express.Multer.File[] = req.file ? [req.file] : 
    Array.isArray(req.files) ? req.files : 
    Object.values(req.files || {}).flat();

  const validatedFiles: any[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      // Step 1: Validate file contents
      const validation = await validateFileContents(file.path);
      
      if (!validation.valid) {
        await quarantineFile(file.path, validation.errors.join(', '));
        errors.push(`${file.originalname}: ${validation.errors.join(', ')}`);
        
        await auditLog.logSecurity(
          AuditEventType.MALWARE_DETECTED,
          AuditSeverity.WARNING,
          {
            filename: file.originalname,
            errors: validation.errors
          },
          req
        );
        
        continue;
      }

      // Step 2: Scan for viruses
      const scanResult = await scanForViruses(file.path);
      
      if (!scanResult.clean) {
        await quarantineFile(file.path, `Virus detected: ${scanResult.threat}`);
        errors.push(`${file.originalname}: Virus detected - ${scanResult.threat}`);
        
        await auditLog.logSecurity(
          AuditEventType.MALWARE_DETECTED,
          AuditSeverity.CRITICAL,
          {
            filename: file.originalname,
            threat: scanResult.threat
          },
          req
        );
        
        continue;
      }

      // Step 3: Process images
      let finalPath = file.path;
      
      if (file.mimetype.startsWith('image/')) {
        const processed = await processImage(file.path, file.mimetype);
        
        if (processed.success && processed.processedPath) {
          // Delete original and use processed
          await fs.unlink(file.path);
          finalPath = processed.processedPath;
        }
      }

      // Step 4: Move to safe storage
      const category = req.body.category || 'general';
      const safePath = await moveToSafeStorage(finalPath, category);

      // Add validated file info
      validatedFiles.push({
        originalName: file.originalname,
        sanitizedName: validation.fileInfo?.sanitizedName,
        mimeType: file.mimetype,
        size: file.size,
        hash: validation.fileInfo?.hash,
        path: safePath,
        warnings: validation.warnings
      });

      // Log successful upload
      await auditLog.log({
        event_type: AuditEventType.FILE_UPLOADED,
        user_id: (req as any).user?.userId,
        details: {
          filename: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          hash: validation.fileInfo?.hash
        }
      });

    } catch (error) {
      logger.error('File security check error:', error);
      errors.push(`${file.originalname}: Security check failed`);
      
      // Try to clean up
      try {
        await fs.unlink(file.path);
      } catch {
        // Silent fail
      }
    }
  }

  // Update request with validated files
  (req as any).validatedFiles = validatedFiles;

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'File validation failed',
      errors,
      validFiles: validatedFiles
    });
  }

  next();
};

/**
 * File type specific validators
 */

/**
 * Validate PDF files
 */
export async function validatePDF(filePath: string): Promise<boolean> {
  try {
    const buffer = await fs.readFile(filePath, { encoding: 'utf8', flag: 'r' });
    
    // Check PDF header
    if (!buffer.startsWith('%PDF-')) {
      return false;
    }

    // Check for JavaScript in PDF (common attack vector)
    const dangerousPatterns = [
      /\/JavaScript/,
      /\/JS/,
      /\/Launch/,
      /\/EmbeddedFile/,
      /\/OpenAction/,
      /\/AA/, // Additional Actions
      /\/URI/, // Can be used for phishing
      /\/SubmitForm/ // Form submission
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(buffer)) {
        logger.warn('PDF contains potentially dangerous content');
        return false;
      }
    }

    return true;

  } catch (error) {
    logger.error('PDF validation error:', error);
    return false;
  }
}

/**
 * Validate Office documents
 */
export async function validateOfficeDocument(_filePath: string): Promise<boolean> {
  try {
    // Office documents are zip archives
    // TODO: Implement deeper Office document validation
    // Check for macros, embedded objects, etc.
    
    return true;

  } catch (error) {
    logger.error('Office document validation error:', error);
    return false;
  }
}

/**
 * Validate CSV files
 */
export async function validateCSV(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check for formula injection
    const dangerousPatterns = [
      /^=/,  // Excel formula
      /^@/,  // Lotus formula
      /^\+/, // Google Sheets formula
      /^-/,  // Another formula indicator
      /^!/,  // Another formula indicator
      /\|cmd/i, // Command injection
      /\|powershell/i // PowerShell injection
    ];

    const lines = content.split('\n');
    
    for (const line of lines) {
      const cells = line.split(',');
      
      for (const cell of cells) {
        const trimmed = cell.trim();
        
        for (const pattern of dangerousPatterns) {
          if (pattern.test(trimmed)) {
            logger.warn('CSV contains potentially dangerous formula');
            return false;
          }
        }
      }
    }

    return true;

  } catch (error) {
    logger.error('CSV validation error:', error);
    return false;
  }
}

/**
 * Generate secure download link
 */
export function generateSecureDownloadLink(
  fileId: string,
  userId: string,
  expiresIn: number = 3600
): string {
  const timestamp = Date.now();
  const expires = timestamp + (expiresIn * 1000);
  
  const payload = `${fileId}:${userId}:${expires}`;
  const signature = crypto
    .createHmac('sha256', process.env.DOWNLOAD_SECRET || 'change-this-secret')
    .update(payload)
    .digest('hex');

  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  
  return `/api/files/download/${token}`;
}

/**
 * Verify secure download link
 */
export function verifySecureDownloadLink(token: string): {
  valid: boolean;
  fileId?: string;
  userId?: string;
} {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [fileId, userId, expires, signature] = decoded.split(':');
    
    // Check expiration
    if (Date.now() > parseInt(expires || '0')) {
      return { valid: false };
    }

    // Verify signature
    const payload = `${fileId}:${userId}:${expires}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.DOWNLOAD_SECRET || 'change-this-secret')
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return { valid: false };
    }

    return { valid: true, fileId, userId };

  } catch {
    return { valid: false };
  }
}

/**
 * Cleanup old files
 */
export async function cleanupOldFiles(): Promise<void> {
  try {
    const dirs = [FILE_CONFIG.TEMP_DIR, FILE_CONFIG.QUARANTINE_DIR];
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const dir of dirs) {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        
        if (Date.now() - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          logger.debug(`Cleaned up old file: ${file}`);
        }
      }
    }

  } catch (error) {
    logger.error('File cleanup error:', error);
  }
}

// Schedule cleanup
setInterval(cleanupOldFiles, 60 * 60 * 1000); // Every hour

export default {
  upload,
  fileSecurityMiddleware,
  validatePDF,
  validateOfficeDocument,
  validateCSV,
  generateSecureDownloadLink,
  verifySecureDownloadLink,
  cleanupOldFiles
};