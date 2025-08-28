import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Apply auth middleware to all document routes
router.use(authMiddleware);

// @route   POST /api/documents/upload
// @desc    Upload document
// @access  Private
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = (req as any).user;
    const { category, vehicleId, leadId } = req.body;

    const document = {
      id: `doc-${Date.now()}`,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      category: category || 'general',
      vehicleId: vehicleId || null,
      leadId: leadId || null,
      uploadedBy: user.userId,
      createdAt: new Date().toISOString()
    };

    // TODO: Save document info to database

    logger.info(`Document uploaded: ${req.file.originalname} by user ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document
      }
    });

  } catch (error) {
    logger.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document'
    });
  }
});

// @route   GET /api/documents
// @desc    Get documents with filtering
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { category, vehicleId, leadId } = req.query;

    const mockDocuments = [
      {
        id: 'doc-1',
        originalName: 'vehicle-inspection.pdf',
        filename: 'document-12345.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
        category: 'vehicle',
        vehicleId: 'vehicle-1',
        leadId: null,
        uploadedBy: 'user-123',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'doc-2',
        originalName: 'credit-application.pdf',
        filename: 'document-12346.pdf',
        size: 512000,
        mimeType: 'application/pdf',
        category: 'customer',
        vehicleId: null,
        leadId: 'lead-1',
        uploadedBy: 'user-123',
        createdAt: '2024-01-15T09:30:00Z'
      }
    ];

    res.json({
      success: true,
      data: {
        documents: mockDocuments
      }
    });

  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents'
    });
  }
});

// @route   GET /api/documents/:id/download
// @desc    Download document
// @access  Private
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Get document info from database and verify user permissions
    
    // For now, return mock response
    res.status(404).json({
      success: false,
      message: 'Document not found or you do not have permission to access it'
    });

  } catch (error) {
    logger.error('Document download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading document'
    });
  }
});

export default router;
