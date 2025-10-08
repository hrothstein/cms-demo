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
    card_id: 'CARD-001',
    amount: -45.50,
    merchant: 'Starbucks Coffee',
    date: '2024-01-15T10:30:00Z',
    status: 'COMPLETED',
    category: 'Food & Dining'
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
  res.json({
    success: true,
    data: {
      totalCustomers: 1250,
      totalCards: 3400,
      activeCards: 3200,
      blockedCards: 200,
      totalTransactions: 45600,
      totalDisputes: 45,
      pendingDisputes: 12,
      resolvedDisputes: 33,
      totalAlerts: 89,
      unreadAlerts: 23,
      totalRevenue: 125000.50,
      monthlyGrowth: 12.5,
      // Additional fields that might be expected
      todayTransactions: 234,
      todayRevenue: 12500.75,
      fraudAlerts: 5,
      highRiskTransactions: 12,
      cardReplacementRequests: 8,
      customerServiceTickets: 45,
      averageTransactionValue: 85.50,
      topMerchants: [
        { name: 'Amazon', count: 1250, amount: 45000.00 },
        { name: 'Starbucks', count: 890, amount: 12000.50 },
        { name: 'Target', count: 650, amount: 25000.75 }
      ],
      recentActivity: [
        { type: 'CARD_BLOCKED', description: 'Card blocked due to suspicious activity', timestamp: '2024-01-15T14:30:00Z' },
        { type: 'DISPUTE_FILED', description: 'New dispute filed for transaction', timestamp: '2024-01-15T13:45:00Z' },
        { type: 'ALERT_TRIGGERED', description: 'High value transaction alert', timestamp: '2024-01-15T12:15:00Z' }
      ]
    }
  });
});

// Admin customers
app.get('/admin/customers', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'CUST-001',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1-555-0123',
        status: 'ACTIVE',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 'CUST-002',
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1-555-0124',
        status: 'ACTIVE',
        created_at: '2024-01-16T14:20:00Z'
      }
    ]
  });
});

// Admin cards
app.get('/admin/cards', (req, res) => {
  res.json({
    success: true,
    data: [
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
    ]
  });
});

// Admin transactions
app.get('/admin/transactions', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'TXN-001',
        card_id: 'CARD-001',
        customer_id: 'CUST-001',
        amount: -45.50,
        merchant: 'Starbucks Coffee',
        date: '2024-01-15T10:30:00Z',
        status: 'COMPLETED',
        category: 'Food & Dining'
      },
      {
        id: 'TXN-002',
        card_id: 'CARD-001',
        customer_id: 'CUST-001',
        amount: -120.00,
        merchant: 'Amazon',
        date: '2024-01-14T15:45:00Z',
        status: 'COMPLETED',
        category: 'Shopping'
      }
    ]
  });
});

// Admin disputes
app.get('/admin/disputes', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'DISPUTE-001',
        customer_id: 'CUST-001',
        transaction_id: 'TXN-001',
        amount: 45.50,
        reason: 'Unauthorized transaction',
        status: 'PENDING',
        created_at: '2024-01-15T11:00:00Z'
      }
    ]
  });
});

// Admin alerts
app.get('/admin/alerts', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'ALERT-001',
        type: 'FRAUD_DETECTED',
        severity: 'HIGH',
        message: 'Unusual spending pattern detected',
        customer_id: 'CUST-001',
        status: 'UNREAD',
        created_at: '2024-01-15T12:00:00Z'
      }
    ]
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