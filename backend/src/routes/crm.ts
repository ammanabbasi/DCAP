import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// Apply auth middleware to all CRM routes
router.use(authMiddleware);

// @route   GET /api/crm/leads
// @desc    Get all leads with pagination and filtering
// @access  Private
router.get('/leads', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
  query('source').optional().isString(),
  query('assignedTo').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const mockLeads = [
      {
        id: 'lead-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        status: 'new',
        source: 'website',
        interestedVehicle: 'Honda Accord',
        budget: 30000,
        notes: 'Interested in financing options',
        assignedTo: 'user-123',
        createdAt: '2024-01-15T09:30:00Z',
        updatedAt: '2024-01-15T09:30:00Z'
      },
      {
        id: 'lead-2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0124',
        status: 'contacted',
        source: 'referral',
        interestedVehicle: 'Toyota Camry',
        budget: 35000,
        notes: 'Called and left message',
        assignedTo: 'user-123',
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-15T10:15:00Z'
      }
    ];

    res.json({
      success: true,
      data: {
        leads: mockLeads,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockLeads.length,
          itemsPerPage: 20
        }
      }
    });

  } catch (error) {
    logger.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads'
    });
  }
});

// @route   POST /api/crm/leads
// @desc    Create new lead
// @access  Private
router.post('/leads', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone('any'),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
  body('source').optional().isString(),
  body('budget').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const leadData = req.body;
    const user = (req as any).user;

    const newLead = {
      id: `lead-${Date.now()}`,
      ...leadData,
      status: leadData.status || 'new',
      assignedTo: user.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    logger.info(`Lead created: ${leadData.firstName} ${leadData.lastName} by user ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: {
        lead: newLead
      }
    });

  } catch (error) {
    logger.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lead'
    });
  }
});

// @route   GET /api/crm/activities
// @desc    Get recent CRM activities
// @access  Private
router.get('/activities', async (req, res) => {
  try {
    const mockActivities = [
      {
        id: 'activity-1',
        type: 'call',
        leadId: 'lead-1',
        leadName: 'John Smith',
        description: 'Called customer to discuss financing options',
        createdBy: 'user-123',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'activity-2',
        type: 'email',
        leadId: 'lead-2',
        leadName: 'Sarah Johnson',
        description: 'Sent vehicle brochure and pricing information',
        createdBy: 'user-123',
        createdAt: '2024-01-15T09:45:00Z'
      }
    ];

    res.json({
      success: true,
      data: {
        activities: mockActivities
      }
    });

  } catch (error) {
    logger.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activities'
    });
  }
});

export default router;
