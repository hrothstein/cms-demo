const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:8080', 
    'http://localhost:5173',
    'https://cms-frontend-demo-6e5d83cad30d.herokuapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      fraud_detection: 'active',
      notifications: 'active'
    }
  });
});

// Customer login endpoint
app.post('/api/v1/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt for:', username);
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Username and password are required'
        }
      });
    }

    // Demo users
    const demoUsers = {
      'john.doe@example.com': { customer_id: 'CUST-001', email: 'john.doe@example.com', first_name: 'John', last_name: 'Doe' },
      'jane.smith@example.com': { customer_id: 'CUST-002', email: 'jane.smith@example.com', first_name: 'Jane', last_name: 'Smith' },
      'bob.johnson@example.com': { customer_id: 'CUST-003', email: 'bob.johnson@example.com', first_name: 'Bob', last_name: 'Johnson' },
      'john.doe': { customer_id: 'CUST-001', email: 'john.doe@example.com', first_name: 'John', last_name: 'Doe' },
      'jane.smith': { customer_id: 'CUST-002', email: 'jane.smith@example.com', first_name: 'Jane', last_name: 'Smith' },
      'bob.johnson': { customer_id: 'CUST-003', email: 'bob.johnson@example.com', first_name: 'Bob', last_name: 'Johnson' }
    };
    
    if (demoUsers[username] && password === 'demo123') {
      const user = demoUsers[username];
      
      console.log('Demo user found:', user);
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          customerId: user.customer_id, 
          email: user.email,
          type: 'customer' 
        },
        process.env.JWT_SECRET || 'demo-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );
      
      console.log('Login successful for:', username);
      return res.json({
        success: true,
        data: {
          token,
          customerId: user.customer_id,
          email: user.email,
          expiresIn: process.env.JWT_EXPIRES_IN || '1h'
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during login',
        details: error.message
      }
    });
  }
});

// Admin login endpoint
app.post('/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Admin login attempt for:', username);
    
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
      
      console.log('Demo admin found:', admin);
      
      // Generate admin JWT token
      const token = jwt.sign(
        { 
          adminId: admin.admin_id,
          username: admin.username,
          role: admin.role,
          type: 'admin' 
        },
        process.env.ADMIN_JWT_SECRET || 'admin-demo-secret-key',
        { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1h' }
      );
      
      console.log('Admin login successful for:', username);
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
          expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1h'
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
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during admin login',
        details: error.message
      }
    });
  }
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
  console.log(`📚 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔐 Customer login: POST /api/v1/auth/login`);
  console.log(`🔐 Admin login: POST /admin/login`);
});

module.exports = app;
