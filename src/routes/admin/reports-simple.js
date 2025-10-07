const express = require('express');
const { checkPermission } = require('../../middleware/rbac');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', checkPermission('GENERATE_REPORTS'), async (req, res) => {
  try {
    const mockStats = {
      totalCards: 1247,
      activeCards: 1189,
      totalTransactions: 15420,
      transactionVolume: 2847500.50,
      criticalAlerts: 3,
      totalCustomers: 892,
      activeCustomers: 856,
      thisWeekTransactions: 2340,
      thisMonthTransactions: 15420,
      thisWeekVolume: 456780.25,
      thisMonthVolume: 2847500.50,
      fraudAlerts: 3,
      disputedTransactions: 12,
      pendingApprovals: 8,
      // Add missing fields that the dashboard expects
      transactionsToday: 156,
      transactionVolumeToday: 23450.75,
      cardsToday: 8,
      alertsToday: 2,
      customersToday: 12,
      disputesToday: 1
    };

    res.json({
      success: true,
      data: mockStats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching dashboard statistics'
      }
    });
  }
});

// Get reports
router.get('/', checkPermission('GENERATE_REPORTS'), async (req, res) => {
  try {
    const mockReports = [
      {
        id: 'RPT-001',
        name: 'Daily Transaction Summary',
        type: 'TRANSACTION',
        status: 'COMPLETED',
        generatedAt: '2024-10-07T10:00:00Z',
        period: '2024-10-06',
        recordCount: 150,
        fileSize: '2.5MB'
      },
      {
        id: 'RPT-002',
        name: 'Card Activity Report',
        type: 'CARD',
        status: 'COMPLETED',
        generatedAt: '2024-10-07T09:30:00Z',
        period: '2024-10-01 to 2024-10-07',
        recordCount: 75,
        fileSize: '1.8MB'
      },
      {
        id: 'RPT-003',
        name: 'Fraud Alert Summary',
        type: 'FRAUD',
        status: 'IN_PROGRESS',
        generatedAt: null,
        period: '2024-10-07',
        recordCount: 0,
        fileSize: '0MB'
      }
    ];

    res.json({
      success: true,
      data: {
        reports: mockReports,
        summary: {
          total: mockReports.length,
          completed: mockReports.filter(r => r.status === 'COMPLETED').length,
          inProgress: mockReports.filter(r => r.status === 'IN_PROGRESS').length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching reports'
      }
    });
  }
});

module.exports = router;
