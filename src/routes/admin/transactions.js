const express = require('express');
const { query } = require('../../config/database');
const { checkPermission } = require('../../middleware/rbac');
const { auditLogs } = require('../../middleware/auditLog');

const router = express.Router();

// Get all transactions with search and pagination
router.get('/', checkPermission('VIEW_TRANSACTIONS'), async (req, res) => {
  try {
    const { 
      search = '', 
      limit = 50, 
      offset = 0, 
      startDate = '',
      endDate = '',
      minAmount = '',
      maxAmount = '',
      status = '',
      category = '',
      fraudFlag = '',
      sortBy = 'transaction_date',
      sortOrder = 'DESC'
    } = req.query;

    // Build search conditions
    let searchConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      searchConditions.push(`(
        t.transaction_id ILIKE $${paramCount} OR 
        t.merchant_name ILIKE $${paramCount} OR 
        u.username ILIKE $${paramCount} OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    if (startDate) {
      paramCount++;
      searchConditions.push(`t.transaction_date >= $${paramCount}`);
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      searchConditions.push(`t.transaction_date <= $${paramCount}`);
      queryParams.push(endDate);
    }

    if (minAmount) {
      paramCount++;
      searchConditions.push(`t.amount >= $${paramCount}`);
      queryParams.push(parseFloat(minAmount));
    }

    if (maxAmount) {
      paramCount++;
      searchConditions.push(`t.amount <= $${paramCount}`);
      queryParams.push(parseFloat(maxAmount));
    }

    if (status) {
      paramCount++;
      searchConditions.push(`t.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (category) {
      paramCount++;
      searchConditions.push(`t.merchant_category = $${paramCount}`);
      queryParams.push(category);
    }

    if (fraudFlag !== '') {
      paramCount++;
      searchConditions.push(`t.fraud_flag = $${paramCount}`);
      queryParams.push(fraudFlag === 'true');
    }

    const whereClause = searchConditions.length > 0 
      ? `WHERE ${searchConditions.join(' AND ')}`
      : '';

    // Validate sort parameters
    const allowedSortColumns = ['transaction_date', 'amount', 'merchant_name', 'status'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'transaction_date';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get transactions with customer and card info
    const transactionsQuery = `
      SELECT 
        t.transaction_id,
        t.card_id,
        t.customer_id,
        u.username as customer_name,
        c.card_last_four,
        c.card_type,
        t.transaction_date,
        t.post_date,
        t.merchant_name,
        t.merchant_id,
        t.merchant_category,
        t.merchant_category_code,
        t.amount,
        t.currency,
        t.transaction_type,
        t.transaction_method,
        t.status,
        t.decline_reason,
        t.authorization_code,
        t.location_city,
        t.location_state,
        t.location_country,
        t.is_international,
        t.is_online,
        t.fraud_score,
        t.fraud_flag,
        t.is_disputed,
        t.created_at
      FROM transactions t
      JOIN users u ON t.customer_id = u.customer_id
      JOIN cards c ON t.card_id = c.card_id
      ${whereClause}
      ORDER BY t.${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const transactionsResult = await query(transactionsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      JOIN users u ON t.customer_id = u.customer_id
      JOIN cards c ON t.card_id = c.card_id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'DECLINED' THEN 1 END) as declined_count,
        COUNT(CASE WHEN fraud_flag = true THEN 1 END) as fraud_count
      FROM transactions t
      JOIN users u ON t.customer_id = u.customer_id
      JOIN cards c ON t.card_id = c.card_id
      ${whereClause}
    `;
    
    const summaryResult = await query(summaryQuery, queryParams.slice(0, -2));
    const summary = summaryResult.rows[0];

    res.json({
      success: true,
      data: transactionsResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      },
      summary: {
        totalAmount: parseFloat(summary.total_amount || 0),
        averageAmount: parseFloat(summary.average_amount || 0),
        approvedCount: parseInt(summary.approved_count || 0),
        declinedCount: parseInt(summary.declined_count || 0),
        fraudCount: parseInt(summary.fraud_count || 0)
      }
    });
  } catch (error) {
    console.error('Admin transactions list error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching transactions'
      }
    });
  }
});

// Get detailed transaction information
router.get('/:transactionId', checkPermission('VIEW_TRANSACTIONS'), async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Get transaction details
    const transactionQuery = `
      SELECT 
        t.*,
        u.username as customer_name,
        u.email as customer_email,
        c.card_last_four,
        c.card_type,
        c.card_brand,
        c.cardholder_name
      FROM transactions t
      JOIN users u ON t.customer_id = u.customer_id
      JOIN cards c ON t.card_id = c.card_id
      WHERE t.transaction_id = $1
    `;

    const transactionResult = await query(transactionQuery, [transactionId]);
    
    if (transactionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRANSACTION_NOT_FOUND',
          message: 'Transaction not found'
        }
      });
    }

    const transaction = transactionResult.rows[0];

    // Get related alerts
    const alertsQuery = `
      SELECT 
        alert_id,
        alert_type,
        severity,
        alert_date,
        alert_title,
        alert_message,
        status
      FROM alerts 
      WHERE related_transaction_id = $1
      ORDER BY alert_date DESC
    `;
    const alertsResult = await query(alertsQuery, [transactionId]);

    // Get related disputes
    const disputesQuery = `
      SELECT 
        dispute_id,
        dispute_date,
        dispute_reason,
        dispute_amount,
        status,
        customer_description
      FROM disputes 
      WHERE transaction_id = $1
      ORDER BY dispute_date DESC
    `;
    const disputesResult = await query(disputesQuery, [transactionId]);

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
      WHERE n.note_type = 'TRANSACTION' 
        AND n.reference_id = $1
      ORDER BY n.created_at DESC
      LIMIT 20
    `;
    const notesResult = await query(notesQuery, [transactionId]);

    res.json({
      success: true,
      data: {
        ...transaction,
        relatedAlerts: alertsResult.rows,
        relatedDisputes: disputesResult.rows,
        adminNotes: notesResult.rows
      }
    });
  } catch (error) {
    console.error('Admin transaction detail error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching transaction details'
      }
    });
  }
});

// Flag transaction as suspicious
router.post('/:transactionId/flag', checkPermission('VIEW_TRANSACTIONS'), async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason = 'SUSPICIOUS_ACTIVITY', notes = '' } = req.body;

    // Check if transaction exists
    const transactionQuery = `
      SELECT transaction_id, fraud_flag, customer_id 
      FROM transactions 
      WHERE transaction_id = $1
    `;
    const transactionResult = await query(transactionQuery, [transactionId]);

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRANSACTION_NOT_FOUND',
          message: 'Transaction not found'
        }
      });
    }

    const transaction = transactionResult.rows[0];

    // Update fraud flag
    const updateQuery = `
      UPDATE transactions 
      SET fraud_flag = true, 
          fraud_score = GREATEST(fraud_score, 0.8),
          updated_at = CURRENT_TIMESTAMP
      WHERE transaction_id = $1
    `;
    
    await query(updateQuery, [transactionId]);

    // Add admin note
    const noteQuery = `
      INSERT INTO admin_notes (admin_id, note_type, reference_id, note_text, is_internal)
      VALUES ($1, 'TRANSACTION', $2, $3, true)
    `;
    await query(noteQuery, [req.admin.adminId, transactionId, `Transaction flagged as suspicious: ${notes}`]);

    // Create fraud alert
    const alertQuery = `
      INSERT INTO alerts (
        card_id, customer_id, alert_type, severity, alert_date,
        alert_title, alert_message, related_transaction_id, action_required
      )
      SELECT 
        c.card_id, 
        c.customer_id,
        'FRAUD_ALERT',
        'HIGH',
        CURRENT_TIMESTAMP,
        'Transaction Flagged as Suspicious',
        $1,
        $2,
        true
      FROM cards c
      JOIN transactions t ON c.card_id = t.card_id
      WHERE t.transaction_id = $2
    `;
    
    await query(alertQuery, [
      `Transaction ${transactionId} flagged as suspicious by admin. Reason: ${reason}`,
      transactionId
    ]);

    res.json({
      success: true,
      message: 'Transaction flagged as suspicious',
      data: {
        transactionId,
        fraudFlag: true,
        flaggedBy: req.admin.username,
        flaggedAt: new Date().toISOString(),
        reason,
        notes
      }
    });
  } catch (error) {
    console.error('Admin transaction flag error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while flagging the transaction'
      }
    });
  }
});

module.exports = router;
