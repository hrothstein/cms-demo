const express = require('express');
const { query } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { submitDisputeToHBR, fetchDisputeStatusFromHBR } = require('../services/mulesoft');

const router = express.Router();

// POST /api/v1/disputes - Submit a new dispute
router.post('/', authenticateToken, validate(schemas.dispute), async (req, res, next) => {
  try {
    const { transactionId, disputeType, disputeReason, disputeAmount, supportingDocuments } = req.body;

    // Verify transaction belongs to user
    const transactionResult = await query(
      'SELECT transaction_id, card_id, amount FROM transactions WHERE transaction_id = $1 AND customer_id = $2',
      [transactionId, req.user.customer_id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactionResult.rows[0];

    // Check if transaction is already disputed
    if (transaction.is_disputed) {
      return res.status(400).json({
        success: false,
        message: 'Transaction is already disputed'
      });
    }

    // Generate dispute ID
    const disputeId = `DSP${Date.now()}`;

    // Create dispute
    await query(
      `INSERT INTO disputes (
        dispute_id, customer_id, card_id, transaction_id,
        dispute_type, dispute_reason, dispute_status, dispute_amount,
        document_urls
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        disputeId,
        req.user.customer_id,
        transaction.card_id,
        transactionId,
        disputeType,
        disputeReason,
        'SUBMITTED',
        disputeAmount,
        supportingDocuments || []
      ]
    );

    // Mark transaction as disputed
    await query(
      'UPDATE transactions SET is_disputed = TRUE, dispute_id = $1 WHERE transaction_id = $2',
      [disputeId, transactionId]
    );

    // Add to dispute timeline
    await query(
      `INSERT INTO dispute_timeline (
        dispute_id, event_type, event_description, old_status, new_status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        disputeId,
        'STATUS_CHANGE',
        'Dispute submitted by customer',
        null,
        'SUBMITTED',
        'CUSTOMER'
      ]
    );

    // Submit to HBR fraud system via MuleSoft
    await submitDisputeToHBR({
      disputeId,
      customerId: req.user.customer_id,
      cardId: transaction.card_id,
      transactionId,
      disputeType,
      disputeReason,
      disputeAmount
    });

    // Log the action
    await query(
      'INSERT INTO audit_log (customer_id, card_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        req.user.customer_id,
        transaction.card_id,
        'SUBMIT_DISPUTE',
        `Dispute submitted for transaction ${transactionId}`,
        'DISPUTE',
        disputeId,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Dispute submitted successfully',
      data: {
        disputeId,
        customerId: req.user.customer_id,
        cardId: transaction.card_id,
        transactionId,
        disputeType,
        disputeReason,
        disputeStatus: 'SUBMITTED',
        disputeAmount,
        provisionalCreditIssued: false,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/v1/disputes - Get all disputes for authenticated user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { status } = req.query;

    let whereClause = 'WHERE d.customer_id = $1';
    let queryParams = [req.user.customer_id];

    if (status) {
      whereClause += ' AND d.dispute_status = $2';
      queryParams.push(status);
    }

    const disputesResult = await query(
      `SELECT 
        d.dispute_id,
        d.customer_id,
        d.card_id,
        d.transaction_id,
        d.dispute_type,
        d.dispute_status,
        d.dispute_amount,
        d.provisional_credit_issued,
        d.provisional_credit_amount,
        d.provisional_credit_date,
        d.submitted_at,
        d.updated_at
      FROM disputes d
      ${whereClause}
      ORDER BY d.submitted_at DESC`,
      queryParams
    );

    const disputes = disputesResult.rows.map(dispute => ({
      disputeId: dispute.dispute_id,
      customerId: dispute.customer_id,
      cardId: dispute.card_id,
      transactionId: dispute.transaction_id,
      disputeType: dispute.dispute_type,
      disputeStatus: dispute.dispute_status,
      disputeAmount: parseFloat(dispute.dispute_amount),
      provisionalCreditIssued: dispute.provisional_credit_issued,
      provisionalCreditAmount: dispute.provisional_credit_amount ? parseFloat(dispute.provisional_credit_amount) : null,
      provisionalCreditDate: dispute.provisional_credit_date,
      submittedAt: dispute.submitted_at,
      updatedAt: dispute.updated_at
    }));

    res.json({
      success: true,
      data: {
        disputes
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/v1/disputes/:disputeId - Get specific dispute details
router.get('/:disputeId', authenticateToken, async (req, res, next) => {
  try {
    const { disputeId } = req.params;

    const disputeResult = await query(
      `SELECT 
        d.dispute_id,
        d.customer_id,
        d.card_id,
        d.transaction_id,
        d.dispute_type,
        d.dispute_reason,
        d.dispute_status,
        d.dispute_amount,
        d.resolution_notes,
        d.resolved_at,
        d.resolved_in_favor,
        d.provisional_credit_issued,
        d.provisional_credit_amount,
        d.provisional_credit_date,
        d.document_urls,
        d.submitted_at,
        d.updated_at
      FROM disputes d
      WHERE d.dispute_id = $1 AND d.customer_id = $2`,
      [disputeId, req.user.customer_id]
    );

    if (disputeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const dispute = disputeResult.rows[0];

    // Get dispute timeline
    const timelineResult = await query(
      `SELECT 
        timeline_id,
        event_type,
        event_description,
        old_status,
        new_status,
        created_by,
        created_at
      FROM dispute_timeline
      WHERE dispute_id = $1
      ORDER BY created_at ASC`,
      [disputeId]
    );

    const timeline = timelineResult.rows.map(event => ({
      timelineId: event.timeline_id,
      eventType: event.event_type,
      eventDescription: event.event_description,
      oldStatus: event.old_status,
      newStatus: event.new_status,
      createdBy: event.created_by,
      createdAt: event.created_at
    }));

    const disputeData = {
      disputeId: dispute.dispute_id,
      customerId: dispute.customer_id,
      cardId: dispute.card_id,
      transactionId: dispute.transaction_id,
      disputeType: dispute.dispute_type,
      disputeReason: dispute.dispute_reason,
      disputeStatus: dispute.dispute_status,
      disputeAmount: parseFloat(dispute.dispute_amount),
      resolutionNotes: dispute.resolution_notes,
      resolvedAt: dispute.resolved_at,
      resolvedInFavor: dispute.resolved_in_favor,
      provisionalCreditIssued: dispute.provisional_credit_issued,
      provisionalCreditAmount: dispute.provisional_credit_amount ? parseFloat(dispute.provisional_credit_amount) : null,
      provisionalCreditDate: dispute.provisional_credit_date,
      documentUrls: dispute.document_urls || [],
      submittedAt: dispute.submitted_at,
      updatedAt: dispute.updated_at,
      timeline
    };

    res.json({
      success: true,
      data: {
        dispute: disputeData
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/v1/disputes/:disputeId/comments - Add comment to dispute
router.post('/:disputeId/comments', authenticateToken, validate(schemas.disputeComment), async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { comment } = req.body;

    // Verify dispute belongs to user
    const disputeResult = await query(
      'SELECT dispute_id, dispute_status FROM disputes WHERE dispute_id = $1 AND customer_id = $2',
      [disputeId, req.user.customer_id]
    );

    if (disputeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const dispute = disputeResult.rows[0];

    if (dispute.dispute_status === 'RESOLVED' || dispute.dispute_status === 'DENIED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add comments to closed disputes'
      });
    }

    // Add comment to timeline
    const timelineResult = await query(
      `INSERT INTO dispute_timeline (
        dispute_id, event_type, event_description, created_by
      ) VALUES ($1, $2, $3, $4)
      RETURNING timeline_id, created_at`,
      [
        disputeId,
        'COMMENT_ADDED',
        comment,
        'CUSTOMER'
      ]
    );

    const timelineEvent = timelineResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Comment added to dispute',
      data: {
        timelineId: timelineEvent.timeline_id,
        eventType: 'COMMENT_ADDED',
        eventDescription: comment,
        createdBy: 'CUSTOMER',
        createdAt: timelineEvent.created_at
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
