const express = require('express');
const { query } = require('../../config/database');
const { checkPermission } = require('../../middleware/rbac');
const { auditLogs } = require('../../middleware/auditLog');

const router = express.Router();

// Get all customers with search and pagination
router.get('/', checkPermission('VIEW_CUSTOMERS'), auditLogs.customerSearch, async (req, res) => {
  try {
    const { 
      search = '', 
      limit = 20, 
      offset = 0, 
      status = '',
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
        u.customer_id ILIKE $${paramCount} OR 
        u.username ILIKE $${paramCount} OR 
        u.email ILIKE $${paramCount} OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      searchConditions.push(`u.is_active = $${paramCount}`);
      queryParams.push(status === 'active');
    }

    const whereClause = searchConditions.length > 0 
      ? `WHERE ${searchConditions.join(' AND ')}`
      : '';

    // Validate sort parameters
    const allowedSortColumns = ['created_at', 'last_login', 'customer_id', 'username'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get customers with card counts and transaction counts
    const customersQuery = `
      SELECT 
        u.customer_id,
        u.username,
        u.email,
        u.phone,
        u.is_active as account_status,
        u.created_at,
        u.last_login,
        COALESCE(card_stats.card_count, 0) as card_count,
        COALESCE(card_stats.active_card_count, 0) as active_card_count,
        COALESCE(txn_stats.total_transactions, 0) as total_transactions,
        COALESCE(dispute_stats.open_disputes, 0) as open_disputes
      FROM users u
      LEFT JOIN (
        SELECT 
          customer_id,
          COUNT(*) as card_count,
          COUNT(CASE WHEN card_status = 'ACTIVE' THEN 1 END) as active_card_count
        FROM cards 
        GROUP BY customer_id
      ) card_stats ON u.customer_id = card_stats.customer_id
      LEFT JOIN (
        SELECT 
          customer_id,
          COUNT(*) as total_transactions
        FROM transactions 
        GROUP BY customer_id
      ) txn_stats ON u.customer_id = txn_stats.customer_id
      LEFT JOIN (
        SELECT 
          customer_id,
          COUNT(*) as open_disputes
        FROM disputes 
        WHERE status IN ('SUBMITTED', 'UNDER_REVIEW')
        GROUP BY customer_id
      ) dispute_stats ON u.customer_id = dispute_stats.customer_id
      ${whereClause}
      ORDER BY u.${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const customersResult = await query(customersQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: customersResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin customers list error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching customers'
      }
    });
  }
});

// Get detailed customer information
router.get('/:customerId', checkPermission('VIEW_CUSTOMERS'), async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get customer details
    const customerQuery = `
      SELECT 
        customer_id,
        username,
        email,
        phone,
        is_active as account_status,
        created_at,
        last_login
      FROM users 
      WHERE customer_id = $1
    `;

    const customerResult = await query(customerQuery, [customerId]);
    
    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      });
    }

    const customer = customerResult.rows[0];

    // Get customer's cards
    const cardsQuery = `
      SELECT 
        card_id,
        card_last_four,
        card_type,
        card_brand,
        card_status,
        expiry_date,
        is_primary,
        created_at
      FROM cards 
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `;

    const cardsResult = await query(cardsQuery, [customerId]);

    // Get recent transactions (last 30 days)
    const transactionsQuery = `
      SELECT 
        t.transaction_id,
        t.transaction_date,
        t.merchant_name,
        t.amount,
        t.currency,
        t.status,
        t.fraud_score,
        t.fraud_flag,
        c.card_last_four
      FROM transactions t
      JOIN cards c ON t.card_id = c.card_id
      WHERE t.customer_id = $1
        AND t.transaction_date >= NOW() - INTERVAL '30 days'
      ORDER BY t.transaction_date DESC
      LIMIT 20
    `;

    const transactionsResult = await query(transactionsQuery, [customerId]);

    // Get open disputes
    const disputesQuery = `
      SELECT 
        d.dispute_id,
        d.dispute_date,
        d.dispute_reason,
        d.dispute_amount,
        d.status,
        d.priority,
        t.merchant_name,
        t.transaction_date
      FROM disputes d
      JOIN transactions t ON d.transaction_id = t.transaction_id
      WHERE d.customer_id = $1
        AND d.status IN ('SUBMITTED', 'UNDER_REVIEW')
      ORDER BY d.dispute_date DESC
    `;

    const disputesResult = await query(disputesQuery, [customerId]);

    // Get active alerts
    const alertsQuery = `
      SELECT 
        a.alert_id,
        a.alert_type,
        a.severity,
        a.alert_date,
        a.alert_title,
        a.alert_message,
        a.status,
        c.card_last_four
      FROM alerts a
      JOIN cards c ON a.card_id = c.card_id
      WHERE a.customer_id = $1
        AND a.status IN ('NEW', 'READ')
      ORDER BY a.alert_date DESC
      LIMIT 10
    `;

    const alertsResult = await query(alertsQuery, [customerId]);

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
      WHERE n.note_type = 'CUSTOMER' 
        AND n.reference_id = $1
      ORDER BY n.created_at DESC
      LIMIT 20
    `;

    const notesResult = await query(notesQuery, [customerId]);

    res.json({
      success: true,
      data: {
        ...customer,
        cards: cardsResult.rows,
        recentTransactions: transactionsResult.rows,
        openDisputes: disputesResult.rows,
        activeAlerts: alertsResult.rows,
        adminNotes: notesResult.rows
      }
    });
  } catch (error) {
    console.error('Admin customer detail error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching customer details'
      }
    });
  }
});

// Create new customer
router.post('/', checkPermission('CREATE_CUSTOMERS'), async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      firstName,
      lastName,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country = 'US'
    } = req.body;

    // Validate required fields
    if (!username || !email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'username, email, firstName, and lastName are required'
        }
      });
    }

    // Generate customer ID
    const customerId = `CUST-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // Mock response - in real implementation, this would insert into database
    const newCustomer = {
      customer_id: customerId,
      customerId: customerId,
      username: username,
      email: email,
      phone: phone || null,
      first_name: firstName,
      lastName: firstName,
      last_name: lastName,
      lastName: lastName,
      date_of_birth: dateOfBirth || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zip_code: zipCode || null,
      country: country,
      status: 'ACTIVE',
      created_at: createdAt,
      updated_at: createdAt,
      last_login: null,
      card_count: 0,
      transaction_count: 0,
      total_spent: 0.00
    };

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating the customer'
      }
    });
  }
});

// Create customer with card (combined endpoint)
router.post('/with-card', checkPermission('CREATE_CUSTOMERS'), async (req, res) => {
  try {
    const {
      // Customer fields
      username,
      email,
      phone,
      firstName,
      lastName,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country = 'US',
      // Card fields
      cardType = 'DEBIT',
      cardBrand = 'VISA',
      cardFormat = 'PHYSICAL',
      isPrimary = true,
      creditLimit = null,
      expiryDate
    } = req.body;

    // Validate required fields
    if (!username || !email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'username, email, firstName, and lastName are required'
        }
      });
    }

    // Generate customer ID
    const customerId = `CUST-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // Create customer object
    const newCustomer = {
      customer_id: customerId,
      customerId: customerId,
      username: username,
      email: email,
      phone: phone || null,
      first_name: firstName,
      lastName: firstName,
      last_name: lastName,
      lastName: lastName,
      date_of_birth: dateOfBirth || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zip_code: zipCode || null,
      country: country,
      status: 'ACTIVE',
      created_at: createdAt,
      updated_at: createdAt,
      last_login: null,
      card_count: 1,
      transaction_count: 0,
      total_spent: 0.00
    };

    // Generate card data
    const cardId = `CARD-${Date.now()}`;
    const cardNumber = cardType === 'CREDIT' ? '5555555555555678' : '4111111111111234';
    const cardLastFour = cardNumber.slice(-4);
    const issueDate = new Date().toISOString().split('T')[0];
    const finalExpiryDate = expiryDate || new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newCard = {
      card_id: cardId,
      cardId: cardId,
      customerId: customerId,
      cardNumber: cardNumber,
      cardLastFour: cardLastFour,
      cardType: cardType,
      cardBrand: cardBrand,
      cardStatus: 'PENDING_ACTIVATION',
      cardSubStatus: null,
      customerName: `${firstName} ${lastName}`,
      cardholderName: `${firstName} ${lastName}`,
      issueDate: issueDate,
      expiryDate: finalExpiryDate,
      activationDate: null,
      creditLimit: cardType === 'CREDIT' ? (creditLimit || 5000.00) : null,
      availableCredit: cardType === 'CREDIT' ? (creditLimit || 5000.00) : null,
      isPrimary: isPrimary,
      cardFormat: cardFormat,
      createdAt: createdAt,
      updatedAt: createdAt,
      customer: {
        username: username,
        email: email,
        phone: phone || '+1234567890'
      }
    };

    res.status(201).json({
      success: true,
      message: 'Customer and card created successfully',
      data: {
        customer: newCustomer,
        card: newCard
      }
    });
  } catch (error) {
    console.error('Error creating customer with card:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating the customer and card'
      }
    });
  }
});

module.exports = router;
