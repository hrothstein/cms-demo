const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration with ALL necessary origins
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080', 
    'http://localhost:5173',
    'https://cms-frontend-demo-6e5d83cad30d.herokuapp.com',
    'https://cms-frontend-1759769376-89e39b75295e.herokuapp.com',
    'https://cms-frontend-fixed-acee297f6c24.herokuapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Customer login
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_CREDENTIALS',
        message: 'Username and password are required'
      }
    });
  }

  const demoUsers = {
    'john.doe@example.com': { customer_id: 'CUST-001', email: 'john.doe@example.com', first_name: 'John', last_name: 'Doe' },
    'jane.smith@example.com': { customer_id: 'CUST-002', email: 'jane.smith@example.com', first_name: 'Jane', last_name: 'Smith' },
    'bob.johnson@example.com': { customer_id: 'CUST-003', email: 'bob.johnson@example.com', first_name: 'Bob', last_name: 'Johnson' }
  };

  if (demoUsers[username] && password === 'demo123') {
    const user = demoUsers[username];
    const token = jwt.sign(
      {
        customerId: user.customer_id,
        email: user.email,
        type: 'customer'
      },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: '1h' }
    );

    return res.json({
      success: true,
      data: {
        token,
        customerId: user.customer_id,
        email: user.email,
        expiresIn: '1h'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid username or password'
    }
  });
});

// Admin login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_CREDENTIALS',
        message: 'Username and password are required'
      }
    });
  }

  if (username === 'admin' && password === 'admin123') {
    const admin = {
      admin_id: 'ADMIN-001',
      username: 'admin',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'ADMIN',
      department: 'IT'
    };

    const token = jwt.sign(
      {
        adminId: admin.admin_id,
        username: admin.username,
        role: admin.role,
        type: 'admin'
      },
      process.env.ADMIN_JWT_SECRET || 'admin-demo-secret-key',
      { expiresIn: '1h' }
    );

    return res.json({
      success: true,
      data: {
        token,
        adminId: admin.admin_id,
        username: admin.username,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role,
        department: admin.department,
        permissions: ['VIEW_CUSTOMERS', 'VIEW_CARDS', 'VIEW_FULL_CARD_NUMBER', 'LOCK_CARDS', 'UPDATE_CARD_CONTROLS', 'VIEW_TRANSACTIONS', 'VIEW_DISPUTES', 'UPDATE_DISPUTES', 'APPROVE_REFUNDS', 'VIEW_ALERTS', 'DISMISS_ALERTS', 'GENERATE_REPORTS', 'VIEW_AUDIT_LOGS', 'MANAGE_ADMIN_USERS', 'ADD_NOTES'],
        expiresIn: '1h'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid username or password'
    }
  });
});

// Demo data
const demoCards = [
  {
    id: 'CARD-001',
    customer_id: 'CUST-001',
    card_number: '**** **** **** 1234',
    card_type: 'DEBIT',
    status: 'ACTIVE',
    expiry_date: '12/25',
    balance: 2500.00,
    credit_limit: 5000.00,
    last_four_digits: '1234'
  }
];

const demoTransactions = [
  {
    id: 'TXN-001',
    transaction_id: 'TXN-001',
    card_id: 'CARD-001',
    customer_id: 'CUST-001',
    amount: -45.50,
    merchant: 'Starbucks Coffee',
    merchant_name: 'Starbucks Coffee',
    customer_name: 'John Doe',
    card_last_four: '1234',
    date: '2024-01-15T10:30:00Z',
    status: 'COMPLETED',
    category: 'Food & Dining',
    merchant_category: 'Food & Dining'
  },
  {
    id: 'TXN-002',
    transaction_id: 'TXN-002',
    card_id: 'CARD-001',
    customer_id: 'CUST-001',
    amount: -120.00,
    merchant: 'Amazon',
    merchant_name: 'Amazon',
    customer_name: 'John Doe',
    card_last_four: '1234',
    date: '2024-01-14T15:45:00Z',
    status: 'COMPLETED',
    category: 'Shopping',
    merchant_category: 'Shopping'
  },
  {
    id: 'TXN-003',
    transaction_id: 'TXN-003',
    card_id: 'CARD-002',
    customer_id: 'CUST-002',
    amount: -89.99,
    merchant: 'Target',
    merchant_name: 'Target',
    customer_name: 'Jane Smith',
    card_last_four: '5678',
    date: '2024-01-13T09:15:00Z',
    status: 'PENDING',
    category: 'Shopping',
    merchant_category: 'Shopping'
  }
];

// Cards endpoints
app.get('/api/v1/cards', (req, res) => {
  res.json({
    success: true,
    data: demoCards
  });
});

app.get('/api/v1/cards/:cardId', (req, res) => {
  const { cardId } = req.params;
  const card = demoCards.find(c => c.id === cardId);
  
  if (!card) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CARD_NOT_FOUND',
        message: 'Card not found'
      }
    });
  }

  res.json({
    success: true,
    data: card
  });
});

// Transactions endpoints
app.get('/api/v1/transactions', (req, res) => {
  res.json({
    success: true,
    data: demoTransactions
  });
});

// Customer profile
app.get('/api/v1/customers/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      customer_id: 'CUST-001',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1-555-0123',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      }
    }
  });
});

// Admin profile endpoint
app.get('/admin/auth/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      adminId: 'ADMIN-001',
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      department: 'IT',
      permissions: ['VIEW_CUSTOMERS', 'VIEW_CARDS', 'VIEW_FULL_CARD_NUMBER', 'LOCK_CARDS', 'UPDATE_CARD_CONTROLS', 'VIEW_TRANSACTIONS', 'VIEW_DISPUTES', 'UPDATE_DISPUTES', 'APPROVE_REFUNDS', 'VIEW_ALERTS', 'DISMISS_ALERTS', 'GENERATE_REPORTS', 'VIEW_AUDIT_LOGS', 'MANAGE_ADMIN_USERS', 'ADD_NOTES']
    }
  });
});

// Admin dashboard stats
app.get('/admin/reports/dashboard', (req, res) => {
  console.log('Dashboard request received');
  const dashboardData = {
      totalCustomers: 1250,
      totalCards: 3400,
      activeCards: 3200,
      blockedCards: 200,
      totalTransactions: 45600,
      totalDisputes: 45,
      pendingDisputes: 12,
      resolvedDisputes: 33,
      openDisputes: 12,
      totalAlerts: 89,
      unreadAlerts: 23,
      criticalAlerts: 5,
      unresolvedAlerts: 15,
      totalRevenue: 125000.50,
      monthlyGrowth: 12.5,
      // Additional fields that might be expected
      transactionsToday: 234,
      transactionVolumeToday: 12500.75,
      cardsToday: 15,
      disputesToday: 3,
      alertsToday: 8,
      // Additional fields from frontend analysis
      transactionsThisWeek: 1250,
      transactionsThisMonth: 5600,
      lockedCards: 200,
      // Additional fields that might be expected
      todayTransactions: 234,
      todayRevenue: 12500.75,
      // Common dashboard fields that might be expected
      totalAmount: 125000.50,
      monthlyRevenue: 125000.50,
      dailyRevenue: 12500.75,
      weeklyRevenue: 87500.25,
      yearlyRevenue: 1500000.00,
      averageDailyTransactions: 234,
      averageTransactionAmount: 85.50,
      totalVolume: 125000.50,
      revenue: 125000.50,
      amount: 125000.50,
      value: 125000.50,
      // Ensure all numeric fields are properly defined
      totalSpent: 125000.50,
      totalEarned: 125000.50,
      netRevenue: 125000.50,
      grossRevenue: 125000.50,
      // Additional common field names that might be expected
      balance: 125000.50,
      total: 125000.50,
      sum: 125000.50,
      count: 125000,
      number: 125000.50,
      price: 125000.50,
      cost: 125000.50,
      fee: 125000.50,
      charge: 125000.50,
      payment: 125000.50,
      income: 125000.50,
      profit: 125000.50,
      loss: 0.00,
      // Common dashboard metrics
      metric1: 125000.50,
      metric2: 125000.50,
      metric3: 125000.50,
      stat1: 125000.50,
      stat2: 125000.50,
      stat3: 125000.50,
      // Ensure no undefined values
      undefined: 0,
      null: 0,
      NaN: 0,
      fraudAlerts: 5,
      highRiskTransactions: 12,
      cardReplacementRequests: 8,
      customerServiceTickets: 45,
      averageTransactionValue: 85.50,
      topMerchants: [
        { name: 'Amazon', count: 1250, amount: 45000.00, value: 45000.00, total: 45000.00, revenue: 45000.00 },
        { name: 'Starbucks', count: 890, amount: 12000.50, value: 12000.50, total: 12000.50, revenue: 12000.50 },
        { name: 'Target', count: 650, amount: 25000.75, value: 25000.75, total: 25000.75, revenue: 25000.75 }
      ],
      // Additional arrays that might be expected
      merchants: [
        { name: 'Amazon', count: 1250, amount: 45000.00, value: 45000.00, total: 45000.00, revenue: 45000.00 },
        { name: 'Starbucks', count: 890, amount: 12000.50, value: 12000.50, total: 12000.50, revenue: 12000.50 }
      ],
      transactions: [
        { amount: 45000.00, value: 45000.00, total: 45000.00, revenue: 45000.00 },
        { amount: 12000.50, value: 12000.50, total: 12000.50, revenue: 12000.50 }
      ],
      // Ensure all array elements have numeric values
      data: [
        { value: 125000.50, amount: 125000.50, total: 125000.50, revenue: 125000.50 },
        { value: 125000.50, amount: 125000.50, total: 125000.50, revenue: 125000.50 }
      ],
      recentActivity: [
        { type: 'CARD_BLOCKED', description: 'Card blocked due to suspicious activity', timestamp: '2024-01-15T14:30:00Z', amount: 0, value: 0, total: 0 },
        { type: 'DISPUTE_FILED', description: 'New dispute filed for transaction', timestamp: '2024-01-15T13:45:00Z', amount: 0, value: 0, total: 0 },
        { type: 'ALERT_TRIGGERED', description: 'High value transaction alert', timestamp: '2024-01-15T12:15:00Z', amount: 0, value: 0, total: 0 }
      ],
      // Additional safety measures
      stats: {
        total: 125000.50,
        amount: 125000.50,
        value: 125000.50,
        revenue: 125000.50,
        count: 125000
      },
      metrics: {
        total: 125000.50,
        amount: 125000.50,
        value: 125000.50,
        revenue: 125000.50,
        count: 125000
      },
      // Ensure all possible nested structures are defined
      summary: {
        total: 125000.50,
        amount: 125000.50,
        value: 125000.50,
        revenue: 125000.50,
        count: 125000
      },
      overview: {
        total: 125000.50,
        amount: 125000.50,
        value: 125000.50,
        revenue: 125000.50,
        count: 125000
      }
    };
  
  console.log('Sending dashboard data:', JSON.stringify(dashboardData, null, 2));
  res.json({
    success: true,
    data: dashboardData
  });
});

    // Admin customers
    app.get('/admin/customers', (req, res) => {
      // Handle undefined parameters
      const { limit = 10, offset = 0, search, status } = req.query;
      
      const customers = [
        {
          id: 'CUST-001',
          customer_id: 'CUST-001',
          email: 'john.doe@example.com',
          username: 'john.doe',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1-555-0123',
          status: 'ACTIVE',
          account_status: 'ACTIVE',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'CUST-002',
          customer_id: 'CUST-002',
          email: 'jane.smith@example.com',
          username: 'jane.smith',
          first_name: 'Jane',
          last_name: 'Smith',
          phone: '+1-555-0124',
          status: 'ACTIVE',
          account_status: 'ACTIVE',
          created_at: '2024-01-16T14:20:00Z'
        }
      ];

      res.json({
        success: true,
        data: customers,
        pagination: {
          total: customers.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    });

    // Admin customer detail
    app.get('/admin/customers/:customerId', (req, res) => {
      const { customerId } = req.params;
      
      // Mock customer data
      const customer = {
        id: customerId,
        customer_id: customerId,
        email: 'john.doe@example.com',
        username: 'john.doe',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1-555-0123',
        status: 'ACTIVE',
        account_status: 'ACTIVE',
        created_at: '2024-01-15T10:30:00Z',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105'
        },
        kyc_status: 'VERIFIED',
        risk_level: 'LOW',
        total_cards: 2,
        active_cards: 2,
        total_transactions: 45,
        total_spent: 1250.50
      };

      res.json({
        success: true,
        data: customer
      });
    });

    // Admin cards
    app.get('/admin/cards', (req, res) => {
      // Handle undefined parameters
      const { limit = 10, offset = 0, status, cardType } = req.query;
      
      const cards = [
        {
          id: 'CARD-001',
          customer_id: 'CUST-001',
          card_number: '**** **** **** 1234',
          card_type: 'DEBIT',
          status: 'ACTIVE',
          expiry_date: '12/25',
          balance: 2500.00,
          credit_limit: 5000.00
        },
        {
          id: 'CARD-002',
          customer_id: 'CUST-001',
          card_number: '**** **** **** 5678',
          card_type: 'CREDIT',
          status: 'ACTIVE',
          expiry_date: '08/26',
          balance: 1200.00,
          credit_limit: 10000.00
        }
      ];

      res.json({
        success: true,
        data: cards,
        pagination: {
          total: cards.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    });

    // Admin card detail
    app.get('/admin/cards/:cardId', (req, res) => {
      const { cardId } = req.params;
      
      const card = {
        id: cardId,
        customer_id: 'CUST-001',
        card_number: '**** **** **** 1234',
        full_card_number: '4111 1111 1111 1234',
        card_type: 'DEBIT',
        status: 'ACTIVE',
        expiry_date: '12/25',
        balance: 2500.00,
        credit_limit: 5000.00,
        created_at: '2024-01-15T10:30:00Z',
        last_used: '2024-01-15T14:30:00Z',
        daily_limit: 1000.00,
        monthly_limit: 5000.00
      };

      res.json({
        success: true,
        data: card
      });
    });

    // Admin transactions
    app.get('/admin/transactions', (req, res) => {
      // Handle undefined parameters
      const { limit = 10, offset = 0, dateRange, status, search } = req.query;
      
      const transactions = [
        {
          id: 'TXN-001',
          transaction_id: 'TXN-001',
          card_id: 'CARD-001',
          customer_id: 'CUST-001',
          amount: -45.50,
          merchant: 'Starbucks Coffee',
          merchant_name: 'Starbucks Coffee',
          customer_name: 'John Doe',
          card_last_four: '1234',
          date: '2024-01-15T10:30:00Z',
          status: 'COMPLETED',
          category: 'Food & Dining',
          merchant_category: 'Food & Dining'
        },
        {
          id: 'TXN-002',
          transaction_id: 'TXN-002',
          card_id: 'CARD-001',
          customer_id: 'CUST-001',
          amount: -120.00,
          merchant: 'Amazon',
          merchant_name: 'Amazon',
          customer_name: 'John Doe',
          card_last_four: '1234',
          date: '2024-01-14T15:45:00Z',
          status: 'COMPLETED',
          category: 'Shopping',
          merchant_category: 'Shopping'
        },
        {
          id: 'TXN-003',
          transaction_id: 'TXN-003',
          card_id: 'CARD-002',
          customer_id: 'CUST-002',
          amount: -89.99,
          merchant: 'Target',
          merchant_name: 'Target',
          customer_name: 'Jane Smith',
          card_last_four: '5678',
          date: '2024-01-13T09:15:00Z',
          status: 'PENDING',
          category: 'Shopping',
          merchant_category: 'Shopping'
        }
      ];

      res.json({
        success: true,
        data: transactions,
        pagination: {
          total: transactions.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    });

    // Admin transaction detail
    app.get('/admin/transactions/:transactionId', (req, res) => {
      const { transactionId } = req.params;
      
      const transaction = {
        id: transactionId,
        transaction_id: transactionId,
        card_id: 'CARD-001',
        customer_id: 'CUST-001',
        amount: -45.50,
        merchant: 'Starbucks Coffee',
        merchant_name: 'Starbucks Coffee',
        customer_name: 'John Doe',
        card_last_four: '1234',
        merchant_category: 'Food & Dining',
        category: 'Food & Dining',
        date: '2024-01-15T10:30:00Z',
        status: 'COMPLETED',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'US'
        },
        authorization_code: 'AUTH123456',
        reference_number: 'REF789012'
      };

      res.json({
        success: true,
        data: transaction
      });
    });

    // Admin disputes
    app.get('/admin/disputes', (req, res) => {
      // Handle undefined parameters
      const { limit = 10, offset = 0, status, type, dateRange, search } = req.query;
      
      const disputes = [
        {
          id: 'DISPUTE-001',
          customer_id: 'CUST-001',
          transaction_id: 'TXN-001',
          amount: 45.50,
          reason: 'Unauthorized transaction',
          status: 'PENDING',
          created_at: '2024-01-15T11:00:00Z'
        }
      ];

      res.json({
        success: true,
        data: disputes,
        pagination: {
          total: disputes.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    });

    // Admin dispute detail
    app.get('/admin/disputes/:disputeId', (req, res) => {
      const { disputeId } = req.params;
      
      const dispute = {
        id: disputeId,
        customer_id: 'CUST-001',
        transaction_id: 'TXN-001',
        amount: 45.50,
        reason: 'Unauthorized transaction',
        status: 'PENDING',
        created_at: '2024-01-15T11:00:00Z',
        description: 'Customer claims they did not make this purchase',
        evidence: [
          {
            type: 'RECEIPT',
            description: 'Customer receipt showing different amount',
            uploaded_at: '2024-01-15T11:15:00Z'
          }
        ],
        timeline: [
          {
            action: 'DISPUTE_CREATED',
            timestamp: '2024-01-15T11:00:00Z',
            user: 'john.doe@example.com',
            note: 'Dispute filed by customer'
          }
        ]
      };

      res.json({
        success: true,
        data: dispute
      });
    });

    // Admin alerts
    app.get('/admin/alerts', (req, res) => {
      // Handle undefined parameters
      const { limit = 10, offset = 0, severity, type, status, search } = req.query;
      
      const alerts = [
        {
          id: 'ALERT-001',
          type: 'FRAUD_DETECTED',
          severity: 'HIGH',
          message: 'Unusual spending pattern detected',
          customer_id: 'CUST-001',
          status: 'UNREAD',
          created_at: '2024-01-15T12:00:00Z'
        }
      ];

      res.json({
        success: true,
        data: alerts,
        pagination: {
          total: alerts.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    });

    // Admin alert detail
    app.get('/admin/alerts/:alertId', (req, res) => {
      const { alertId } = req.params;
      
      const alert = {
        id: alertId,
        type: 'FRAUD_DETECTED',
        severity: 'HIGH',
        message: 'Unusual spending pattern detected',
        customer_id: 'CUST-001',
        status: 'UNREAD',
        created_at: '2024-01-15T12:00:00Z',
        details: {
          threshold_exceeded: 'Daily spending limit',
          amount: 500.00,
          normal_average: 50.00,
          location: 'San Francisco, CA',
          merchant: 'Unknown merchant'
        },
        actions_taken: [
          {
            action: 'CARD_TEMPORARILY_BLOCKED',
            timestamp: '2024-01-15T12:05:00Z',
            user: 'system'
          }
        ]
      };

      res.json({
        success: true,
        data: alert
      });
    });

    // Admin reports
    app.get('/admin/reports', (req, res) => {
      // Handle undefined parameters
      const { limit = 10, offset = 0, start, end, type } = req.query;
      
      const reports = [
        {
          id: 'REPORT-001',
          name: 'Transaction Summary Report',
          type: 'TRANSACTION_SUMMARY',
          status: 'COMPLETED',
          created_at: '2024-01-15T10:00:00Z',
          generated_by: 'admin',
          file_url: '/reports/transaction-summary-2024-01-15.pdf'
        },
        {
          id: 'REPORT-002',
          name: 'Fraud Analysis Report',
          type: 'FRAUD_ANALYSIS',
          status: 'COMPLETED',
          created_at: '2024-01-14T15:30:00Z',
          generated_by: 'admin',
          file_url: '/reports/fraud-analysis-2024-01-14.pdf'
        }
      ];

      res.json({
        success: true,
        data: reports,
        pagination: {
          total: reports.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    });

    // Admin audit logs
    app.get('/admin/audit-logs', (req, res) => {
      // Handle undefined parameters
      const { limit = 50, offset = 0, action, user, resource, dateRange, search, page = 1 } = req.query;
      
      const auditLogs = [
        {
          id: 'AUDIT-001',
          action: 'CARD_LOCKED',
          user: 'admin',
          resource: 'CARD-001',
          details: 'Card locked due to suspicious activity',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          created_at: '2024-01-15T14:30:00Z'
        },
        {
          id: 'AUDIT-002',
          action: 'DISPUTE_CREATED',
          user: 'john.doe@example.com',
          resource: 'DISPUTE-001',
          details: 'Customer filed dispute for unauthorized transaction',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0...',
          created_at: '2024-01-15T13:45:00Z'
        }
      ];

      res.json({
        success: true,
        data: auditLogs,
        pagination: {
          total: auditLogs.length,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    });

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      path: req.originalUrl
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Card Management Backend API running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Customer login: POST /api/v1/auth/login`);
  console.log(`🔐 Admin login: POST /admin/login`);
});

module.exports = app;