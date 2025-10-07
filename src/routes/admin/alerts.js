const express = require('express');
const { query } = require('../../config/database');
const { checkPermission } = require('../../middleware/rbac');
const { auditLogs } = require('../../middleware/auditLog');

const router = express.Router();

// Get all alerts with search and pagination
router.get('/', checkPermission('VIEW_ALERTS'), async (req, res) => {
  try {
    const { 
      search = '', 
      limit = 20, 
      offset = 0, 
      severity = '',
      type = '',
      status = '',
      startDate = '',
      endDate = '',
      sortBy = 'alert_date',
      sortOrder = 'DESC'
    } = req.query;

    // Build search conditions
    let searchConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      searchConditions.push(`(
        a.alert_id::text ILIKE $${paramCount} OR 
        u.username ILIKE $${paramCount} OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramCount} OR
        a.alert_title ILIKE $${paramCount} OR
        a.alert_message ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    if (severity) {
      paramCount++;
      searchConditions.push(`a.severity = $${paramCount}`);
      queryParams.push(severity);
    }

    if (type) {
      paramCount++;
      searchConditions.push(`a.alert_type = $${paramCount}`);
      queryParams.push(type);
    }

    if (status) {
      paramCount++;
      searchConditions.push(`a.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (startDate) {
      paramCount++;
      searchConditions.push(`a.alert_date >= $${paramCount}`);
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      searchConditions.push(`a.alert_date <= $${paramCount}`);
      queryParams.push(endDate);
    }

    const whereClause = searchConditions.length > 0 
      ? `WHERE ${searchConditions.join(' AND ')}`
      : '';

    // Validate sort parameters
    const allowedSortColumns = ['alert_date', 'severity', 'alert_type', 'status'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'alert_date';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get alerts with customer and card info
    const alertsQuery = `
      SELECT 
        a.alert_id,
        a.card_id,
        a.customer_id,
        u.username as customer_name,
        c.card_last_four,
        c.card_type,
        a.alert_type,
        a.severity,
        a.alert_date,
        a.alert_title,
        a.alert_message,
        a.related_transaction_id,
        a.status,
        a.read_date,
        a.action_required,
        a.notification_sent,
        a.reviewed_by,
        au.username as reviewed_by_username,
        a.reviewed_at,
        a.created_at
      FROM alerts a
      JOIN users u ON a.customer_id = u.customer_id
      JOIN cards c ON a.card_id = c.card_id
      LEFT JOIN admin_users au ON a.reviewed_by = au.admin_id
      ${whereClause}
      ORDER BY a.${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const alertsResult = await query(alertsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM alerts a
      JOIN users u ON a.customer_id = u.customer_id
      JOIN cards c ON a.card_id = c.card_id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_alerts,
        COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END) as critical_alerts,
        COUNT(CASE WHEN severity = 'HIGH' THEN 1 END) as high_alerts,
        COUNT(CASE WHEN severity = 'MEDIUM' THEN 1 END) as medium_alerts,
        COUNT(CASE WHEN severity = 'LOW' THEN 1 END) as low_alerts,
        COUNT(CASE WHEN status = 'NEW' THEN 1 END) as new_alerts,
        COUNT(CASE WHEN action_required = true THEN 1 END) as require_action
      FROM alerts a
      JOIN users u ON a.customer_id = u.customer_id
      JOIN cards c ON a.card_id = c.card_id
      ${whereClause}
    `;
    
    const summaryResult = await query(summaryQuery, queryParams.slice(0, -2));
    const summary = summaryResult.rows[0];

    res.json({
      success: true,
      data: alertsResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      },
      summary: {
        criticalAlerts: parseInt(summary.critical_alerts || 0),
        highAlerts: parseInt(summary.high_alerts || 0),
        mediumAlerts: parseInt(summary.medium_alerts || 0),
        lowAlerts: parseInt(summary.low_alerts || 0),
        newAlerts: parseInt(summary.new_alerts || 0),
        requireAction: parseInt(summary.require_action || 0)
      }
    });
  } catch (error) {
    console.error('Admin alerts list error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching alerts'
      }
    });
  }
});

// Get detailed alert information
router.get('/:alertId', checkPermission('VIEW_ALERTS'), async (req, res) => {
  try {
    const { alertId } = req.params;

    // Get alert details
    const alertQuery = `
      SELECT 
        a.*,
        u.username as customer_name,
        u.email as customer_email,
        c.card_last_four,
        c.card_type,
        c.card_brand,
        au.username as reviewed_by_username
      FROM alerts a
      JOIN users u ON a.customer_id = u.customer_id
      JOIN cards c ON a.card_id = c.card_id
      LEFT JOIN admin_users au ON a.reviewed_by = au.admin_id
      WHERE a.alert_id = $1
    `;

    const alertResult = await query(alertQuery, [alertId]);
    
    if (alertResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ALERT_NOT_FOUND',
          message: 'Alert not found'
        }
      });
    }

    const alert = alertResult.rows[0];

    // Get related transaction if exists
    let relatedTransaction = null;
    if (alert.related_transaction_id) {
      const transactionQuery = `
        SELECT 
          transaction_id,
          transaction_date,
          merchant_name,
          amount,
          currency,
          status,
          fraud_score
        FROM transactions 
        WHERE transaction_id = $1
      `;
      const transactionResult = await query(transactionQuery, [alert.related_transaction_id]);
      relatedTransaction = transactionResult.rows[0] || null;
    }

    // Get admin notes
    const notesQuery = `
      SELECT 
        n.note_id,
        n.note_text,
        n.is_internal,
        n.created_at,
        au.username as admin_username
      FROM admin_notes n
      JOIN admin_users au ON n.admin_id = au.admin_id
      WHERE n.note_type = 'ALERT' 
        AND n.reference_id = $1
      ORDER BY n.created_at DESC
      LIMIT 20
    `;
    const notesResult = await query(notesQuery, [alertId]);

    res.json({
      success: true,
      data: {
        ...alert,
        relatedTransaction,
        adminNotes: notesResult.rows
      }
    });
  } catch (error) {
    console.error('Admin alert detail error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching alert details'
      }
    });
  }
});

// Mark alert as reviewed
router.put('/:alertId/review', checkPermission('DISMISS_ALERTS'), auditLogs.alertReview, async (req, res) => {
  try {
    const { alertId } = req.params;
    const { 
      reviewNotes = '', 
      actionTaken = 'REVIEWED',
      dismiss = false 
    } = req.body;

    // Check if alert exists
    const alertQuery = `
      SELECT alert_id, status, action_required 
      FROM alerts 
      WHERE alert_id = $1
    `;
    const alertResult = await query(alertQuery, [alertId]);

    if (alertResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ALERT_NOT_FOUND',
          message: 'Alert not found'
        }
      });
    }

    const alert = alertResult.rows[0];

    // Update alert status
    const newStatus = dismiss ? 'RESOLVED' : 'REVIEWED';
    const updateQuery = `
      UPDATE alerts 
      SET status = $1, 
          reviewed_by = $2, 
          reviewed_at = $3,
          action_required = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE alert_id = $4
    `;
    
    await query(updateQuery, [
      newStatus, 
      req.admin.adminId, 
      new Date().toISOString(), 
      alertId
    ]);

    // Add admin note
    const noteQuery = `
      INSERT INTO admin_notes (admin_id, note_type, reference_id, note_text, is_internal)
      VALUES ($1, 'ALERT', $2, $3, true)
    `;
    await query(noteQuery, [
      req.admin.adminId, 
      alertId, 
      `Alert ${dismiss ? 'dismissed' : 'reviewed'}: ${actionTaken}${reviewNotes ? `. Notes: ${reviewNotes}` : ''}`
    ]);

    res.json({
      success: true,
      message: `Alert ${dismiss ? 'dismissed' : 'reviewed'} successfully`,
      data: {
        alertId,
        newStatus,
        reviewedBy: req.admin.username,
        reviewedAt: new Date().toISOString(),
        actionTaken,
        reviewNotes
      }
    });
  } catch (error) {
    console.error('Admin alert review error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while reviewing the alert'
      }
    });
  }
});

// Dismiss alert
router.post('/:alertId/dismiss', checkPermission('DISMISS_ALERTS'), auditLogs.alertDismiss, async (req, res) => {
  try {
    const { alertId } = req.params;
    const { reason = 'ADMIN_DISMISSED', notes = '' } = req.body;

    // Check if alert exists
    const alertQuery = `
      SELECT alert_id, status 
      FROM alerts 
      WHERE alert_id = $1
    `;
    const alertResult = await query(alertQuery, [alertId]);

    if (alertResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ALERT_NOT_FOUND',
          message: 'Alert not found'
        }
      });
    }

    const alert = alertResult.rows[0];

    if (alert.status === 'RESOLVED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALERT_ALREADY_RESOLVED',
          message: 'Alert is already resolved'
        }
      });
    }

    // Dismiss the alert
    const dismissQuery = `
      UPDATE alerts 
      SET status = 'RESOLVED', 
          reviewed_by = $1, 
          reviewed_at = $2,
          action_required = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE alert_id = $3
    `;
    
    await query(dismissQuery, [req.admin.adminId, new Date().toISOString(), alertId]);

    // Add admin note
    const noteQuery = `
      INSERT INTO admin_notes (admin_id, note_type, reference_id, note_text, is_internal)
      VALUES ($1, 'ALERT', $2, $3, true)
    `;
    await query(noteQuery, [
      req.admin.adminId, 
      alertId, 
      `Alert dismissed: ${reason}${notes ? `. Notes: ${notes}` : ''}`
    ]);

    res.json({
      success: true,
      message: 'Alert dismissed successfully',
      data: {
        alertId,
        dismissedBy: req.admin.username,
        dismissedAt: new Date().toISOString(),
        reason,
        notes
      }
    });
  } catch (error) {
    console.error('Admin alert dismiss error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while dismissing the alert'
      }
    });
  }
});

module.exports = router;
