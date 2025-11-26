/**
 * In-Memory Datastore for CMS MCP Server
 * Provides CRUD operations for customers, cards, transactions, alerts, disputes
 * Data resets on server restart (perfect for demos)
 */

const { v4: uuidv4 } = require('uuid');
const { customers } = require('./seed-data');

// Helper functions
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate cards for customers based on their profiles
 * Higher income = higher credit limits
 */
function generateCardsForCustomers(customers) {
  const cards = [];
  const cardTypes = ['DEBIT', 'CREDIT', 'PREPAID'];
  
  customers.forEach((customer, customerIndex) => {
    // Determine number of cards based on customer type
    const numCards = customer.customer_type === 'BUSINESS' 
      ? Math.floor(Math.random() * 3) + 1  // 1-3 cards for business
      : Math.floor(Math.random() * 2) + 1; // 1-2 cards for individual
    
    for (let i = 0; i < numCards; i++) {
      // Business customers get more CREDIT cards
      let cardType;
      if (customer.customer_type === 'BUSINESS') {
        cardType = i === 0 ? 'CREDIT' : randomElement(['CREDIT', 'DEBIT']);
      } else {
        cardType = randomElement(cardTypes);
      }
      
      // Generate card number (last 4 digits)
      const lastFour = String(1000 + (customerIndex * 100 + i * 10) % 9000).padStart(4, '0');
      const cardNumberPrefix = cardType === 'CREDIT' ? '5500' : (cardType === 'DEBIT' ? '4111' : '6011');
      
      // Calculate credit limit based on annual income
      let creditLimit;
      if (cardType === 'CREDIT') {
        // Credit limit is typically 20-40% of annual income
        const baseLimit = Math.floor(customer.annual_income * 0.3);
        creditLimit = Math.round(baseLimit / 1000) * 1000; // Round to nearest 1000
      } else if (cardType === 'PREPAID') {
        creditLimit = 5000;
      } else {
        creditLimit = Math.min(50000, Math.floor(customer.annual_income * 0.5));
      }
      
      // Daily limit as percentage of credit limit
      const dailyLimit = Math.floor(creditLimit * 0.2);
      const monthlyLimit = creditLimit;
      
      // Expiration date (2-5 years from now)
      const expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const expYear = String(new Date().getFullYear() + Math.floor(Math.random() * 3) + 2).slice(-2);
      
      // Determine card status (most cards are ACTIVE)
      const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'LOCKED', 'PENDING_ACTIVATION'];
      const cardStatus = customer.kyc_status === 'PENDING' ? 'PENDING_ACTIVATION' : randomElement(statuses);
      
      const card = {
        card_id: uuidv4(),
        customer_id: customer.customer_id,
        customer_name: customer.customer_type === 'BUSINESS' 
          ? customer.business_name 
          : `${customer.first_name} ${customer.last_name}`,
        card_number: `**** **** **** ${lastFour}`,
        full_card_number: `${cardNumberPrefix} 1111 1111 ${lastFour}`,
        card_type: cardType,
        card_status: cardStatus,
        expiry_date: `${expMonth}/${expYear}`,
        cvv: String(Math.floor(Math.random() * 900) + 100),
        balance: cardType === 'DEBIT' ? Math.floor(Math.random() * Math.min(creditLimit, 50000)) : 0,
        credit_limit: creditLimit,
        available_credit: cardType === 'CREDIT' ? Math.floor(creditLimit * 0.7) : creditLimit,
        daily_limit: dailyLimit,
        monthly_limit: monthlyLimit,
        is_locked: cardStatus === 'LOCKED',
        card_controls: {
          international_enabled: Math.random() > 0.3,
          online_enabled: Math.random() > 0.2,
          contactless_enabled: Math.random() > 0.1,
          atm_enabled: cardType !== 'CREDIT' && Math.random() > 0.2,
          daily_limit: dailyLimit,
          transaction_limit: Math.floor(dailyLimit * 0.5),
        },
        created_at: customer.created_at,
        last_used: cardStatus === 'ACTIVE' ? daysAgo(Math.floor(Math.random() * 30)) : null,
      };
      
      cards.push(card);
    }
  });
  
  return cards;
}

/**
 * Generate realistic transactions for cards
 */
function generateTransactions(cards) {
  const transactions = [];
  const merchants = [
    { name: 'Starbucks Coffee', category: 'Food & Dining', city: 'San Francisco', state: 'CA', avgAmount: 5.50 },
    { name: 'Amazon', category: 'Shopping', city: 'Seattle', state: 'WA', avgAmount: 45.00 },
    { name: 'Target', category: 'Shopping', city: 'Minneapolis', state: 'MN', avgAmount: 85.00 },
    { name: 'Shell Gas Station', category: 'Gas & Fuel', city: 'Houston', state: 'TX', avgAmount: 55.00 },
    { name: 'Whole Foods Market', category: 'Groceries', city: 'Austin', state: 'TX', avgAmount: 125.00 },
    { name: 'Netflix', category: 'Entertainment', city: 'Los Gatos', state: 'CA', avgAmount: 15.99 },
    { name: 'Uber', category: 'Transportation', city: 'San Francisco', state: 'CA', avgAmount: 25.00 },
    { name: 'Apple Store', category: 'Electronics', city: 'Cupertino', state: 'CA', avgAmount: 350.00 },
    { name: 'Home Depot', category: 'Home Improvement', city: 'Atlanta', state: 'GA', avgAmount: 150.00 },
    { name: 'Walmart', category: 'Groceries', city: 'Bentonville', state: 'AR', avgAmount: 75.00 },
    { name: 'CVS Pharmacy', category: 'Health & Wellness', city: 'Providence', state: 'RI', avgAmount: 35.00 },
    { name: 'Delta Airlines', category: 'Travel', city: 'Atlanta', state: 'GA', avgAmount: 450.00 },
    { name: 'Hilton Hotels', category: 'Travel', city: 'McLean', state: 'VA', avgAmount: 225.00 },
    { name: 'Starbucks', category: 'Food & Dining', city: 'Seattle', state: 'WA', avgAmount: 6.50 },
    { name: 'McDonald\'s', category: 'Food & Dining', city: 'Chicago', state: 'IL', avgAmount: 12.00 },
  ];
  
  // Generate 5-20 transactions per ACTIVE card
  cards.filter(c => c.card_status === 'ACTIVE').forEach(card => {
    const numTransactions = Math.floor(Math.random() * 16) + 5; // 5-20 transactions
    
    for (let i = 0; i < numTransactions; i++) {
      const merchant = randomElement(merchants);
      const amount = -(merchant.avgAmount * (0.5 + Math.random())); // Vary amount ±50%
      const daysOld = Math.floor(Math.random() * 90); // Last 90 days
      
      const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING', 'DECLINED'];
      const types = ['PURCHASE', 'PURCHASE', 'PURCHASE', 'REFUND', 'WITHDRAWAL'];
      
      transactions.push({
        transaction_id: uuidv4(),
        card_id: card.card_id,
        amount: Math.round(amount * 100) / 100,
        currency: 'USD',
        merchant_name: merchant.name,
        merchant_category: merchant.category,
        transaction_type: randomElement(types),
        transaction_status: randomElement(statuses),
        transaction_date: daysAgo(daysOld),
        location: {
          city: merchant.city,
          state: merchant.state,
          country: 'USA',
        },
        is_suspicious: Math.random() > 0.95, // 5% suspicious
        created_at: daysAgo(daysOld),
      });
    }
  });
  
  return transactions;
}

/**
 * Generate alerts for customers
 */
function generateAlerts(customers, cards, transactions) {
  const alerts = [];
  const alertTypes = ['TRANSACTION', 'FRAUD', 'SECURITY', 'CARD_STATUS', 'SYSTEM', 'PROMOTION'];
  const alertTemplates = {
    TRANSACTION: 'Large transaction detected: ${amount} at ${merchant}',
    FRAUD: 'Suspicious activity detected on your account',
    SECURITY: 'New login detected from ${location}',
    CARD_STATUS: 'Your card ending in ${last4} has been ${status}',
    SYSTEM: 'System maintenance scheduled for ${date}',
    PROMOTION: 'Special offer: Earn 3x points on all purchases',
  };
  
  // Generate 3-8 alerts per customer
  customers.slice(0, 20).forEach(customer => {
    const numAlerts = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < numAlerts; i++) {
      const alertType = randomElement(alertTypes);
      const isRead = Math.random() > 0.4; // 60% read
      
      alerts.push({
        alert_id: uuidv4(),
        customer_id: customer.customer_id,
        alert_type: alertType,
        title: `${alertType.charAt(0)}${alertType.slice(1).toLowerCase()} Alert`,
        message: alertTemplates[alertType],
        is_read: isRead,
        created_at: daysAgo(Math.floor(Math.random() * 30)),
        read_at: isRead ? daysAgo(Math.floor(Math.random() * 29)) : null,
      });
    }
  });
  
  return alerts;
}

/**
 * Generate sample disputes
 */
function generateDisputes(customers, cards, transactions) {
  const disputes = [];
  const disputeTypes = ['unauthorized', 'duplicate', 'incorrect_amount', 'merchandise_not_received', 'fraud'];
  const statuses = ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];
  
  // Create 10-15 disputes
  const suspiciousTransactions = transactions.filter(t => t.is_suspicious || Math.random() > 0.9).slice(0, 15);
  
  suspiciousTransactions.forEach((transaction, index) => {
    disputes.push({
      dispute_id: uuidv4(),
      transaction_id: transaction.transaction_id,
      customer_id: customers.find(c => {
        const card = cards.find(card => card.card_id === transaction.card_id);
        return card && card.customer_id === c.customer_id;
      })?.customer_id,
      dispute_type: randomElement(disputeTypes),
      reason: `I did not authorize this transaction with ${transaction.merchant_name}`,
      amount: Math.abs(transaction.amount),
      status: randomElement(statuses),
      created_at: transaction.created_at,
      updated_at: daysAgo(Math.floor(Math.random() * 10)),
      resolution: index % 3 === 0 ? 'Refund issued to customer' : null,
    });
  });
  
  return disputes;
}

/**
 * Initialize the datastore with seed data
 */
function initializeDatastore() {
  console.log('\n📊 Initializing CMS Datastore...');
  
  const cards = generateCardsForCustomers(customers);
  const transactions = generateTransactions(cards);
  const alerts = generateAlerts(customers, cards, transactions);
  const disputes = generateDisputes(customers, cards, transactions);
  
  console.log(`   👥 ${customers.length} customers (${customers.filter(c => c.customer_type === 'INDIVIDUAL').length} Individual, ${customers.filter(c => c.customer_type === 'BUSINESS').length} Business)`);
  console.log(`   💳 ${cards.length} cards`);
  console.log(`   💵 ${transactions.length} transactions`);
  console.log(`   🚨 ${alerts.length} alerts`);
  console.log(`   ⚖️  ${disputes.length} disputes`);
  console.log('✅ Datastore initialized\n');
  
  return {
    customers: [...customers],
    cards: [...cards],
    transactions: [...transactions],
    alerts: [...alerts],
    disputes: [...disputes],
  };
}

// Initialize datastore on module load
const datastore = initializeDatastore();

/**
 * CRUD Operations for Customers
 */
const customerOps = {
  getAll: (filters = {}) => {
    let filtered = [...datastore.customers];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.email?.toLowerCase().includes(search) ||
        c.first_name?.toLowerCase().includes(search) ||
        c.last_name?.toLowerCase().includes(search) ||
        c.business_name?.toLowerCase().includes(search)
      );
    }
    
    if (filters.customer_type) {
      filtered = filtered.filter(c => c.customer_type === filters.customer_type);
    }
    
    if (filters.kyc_status) {
      filtered = filtered.filter(c => c.kyc_status === filters.kyc_status);
    }
    
    if (filters.risk_rating) {
      filtered = filtered.filter(c => c.risk_rating === filters.risk_rating);
    }
    
    return filtered;
  },
  
  getById: (customer_id) => {
    return datastore.customers.find(c => c.customer_id === customer_id);
  },
  
  create: (customerData) => {
    const newCustomer = {
      customer_id: uuidv4(),
      ...customerData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    datastore.customers.push(newCustomer);
    return newCustomer;
  },
  
  update: (customer_id, updates) => {
    const index = datastore.customers.findIndex(c => c.customer_id === customer_id);
    if (index === -1) return null;
    
    datastore.customers[index] = {
      ...datastore.customers[index],
      ...updates,
      customer_id, // Preserve ID
      updated_at: new Date().toISOString(),
    };
    return datastore.customers[index];
  },
  
  delete: (customer_id) => {
    const index = datastore.customers.findIndex(c => c.customer_id === customer_id);
    if (index === -1) return false;
    
    datastore.customers.splice(index, 1);
    // Also delete related cards
    datastore.cards = datastore.cards.filter(card => card.customer_id !== customer_id);
    return true;
  },
};

/**
 * CRUD Operations for Cards
 */
const cardOps = {
  getAll: (filters = {}) => {
    let filtered = [...datastore.cards];
    
    if (filters.customer_id) {
      filtered = filtered.filter(c => c.customer_id === filters.customer_id);
    }
    
    if (filters.card_status) {
      filtered = filtered.filter(c => c.card_status === filters.card_status);
    }
    
    if (filters.card_type) {
      filtered = filtered.filter(c => c.card_type === filters.card_type);
    }
    
    return filtered;
  },
  
  getById: (card_id) => {
    return datastore.cards.find(c => c.card_id === card_id);
  },
  
  create: (cardData) => {
    const newCard = {
      card_id: uuidv4(),
      ...cardData,
      created_at: new Date().toISOString(),
    };
    datastore.cards.push(newCard);
    return newCard;
  },
  
  update: (card_id, updates) => {
    const index = datastore.cards.findIndex(c => c.card_id === card_id);
    if (index === -1) return null;
    
    datastore.cards[index] = {
      ...datastore.cards[index],
      ...updates,
      card_id, // Preserve ID
    };
    return datastore.cards[index];
  },
  
  delete: (card_id) => {
    const index = datastore.cards.findIndex(c => c.card_id === card_id);
    if (index === -1) return false;
    
    datastore.cards.splice(index, 1);
    return true;
  },
};

// Export datastore and operations
module.exports = {
  datastore,
  customerOps,
  cardOps,
  // Direct access to data arrays
  getCustomers: () => datastore.customers,
  getCards: () => datastore.cards,
  getTransactions: () => datastore.transactions,
  getAlerts: () => datastore.alerts,
  getDisputes: () => datastore.disputes,
};

