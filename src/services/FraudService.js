const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Fraud Service - Handles fraud detection and dispute management
 */
class FraudService {
  // Get disputes for a customer
  async getDisputesByCustomer(customerId) {
    const queryText = `
      SELECT 
        d.dispute_id,
        d.transaction_id,
        d.card_id,
        d.customer_id,
        d.dispute_date,
        d.dispute_reason,
        d.dispute_amount,
        d.status,
        d.customer_description,
        d.case_number,
        d.resolution_date,
        d.resolution_notes,
        d.refund_amount,
        d.created_at,
        d.updated_at,
        t.merchant_name,
        t.amount as transaction_amount,
        t.transaction_date
      FROM disputes d
      JOIN transactions t ON d.transaction_id = t.transaction_id
      WHERE d.customer_id = $1
      ORDER BY d.dispute_date DESC
    `;

    const result = await query(queryText, [customerId]);
    return result.rows.map(row => this.formatDispute(row));
  }

  // Get specific dispute by ID
  async getDisputeById(disputeId, customerId) {
    const queryText = `
      SELECT 
        d.dispute_id,
        d.transaction_id,
        d.card_id,
        d.customer_id,
        d.dispute_date,
        d.dispute_reason,
        d.dispute_amount,
        d.status,
        d.customer_description,
        d.case_number,
        d.resolution_date,
        d.resolution_notes,
        d.refund_amount,
        d.created_at,
        d.updated_at,
        t.merchant_name,
        t.amount as transaction_amount,
        t.transaction_date
      FROM disputes d
      JOIN transactions t ON d.transaction_id = t.transaction_id
      WHERE d.dispute_id = $1 AND d.customer_id = $2
    `;

    const result = await query(queryText, [disputeId, customerId]);
    
    if (result.rows.length === 0) {
      throw new Error('DISPUTE_NOT_FOUND');
    }

    return this.formatDispute(result.rows[0]);
  }

  // File a new dispute
  async fileDispute(customerId, disputeData) {
    const { transactionId, disputeReason, disputeAmount, customerDescription } = disputeData;

    // First, verify the transaction exists and belongs to the customer
    const transactionQuery = `
      SELECT 
        transaction_id,
        card_id,
        amount,
        status,
        transaction_date,
        merchant_name
      FROM transactions
      WHERE transaction_id = $1 AND customer_id = $2
    `;

    const transactionResult = await query(transactionQuery, [transactionId, customerId]);
    
    if (transactionResult.rows.length === 0) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }

    const transaction = transactionResult.rows[0];

    // Check if transaction is eligible for dispute
    const transactionDate = moment(transaction.transaction_date);
    const disputeWindow = moment().subtract(60, 'days');
    
    if (transactionDate.isBefore(disputeWindow)) {
      throw new Error('DISPUTE_NOT_ELIGIBLE');
    }

    if (transaction.status !== 'APPROVED') {
      throw new Error('DISPUTE_NOT_ELIGIBLE');
    }

    // Check if already disputed
    const existingDisputeQuery = `
      SELECT dispute_id FROM disputes 
      WHERE transaction_id = $1
    `;
    const existingDispute = await query(existingDisputeQuery, [transactionId]);
    
    if (existingDispute.rows.length > 0) {
      throw new Error('DISPUTE_ALREADY_EXISTS');
    }

    // Create dispute
    const disputeId = `DSP-${uuidv4().substring(0, 6).toUpperCase()}`;
    const caseNumber = `CASE-${moment().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const disputeDate = moment().format('YYYY-MM-DD');
    const expectedResolutionDate = moment().add(30, 'days').format('YYYY-MM-DD');

    const insertQuery = `
      INSERT INTO disputes (
        dispute_id, transaction_id, card_id, customer_id, dispute_date,
        dispute_reason, dispute_amount, status, customer_description, case_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const disputeResult = await query(insertQuery, [
      disputeId,
      transactionId,
      transaction.card_id,
      customerId,
      disputeDate,
      disputeReason,
      disputeAmount,
      'SUBMITTED',
      customerDescription,
      caseNumber
    ]);

    // Mark transaction as disputed
    await query(
      'UPDATE transactions SET is_disputed = true WHERE transaction_id = $1',
      [transactionId]
    );

    return {
      success: true,
      message: 'Dispute submitted successfully',
      data: {
        disputeId: disputeResult.rows[0].dispute_id,
        transactionId: transactionId,
        status: 'SUBMITTED',
        caseNumber: caseNumber,
        disputeDate: disputeDate,
        expectedResolutionDate: expectedResolutionDate
      }
    };
  }

  // Report suspected fraud
  async reportFraud(customerId, fraudData) {
    const { cardId, description, transactionIds = [] } = fraudData;

    // Verify card belongs to customer
    const cardQuery = `
      SELECT card_id, card_status FROM cards 
      WHERE card_id = $1 AND customer_id = $2
    `;
    const cardResult = await query(cardQuery, [cardId, customerId]);
    
    if (cardResult.rows.length === 0) {
      throw new Error('CARD_NOT_FOUND');
    }

    // Lock the card if it's not already locked
    if (cardResult.rows[0].card_status === 'ACTIVE') {
      await query(
        'UPDATE cards SET card_status = $1, updated_at = $2 WHERE card_id = $3',
        ['LOCKED', new Date().toISOString(), cardId]
      );
    }

    // Create fraud alert
    const alertId = await this.createFraudAlert(cardId, customerId, description, transactionIds);

    return {
      success: true,
      message: 'Fraud report submitted successfully',
      data: {
        cardId: cardId,
        cardStatus: 'LOCKED',
        alertId: alertId,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Create fraud alert
  async createFraudAlert(cardId, customerId, description, transactionIds) {
    const alertQuery = `
      INSERT INTO alerts (
        card_id, customer_id, alert_type, severity, alert_date,
        alert_title, alert_message, related_transaction_id, status, action_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING alert_id
    `;

    const result = await query(alertQuery, [
      cardId,
      customerId,
      'FRAUD_ALERT',
      'HIGH',
      new Date().toISOString(),
      'Fraud Report Submitted',
      description,
      transactionIds.length > 0 ? transactionIds[0] : null,
      'NEW',
      true
    ]);

    return result.rows[0].alert_id;
  }

  // Format dispute data for API response
  formatDispute(row) {
    return {
      disputeId: row.dispute_id,
      transactionId: row.transaction_id,
      cardId: row.card_id,
      customerId: row.customer_id,
      disputeDate: row.dispute_date,
      disputeReason: row.dispute_reason,
      disputeAmount: parseFloat(row.dispute_amount),
      status: row.status,
      customerDescription: row.customer_description,
      caseNumber: row.case_number,
      resolutionDate: row.resolution_date,
      resolutionNotes: row.resolution_notes,
      refundAmount: row.refund_amount ? parseFloat(row.refund_amount) : null,
      transaction: {
        merchantName: row.merchant_name,
        amount: parseFloat(row.transaction_amount),
        transactionDate: row.transaction_date
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = new FraudService();
