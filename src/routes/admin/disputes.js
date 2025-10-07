const express = require('express');
const { query } = require('../../config/database');
const { checkPermission } = require('../../middleware/rbac');
const { auditLogs } = require('../../middleware/auditLog');

const router = express.Router();

// Get all disputes with search and pagination
router.get('/', checkPermission('VIEW_DISPUTES'), async (req, res) => {
  try {
    const { 
      search = '', 
      limit = 20, 
      offset = 0, 
      status = '',
      priority = '',
      assignedTo = '',
      startDate = '',
      endDate = '',
      sortBy = 'dispute_date',
      sortOrder = 'DESC'
    } = req.query;

    // Build search conditions
    let searchConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      searchConditions.push(`(
        d.dispute_id ILIKE $${paramCount} OR 
        u.username ILIKE $${paramCount} OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramCount} OR
        t.merchant_name ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      searchConditions.push(`d.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (priority) {
      paramCount++;
      searchConditions.push(`d.priority = $${paramCount}`);
      queryParams.push(priority);
    }

    if (assignedTo) {
      paramCount++;
      searchConditions.push(`d.assigned_to = $${paramCount}`);
      queryParams.push(assignedTo);
    }

    if (startDate) {
      paramCount++;
      searchConditions.push(`d.dispute_date >= $${paramCount}`);
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      searchConditions.push(`d.dispute_date <= $${paramCount}`);
      queryParams.push(endDate);
    }

    const whereClause = searchConditions.length > 0 
      ? `WHERE ${searchConditions.join(' AND ')}`
      : '';

    // Validate sort parameters
    const allowedSortColumns = ['dispute_date', 'dispute_amount', 'status', 'priority'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'dispute_date';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get disputes with customer and transaction info
    const disputesQuery = `
      SELECT 
        d.dispute_id,
        d.transaction_id,
        d.customer_id,
        u.username as customer_name,
        d.dispute_date,
        d.dispute_reason,
        d.dispute_amount,
        d.status,
        d.priority,
        d.customer_description,
        d.resolution_date,
        d.resolution_notes,
        d.refund_amount,
        d.case_number,
        d.assigned_to,
        au.username as assigned_to_username,
        d.resolved_by,
        rau.username as resolved_by_username,
        t.merchant_name,
        t.transaction_date,
        t.amount as transaction_amount,
        c.card_last_four,
        d.created_at,
        d.updated_at,
        EXTRACT(DAYS FROM (CURRENT_DATE - d.dispute_date)) as days_open
      FROM disputes d
      JOIN users u ON d.customer_id = u.customer_id
      JOIN transactions t ON d.transaction_id = t.transaction_id
      JOIN cards c ON d.card_id = c.card_id
      LEFT JOIN admin_users au ON d.assigned_to = au.admin_id
      LEFT JOIN admin_users rau ON d.resolved_by = rau.admin_id
      ${whereClause}
      ORDER BY d.${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const disputesResult = await query(disputesQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM disputes d
      JOIN users u ON d.customer_id = u.customer_id
      JOIN transactions t ON d.transaction_id = t.transaction_id
      JOIN cards c ON d.card_id = c.card_id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_disputes,
        COUNT(CASE WHEN status = 'SUBMITTED' THEN 1 END) as new_disputes,
        COUNT(CASE WHEN status = 'UNDER_REVIEW' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'DENIED' THEN 1 END) as denied,
        SUM(dispute_amount) as total_dispute_amount
      FROM disputes d
      JOIN users u ON d.customer_id = u.customer_id
      JOIN transactions t ON d.transaction_id = t.transaction_id
      JOIN cards c ON d.card_id = c.card_id
      ${whereClause}
    `;
    
    const summaryResult = await query(summaryQuery, queryParams.slice(0, -2));
    const summary = summaryResult.rows[0];

    res.json({
      success: true,
      data: disputesResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      },
      summary: {
        newDisputes: parseInt(summary.new_disputes || 0),
        underReview: parseInt(summary.under_review || 0),
        resolved: parseInt(summary.resolved || 0),
        denied: parseInt(summary.denied || 0),
        totalDisputeAmount: parseFloat(summary.total_dispute_amount || 0)
      }
    });
  } catch (error) {
    console.error('Admin disputes list error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching disputes'
      }
    });
  }
});

// Get detailed dispute information
router.get('/:disputeId', checkPermission('VIEW_DISPUTES'), async (req, res) => {
  try {
    const { disputeId } = req.params;

    // Get dispute details
    const disputeQuery = `
      SELECT 
        d.*,
        u.username as customer_name,
        u.email as customer_email,
        au.username as assigned_to_username,
        rau.username as resolved_by_username,
        t.merchant_name,
        t.merchant_category,
        t.transaction_date,
        t.amount as transaction_amount,
        t.currency,
        t.location_city,
        t.location_state,
        t.location_country,
        c.card_last_four,
        c.card_type,
        c.card_brand
      FROM disputes d
      JOIN users u ON d.customer_id = u.customer_id
      JOIN transactions t ON d.transaction_id = t.transaction_id
      JOIN cards c ON d.card_id = c.card_id
      LEFT JOIN admin_users au ON d.assigned_to = au.admin_id
      LEFT JOIN admin_users rau ON d.resolved_by = rau.admin_id
      WHERE d.dispute_id = $1
    `;

    const disputeResult = await query(disputeQuery, [disputeId]);
    
    if (disputeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISPUTE_NOT_FOUND',
          message: 'Dispute not found'
        }
      });
    }

    const dispute = disputeResult.rows[0];

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
      WHERE n.note_type = 'DISPUTE' 
        AND n.reference_id = $1
      ORDER BY n.created_at DESC
      LIMIT 20
    `;
    const notesResult = await query(notesQuery, [disputeId]);

    res.json({
      success: true,
      data: {
        ...dispute,
        adminNotes: notesResult.rows
      }
    });
  } catch (error) {
    console.error('Admin dispute detail error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching dispute details'
      }
    });
  }
});

// Update dispute status
router.put('/:disputeId', checkPermission('UPDATE_DISPUTES'), auditLogs.disputeUpdate, async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { 
      status, 
      resolutionNotes = '', 
      refundAmount = null,
      priority = null 
    } = req.body;

    // Check if dispute exists
    const disputeQuery = `
      SELECT dispute_id, status, dispute_amount 
      FROM disputes 
      WHERE dispute_id = $1
    `;
    const disputeResult = await query(disputeQuery, [disputeId]);

    if (disputeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISPUTE_NOT_FOUND',
          message: 'Dispute not found'
        }
      });
    }

    const dispute = disputeResult.rows[0];

    // Validate status transition
    const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'DENIED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid dispute status'
        }
      });
    }

    // Build update query
    let updateFields = [];
    let queryParams = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      queryParams.push(status);
    }

    if (priority) {
      paramCount++;
      updateFields.push(`priority = $${paramCount}`);
      queryParams.push(priority);
    }

    if (resolutionNotes) {
      paramCount++;
      updateFields.push(`resolution_notes = $${paramCount}`);
      queryParams.push(resolutionNotes);
    }

    if (refundAmount !== null) {
      paramCount++;
      updateFields.push(`refund_amount = $${paramCount}`);
      queryParams.push(refundAmount);
    }

    if (status === 'RESOLVED' || status === 'DENIED') {
      paramCount++;
      updateFields.push(`resolution_date = $${paramCount}`);
      queryParams.push(new Date().toISOString().split('T')[0]);
      
      paramCount++;
      updateFields.push(`resolved_by = $${paramCount}`);
      queryParams.push(req.admin.adminId);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No valid updates provided'
        }
      });
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    queryParams.push(disputeId);

    const updateQuery = `
      UPDATE disputes 
      SET ${updateFields.join(', ')}
      WHERE dispute_id = $${paramCount}
    `;

    await query(updateQuery, queryParams);

    // Add admin note
    const noteQuery = `
      INSERT INTO admin_notes (admin_id, note_type, reference_id, note_text, is_internal)
      VALUES ($1, 'DISPUTE', $2, $3, true)
    `;
    await query(noteQuery, [
      req.admin.adminId, 
      disputeId, 
      `Dispute updated: ${status ? `Status changed to ${status}` : 'Updated'}${resolutionNotes ? `. Notes: ${resolutionNotes}` : ''}`
    ]);

    res.json({
      success: true,
      message: 'Dispute updated successfully',
      data: {
        disputeId,
        updatedBy: req.admin.username,
        updatedAt: new Date().toISOString(),
        changes: {
          status,
          priority,
          resolutionNotes,
          refundAmount
        }
      }
    });
  } catch (error) {
    console.error('Admin dispute update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating the dispute'
      }
    });
  }
});

// Assign dispute to analyst
router.post('/:disputeId/assign', checkPermission('UPDATE_DISPUTES'), auditLogs.disputeAssign, async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_ASSIGNEE',
          message: 'Assigned admin ID is required'
        }
      });
    }

    // Check if dispute exists
    const disputeQuery = `
      SELECT dispute_id, assigned_to 
      FROM disputes 
      WHERE dispute_id = $1
    `;
    const disputeResult = await query(disputeQuery, [disputeId]);

    if (disputeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISPUTE_NOT_FOUND',
          message: 'Dispute not found'
        }
      });
    }

    // Check if assigned admin exists
    const adminQuery = `
      SELECT admin_id, username, role 
      FROM admin_users 
      WHERE admin_id = $1 AND is_active = true
    `;
    const adminResult = await query(adminQuery, [assignedTo]);

    if (adminResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Assigned admin not found'
        }
      });
    }

    const assignedAdmin = adminResult.rows[0];

    // Update dispute assignment
    const updateQuery = `
      UPDATE disputes 
      SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
      WHERE dispute_id = $2
    `;
    
    await query(updateQuery, [assignedTo, disputeId]);

    // Add admin note
    const noteQuery = `
      INSERT INTO admin_notes (admin_id, note_type, reference_id, note_text, is_internal)
      VALUES ($1, 'DISPUTE', $2, $3, true)
    `;
    await query(noteQuery, [
      req.admin.adminId, 
      disputeId, 
      `Dispute assigned to ${assignedAdmin.username} (${assignedAdmin.role})`
    ]);

    res.json({
      success: true,
      message: 'Dispute assigned successfully',
      data: {
        disputeId,
        assignedTo: assignedAdmin.username,
        assignedBy: req.admin.username,
        assignedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Admin dispute assign error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while assigning the dispute'
      }
    });
  }
});

module.exports = router;
