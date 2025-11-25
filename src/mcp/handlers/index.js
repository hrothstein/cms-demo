/**
 * MCP Tool Handlers - In-Memory Storage
 * Uses in-memory arrays for CRUD operations
 * Data is lost on server restart (perfect for demos)
 */

// ========================================
// In-Memory Data Store
// ========================================

const dataStore = {
  customers: [
    {
      customer_id: 'CUST-001',
      username: 'john.doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      is_active: true,
      account_status: 'ACTIVE',
      created_at: '2024-01-15T10:30:00Z',
      last_login: '2024-01-20T14:30:00Z'
    },
    {
      customer_id: 'CUST-002',
      username: 'jane.smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0124',
      is_active: true,
      account_status: 'ACTIVE',
      created_at: '2024-01-16T14:20:00Z',
      last_login: '2024-01-21T09:15:00Z'
    }
  ],
  
  cards: [
    {
      card_id: 'CARD-001',
      customer_id: 'CUST-001',
      card_number: '**** **** **** 1234',
      full_card_number: '4111 1111 1111 1234',
      card_type: 'DEBIT',
      card_status: 'ACTIVE',
      expiry_date: '12/25',
      cvv: '123',
      balance: 2500.00,
      credit_limit: 5000.00,
      daily_limit: 1000.00,
      monthly_limit: 5000.00,
      is_locked: false,
      created_at: '2024-01-15T10:30:00Z',
      last_used: '2024-01-20T14:30:00Z'
    },
    {
      card_id: 'CARD-002',
      customer_id: 'CUST-001',
      card_number: '**** **** **** 5678',
      full_card_number: '5500 0000 0000 5678',
      card_type: 'CREDIT',
      card_status: 'ACTIVE',
      expiry_date: '08/26',
      cvv: '456',
      balance: 1200.00,
      credit_limit: 10000.00,
      daily_limit: 2000.00,
      monthly_limit: 10000.00,
      is_locked: false,
      created_at: '2024-01-16T11:00:00Z',
      last_used: '2024-01-21T09:00:00Z'
    }
  ],
  
  transactions: [
    {
      transaction_id: 'TXN-001',
      card_id: 'CARD-001',
      customer_id: 'CUST-001',
      amount: -45.50,
      merchant: 'Starbucks Coffee',
      merchant_name: 'Starbucks Coffee',
      customer_name: 'John Doe',
      card_last_four: '1234',
      merchant_category: 'Food & Dining',
      category: 'Food & Dining',
      transaction_date: '2024-01-20T10:30:00Z',
      transaction_status: 'COMPLETED',
      status: 'COMPLETED',
      location: { city: 'San Francisco', state: 'CA', country: 'US' }
    },
    {
      transaction_id: 'TXN-002',
      card_id: 'CARD-001',
      customer_id: 'CUST-001',
      amount: -120.00,
      merchant: 'Amazon',
      merchant_name: 'Amazon',
      customer_name: 'John Doe',
      card_last_four: '1234',
      merchant_category: 'Shopping',
      category: 'Shopping',
      transaction_date: '2024-01-19T15:45:00Z',
      transaction_status: 'COMPLETED',
      status: 'COMPLETED',
      location: { city: 'Seattle', state: 'WA', country: 'US' }
    },
    {
      transaction_id: 'TXN-003',
      card_id: 'CARD-002',
      customer_id: 'CUST-001',
      amount: -89.99,
      merchant: 'Target',
      merchant_name: 'Target',
      customer_name: 'John Doe',
      card_last_four: '5678',
      merchant_category: 'Shopping',
      category: 'Shopping',
      transaction_date: '2024-01-18T09:15:00Z',
      transaction_status: 'COMPLETED',
      status: 'COMPLETED',
      location: { city: 'San Francisco', state: 'CA', country: 'US' }
    }
  ],
  
  alerts: [
    {
      alert_id: 'ALERT-001',
      customer_id: 'CUST-001',
      alert_type: 'FRAUD_DETECTED',
      severity: 'HIGH',
      message: 'Unusual spending pattern detected',
      details: 'Multiple high-value transactions in short time period',
      alert_status: 'UNREAD',
      status: 'UNREAD',
      created_at: '2024-01-20T12:00:00Z',
      is_read: false
    }
  ],
  
  disputes: [
    {
      dispute_id: 'DISPUTE-001',
      transaction_id: 'TXN-001',
      customer_id: 'CUST-001',
      card_id: 'CARD-001',
      amount: 45.50,
      reason: 'Unauthorized transaction',
      description: 'I did not make this purchase',
      dispute_status: 'PENDING',
      status: 'PENDING',
      created_at: '2024-01-20T11:00:00Z',
      resolution: null
    }
  ],
  
  // Counters for generating IDs
  counters: {
    customer: 3,
    card: 3,
    transaction: 4,
    alert: 2,
    dispute: 2
  }
};

// Helper function to generate IDs
function generateId(type) {
  const counter = dataStore.counters[type]++;
  const prefix = type.toUpperCase();
  return `${prefix}-${String(counter).padStart(3, '0')}`;
}

// ========================================
// Customer Management Handlers
// ========================================

async function cms_get_customers(args) {
  const { limit = 20, offset = 0, search = '', status = '' } = args;
  
  let filtered = [...dataStore.customers];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(c => 
      c.customer_id.toLowerCase().includes(searchLower) ||
      c.username.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower)
    );
  }
  
  if (status) {
    const isActive = status.toLowerCase() === 'active';
    filtered = filtered.filter(c => c.is_active === isActive);
  }
  
  // Add card counts
  const customersWithCounts = filtered.map(customer => {
    const customerCards = dataStore.cards.filter(c => c.customer_id === customer.customer_id);
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
    total: filtered.length,
    limit,
    offset
  };
}

async function cms_create_customer(args) {
  const { username, email, phone, password } = args;
  
  // Check for duplicate email
  if (dataStore.customers.some(c => c.email === email)) {
    throw new Error(`Customer with email ${email} already exists`);
  }
  
  const newCustomer = {
    customer_id: generateId('customer'),
    username,
    email,
    phone,
    is_active: true,
    account_status: 'ACTIVE',
    created_at: new Date().toISOString(),
    last_login: null
  };
  
  dataStore.customers.push(newCustomer);
  
  return {
    success: true,
    message: 'Customer created successfully',
    customer: newCustomer
  };
}

async function cms_update_customer(args) {
  const { customer_id, email, phone } = args;
  
  const customerIndex = dataStore.customers.findIndex(c => c.customer_id === customer_id);
  
  if (customerIndex === -1) {
    throw new Error(`Customer ${customer_id} not found`);
  }
  
  if (email) dataStore.customers[customerIndex].email = email;
  if (phone) dataStore.customers[customerIndex].phone = phone;
  
  return {
    success: true,
    message: 'Customer updated successfully',
    customer: dataStore.customers[customerIndex]
  };
}

async function cms_delete_customer(args) {
  const { customer_id } = args;
  
  const customerIndex = dataStore.customers.findIndex(c => c.customer_id === customer_id);
  
  if (customerIndex === -1) {
    throw new Error(`Customer ${customer_id} not found`);
  }
  
  // Remove customer and their cards
  dataStore.customers.splice(customerIndex, 1);
  dataStore.cards = dataStore.cards.filter(c => c.customer_id !== customer_id);
  
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
  const { limit = 20, offset = 0, customer_id = '', status = '', card_type = '' } = args;
  
  let filtered = [...dataStore.cards];
  
  if (customer_id) {
    filtered = filtered.filter(c => c.customer_id === customer_id);
  }
  
  if (status) {
    filtered = filtered.filter(c => c.card_status.toLowerCase() === status.toLowerCase());
  }
  
  if (card_type) {
    filtered = filtered.filter(c => c.card_type.toLowerCase() === card_type.toLowerCase());
  }
  
  const paginated = filtered.slice(offset, offset + limit);
  
  return {
    success: true,
    cards: paginated,
    total: filtered.length,
    limit,
    offset
  };
}

async function cms_get_card_details(args) {
  const { card_id } = args;
  
  const card = dataStore.cards.find(c => c.card_id === card_id);
  
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  return {
    success: true,
    card
  };
}

async function cms_create_card(args) {
  const { customer_id, card_type, credit_limit } = args;
  
  const customer = dataStore.customers.find(c => c.customer_id === customer_id);
  
  if (!customer) {
    throw new Error(`Customer ${customer_id} not found`);
  }
  
  const lastFour = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  const fullNumber = `4111 1111 1111 ${lastFour}`;
  
  const newCard = {
    card_id: generateId('card'),
    customer_id,
    card_number: `**** **** **** ${lastFour}`,
    full_card_number: fullNumber,
    card_type: card_type || 'DEBIT',
    card_status: 'ACTIVE',
    expiry_date: '12/28',
    cvv: String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    balance: 0,
    credit_limit: credit_limit || 5000,
    daily_limit: 1000,
    monthly_limit: 5000,
    is_locked: false,
    created_at: new Date().toISOString(),
    last_used: null
  };
  
  dataStore.cards.push(newCard);
  
  return {
    success: true,
    message: 'Card created successfully',
    card: newCard
  };
}

async function cms_update_card(args) {
  const { card_id, status, daily_limit, monthly_limit } = args;
  
  const cardIndex = dataStore.cards.findIndex(c => c.card_id === card_id);
  
  if (cardIndex === -1) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  if (status) dataStore.cards[cardIndex].card_status = status;
  if (daily_limit) dataStore.cards[cardIndex].daily_limit = daily_limit;
  if (monthly_limit) dataStore.cards[cardIndex].monthly_limit = monthly_limit;
  
  return {
    success: true,
    message: 'Card updated successfully',
    card: dataStore.cards[cardIndex]
  };
}

async function cms_lock_card(args) {
  const { card_id, reason } = args;
  
  const cardIndex = dataStore.cards.findIndex(c => c.card_id === card_id);
  
  if (cardIndex === -1) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  dataStore.cards[cardIndex].is_locked = true;
  dataStore.cards[cardIndex].card_status = 'LOCKED';
  
  return {
    success: true,
    message: `Card ${card_id} locked successfully`,
    reason: reason || 'Manual lock',
    card: dataStore.cards[cardIndex]
  };
}

async function cms_unlock_card(args) {
  const { card_id } = args;
  
  const cardIndex = dataStore.cards.findIndex(c => c.card_id === card_id);
  
  if (cardIndex === -1) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  dataStore.cards[cardIndex].is_locked = false;
  dataStore.cards[cardIndex].card_status = 'ACTIVE';
  
  return {
    success: true,
    message: `Card ${card_id} unlocked successfully`,
    card: dataStore.cards[cardIndex]
  };
}

async function cms_update_card_controls(args) {
  const { card_id, daily_limit, monthly_limit, allowed_categories, blocked_merchants } = args;
  
  const cardIndex = dataStore.cards.findIndex(c => c.card_id === card_id);
  
  if (cardIndex === -1) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  if (daily_limit) dataStore.cards[cardIndex].daily_limit = daily_limit;
  if (monthly_limit) dataStore.cards[cardIndex].monthly_limit = monthly_limit;
  
  return {
    success: true,
    message: 'Card controls updated successfully',
    controls: {
      card_id,
      daily_limit: dataStore.cards[cardIndex].daily_limit,
      monthly_limit: dataStore.cards[cardIndex].monthly_limit,
      allowed_categories: allowed_categories || [],
      blocked_merchants: blocked_merchants || []
    }
  };
}

// ========================================
// Transaction Management Handlers
// ========================================

async function cms_get_transactions(args) {
  const { limit = 50, offset = 0, card_id = '', customer_id = '', status = '' } = args;
  
  let filtered = [...dataStore.transactions];
  
  if (card_id) {
    filtered = filtered.filter(t => t.card_id === card_id);
  }
  
  if (customer_id) {
    filtered = filtered.filter(t => t.customer_id === customer_id);
  }
  
  if (status) {
    filtered = filtered.filter(t => t.transaction_status.toLowerCase() === status.toLowerCase());
  }
  
  const paginated = filtered.slice(offset, offset + limit);
  
  return {
    success: true,
    transactions: paginated,
    total: filtered.length,
    limit,
    offset
  };
}

async function cms_search_transactions(args) {
  return cms_get_transactions(args);
}

// ========================================
// Alert Management Handlers
// ========================================

async function cms_get_alerts(args) {
  const { limit = 20, offset = 0, customer_id = '', severity = '', status = '' } = args;
  
  let filtered = [...dataStore.alerts];
  
  if (customer_id) {
    filtered = filtered.filter(a => a.customer_id === customer_id);
  }
  
  if (severity) {
    filtered = filtered.filter(a => a.severity.toLowerCase() === severity.toLowerCase());
  }
  
  if (status) {
    filtered = filtered.filter(a => a.alert_status.toLowerCase() === status.toLowerCase());
  }
  
  const paginated = filtered.slice(offset, offset + limit);
  
  return {
    success: true,
    alerts: paginated,
    total: filtered.length,
    limit,
    offset
  };
}

async function cms_mark_alert_read(args) {
  const { alert_id } = args;
  
  const alertIndex = dataStore.alerts.findIndex(a => a.alert_id === alert_id);
  
  if (alertIndex === -1) {
    throw new Error(`Alert ${alert_id} not found`);
  }
  
  dataStore.alerts[alertIndex].alert_status = 'READ';
  dataStore.alerts[alertIndex].status = 'READ';
  dataStore.alerts[alertIndex].is_read = true;
  
  return {
    success: true,
    message: `Alert ${alert_id} marked as read`,
    alert: dataStore.alerts[alertIndex]
  };
}

async function cms_get_alert_preferences(args) {
  const { customer_id } = args;
  
  const customer = dataStore.customers.find(c => c.customer_id === customer_id);
  
  if (!customer) {
    throw new Error(`Customer ${customer_id} not found`);
  }
  
  return {
    success: true,
    preferences: {
      customer_id,
      email_enabled: true,
      sms_enabled: true,
      push_enabled: true,
      alert_types: ['FRAUD_DETECTED', 'LARGE_TRANSACTION', 'CARD_DECLINED']
    }
  };
}

async function cms_update_alert_preferences(args) {
  const { customer_id, email_enabled, sms_enabled, push_enabled } = args;
  
  const customer = dataStore.customers.find(c => c.customer_id === customer_id);
  
  if (!customer) {
    throw new Error(`Customer ${customer_id} not found`);
  }
  
  return {
    success: true,
    message: 'Alert preferences updated successfully',
    preferences: {
      customer_id,
      email_enabled: email_enabled !== undefined ? email_enabled : true,
      sms_enabled: sms_enabled !== undefined ? sms_enabled : true,
      push_enabled: push_enabled !== undefined ? push_enabled : true
    }
  };
}

// ========================================
// Dispute Management Handlers
// ========================================

async function cms_create_dispute(args) {
  const { transaction_id, reason, description } = args;
  
  const transaction = dataStore.transactions.find(t => t.transaction_id === transaction_id);
  
  if (!transaction) {
    throw new Error(`Transaction ${transaction_id} not found`);
  }
  
  const newDispute = {
    dispute_id: generateId('dispute'),
    transaction_id,
    customer_id: transaction.customer_id,
    card_id: transaction.card_id,
    amount: Math.abs(transaction.amount),
    reason,
    description,
    dispute_status: 'PENDING',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    resolution: null
  };
  
  dataStore.disputes.push(newDispute);
  
  return {
    success: true,
    message: 'Dispute created successfully',
    dispute: newDispute
  };
}

async function cms_get_disputes(args) {
  const { limit = 20, offset = 0, customer_id = '', status = '' } = args;
  
  let filtered = [...dataStore.disputes];
  
  if (customer_id) {
    filtered = filtered.filter(d => d.customer_id === customer_id);
  }
  
  if (status) {
    filtered = filtered.filter(d => d.dispute_status.toLowerCase() === status.toLowerCase());
  }
  
  const paginated = filtered.slice(offset, offset + limit);
  
  return {
    success: true,
    disputes: paginated,
    total: filtered.length,
    limit,
    offset
  };
}

async function cms_update_dispute(args) {
  const { dispute_id, status, resolution } = args;
  
  const disputeIndex = dataStore.disputes.findIndex(d => d.dispute_id === dispute_id);
  
  if (disputeIndex === -1) {
    throw new Error(`Dispute ${dispute_id} not found`);
  }
  
  if (status) {
    dataStore.disputes[disputeIndex].dispute_status = status;
    dataStore.disputes[disputeIndex].status = status;
  }
  if (resolution) {
    dataStore.disputes[disputeIndex].resolution = resolution;
  }
  
  return {
    success: true,
    message: 'Dispute updated successfully',
    dispute: dataStore.disputes[disputeIndex]
  };
}

// ========================================
// Card Service Handlers
// ========================================

async function cms_view_pin(args) {
  const { card_id } = args;
  
  const card = dataStore.cards.find(c => c.card_id === card_id);
  
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  return {
    success: true,
    card_id,
    pin: '1234',
    message: 'PIN retrieved successfully'
  };
}

async function cms_change_pin(args) {
  const { card_id, new_pin } = args;
  
  const card = dataStore.cards.find(c => c.card_id === card_id);
  
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  return {
    success: true,
    message: `PIN changed successfully for card ${card_id}`
  };
}

async function cms_request_replacement(args) {
  const { card_id, reason, shipping_address } = args;
  
  const card = dataStore.cards.find(c => c.card_id === card_id);
  
  if (!card) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  return {
    success: true,
    message: 'Card replacement requested successfully',
    replacement: {
      original_card_id: card_id,
      new_card_id: generateId('card'),
      reason,
      shipping_address,
      estimated_delivery: '5-7 business days'
    }
  };
}

async function cms_activate_card(args) {
  const { card_id, last_four_digits } = args;
  
  const cardIndex = dataStore.cards.findIndex(c => c.card_id === card_id);
  
  if (cardIndex === -1) {
    throw new Error(`Card ${card_id} not found`);
  }
  
  dataStore.cards[cardIndex].card_status = 'ACTIVE';
  
  return {
    success: true,
    message: `Card ${card_id} activated successfully`,
    card: dataStore.cards[cardIndex]
  };
}

// Export all handlers
module.exports = {
  cms_get_customers,
  cms_create_customer,
  cms_update_customer,
  cms_delete_customer,
  cms_search_customers,
  cms_get_cards,
  cms_get_card_details,
  cms_create_card,
  cms_update_card,
  cms_lock_card,
  cms_unlock_card,
  cms_update_card_controls,
  cms_get_transactions,
  cms_search_transactions,
  cms_get_alerts,
  cms_mark_alert_read,
  cms_get_alert_preferences,
  cms_update_alert_preferences,
  cms_create_dispute,
  cms_get_disputes,
  cms_update_dispute,
  cms_view_pin,
  cms_change_pin,
  cms_request_replacement,
  cms_activate_card
};
