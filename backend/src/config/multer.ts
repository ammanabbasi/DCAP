import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';

// File type mappings
const FILE_TYPES = {
  images: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  documents: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx'],
    maxSize: 25 * 1024 * 1024, // 25MB
  },
  videos: {
    mimeTypes: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
    extensions: ['.mp4', '.mpeg', '.mov', '.avi'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  spreadsheets: {
    mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
    extensions: ['.xls', '.xlsx', '.csv'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
};

// Generate unique filename
const generateFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .substring(0, 50);
  
  return `${timestamp}-${randomString}-${baseName}${extension}`;
};

// File filter function
const createFileFilter = (allowedTypes: string[]) => {
  return (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedMimeTypes: string[] = [];
    const allowedExtensions: string[] = [];

    allowedTypes.forEach(type => {
      if (FILE_TYPES[type as keyof typeof FILE_TYPES]) {
        allowedMimeTypes.push(...FILE_TYPES[type as keyof typeof FILE_TYPES].mimeTypes);
        allowedExtensions.push(...FILE_TYPES[type as keyof typeof FILE_TYPES].extensions);
      }
    });

    const extension = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
      callback(null, true);
    } else {
      callback(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`));
    }
  };
};

// Get max file size based on file types
const _getMaxFileSize = (allowedTypes: string[]): number => {
  let maxSize = 0;
  
  allowedTypes.forEach(type => {
    if (FILE_TYPES[type as keyof typeof FILE_TYPES]) {
      const typeMaxSize = FILE_TYPES[type as keyof typeof FILE_TYPES].maxSize;
      if (typeMaxSize > maxSize) {
        maxSize = typeMaxSize;
      }
    }
  });
  
  return maxSize || 10 * 1024 * 1024; // Default 10MB
};

// Memory storage configuration (for Azure Blob Storage)
const memoryStorage = multer.memoryStorage();

// Disk storage configuration (for local storage)
const _diskStorage = multer.diskStorage({
  destination: (_req, file, callback) => {
    // Determine destination based on file type
    let folder = 'uploads/misc';
    
    if (FILE_TYPES.images.mimeTypes.includes(file.mimetype)) {
      folder = 'uploads/images';
    } else if (FILE_TYPES.documents.mimeTypes.includes(file.mimetype)) {
      folder = 'uploads/documents';
    } else if (FILE_TYPES.videos.mimeTypes.includes(file.mimetype)) {
      folder = 'uploads/videos';
    } else if (FILE_TYPES.spreadsheets.mimeTypes.includes(file.mimetype)) {
      folder = 'uploads/spreadsheets';
    }
    
    callback(null, folder);
  },
  filename: (_req, file, callback) => {
    callback(null, generateFilename(file.originalname));
  },
});

// Create multer configurations
export const uploadConfigs = {
  // Vehicle images upload
  vehicleImages: multer({
    storage: memoryStorage,
    fileFilter: createFileFilter(['images']),
    limits: {
      fileSize: FILE_TYPES.images.maxSize,
      files: 20, // Max 20 images per vehicle
    },
  }),

  // Document upload
  documents: multer({
    storage: memoryStorage,
    fileFilter: createFileFilter(['documents', 'images']),
    limits: {
      fileSize: FILE_TYPES.documents.maxSize,
      files: 10,
    },
  }),

  // Profile avatar upload
  avatar: multer({
    storage: memoryStorage,
    fileFilter: createFileFilter(['images']),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB for avatars
      files: 1,
    },
  }),

  // Vehicle inspection report
  inspectionReport: multer({
    storage: memoryStorage,
    fileFilter: createFileFilter(['documents', 'images', 'spreadsheets']),
    limits: {
      fileSize: FILE_TYPES.documents.maxSize,
      files: 5,
    },
  }),

  // Import data (CSV/Excel)
  dataImport: multer({
    storage: memoryStorage,
    fileFilter: createFileFilter(['spreadsheets']),
    limits: {
      fileSize: FILE_TYPES.spreadsheets.maxSize,
      files: 1,
    },
  }),

  // Video upload
  video: multer({
    storage: memoryStorage,
    fileFilter: createFileFilter(['videos']),
    limits: {
      fileSize: FILE_TYPES.videos.maxSize,
      files: 3,
    },
  }),

  // General file upload
  general: multer({
    storage: memoryStorage,
    fileFilter: createFileFilter(['images', 'documents', 'spreadsheets']),
    limits: {
      fileSize: 25 * 1024 * 1024, // 25MB
      files: 10,
    },
  }),
};

// Middleware to handle multer errors
export const handleMulterError = (error: any, _req: Request, res: any, _next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large',
        code: 'FILE_TOO_LARGE',
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded',
        code: 'TOO_MANY_FILES',
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
        code: 'UNEXPECTED_FILE_FIELD',
      });
    }
    
    return res.status(400).json({
      success: false,
      message: error.message,
      code: 'MULTER_ERROR',
    });
  }
  
  if (error && error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: 'INVALID_FILE_TYPE',
    });
  }
  
  next(error);
};

// Helper function to validate file before upload
export const validateFile = (file: Express.Multer.File, options: {
  allowedTypes?: string[];
  maxSize?: number;
}): { valid: boolean; error?: string } => {
  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${options.maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (options.allowedTypes) {
    const allowedMimeTypes: string[] = [];
    const allowedExtensions: string[] = [];

    options.allowedTypes.forEach(type => {
      if (FILE_TYPES[type as keyof typeof FILE_TYPES]) {
        allowedMimeTypes.push(...FILE_TYPES[type as keyof typeof FILE_TYPES].mimeTypes);
        allowedExtensions.push(...FILE_TYPES[type as keyof typeof FILE_TYPES].extensions);
      }
    });

    const extension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`,
      };
    }
  }

  return { valid: true };
};

export default uploadConfigs;