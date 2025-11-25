/**
 * MCP Tool Handlers - In-Memory Storage
 * Uses in-memory arrays for CRUD operations
 * Data is lost on server restart (perfect for demos)
 * 
 * Aligned with bankingcoredemo mock data structure
 */

// ========================================
// In-Memory Data Store
// ========================================

// Matching the naming conventions from bankingcoredemo
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA'];

// Generate initial customer data matching bankingcoredemo structure
function generateInitialCustomers() {
  const customers = [];
  
  // Generate 50 customers to match banking system (using first 10 for cards)
  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const cityIndex = i % cities.length;
    
    customers.push({
      customer_id: `CUST-${String(i + 1).padStart(3, '0')}`,
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      first_name: firstName,
      last_name: lastName,
      city: cities[cityIndex],
      state: states[cityIndex],
      postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
      is_active: true,
      account_status: 'ACTIVE',
      created_at: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
      last_login: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return customers;
}

// Generate a card for each customer (matching banking accounts)
function generateInitialCards(customers) {
  const cards = [];
  const cardTypes = ['DEBIT', 'CREDIT', 'DEBIT', 'CREDIT', 'PREPAID']; // More debit cards than credit
  
  customers.forEach((customer, index) => {
    // Create 1-2 cards per customer (focusing on first 30 customers for active cards)
    const numCards = index < 30 ? (Math.random() < 0.6 ? 2 : 1) : 1;
    
    for (let j = 0; j < numCards; j++) {
      const cardType = cardTypes[(index + j) % cardTypes.length];
      const lastFour = String(1000 + (index * 100 + j * 10) % 9000).padStart(4, '0');
      const cardNumber = cardType === 'CREDIT' ? `5500 0000 0000 ${lastFour}` : `4111 1111 1111 ${lastFour}`;
      
      const card = {
        card_id: `CARD-${String(cards.length + 1).padStart(3, '0')}`,
        customer_id: customer.customer_id,
        customer_name: `${customer.first_name} ${customer.last_name}`,
        card_number: `**** **** **** ${lastFour}`,
        full_card_number: cardNumber,
        card_type: cardType,
        card_status: index < 30 ? 'ACTIVE' : (Math.random() < 0.8 ? 'ACTIVE' : 'INACTIVE'),
        expiry_date: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${25 + Math.floor(Math.random() * 5)}`,
        cvv: String(Math.floor(Math.random() * 900) + 100),
        balance: cardType === 'DEBIT' ? Math.floor(Math.random() * 10000) + 500 : Math.floor(Math.random() * 5000),
        credit_limit: cardType === 'CREDIT' ? (5000 + Math.floor(Math.random() * 20000)) : (cardType === 'PREPAID' ? 2000 : 5000),
        daily_limit: cardType === 'CREDIT' ? 2000 : 1000,
        monthly_limit: cardType === 'CREDIT' ? 10000 : 5000,
        is_locked: false,
        created_at: customer.created_at,
        last_used: Math.random() < 0.7 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString() : null
      };
      
      cards.push(card);
    }
  });
  
  return cards;
}

// Generate transactions matching cards
function generateInitialTransactions(cards) {
  const transactions = [];
  const merchants = [
    { name: 'Starbucks Coffee', category: 'Food & Dining', city: 'San Francisco', state: 'CA' },
    { name: 'Amazon', category: 'Shopping', city: 'Seattle', state: 'WA' },
    { name: 'Target', category: 'Shopping', city: 'Minneapolis', state: 'MN' },
    { name: 'Shell Gas Station', category: 'Gas & Fuel', city: 'Houston', state: 'TX' },
    { name: 'Whole Foods Market', category: 'Groceries', city: 'Austin', state: 'TX' },
    { name: 'Netflix', category: 'Entertainment', city: 'Los Gatos', state: 'CA' },
    { name: 'Uber', category: 'Transportation', city: 'San Francisco', state: 'CA' },
    { name: 'Apple Store', category: 'Electronics', city: 'Cupertino', state: 'CA' },
    { name: 'CVS Pharmacy', category: 'Healthcare', city: 'Woonsocket', state: 'RI' },
    { name: 'Home Depot', category: 'Home Improvement', city: 'Atlanta', state: 'GA' }
  ];
  
  // Generate 10-20 transactions per active card
  cards.filter(c => c.card_status === 'ACTIVE').forEach((card, cardIndex) => {
    const numTransactions = Math.floor(Math.random() * 10) + 10;
    
    for (let i = 0; i < numTransactions; i++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = -(Math.floor(Math.random() * 20000) + 500) / 100; // $5.00 to $200.00
      const daysAgo = Math.floor(Math.random() * 60); // Last 60 days
      
      transactions.push({
        transaction_id: `TXN-${String(transactions.length + 1).padStart(4, '0')}`,
        card_id: card.card_id,
        customer_id: card.customer_id,
        customer_name: card.customer_name,
        card_last_four: card.card_number.slice(-4),
        amount: amount,
        merchant: merchant.name,
        merchant_name: merchant.name,
        merchant_category: merchant.category,
        category: merchant.category,
        transaction_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        transaction_status: 'COMPLETED',
        status: 'COMPLETED',
        location: { city: merchant.city, state: merchant.state, country: 'US' }
      });
    }
  });
  
  return transactions;
}

// Generate alerts
function generateInitialAlerts(customers) {
  const alerts = [];
  const alertTypes = ['FRAUD_DETECTED', 'LARGE_TRANSACTION', 'UNUSUAL_ACTIVITY', 'CARD_DECLINED', 'SUSPICIOUS_LOGIN'];
  
  // 20% of customers have alerts
  customers.slice(0, 10).forEach((customer, index) => {
    if (Math.random() < 0.5) {
      alerts.push({
        alert_id: `ALERT-${String(alerts.length + 1).padStart(3, '0')}`,
        customer_id: customer.customer_id,
        alert_type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
        message: 'Unusual activity detected on your account',
        details: 'Multiple transactions from different locations detected',
        alert_status: Math.random() < 0.3 ? 'READ' : 'UNREAD',
        status: Math.random() < 0.3 ? 'READ' : 'UNREAD',
        created_at: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString(),
        is_read: Math.random() < 0.3
      });
    }
  });
  
  return alerts;
}

// Generate disputes
function generateInitialDisputes(transactions, cards) {
  const disputes = [];
  
  // 2% of transactions have disputes
  transactions.slice(0, 20).forEach((transaction, index) => {
    if (Math.random() < 0.1) {
      const card = cards.find(c => c.card_id === transaction.card_id);
      disputes.push({
        dispute_id: `DISPUTE-${String(disputes.length + 1).padStart(3, '0')}`,
        transaction_id: transaction.transaction_id,
        customer_id: transaction.customer_id,
        card_id: transaction.card_id,
        amount: Math.abs(transaction.amount),
        reason: ['Unauthorized transaction', 'Duplicate charge', 'Service not received', 'Product defective'][Math.floor(Math.random() * 4)],
        description: 'I did not authorize this transaction',
        dispute_status: ['PENDING', 'UNDER_REVIEW', 'RESOLVED'][Math.floor(Math.random() * 3)],
        status: ['PENDING', 'UNDER_REVIEW', 'RESOLVED'][Math.floor(Math.random() * 3)],
        created_at: new Date(new Date(transaction.transaction_date).getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString(),
        resolution: null
      });
    }
  });
  
  return disputes;
}

// Initialize data store
const initialCustomers = generateInitialCustomers();
const initialCards = generateInitialCards(initialCustomers);
const initialTransactions = generateInitialTransactions(initialCards);
const initialAlerts = generateInitialAlerts(initialCustomers);
const initialDisputes = generateInitialDisputes(initialTransactions, initialCards);

const dataStore = {
  customers: initialCustomers,
  cards: initialCards,
  transactions: initialTransactions,
  alerts: initialAlerts,
  disputes: initialDisputes,
  
  // Counters for generating new IDs
  counters: {
    customer: initialCustomers.length + 1,
    card: initialCards.length + 1,
    transaction: initialTransactions.length + 1,
    alert: initialAlerts.length + 1,
    dispute: initialDisputes.length + 1
  }
};

// Helper function to generate IDs
function generateId(type) {
  const counter = dataStore.counters[type]++;
  const prefix = type.toUpperCase();
  return `${prefix}-${String(counter).padStart(3, '0')}`;
}

// Log initial data stats
console.log('📊 In-Memory Data Store Initialized:');
console.log(`   👥 ${dataStore.customers.length} customers`);
console.log(`   💳 ${dataStore.cards.length} cards`);
console.log(`   💵 ${dataStore.transactions.length} transactions`);
console.log(`   🚨 ${dataStore.alerts.length} alerts`);
console.log(`   ⚖️  ${dataStore.disputes.length} disputes`);

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
      c.email.toLowerCase().includes(searchLower) ||
      c.first_name.toLowerCase().includes(searchLower) ||
      c.last_name.toLowerCase().includes(searchLower)
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
  const { username, email, phone, password, first_name, last_name } = args;
  
  // Check for duplicate email
  if (dataStore.customers.some(c => c.email === email)) {
    throw new Error(`Customer with email ${email} already exists`);
  }
  
  const newCustomer = {
    customer_id: generateId('customer'),
    username,
    email,
    phone,
    first_name: first_name || username.split('.')[0],
    last_name: last_name || username.split('.')[1] || '',
    city: cities[Math.floor(Math.random() * cities.length)],
    state: states[Math.floor(Math.random() * states.length)],
    postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
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
  const { customer_id, email, phone, first_name, last_name } = args;
  
  const customerIndex = dataStore.customers.findIndex(c => c.customer_id === customer_id);
  
  if (customerIndex === -1) {
    throw new Error(`Customer ${customer_id} not found`);
  }
  
  if (email) dataStore.customers[customerIndex].email = email;
  if (phone) dataStore.customers[customerIndex].phone = phone;
  if (first_name) dataStore.customers[customerIndex].first_name = first_name;
  if (last_name) dataStore.customers[customerIndex].last_name = last_name;
  
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
  dataStore.transactions = dataStore.transactions.filter(t => t.customer_id !== customer_id);
  dataStore.alerts = dataStore.alerts.filter(a => a.customer_id !== customer_id);
  dataStore.disputes = dataStore.disputes.filter(d => d.customer_id !== customer_id);
  
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
  const fullNumber = card_type === 'CREDIT' ? `5500 0000 0000 ${lastFour}` : `4111 1111 1111 ${lastFour}`;
  
  const newCard = {
    card_id: generateId('card'),
    customer_id,
    customer_name: `${customer.first_name} ${customer.last_name}`,
    card_number: `**** **** **** ${lastFour}`,
    full_card_number: fullNumber,
    card_type: card_type || 'DEBIT',
    card_status: 'ACTIVE',
    expiry_date: '12/28',
    cvv: String(Math.floor(Math.random() * 900) + 100),
    balance: 0,
    credit_limit: credit_limit || (card_type === 'CREDIT' ? 10000 : 5000),
    daily_limit: card_type === 'CREDIT' ? 2000 : 1000,
    monthly_limit: card_type === 'CREDIT' ? 10000 : 5000,
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
  
  // Sort by date descending
  filtered.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  
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
  
  // Sort by date descending
  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
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
  
  // Sort by date descending
  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
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
