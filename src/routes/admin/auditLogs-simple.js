const express = require('express');
const { checkPermission } = require('../../middleware/rbac');

const router = express.Router();

// Get audit logs
router.get('/', checkPermission('VIEW_AUDIT_LOGS'), async (req, res) => {
  try {
    const mockAuditLogs = [
      {
        id: 'AUDIT-001',
        timestamp: '2024-10-07T13:30:00Z',
        userId: 'admin',
        action: 'LOGIN',
        resource: 'admin/auth/login',
        details: 'Admin user logged in successfully',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'SUCCESS'
      },
      {
        id: 'AUDIT-002',
        timestamp: '2024-10-07T13:25:00Z',
        userId: 'admin',
        action: 'VIEW_CARDS',
        resource: 'admin/cards',
        details: 'Viewed cards list',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'SUCCESS'
      },
      {
        id: 'AUDIT-003',
        timestamp: '2024-10-07T13:20:00Z',
        userId: 'admin',
        action: 'VIEW_CUSTOMERS',
        resource: 'admin/customers',
        details: 'Viewed customers list',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'SUCCESS'
      }
    ];

    res.json({
      success: true,
      data: {
        auditLogs: mockAuditLogs,
        pagination: {
          total: mockAuditLogs.length,
          limit: 50,
          offset: 0,
          pages: 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching audit logs'
      }
    });
  }
});

module.exports = router;
