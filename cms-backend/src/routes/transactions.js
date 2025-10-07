const express = require('express');
const { query } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/v1/cards/:cardId/transactions - Get transactions for a specific card
router.get('/cards/:cardId/transactions', authenticateToken, validate(schemas.transactionQuery), async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { startDate, endDate, limit, offset, status, minAmount, maxAmount } = req.query;

    // Verify card belongs to user
    const cardResult = await query(
      'SELECT card_id FROM cards WHERE card_id = $1 AND customer_id = $2',
      [cardId, req.user.customer_id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Build query with filters
    let whereConditions = ['t.card_id = $1'];
    let queryParams = [cardId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      whereConditions.push(`t.transaction_date >= $${paramCount}`);
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      whereConditions.push(`t.transaction_date <= $${paramCount}`);
      queryParams.push(endDate);
    }

    if (status) {
      paramCount++;
      whereConditions.push(`t.transaction_status = $${paramCount}`);
      queryParams.push(status);
    }

    if (minAmount) {
      paramCount++;
      whereConditions.push(`t.amount >= $${paramCount}`);
      queryParams.push(minAmount);
    }

    if (maxAmount) {
      paramCount++;
      whereConditions.push(`t.amount <= $${paramCount}`);
      queryParams.push(maxAmount);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM transactions t WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total);

    // Get transactions with pagination
    paramCount++;
    queryParams.push(limit);
    paramCount++;
    queryParams.push(offset);

    const transactionsResult = await query(
      `SELECT 
        t.transaction_id,
        t.card_id,
        t.merchant_name,
        t.merchant_category,
        t.merchant_city,
        t.merchant_state,
        t.merchant_country,
        t.amount,
        t.currency,
        t.original_amount,
        t.original_currency,
        t.exchange_rate,
        t.fees,
        t.transaction_type,
        t.transaction_status,
        t.authorization_code,
        t.is_disputed,
        t.is_fraudulent,
        t.transaction_date,
        t.posted_date
      FROM transactions t
      WHERE ${whereClause}
      ORDER BY t.transaction_date DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      queryParams
    );

    const transactions = transactionsResult.rows.map(txn => ({
      transactionId: txn.transaction_id,
      cardId: txn.card_id,
      merchantName: txn.merchant_name,
      merchantCategory: txn.merchant_category,
      merchantCity: txn.merchant_city,
      merchantState: txn.merchant_state,
      merchantCountry: txn.merchant_country,
      amount: parseFloat(txn.amount),
      currency: txn.currency,
      originalAmount: txn.original_amount ? parseFloat(txn.original_amount) : null,
      originalCurrency: txn.original_currency,
      exchangeRate: txn.exchange_rate ? parseFloat(txn.exchange_rate) : null,
      fees: parseFloat(txn.fees),
      transactionType: txn.transaction_type,
      transactionStatus: txn.transaction_status,
      authorizationCode: txn.authorization_code,
      isDisputed: txn.is_disputed,
      isFraudulent: txn.is_fraudulent,
      transactionDate: txn.transaction_date,
      postedDate: txn.posted_date
    }));

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/v1/transactions/:transactionId - Get specific transaction details
router.get('/:transactionId', authenticateToken, async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transactionResult = await query(
      `SELECT 
        t.transaction_id,
        t.card_id,
        t.customer_id,
        t.merchant_name,
        t.merchant_category,
        t.merchant_city,
        t.merchant_state,
        t.merchant_country,
        t.merchant_lat,
        t.merchant_lon,
        t.amount,
        t.currency,
        t.original_amount,
        t.original_currency,
        t.exchange_rate,
        t.fees,
        t.transaction_type,
        t.transaction_status,
        t.authorization_code,
        t.is_disputed,
        t.dispute_id,
        t.is_fraudulent,
        t.transaction_date,
        t.posted_date
      FROM transactions t
      WHERE t.transaction_id = $1 AND t.customer_id = $2`,
      [transactionId, req.user.customer_id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const txn = transactionResult.rows[0];

    const transaction = {
      transactionId: txn.transaction_id,
      cardId: txn.card_id,
      customerId: txn.customer_id,
      merchantName: txn.merchant_name,
      merchantCategory: txn.merchant_category,
      merchantCity: txn.merchant_city,
      merchantState: txn.merchant_state,
      merchantCountry: txn.merchant_country,
      merchantLat: txn.merchant_lat ? parseFloat(txn.merchant_lat) : null,
      merchantLon: txn.merchant_lon ? parseFloat(txn.merchant_lon) : null,
      amount: parseFloat(txn.amount),
      currency: txn.currency,
      originalAmount: txn.original_amount ? parseFloat(txn.original_amount) : null,
      originalCurrency: txn.original_currency,
      exchangeRate: txn.exchange_rate ? parseFloat(txn.exchange_rate) : null,
      fees: parseFloat(txn.fees),
      transactionType: txn.transaction_type,
      transactionStatus: txn.transaction_status,
      authorizationCode: txn.authorization_code,
      isDisputed: txn.is_disputed,
      disputeId: txn.dispute_id,
      isFraudulent: txn.is_fraudulent,
      transactionDate: txn.transaction_date,
      postedDate: txn.posted_date
    };

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
