const express = require('express');
const { query } = require('../../config/database');
const { checkPermission } = require('../../middleware/rbac');

const router = express.Router();

// Get audit logs with search and pagination
router.get('/', checkPermission('VIEW_AUDIT_LOGS'), async (req, res) => {
  try {
    const { 
      search = '', 
      limit = 50, 
      offset = 0, 
      adminId = '',
      actionType = '',
      targetType = '',
      startDate = '',
      endDate = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Build search conditions
    let searchConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      searchConditions.push(`(
        al.action_description ILIKE $${paramCount} OR 
        au.username ILIKE $${paramCount} OR
        al.target_id ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    if (adminId) {
      paramCount++;
      searchConditions.push(`al.admin_id = $${paramCount}`);
      queryParams.push(adminId);
    }

    if (actionType) {
      paramCount++;
      searchConditions.push(`al.action_type = $${paramCount}`);
      queryParams.push(actionType);
    }

    if (targetType) {
      paramCount++;
      searchConditions.push(`al.target_type = $${paramCount}`);
      queryParams.push(targetType);
    }

    if (startDate) {
      paramCount++;
      searchConditions.push(`al.created_at >= $${paramCount}`);
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      searchConditions.push(`al.created_at <= $${paramCount}`);
      queryParams.push(endDate);
    }

    const whereClause = searchConditions.length > 0 
      ? `WHERE ${searchConditions.join(' AND ')}`
      : '';

    // Validate sort parameters
    const allowedSortColumns = ['created_at', 'action_type', 'target_type', 'admin_id'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get audit logs with admin info
    const auditQuery = `
      SELECT 
        al.log_id,
        al.admin_id,
        au.username as admin_username,
        au.first_name as admin_first_name,
        au.last_name as admin_last_name,
        al.action_type,
        al.target_type,
        al.target_id,
        al.action_description,
        al.before_value,
        al.after_value,
        al.ip_address,
        al.user_agent,
        al.created_at
      FROM audit_logs al
      LEFT JOIN admin_users au ON al.admin_id = au.admin_id
      ${whereClause}
      ORDER BY al.${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const auditResult = await query(auditQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs al
      LEFT JOIN admin_users au ON al.admin_id = au.admin_id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT al.admin_id) as unique_admins,
        COUNT(DISTINCT al.action_type) as unique_actions,
        COUNT(CASE WHEN al.created_at >= CURRENT_DATE THEN 1 END) as today_logs,
        COUNT(CASE WHEN al.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_logs
      FROM audit_logs al
      LEFT JOIN admin_users au ON al.admin_id = au.admin_id
      ${whereClause}
    `;
    
    const summaryResult = await query(summaryQuery, queryParams.slice(0, -2));
    const summary = summaryResult.rows[0];

    res.json({
      success: true,
      data: auditResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      },
      summary: {
        totalLogs: parseInt(summary.total_logs || 0),
        uniqueAdmins: parseInt(summary.unique_admins || 0),
        uniqueActions: parseInt(summary.unique_actions || 0),
        todayLogs: parseInt(summary.today_logs || 0),
        weekLogs: parseInt(summary.week_logs || 0)
      }
    });
  } catch (error) {
    console.error('Admin audit logs list error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching audit logs'
      }
    });
  }
});

// Get audit log details
router.get('/:logId', checkPermission('VIEW_AUDIT_LOGS'), async (req, res) => {
  try {
    const { logId } = req.params;

    const auditQuery = `
      SELECT 
        al.*,
        au.username as admin_username,
        au.first_name as admin_first_name,
        au.last_name as admin_last_name,
        au.role as admin_role
      FROM audit_logs al
      LEFT JOIN admin_users au ON al.admin_id = au.admin_id
      WHERE al.log_id = $1
    `;

    const auditResult = await query(auditQuery, [logId]);
    
    if (auditResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AUDIT_LOG_NOT_FOUND',
          message: 'Audit log not found'
        }
      });
    }

    const auditLog = auditResult.rows[0];

    res.json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    console.error('Admin audit log detail error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching audit log details'
      }
    });
  }
});

// Get audit log statistics
router.get('/stats/summary', checkPermission('VIEW_AUDIT_LOGS'), async (req, res) => {
  try {
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate = new Date().toISOString()
    } = req.query;

    // Get action type statistics
    const actionStatsQuery = `
      SELECT 
        action_type,
        COUNT(*) as count,
        COUNT(DISTINCT admin_id) as unique_admins
      FROM audit_logs 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY action_type
      ORDER BY count DESC
      LIMIT 10
    `;

    const actionStatsResult = await query(actionStatsQuery, [startDate, endDate]);

    // Get admin activity statistics
    const adminStatsQuery = `
      SELECT 
        au.username,
        au.first_name,
        au.last_name,
        au.role,
        COUNT(al.log_id) as action_count,
        MAX(al.created_at) as last_activity
      FROM audit_logs al
      JOIN admin_users au ON al.admin_id = au.admin_id
      WHERE al.created_at >= $1 AND al.created_at <= $2
      GROUP BY au.admin_id, au.username, au.first_name, au.last_name, au.role
      ORDER BY action_count DESC
      LIMIT 10
    `;

    const adminStatsResult = await query(adminStatsQuery, [startDate, endDate]);

    // Get daily activity
    const dailyActivityQuery = `
      SELECT 
        DATE(created_at) as activity_date,
        COUNT(*) as log_count,
        COUNT(DISTINCT admin_id) as active_admins
      FROM audit_logs 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY activity_date DESC
      LIMIT 30
    `;

    const dailyActivityResult = await query(dailyActivityQuery, [startDate, endDate]);

    res.json({
      success: true,
      data: {
        actionTypes: actionStatsResult.rows,
        adminActivity: adminStatsResult.rows,
        dailyActivity: dailyActivityResult.rows,
        period: {
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Admin audit log stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching audit log statistics'
      }
    });
  }
});

module.exports = router;
