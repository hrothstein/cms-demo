/**
 * MCP Tool Handlers
 * Implements the business logic for each MCP tool by calling existing database and services
 */

const { query } = require('../../config/database');
const bcrypt = require('bcrypt');

// ========================================
// Customer Management Handlers
// ========================================

async function cms_get_customers(args) {
  const {
    limit = 20,
    offset = 0,
    search = '',
    status = '',
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = args;

  // Build search conditions
  let searchConditions = [];
  let queryParams = [];
  let paramCount = 0;

  if (search) {
    paramCount++;
    searchConditions.push(`(
      u.customer_id ILIKE $${paramCount} OR 
      u.username ILIKE $${paramCount} OR 
      u.email ILIKE $${paramCount}
    )`);
    queryParams.push(`%${search}%`);
  }

  if (status) {
    paramCount++;
    searchConditions.push(`u.is_active = $${paramCount}`);
    queryParams.push(status === 'active');
  }

  const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';

  // Validate sort parameters
  const allowedSortColumns = ['created_at', 'last_login', 'customer_id', 'username'];
  const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Add limit and offset
  paramCount++;
  queryParams.push(limit);
  const limitParam = `$${paramCount}`;

  paramCount++;
  queryParams.push(offset);
  const offsetParam = `$${paramCount}`;

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
      COALESCE(card_stats.active_card_count, 0) as active_card_count
    FROM users u
    LEFT JOIN (
      SELECT 
        customer_id,
        COUNT(*) as card_count,
        COUNT(CASE WHEN card_status = 'ACTIVE' THEN 1 END) as active_card_count
      FROM cards 
      GROUP BY customer_id
    ) card_stats ON u.customer_id = card_stats.customer_id
    ${whereClause}
    ORDER BY u.${sortColumn} ${sortDirection}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM users u
    ${whereClause}
  `;

  const customersResult = await query(customersQuery, queryParams);
  const countResult = await query(countQuery, queryParams.slice(0, -2)); // Remove limit/offset params

  return {
    success: true,
    customers: customersResult.rows,
    total: parseInt(countResult.rows[0].total),
    limit,
    offset,
  };
}

async function cms_get_customer(args) {
  const { customer_id } = args;

  const customerQuery = `
    SELECT 
      u.customer_id,
      u.username,
      u.email,
      u.phone,
      u.is_active,
      u.created_at,
      u.updated_at,
      u.last_login,
      COALESCE(card_stats.card_count, 0) as card_count
    FROM users u
    LEFT JOIN (
      SELECT customer_id, COUNT(*) as card_count
      FROM cards 
      GROUP BY customer_id
    ) card_stats ON u.customer_id = card_stats.customer_id
    WHERE u.customer_id = $1
  `;

  const result = await query(customerQuery, [customer_id]);

  if (result.rows.length === 0) {
    throw new Error(`Customer with ID ${customer_id} not found`);
  }

  return {
    success: true,
    customer: result.rows[0],
  };
}

async function cms_create_customer(args) {
  const {
    username,
    email,
    password,
    phone,
  } = args;

  // Generate customer_id
  const customer_id = 'CUST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  const insertQuery = `
    INSERT INTO users (
      customer_id, username, email, password_hash, phone
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING customer_id, username, email, phone, created_at
  `;

  const result = await query(insertQuery, [
    customer_id,
    username,
    email,
    password_hash,
    phone,
  ]);

  return {
    success: true,
    message: 'Customer created successfully',
    customer: result.rows[0],
  };
}

async function cms_update_customer(args) {
  const { customer_id, ...updates } = args;

  // Build dynamic update query
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(customer_id);

  const updateQuery = `
    UPDATE users
    SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE customer_id = $${paramCount}
    RETURNING customer_id, username, email, phone, first_name, last_name, updated_at
  `;

  const result = await query(updateQuery, values);

  if (result.rows.length === 0) {
    throw new Error(`Customer with ID ${customer_id} not found`);
  }

  return {
    success: true,
    message: 'Customer updated successfully',
    customer: result.rows[0],
  };
}

async function cms_delete_customer(args) {
  const { customer_id } = args;

  // Soft delete - mark as inactive
  const deleteQuery = `
    UPDATE users
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE customer_id = $1
    RETURNING customer_id, username
  `;

  const result = await query(deleteQuery, [customer_id]);

  if (result.rows.length === 0) {
    throw new Error(`Customer with ID ${customer_id} not found`);
  }

  return {
    success: true,
    message: 'Customer deleted successfully',
    customer_id: result.rows[0].customer_id,
  };
}

async function cms_search_customers(args) {
  const { query: searchQuery, limit = 20 } = args;

  const searchSql = `
    SELECT 
      customer_id, username, email, phone, created_at
    FROM users
    WHERE (
      username ILIKE $1 OR
      email ILIKE $1
    )
    AND is_active = true
    ORDER BY created_at DESC
    LIMIT $2
  `;

  const result = await query(searchSql, [`%${searchQuery}%`, limit]);

  return {
    success: true,
    customers: result.rows,
    count: result.rows.length,
  };
}

// ========================================
// Card Management Handlers
// ========================================

async function cms_get_cards(args) {
  const {
    customer_id,
    status,
    card_type,
    limit = 20,
    offset = 0,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = args;

  let searchConditions = [];
  let queryParams = [];
  let paramCount = 0;

  if (customer_id) {
    paramCount++;
    searchConditions.push(`c.customer_id = $${paramCount}`);
    queryParams.push(customer_id);
  }

  if (status) {
    paramCount++;
    searchConditions.push(`c.card_status = $${paramCount}`);
    queryParams.push(status);
  }

  if (card_type) {
    paramCount++;
    searchConditions.push(`c.card_type = $${paramCount}`);
    queryParams.push(card_type);
  }

  const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';

  const allowedSortColumns = ['created_at', 'expiry_date', 'card_status', 'card_type'];
  const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  paramCount++;
  queryParams.push(limit);
  const limitParam = `$${paramCount}`;

  paramCount++;
  queryParams.push(offset);
  const offsetParam = `$${paramCount}`;

  const cardsQuery = `
    SELECT 
      c.card_id,
      c.customer_id,
      u.username as customer_name,
      c.card_last_four,
      c.card_type,
      c.card_brand,
      c.card_status,
      c.cardholder_name,
      c.issue_date,
      c.expiry_date,
      c.credit_limit,
      c.available_credit,
      c.created_at
    FROM cards c
    LEFT JOIN users u ON c.customer_id = u.customer_id
    ${whereClause}
    ORDER BY c.${sortColumn} ${sortDirection}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await query(cardsQuery, queryParams);

  return {
    success: true,
    cards: result.rows,
    count: result.rows.length,
  };
}

async function cms_get_card(args) {
  const { card_id } = args;

  const cardQuery = `
    SELECT 
      c.*,
      u.username as customer_name,
      u.email as customer_email
    FROM cards c
    LEFT JOIN users u ON c.customer_id = u.customer_id
    WHERE c.card_id = $1
  `;

  const result = await query(cardQuery, [card_id]);

  if (result.rows.length === 0) {
    throw new Error(`Card with ID ${card_id} not found`);
  }

  return {
    success: true,
    card: result.rows[0],
  };
}

async function cms_create_card(args) {
  const {
    customer_id,
    card_type,
    card_brand = 'VISA',
    cardholder_name,
    credit_limit,
    is_primary = false,
  } = args;

  // Generate card number (last 4 digits)
  const card_last_four = Math.floor(1000 + Math.random() * 9000).toString();

  // Set expiry date (3 years from now)
  const expiry_date = new Date();
  expiry_date.setFullYear(expiry_date.getFullYear() + 3);

  const insertQuery = `
    INSERT INTO cards (
      customer_id, card_type, card_brand, card_last_four, cardholder_name,
      credit_limit, available_credit, expiry_date, card_status, is_primary
    ) VALUES ($1, $2, $3, $4, $5, $6, $6, $7, 'PENDING_ACTIVATION', $8)
    RETURNING card_id, card_type, card_brand, card_last_four, card_status, created_at
  `;

  const result = await query(insertQuery, [
    customer_id,
    card_type,
    card_brand,
    card_last_four,
    cardholder_name,
    credit_limit || null,
    expiry_date,
    is_primary,
  ]);

  return {
    success: true,
    message: 'Card created successfully',
    card: result.rows[0],
  };
}

async function cms_update_card(args) {
  const { card_id, ...updates } = args;

  const updateFields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(card_id);

  const updateQuery = `
    UPDATE cards
    SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE card_id = $${paramCount}
    RETURNING card_id, card_type, card_status, updated_at
  `;

  const result = await query(updateQuery, values);

  if (result.rows.length === 0) {
    throw new Error(`Card with ID ${card_id} not found`);
  }

  return {
    success: true,
    message: 'Card updated successfully',
    card: result.rows[0],
  };
}

async function cms_delete_card(args) {
  const { card_id } = args;

  const deleteQuery = `
    UPDATE cards
    SET card_status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP
    WHERE card_id = $1
    RETURNING card_id, card_last_four
  `;

  const result = await query(deleteQuery, [card_id]);

  if (result.rows.length === 0) {
    throw new Error(`Card with ID ${card_id} not found`);
  }

  return {
    success: true,
    message: 'Card deleted successfully',
    card_id: result.rows[0].card_id,
  };
}

async function cms_lock_card(args) {
  const { card_id, reason, notes } = args;

  const lockQuery = `
    UPDATE cards
    SET card_status = 'LOCKED',
        card_sub_status = $2,
        locked_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE card_id = $1
    RETURNING card_id, card_status, locked_at
  `;

  const result = await query(lockQuery, [card_id, reason || 'customer_request']);

  if (result.rows.length === 0) {
    throw new Error(`Card with ID ${card_id} not found`);
  }

  return {
    success: true,
    message: 'Card locked successfully',
    card: result.rows[0],
  };
}

async function cms_unlock_card(args) {
  const { card_id, notes } = args;

  const unlockQuery = `
    UPDATE cards
    SET card_status = 'ACTIVE',
        card_sub_status = NULL,
        locked_at = NULL,
        locked_by = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE card_id = $1
    RETURNING card_id, card_status, updated_at
  `;

  const result = await query(unlockQuery, [card_id]);

  if (result.rows.length === 0) {
    throw new Error(`Card with ID ${card_id} not found`);
  }

  return {
    success: true,
    message: 'Card unlocked successfully',
    card: result.rows[0],
  };
}

async function cms_update_card_controls(args) {
  const { card_id, ...controls } = args;

  // Check if card exists
  const checkCard = await query('SELECT card_id FROM cards WHERE card_id = $1', [card_id]);
  if (checkCard.rows.length === 0) {
    throw new Error(`Card with ID ${card_id} not found`);
  }

  // Check if controls record exists
  const existingControls = await query('SELECT * FROM card_controls WHERE card_id = $1', [card_id]);

  if (existingControls.rows.length === 0) {
    // Insert new controls
    const insertQuery = `
      INSERT INTO card_controls (
        card_id, daily_limit, per_transaction_limit, contactless_enabled, 
        online_enabled, international_enabled, atm_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await query(insertQuery, [
      card_id,
      controls.daily_limit || null,
      controls.transaction_limit || null,
      controls.contactless_enabled !== undefined ? controls.contactless_enabled : true,
      controls.online_enabled !== undefined ? controls.online_enabled : true,
      controls.international_enabled !== undefined ? controls.international_enabled : false,
      controls.atm_enabled !== undefined ? controls.atm_enabled : true,
    ]);
    return {
      success: true,
      message: 'Card controls created successfully',
      controls: result.rows[0],
    };
  } else {
    // Update existing controls
    const updateFields = [];
    const values = [card_id];
    let paramCount = 1;

    Object.keys(controls).forEach((key) => {
      if (controls[key] !== undefined) {
        paramCount++;
        const dbKey = key === 'transaction_limit' ? 'per_transaction_limit' : key;
        updateFields.push(`${dbKey} = $${paramCount}`);
        values.push(controls[key]);
      }
    });

    if (updateFields.length === 0) {
      return {
        success: true,
        message: 'No changes made',
        controls: existingControls.rows[0],
      };
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const updateQuery = `
      UPDATE card_controls
      SET ${updateFields.join(', ')}
      WHERE card_id = $1
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    return {
      success: true,
      message: 'Card controls updated successfully',
      controls: result.rows[0],
    };
  }
}

// ========================================
// Transaction Handlers
// ========================================

async function cms_get_transactions(args) {
  const {
    card_id,
    start_date,
    end_date,
    limit = 50,
    offset = 0,
    transaction_type,
    status,
  } = args;

  let searchConditions = ['t.card_id = $1'];
  let queryParams = [card_id];
  let paramCount = 1;

  if (start_date) {
    paramCount++;
    searchConditions.push(`t.transaction_date >= $${paramCount}`);
    queryParams.push(start_date);
  }

  if (end_date) {
    paramCount++;
    searchConditions.push(`t.transaction_date <= $${paramCount}`);
    queryParams.push(end_date);
  }

  if (transaction_type) {
    paramCount++;
    searchConditions.push(`t.transaction_type = $${paramCount}`);
    queryParams.push(transaction_type);
  }

  if (status) {
    paramCount++;
    searchConditions.push(`t.transaction_status = $${paramCount}`);
    queryParams.push(status);
  }

  paramCount++;
  queryParams.push(limit);
  const limitParam = `$${paramCount}`;

  paramCount++;
  queryParams.push(offset);
  const offsetParam = `$${paramCount}`;

  const transactionsQuery = `
    SELECT *
    FROM transactions t
    WHERE ${searchConditions.join(' AND ')}
    ORDER BY t.transaction_date DESC
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await query(transactionsQuery, queryParams);

  return {
    success: true,
    transactions: result.rows,
    count: result.rows.length,
  };
}

async function cms_get_transaction(args) {
  const { transaction_id } = args;

  const transactionQuery = `
    SELECT t.*, c.card_last_four, u.username as customer_name
    FROM transactions t
    LEFT JOIN cards c ON t.card_id = c.card_id
    LEFT JOIN users u ON c.customer_id = u.customer_id
    WHERE t.transaction_id = $1
  `;

  const result = await query(transactionQuery, [transaction_id]);

  if (result.rows.length === 0) {
    throw new Error(`Transaction with ID ${transaction_id} not found`);
  }

  return {
    success: true,
    transaction: result.rows[0],
  };
}

async function cms_search_transactions(args) {
  const {
    card_id,
    query: searchQuery,
    min_amount,
    max_amount,
    merchant_category,
    limit = 50,
  } = args;

  let searchConditions = ['card_id = $1'];
  let queryParams = [card_id];
  let paramCount = 1;

  if (searchQuery) {
    paramCount++;
    searchConditions.push(`(merchant_name ILIKE $${paramCount} OR merchant_city ILIKE $${paramCount})`);
    queryParams.push(`%${searchQuery}%`);
  }

  if (min_amount !== undefined) {
    paramCount++;
    searchConditions.push(`amount >= $${paramCount}`);
    queryParams.push(min_amount);
  }

  if (max_amount !== undefined) {
    paramCount++;
    searchConditions.push(`amount <= $${paramCount}`);
    queryParams.push(max_amount);
  }

  if (merchant_category) {
    paramCount++;
    searchConditions.push(`merchant_category ILIKE $${paramCount}`);
    queryParams.push(`%${merchant_category}%`);
  }

  paramCount++;
  queryParams.push(limit);

  const searchSql = `
    SELECT *
    FROM transactions
    WHERE ${searchConditions.join(' AND ')}
    ORDER BY transaction_date DESC
    LIMIT $${paramCount}
  `;

  const result = await query(searchSql, queryParams);

  return {
    success: true,
    transactions: result.rows,
    count: result.rows.length,
  };
}

// ========================================
// Alert Handlers
// ========================================

async function cms_get_alerts(args) {
  const {
    customer_id,
    unread_only = false,
    alert_type,
    limit = 50,
    offset = 0,
  } = args;

  let searchConditions = [];
  let queryParams = [];
  let paramCount = 0;

  if (customer_id) {
    paramCount++;
    searchConditions.push(`customer_id = $${paramCount}`);
    queryParams.push(customer_id);
  }

  if (unread_only) {
    searchConditions.push(`is_read = false`);
  }

  if (alert_type) {
    paramCount++;
    searchConditions.push(`alert_type = $${paramCount}`);
    queryParams.push(alert_type);
  }

  const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';

  paramCount++;
  queryParams.push(limit);
  const limitParam = `$${paramCount}`;

  paramCount++;
  queryParams.push(offset);
  const offsetParam = `$${paramCount}`;

  const alertsQuery = `
    SELECT *
    FROM alerts
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await query(alertsQuery, queryParams);

  return {
    success: true,
    alerts: result.rows,
    count: result.rows.length,
  };
}

async function cms_mark_alert_read(args) {
  const { alert_id } = args;

  const updateQuery = `
    UPDATE alerts
    SET is_read = true, read_at = CURRENT_TIMESTAMP
    WHERE alert_id = $1
    RETURNING alert_id, is_read, read_at
  `;

  const result = await query(updateQuery, [alert_id]);

  if (result.rows.length === 0) {
    throw new Error(`Alert with ID ${alert_id} not found`);
  }

  return {
    success: true,
    message: 'Alert marked as read',
    alert: result.rows[0],
  };
}

async function cms_get_alert_preferences(args) {
  const { customer_id } = args;

  const prefsQuery = `
    SELECT notification_preferences
    FROM users
    WHERE customer_id = $1
  `;

  const result = await query(prefsQuery, [customer_id]);

  if (result.rows.length === 0) {
    throw new Error(`Customer with ID ${customer_id} not found`);
  }

  return {
    success: true,
    preferences: result.rows[0].notification_preferences || {},
  };
}

async function cms_update_alert_preferences(args) {
  const { customer_id, ...preferences } = args;

  // Get current preferences
  const getCurrentQuery = `
    SELECT notification_preferences FROM users WHERE customer_id = $1
  `;

  const currentResult = await query(getCurrentQuery, [customer_id]);

  if (currentResult.rows.length === 0) {
    throw new Error(`Customer with ID ${customer_id} not found`);
  }

  const currentPrefs = currentResult.rows[0].notification_preferences || {};
  const updatedPrefs = { ...currentPrefs, ...preferences };

  const updateQuery = `
    UPDATE users
    SET notification_preferences = $2, updated_at = CURRENT_TIMESTAMP
    WHERE customer_id = $1
    RETURNING customer_id, notification_preferences
  `;

  const result = await query(updateQuery, [customer_id, JSON.stringify(updatedPrefs)]);

  return {
    success: true,
    message: 'Alert preferences updated successfully',
    preferences: result.rows[0].notification_preferences,
  };
}

// ========================================
// Dispute Handlers
// ========================================

async function cms_create_dispute(args) {
  const {
    transaction_id,
    dispute_type,
    reason,
    amount,
    evidence_description,
  } = args;

  const insertQuery = `
    INSERT INTO disputes (
      transaction_id, dispute_type, reason, disputed_amount, 
      evidence_description, dispute_status
    ) VALUES ($1, $2, $3, $4, $5, 'OPEN')
    RETURNING dispute_id, transaction_id, dispute_status, created_at
  `;

  const result = await query(insertQuery, [
    transaction_id,
    dispute_type,
    reason,
    amount || null,
    evidence_description || null,
  ]);

  return {
    success: true,
    message: 'Dispute created successfully',
    dispute: result.rows[0],
  };
}

async function cms_get_disputes(args) {
  const {
    customer_id,
    status,
    limit = 20,
    offset = 0,
  } = args;

  let searchConditions = [];
  let queryParams = [];
  let paramCount = 0;

  if (customer_id) {
    searchConditions.push(`t.customer_id = $1`);
    queryParams.push(customer_id);
    paramCount = 1;
  }

  if (status) {
    paramCount++;
    searchConditions.push(`d.dispute_status = $${paramCount}`);
    queryParams.push(status);
  }

  const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';

  paramCount++;
  queryParams.push(limit);
  const limitParam = `$${paramCount}`;

  paramCount++;
  queryParams.push(offset);
  const offsetParam = `$${paramCount}`;

  const disputesQuery = `
    SELECT d.*, t.amount as transaction_amount, t.merchant_name
    FROM disputes d
    LEFT JOIN transactions t ON d.transaction_id = t.transaction_id
    ${whereClause}
    ORDER BY d.created_at DESC
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await query(disputesQuery, queryParams);

  return {
    success: true,
    disputes: result.rows,
    count: result.rows.length,
  };
}

async function cms_get_dispute(args) {
  const { dispute_id } = args;

  const disputeQuery = `
    SELECT d.*, t.*, u.username as customer_name
    FROM disputes d
    LEFT JOIN transactions t ON d.transaction_id = t.transaction_id
    LEFT JOIN cards c ON t.card_id = c.card_id
    LEFT JOIN users u ON c.customer_id = u.customer_id
    WHERE d.dispute_id = $1
  `;

  const result = await query(disputeQuery, [dispute_id]);

  if (result.rows.length === 0) {
    throw new Error(`Dispute with ID ${dispute_id} not found`);
  }

  return {
    success: true,
    dispute: result.rows[0],
  };
}

async function cms_update_dispute(args) {
  const { dispute_id, additional_info, evidence_description } = args;

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (additional_info) {
    updates.push(`additional_info = $${paramCount}`);
    values.push(additional_info);
    paramCount++;
  }

  if (evidence_description) {
    updates.push(`evidence_description = $${paramCount}`);
    values.push(evidence_description);
    paramCount++;
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(dispute_id);

  const updateQuery = `
    UPDATE disputes
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE dispute_id = $${paramCount}
    RETURNING dispute_id, dispute_status, updated_at
  `;

  const result = await query(updateQuery, values);

  if (result.rows.length === 0) {
    throw new Error(`Dispute with ID ${dispute_id} not found`);
  }

  return {
    success: true,
    message: 'Dispute updated successfully',
    dispute: result.rows[0],
  };
}

// ========================================
// Card Services Handlers
// ========================================

async function cms_view_pin(args) {
  const { card_id, password } = args;

  // Note: In production, this would require additional authentication
  // For demo purposes, we'll return a masked PIN
  const cardQuery = `
    SELECT card_id, card_last_four
    FROM cards
    WHERE card_id = $1
  `;

  const result = await query(cardQuery, [card_id]);

  if (result.rows.length === 0) {
    throw new Error(`Card with ID ${card_id} not found`);
  }

  return {
    success: true,
    message: 'PIN viewing requires additional security verification in production',
    card_id,
    pin_hint: '****', // In production, this would be properly secured
  };
}

async function cms_change_pin(args) {
  const { card_id, current_pin, new_pin } = args;

  // Validate PIN format
  if (!/^\d{4}$/.test(new_pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }

  // In production, this would verify current_pin and update securely
  const updateQuery = `
    UPDATE cards
    SET updated_at = CURRENT_TIMESTAMP
    WHERE card_id = $1
    RETURNING card_id
  `;

  const result = await query(updateQuery, [card_id]);

  if (result.rows.length === 0) {
    throw new Error(`Card with ID ${card_id} not found`);
  }

  return {
    success: true,
    message: 'PIN changed successfully',
    card_id: result.rows[0].card_id,
  };
}

async function cms_request_replacement(args) {
  const { card_id, reason, expedited = false, shipping_address } = args;

  // Mark current card as cancelled and create replacement request
  const updateQuery = `
    UPDATE cards
    SET card_status = 'CANCELLED',
        card_sub_status = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE card_id = $1
    RETURNING card_id, customer_id
  `;

  const result = await query(updateQuery, [card_id, `replacement_${reason}`]);

  if (result.rows.length === 0) {
    throw new Error(`Card with ID ${card_id} not found`);
  }

  return {
    success: true,
    message: `Replacement card requested. ${expedited ? 'Expedited' : 'Standard'} shipping selected.`,
    original_card_id: card_id,
    status: 'PROCESSING',
    estimated_delivery_days: expedited ? 2 : 7,
  };
}

async function cms_activate_card(args) {
  const { card_id, last_four_ssn, cvv, date_of_birth } = args;

  // In production, this would verify identity
  const activateQuery = `
    UPDATE cards
    SET card_status = 'ACTIVE',
        activation_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE card_id = $1 AND card_status = 'PENDING_ACTIVATION'
    RETURNING card_id, card_status, activation_date
  `;

  const result = await query(activateQuery, [card_id]);

  if (result.rows.length === 0) {
    throw new Error(`Card with ID ${card_id} not found or already activated`);
  }

  return {
    success: true,
    message: 'Card activated successfully',
    card: result.rows[0],
  };
}

// Export all handlers
module.exports = {
  // Customer handlers
  cms_get_customers,
  cms_get_customer,
  cms_create_customer,
  cms_update_customer,
  cms_delete_customer,
  cms_search_customers,

  // Card handlers
  cms_get_cards,
  cms_get_card,
  cms_create_card,
  cms_update_card,
  cms_delete_card,
  cms_lock_card,
  cms_unlock_card,
  cms_update_card_controls,

  // Transaction handlers
  cms_get_transactions,
  cms_get_transaction,
  cms_search_transactions,

  // Alert handlers
  cms_get_alerts,
  cms_mark_alert_read,
  cms_get_alert_preferences,
  cms_update_alert_preferences,

  // Dispute handlers
  cms_create_dispute,
  cms_get_disputes,
  cms_get_dispute,
  cms_update_dispute,

  // Card services handlers
  cms_view_pin,
  cms_change_pin,
  cms_request_replacement,
  cms_activate_card,
};

