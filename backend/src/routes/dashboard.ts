import express from 'express';
import { authMiddleware } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// Apply auth middleware to all dashboard routes
router.use(authMiddleware);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const mockStats = {
      vehicles: {
        total: 245,
        available: 189,
        sold: 45,
        pending: 11,
        monthlyChange: 5.2
      },
      leads: {
        total: 156,
        new: 23,
        contacted: 45,
        qualified: 34,
        closed: 54,
        conversionRate: 34.6,
        monthlyChange: 12.3
      },
      sales: {
        thisMonth: 850000,
        lastMonth: 720000,
        monthlyChange: 18.1,
        avgDealValue: 28500,
        totalThisYear: 8400000
      },
      revenue: {
        thisMonth: 125000,
        lastMonth: 108000,
        monthlyChange: 15.7,
        totalThisYear: 1240000
      }
    };

    res.json({
      success: true,
      data: mockStats
    });

  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

// @route   GET /api/dashboard/charts
// @desc    Get data for dashboard charts
// @access  Private
router.get('/charts', async (req, res) => {
  try {
    const mockChartData = {
      salesTrend: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [650000, 720000, 580000, 890000, 760000, 850000]
      },
      leadsBySource: {
        labels: ['Website', 'Referral', 'Walk-in', 'Social Media', 'Advertising'],
        data: [45, 30, 25, 15, 10]
      },
      vehiclesByStatus: {
        labels: ['Available', 'Sold', 'Pending'],
        data: [189, 45, 11]
      },
      monthlyPerformance: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        leads: [25, 30, 22, 28],
        sales: [12, 15, 10, 18]
      }
    };

    res.json({
      success: true,
      data: mockChartData
    });

  } catch (error) {
    logger.error('Get dashboard charts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chart data'
    });
  }
});

export default router;
