/**
 * MCP Tool Handlers
 * Uses datastore for all CRUD operations
 * Implements all 29 MCP tools per PRD Section 17.3
 */

const { 
  datastore,
  customerOps,
  cardOps,
  getCustomers,
  getCards,
  getTransactions,
  getAlerts,
  getDisputes,
} = require('../datastore');

const { v4: uuidv4 } = require('uuid');

// ========================================
// Customer Management Handlers
// ========================================

// Get a single customer by ID
async function cms_get_customer(args) {
  const { customer_id } = args;
  
  const customer = customerOps.getById(customer_id);
  
  if (!customer) {
    throw new Error(`Customer ${customer_id} not found`);
  }
  
  // Add card counts
  const customerCards = getCards().filter(c => c.customer_id === customer.customer_id);
  const customerWithCounts = {
    ...customer,
    card_count: customerCards.length,
    active_card_count: customerCards.filter(c => c.card_status === 'ACTIVE').length
  };
  
  return {
    success: true,
    customer: customerWithCounts
  };
}

async function cms_get_customers(args) {
  const { limit = 20, offset = 0, search = '', customer_type = '', kyc_status = '', risk_rating = '' } = args;
  
  let filtered = customerOps.getAll({ search, customer_type, kyc_status, risk_rating });
  
  // Add card counts
  const customersWithCounts = filtered.map(customer => {
    const customerCards = getCards().filter(c => c.customer_id === customer.customer_id);
    return {
      ...customer,
      card_count: customerCards.length,
      active_card_count: customerCards.filter(c => c.card_status === 'ACTIVE').length
    };
  });
  
  const paginated = customersWithCounts.slice(offset, offset + limit);
  
  return {
    success: true,
    customers: paginated,
    total: customersWithCounts.length,
    limit,
    offset
  };
}

async function cms_create_customer(args) {
  const {
    customer_type = 'INDIVIDUAL',
    first_name,
    last_name,
    business_name,
    email,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country = 'USA',
    date_of_birth,
    ein,
    kyc_status = 'PENDING',
    risk_rating = 'LOW',
    annual_income,
    employment_status,
    occupation
  } = args;
  
  const newCustomer = customerOps.create({
    customer_type,
    first_name,
    last_name,
    business_name,
    email,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    date_of_birth,
    ein,
    kyc_status,
    risk_rating,
    annual_income,
    employment_status,
    occupation
  });
  
  return {
    success: true,
    customer: newCustomer,
    message: 'Customer created successfully'
  };
}

async function cms_update_customer(args) {
  const { customer_id, ...updates } = args;
  
  const updatedCustomer = customerOps.update(customer_id, updates);
  
  if (!updatedCustomer) {
    throw new Error(`Customer ${customer_id} not found`);
  }
  
  return {
    success: true,
    customer: updatedCustomer,
    message: 'Customer updated successfully'
  };
}

async function cms_delete_customer(args) {
  const { customer_id } = args;
  
  const deleted = customerOps.delete(customer_id);
  
  if (!deleted) {
    throw new Error(`Customer ${customer_id} not found`);
  }
  
  return {
    success: true,
    message: `Customer ${customer_id} deleted successfully`
  };
}

async function cms_search_customers(args) {
  return cms_get_customers(args);
}

// ========================================
// Card Management Handlers
// ========================================

async function cms_get_cards(args) {
  const { customer_id, status, card_type, limit = 20, offset = 0 } = args;
  
  const filtered = cardOps.getAll({ customer_id, card_status: status, card_type });
  const paginated = filtered.slice(offset, offset + limit);
  
  return {
    success: true,
    cards: paginated,
    total: filtered.length,
    limit,
    offset
  };
}

async function cms_get_card(args) {
  const { card_id } = args;
  
  const card = cardOps.getById(card_id);
  
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  return {
    success: true,
    card
  };
}

async function cms_create_card(args) {
  const {
    customer_id,
    card_type = 'DEBIT',
    credit_limit,
    daily_limit,
    monthly_limit
  } = args;
  
  // Verify customer exists
  const customer = customerOps.getById(customer_id);
  if (!customer) {
    throw new Error(`Customer ${customer_id} not found`);
  }
  
  // Generate card data
  const lastFour = String(Math.floor(Math.random() * 9000) + 1000);
  const cardNumberPrefix = card_type === 'CREDIT' ? '5500' : (card_type === 'DEBIT' ? '4111' : '6011');
  
  const newCard = cardOps.create({
    customer_id,
    customer_name: customer.customer_type === 'BUSINESS' 
      ? customer.business_name 
      : `${customer.first_name} ${customer.last_name}`,
    card_number: `**** **** **** ${lastFour}`,
    full_card_number: `${cardNumberPrefix} 1111 1111 ${lastFour}`,
    card_type,
    card_status: 'PENDING_ACTIVATION',
    expiry_date: `12/${String(new Date().getFullYear() + 3).slice(-2)}`,
    cvv: String(Math.floor(Math.random() * 900) + 100),
    balance: 0,
    credit_limit: credit_limit || (card_type === 'CREDIT' ? 5000 : 1000),
    available_credit: credit_limit || (card_type === 'CREDIT' ? 5000 : 1000),
    daily_limit: daily_limit || 1000,
    monthly_limit: monthly_limit || 5000,
    is_locked: false,
    card_controls: {
      international_enabled: true,
      online_enabled: true,
      contactless_enabled: true,
      atm_enabled: card_type !== 'CREDIT',
      daily_limit: daily_limit || 1000,
      transaction_limit: 500,
    },
  });
  
  return {
    success: true,
    card: newCard,
    message: 'Card created successfully'
  };
}

async function cms_update_card(args) {
  const { card_id, ...updates } = args;
  
  const updatedCard = cardOps.update(card_id, updates);
  
  if (!updatedCard) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  return {
    success: true,
    card: updatedCard,
    message: 'Card updated successfully'
  };
}

async function cms_delete_card(args) {
  const { card_id } = args;
  
  const deleted = cardOps.delete(card_id);
  
  if (!deleted) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  return {
    success: true,
    message: `Card ${card_id} deleted successfully`
  };
}

async function cms_lock_card(args) {
  const { card_id, reason } = args;
  
  const card = cardOps.getById(card_id);
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  const updatedCard = cardOps.update(card_id, {
    card_status: 'LOCKED',
    is_locked: true,
    lock_reason: reason || 'Locked by user'
  });
  
  return {
    success: true,
    card: updatedCard,
    message: `Card ${card_id} locked successfully`
  };
}

async function cms_unlock_card(args) {
  const { card_id } = args;
  
  const card = cardOps.getById(card_id);
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  const updatedCard = cardOps.update(card_id, {
    card_status: 'ACTIVE',
    is_locked: false,
    lock_reason: null
  });
  
  return {
    success: true,
    card: updatedCard,
    message: `Card ${card_id} unlocked successfully`
  };
}

async function cms_update_card_controls(args) {
  const { 
    card_id,
    international_enabled,
    online_enabled,
    contactless_enabled,
    atm_enabled,
    daily_limit,
    transaction_limit
  } = args;
  
  const card = cardOps.getById(card_id);
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  const updatedControls = {
    ...card.card_controls,
    ...(international_enabled !== undefined && { international_enabled }),
    ...(online_enabled !== undefined && { online_enabled }),
    ...(contactless_enabled !== undefined && { contactless_enabled }),
    ...(atm_enabled !== undefined && { atm_enabled }),
    ...(daily_limit !== undefined && { daily_limit }),
    ...(transaction_limit !== undefined && { transaction_limit }),
  };
  
  const updatedCard = cardOps.update(card_id, { card_controls: updatedControls });
  
  return {
    success: true,
    card: updatedCard,
    message: 'Card controls updated successfully'
  };
}

// ========================================
// Transaction Handlers
// ========================================

async function cms_get_transactions(args) {
  const { card_id, start_date, end_date, limit = 50, offset = 0 } = args;
  
  let transactions = getTransactions().filter(t => t.card_id === card_id);
  
  if (start_date) {
    transactions = transactions.filter(t => new Date(t.transaction_date) >= new Date(start_date));
  }
  
  if (end_date) {
    transactions = transactions.filter(t => new Date(t.transaction_date) <= new Date(end_date));
  }
  
  // Sort by date descending
  transactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  
  const paginated = transactions.slice(offset, offset + limit);
  
  return {
    success: true,
    transactions: paginated,
    total: transactions.length,
    limit,
    offset
  };
}

async function cms_get_transaction(args) {
  const { transaction_id } = args;
  
  const transaction = getTransactions().find(t => t.transaction_id === transaction_id);
  
  if (!transaction) {
    throw new Error(`Transaction ${transaction_id} not found`);
  }
  
  return {
    success: true,
    transaction
  };
}

async function cms_search_transactions(args) {
  const { card_id, query, min_amount, max_amount, limit = 50 } = args;
  
  let transactions = getTransactions().filter(t => t.card_id === card_id);
  
  if (query) {
    const searchLower = query.toLowerCase();
    transactions = transactions.filter(t =>
      t.merchant_name.toLowerCase().includes(searchLower) ||
      t.merchant_category.toLowerCase().includes(searchLower)
    );
  }
  
  if (min_amount !== undefined) {
    transactions = transactions.filter(t => Math.abs(t.amount) >= min_amount);
  }
  
  if (max_amount !== undefined) {
    transactions = transactions.filter(t => Math.abs(t.amount) <= max_amount);
  }
  
  // Sort by date descending
  transactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  
  return {
    success: true,
    transactions: transactions.slice(0, limit),
    total: transactions.length
  };
}

// ========================================
// Alert Handlers
// ========================================

async function cms_get_alerts(args) {
  const { customer_id, unread_only, alert_type, limit = 50, offset = 0 } = args;
  
  let alerts = getAlerts();
  
  if (customer_id) {
    alerts = alerts.filter(a => a.customer_id === customer_id);
  }
  
  if (unread_only) {
    alerts = alerts.filter(a => !a.is_read);
  }
  
  if (alert_type) {
    alerts = alerts.filter(a => a.alert_type === alert_type);
  }
  
  // Sort by created_at descending
  alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  const paginated = alerts.slice(offset, offset + limit);
  
  return {
    success: true,
    alerts: paginated,
    total: alerts.length,
    unread_count: alerts.filter(a => !a.is_read).length
  };
}

async function cms_mark_alert_read(args) {
  const { alert_id } = args;
  
  const alerts = getAlerts();
  const alert = alerts.find(a => a.alert_id === alert_id);
  
  if (!alert) {
    throw new Error(`Alert ${alert_id} not found`);
  }
  
  alert.is_read = true;
  alert.read_at = new Date().toISOString();
  
  return {
    success: true,
    alert,
    message: 'Alert marked as read'
  };
}

async function cms_get_alert_preferences(args) {
  const { customer_id } = args;
  
  // For demo purposes, return default preferences
  return {
    success: true,
    preferences: {
      customer_id,
      email_enabled: true,
      sms_enabled: true,
      push_enabled: true,
      alert_types: {
        TRANSACTION: true,
        FRAUD: true,
        SECURITY: true,
        CARD_STATUS: true,
        SYSTEM: false,
        PROMOTION: true
      }
    }
  };
}

async function cms_update_alert_preferences(args) {
  const {
    customer_id,
    email_enabled,
    sms_enabled,
    push_enabled,
    alert_types
  } = args;
  
  // For demo purposes, just return the updated preferences
  return {
    success: true,
    preferences: {
      customer_id,
      email_enabled: email_enabled !== undefined ? email_enabled : true,
      sms_enabled: sms_enabled !== undefined ? sms_enabled : true,
      push_enabled: push_enabled !== undefined ? push_enabled : true,
      alert_types: alert_types || {}
    },
    message: 'Alert preferences updated successfully'
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
    evidence_description
  } = args;
  
  const transaction = getTransactions().find(t => t.transaction_id === transaction_id);
  if (!transaction) {
    throw new Error(`Transaction ${transaction_id} not found`);
  }
  
  // Find customer via card
  const card = getCards().find(c => c.card_id === transaction.card_id);
  const customer_id = card?.customer_id;
  
  const newDispute = {
    dispute_id: uuidv4(),
    transaction_id,
    customer_id,
    dispute_type,
    reason,
    amount: amount || Math.abs(transaction.amount),
    evidence_description,
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    resolution: null
  };
  
  getDisputes().push(newDispute);
  
  return {
    success: true,
    dispute: newDispute,
    message: 'Dispute created successfully'
  };
}

async function cms_get_disputes(args) {
  const { customer_id, status, limit = 50, offset = 0 } = args;
  
  let disputes = getDisputes();
  
  if (customer_id) {
    disputes = disputes.filter(d => d.customer_id === customer_id);
  }
  
  if (status) {
    disputes = disputes.filter(d => d.status === status);
  }
  
  // Sort by created_at descending
  disputes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  const paginated = disputes.slice(offset, offset + limit);
  
  return {
    success: true,
    disputes: paginated,
    total: disputes.length
  };
}

async function cms_get_dispute(args) {
  const { dispute_id } = args;
  
  const dispute = getDisputes().find(d => d.dispute_id === dispute_id);
  
  if (!dispute) {
    throw new Error(`Dispute ${dispute_id} not found`);
  }
  
  return {
    success: true,
    dispute
  };
}

async function cms_update_dispute(args) {
  const { dispute_id, additional_info, status } = args;
  
  const disputes = getDisputes();
  const dispute = disputes.find(d => d.dispute_id === dispute_id);
  
  if (!dispute) {
    throw new Error(`Dispute ${dispute_id} not found`);
  }
  
  if (additional_info) {
    dispute.additional_info = additional_info;
  }
  
  if (status) {
    dispute.status = status;
  }
  
  dispute.updated_at = new Date().toISOString();
  
  return {
    success: true,
    dispute,
    message: 'Dispute updated successfully'
  };
}

// ========================================
// Card Service Handlers
// ========================================

async function cms_view_pin(args) {
  const { card_id, password } = args;
  
  const card = cardOps.getById(card_id);
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  // For demo purposes, return a mock PIN
  // In production, this would require re-authentication
  return {
    success: true,
    pin: '****', // Masked for security
    message: 'PIN retrieved successfully (masked for security)',
    warning: 'This is a demo endpoint. In production, full PIN would require additional authentication.'
  };
}

async function cms_change_pin(args) {
  const { card_id, current_pin, new_pin } = args;
  
  const card = cardOps.getById(card_id);
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  // For demo purposes, accept any PIN change
  return {
    success: true,
    message: `PIN changed successfully for card ${card_id}`
  };
}

async function cms_request_replacement(args) {
  const { card_id, reason, expedited = false, shipping_address } = args;
  
  const card = cardOps.getById(card_id);
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  // Lock the old card
  cardOps.update(card_id, { card_status: 'CANCELLED' });
  
  const replacementCard = {
    replacement_request_id: uuidv4(),
    original_card_id: card_id,
    reason,
    expedited,
    shipping_address: shipping_address || 'Customer address on file',
    status: 'PROCESSING',
    estimated_delivery: expedited 
      ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  };
  
  return {
    success: true,
    replacement: replacementCard,
    message: `Replacement card requested successfully. ${expedited ? 'Expedited' : 'Standard'} delivery.`
  };
}

async function cms_activate_card(args) {
  const { card_id, last_four_ssn } = args;
  
  const card = cardOps.getById(card_id);
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  if (card.card_status !== 'PENDING_ACTIVATION') {
    throw new Error(`Card ${card_id} is not pending activation`);
  }
  
  const updatedCard = cardOps.update(card_id, { card_status: 'ACTIVE' });
  
  return {
    success: true,
    card: updatedCard,
    message: `Card ${card_id} activated successfully`
  };
}

// ========================================
// Export all handlers
// ========================================

module.exports = {
  cms_get_customer,
  cms_get_customers,
  cms_create_customer,
  cms_update_customer,
  cms_delete_customer,
  cms_search_customers,
  cms_get_cards,
  cms_get_card,
  cms_create_card,
  cms_update_card,
  cms_delete_card,
  cms_lock_card,
  cms_unlock_card,
  cms_update_card_controls,
  cms_get_transactions,
  cms_get_transaction,
  cms_search_transactions,
  cms_get_alerts,
  cms_mark_alert_read,
  cms_get_alert_preferences,
  cms_update_alert_preferences,
  cms_create_dispute,
  cms_get_disputes,
  cms_get_dispute,
  cms_update_dispute,
  cms_view_pin,
  cms_change_pin,
  cms_request_replacement,
  cms_activate_card,
};
