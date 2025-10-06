const { query } = require('../config/database');
const moment = require('moment');

/**
 * Transaction Service - Handles transaction-related database operations
 */
class TransactionService {
  // Get transactions for a customer with filters
  async getTransactionsByCustomer(customerId, filters = {}) {
    const {
      cardId,
      limit = 20,
      offset = 0,
      startDate,
      endDate,
      category,
      status
    } = filters;

    let whereConditions = ['t.customer_id = $1'];
    let queryParams = [customerId];
    let paramCount = 1;

    if (cardId) {
      paramCount++;
      whereConditions.push(`t.card_id = $${paramCount}`);
      queryParams.push(cardId);
    }

    if (startDate) {
      paramCount++;
      whereConditions.push(`t.transaction_date >= $${paramCount}`);
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      whereConditions.push(`t.transaction_date <= $${paramCount}`);
      queryParams.push(endDate + ' 23:59:59');
    }

    if (category) {
      paramCount++;
      whereConditions.push(`t.merchant_category = $${paramCount}`);
      queryParams.push(category);
    }

    if (status) {
      paramCount++;
      whereConditions.push(`t.status = $${paramCount}`);
      queryParams.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get transactions with pagination
    const transactionsQuery = `
      SELECT 
        t.transaction_id,
        t.card_id,
        t.customer_id,
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
        t.authorization_code,
        t.location_city,
        t.location_state,
        t.location_country,
        t.location_lat,
        t.location_lng,
        t.is_international,
        t.is_online,
        t.fraud_score,
        t.fraud_flag,
        t.is_disputed,
        t.created_at
      FROM transactions t
      WHERE ${whereClause}
      ORDER BY t.transaction_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const result = await query(transactionsQuery, queryParams);

    // Calculate summary
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(*) as transaction_count,
        COALESCE(AVG(amount), 0) as average_amount
      FROM transactions t
      WHERE ${whereClause}
    `;
    const summaryResult = await query(summaryQuery, queryParams.slice(0, -2));
    const summary = summaryResult.rows[0];

    // Format transactions
    const transactions = result.rows.map(row => this.formatTransaction(row));

    return {
      success: true,
      data: transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      summary: {
        totalAmount: parseFloat(summary.total_amount),
        transactionCount: parseInt(summary.transaction_count),
        averageAmount: parseFloat(summary.average_amount)
      }
    };
  }

  // Get specific transaction by ID
  async getTransactionById(transactionId, customerId) {
    const queryText = `
      SELECT 
        t.transaction_id,
        t.card_id,
        t.customer_id,
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
        t.authorization_code,
        t.location_city,
        t.location_state,
        t.location_country,
        t.location_lat,
        t.location_lng,
        t.is_international,
        t.is_online,
        t.fraud_score,
        t.fraud_flag,
        t.is_disputed,
        t.created_at
      FROM transactions t
      WHERE t.transaction_id = $1 AND t.customer_id = $2
    `;

    const result = await query(queryText, [transactionId, customerId]);
    
    if (result.rows.length === 0) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }

    return this.formatTransaction(result.rows[0]);
  }

  // Search transactions with advanced filters
  async searchTransactions(customerId, searchFilters = {}) {
    const {
      query: searchQuery,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      category,
      status,
      limit = 20,
      offset = 0
    } = searchFilters;

    let whereConditions = ['t.customer_id = $1'];
    let queryParams = [customerId];
    let paramCount = 1;

    if (searchQuery) {
      paramCount++;
      whereConditions.push(`(
        t.merchant_name ILIKE $${paramCount} OR 
        t.transaction_id ILIKE $${paramCount} OR
        t.amount::text ILIKE $${paramCount}
      )`);
      queryParams.push(`%${searchQuery}%`);
    }

    if (startDate) {
      paramCount++;
      whereConditions.push(`t.transaction_date >= $${paramCount}`);
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      whereConditions.push(`t.transaction_date <= $${paramCount}`);
      queryParams.push(endDate + ' 23:59:59');
    }

    if (minAmount !== undefined) {
      paramCount++;
      whereConditions.push(`t.amount >= $${paramCount}`);
      queryParams.push(minAmount);
    }

    if (maxAmount !== undefined) {
      paramCount++;
      whereConditions.push(`t.amount <= $${paramCount}`);
      queryParams.push(maxAmount);
    }

    if (category) {
      paramCount++;
      whereConditions.push(`t.merchant_category = $${paramCount}`);
      queryParams.push(category);
    }

    if (status) {
      paramCount++;
      whereConditions.push(`t.status = $${paramCount}`);
      queryParams.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get transactions with pagination
    const transactionsQuery = `
      SELECT 
        t.transaction_id,
        t.card_id,
        t.customer_id,
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
        t.authorization_code,
        t.location_city,
        t.location_state,
        t.location_country,
        t.location_lat,
        t.location_lng,
        t.is_international,
        t.is_online,
        t.fraud_score,
        t.fraud_flag,
        t.is_disputed,
        t.created_at
      FROM transactions t
      WHERE ${whereClause}
      ORDER BY t.transaction_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const result = await query(transactionsQuery, queryParams);

    // Format transactions
    const transactions = result.rows.map(row => this.formatTransaction(row));

    return {
      success: true,
      data: transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  // Format transaction data for API response
  formatTransaction(row) {
    const fraudScore = parseFloat(row.fraud_score) || 0;
    let fraudRiskLevel = 'MINIMAL';
    if (fraudScore >= 0.8) fraudRiskLevel = 'HIGH';
    else if (fraudScore >= 0.5) fraudRiskLevel = 'MEDIUM';
    else if (fraudScore >= 0.2) fraudRiskLevel = 'LOW';

    // Check if transaction can be disputed (within 60 days and approved)
    const transactionDate = moment(row.transaction_date);
    const disputeWindow = moment().subtract(60, 'days');
    const canBeDisputed = transactionDate.isAfter(disputeWindow) && 
                         !row.is_disputed && 
                         row.status === 'APPROVED';

    return {
      transactionId: row.transaction_id,
      cardId: row.card_id,
      customerId: row.customer_id,
      transactionDate: row.transaction_date,
      postDate: row.post_date,
      merchant: {
        name: row.merchant_name,
        merchantId: row.merchant_id,
        category: row.merchant_category,
        categoryCode: row.merchant_category_code
      },
      amount: {
        value: parseFloat(row.amount),
        currency: row.currency
      },
      transactionType: row.transaction_type,
      transactionMethod: row.transaction_method,
      status: row.status,
      authorizationCode: row.authorization_code,
      location: {
        city: row.location_city,
        state: row.location_state,
        country: row.location_country,
        coordinates: row.location_lat && row.location_lng ? {
          lat: parseFloat(row.location_lat),
          lng: parseFloat(row.location_lng)
        } : null
      },
      isInternational: row.is_international,
      isOnline: row.is_online,
      fraudScore: fraudScore,
      fraudFlag: row.fraud_flag,
      fraudRiskLevel: fraudRiskLevel,
      isDisputed: row.is_disputed,
      canBeDisputed: canBeDisputed,
      createdAt: row.created_at
    };
  }
}

module.exports = new TransactionService();
