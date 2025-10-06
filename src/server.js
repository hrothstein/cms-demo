require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import database connection
const { query } = require('./config/database');

// Import routes
const cardRoutes = require('./routes/cards');
const transactionRoutes = require('./routes/transactions');
const customerRoutes = require('./routes/customers');
const fraudRoutes = require('./routes/fraud');
const notificationRoutes = require('./routes/notifications');

// Import admin routes
const adminAuthRoutes = require('./routes/admin/auth');
const adminCustomerRoutes = require('./routes/admin/customers');
const adminCardRoutes = require('./routes/admin/cards');
const adminTransactionRoutes = require('./routes/admin/transactions');
const adminDisputeRoutes = require('./routes/admin/disputes');
const adminAlertRoutes = require('./routes/admin/alerts');
const adminReportRoutes = require('./routes/admin/reports');
const adminAuditLogRoutes = require('./routes/admin/auditLogs');
const adminNoteRoutes = require('./routes/admin/notes');

// Import middleware
const authMiddleware = require('./middleware/auth');
const adminAuthMiddleware = require('./middleware/adminAuth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:8080', 
    'http://localhost:5173',
    'https://cms-frontend-1759769376-89e39b75295e.herokuapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Card Management System API',
      version: '1.0.0',
      description: 'Demo backend system simulating core banking operations for card management',
      contact: {
        name: 'Demo Team',
        email: 'demo@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

// API routes
app.use('/api/v1/cards', authMiddleware, cardRoutes);
app.use('/api/v1/transactions', authMiddleware, transactionRoutes);
app.use('/api/v1/customers', authMiddleware, customerRoutes);
app.use('/api/v1/fraud', authMiddleware, fraudRoutes);
app.use('/api/v1/notifications', authMiddleware, notificationRoutes);

// Admin API routes
app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/admin/customers', adminAuthMiddleware, adminCustomerRoutes);
app.use('/api/v1/admin/cards', adminAuthMiddleware, adminCardRoutes);
app.use('/api/v1/admin/transactions', adminAuthMiddleware, adminTransactionRoutes);
app.use('/api/v1/admin/disputes', adminAuthMiddleware, adminDisputeRoutes);
app.use('/api/v1/admin/alerts', adminAuthMiddleware, adminAlertRoutes);
app.use('/api/v1/admin/reports', adminAuthMiddleware, adminReportRoutes);
app.use('/api/v1/admin/audit-logs', adminAuthMiddleware, adminAuditLogRoutes);
app.use('/api/v1/admin/notes', adminAuthMiddleware, adminNoteRoutes);

// Authentication endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  try {
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

    // Query user from database (check both username and email)
    const userQuery = `
      SELECT user_id, customer_id, username, password_hash, email, phone, is_active
      FROM users 
      WHERE (username = $1 OR email = $1) AND is_active = true
    `;
    
    const result = await query(userQuery, [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }

    const user = result.rows[0];
    
    // For demo purposes, check if password is 'demo123'
    // In production, use: const isValidPassword = await bcrypt.compare(password, user.password_hash);
    const isValidPassword = password === 'demo123';
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = $1 WHERE user_id = $2',
      [new Date().toISOString(), user.user_id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: user.customer_id, 
        username: user.username,
        type: 'customer' 
      },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        customerId: user.customer_id,
        username: user.username,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during login'
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

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Card Management Backend API running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔐 Demo login: POST /api/v1/auth/login with {"customerId": "CUST-12345", "password": "demo123"}`);
});

module.exports = app;
