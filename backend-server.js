require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const YAML = require('yamljs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import database connection
const { query } = require('./src/config/database');

// Import routes
const cardRoutes = require('./src/routes/cards');
const transactionRoutes = require('./src/routes/transactions');
const customerRoutes = require('./src/routes/customers');
const fraudRoutes = require('./src/routes/fraud');
const notificationRoutes = require('./src/routes/notifications');

// Import admin routes
const adminAuthRoutes = require('./src/routes/admin/auth');
const adminCustomerRoutes = require('./src/routes/admin/customers');
const adminCardRoutes = require('./src/routes/admin/cards-simple');
const adminTransactionRoutes = require('./src/routes/admin/transactions');
const adminDisputeRoutes = require('./src/routes/admin/disputes');
const adminAlertRoutes = require('./src/routes/admin/alerts');
const adminReportRoutes = require('./src/routes/admin/reports-simple');
const adminAuditLogRoutes = require('./src/routes/admin/auditLogs-simple');
const adminHbrSyncRoutes = require('./src/routes/admin/hbr-sync');
const adminNoteRoutes = require('./src/routes/admin/notes');

// Import middleware
const authMiddleware = require('./src/middleware/auth');
const adminAuthMiddleware = require('./src/middleware/adminAuth');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:8080', 
    'http://localhost:5173',
    'https://cms-frontend-1759769376-89e39b75295e.herokuapp.com',
    'https://cms-frontend-demo-6e5d83cad30d.herokuapp.com'
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

// Admin API documentation
const adminApiSpec = YAML.load('./src/swagger/admin-api.yaml');
app.use('/admin-api-docs', swaggerUi.serve, swaggerUi.setup(adminApiSpec));

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
app.use('/api/v1/admin/hbr-sync', adminAuthMiddleware, adminHbrSyncRoutes);

// Authentication endpoint
app.post('/api/v1/auth/login', async (req, res) => {
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

    // Query customer from database (check email)
    const userQuery = `
      SELECT customer_id, email, first_name, last_name, password_hash
      FROM customers 
      WHERE email = $1
    `;
    
    console.log('Executing query:', userQuery, 'with params:', [username]);
    const result = await query(userQuery, [username]);
    console.log('Query result:', result.rows);
    
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
    console.log('User found:', user);
    
    // For demo purposes, check if password is 'Demo123!'
    // In production, use: const isValidPassword = await bcrypt.compare(password, user.password_hash);
    const isValidPassword = password === 'Demo123!';
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }

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
    res.json({
      success: true,
      data: {
        token,
        customerId: user.customer_id,
        email: user.email,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
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
