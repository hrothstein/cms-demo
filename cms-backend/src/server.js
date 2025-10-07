const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const transactionRoutes = require('./routes/transactions');
const alertRoutes = require('./routes/alerts');
const disputeRoutes = require('./routes/disputes');
const cardServiceRoutes = require('./routes/card-services');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        api: 'running'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cards', cardRoutes);
app.use('/api/v1', transactionRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/disputes', disputeRoutes);
app.use('/api/v1/card-services', cardServiceRoutes);

// API documentation endpoint
app.get('/api/v1/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Card Management System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/v1/auth/login': 'User login',
        'POST /api/v1/auth/logout': 'User logout',
        'GET /api/v1/auth/me': 'Get current user info'
      },
      cards: {
        'GET /api/v1/cards': 'Get all user cards',
        'GET /api/v1/cards/:cardId': 'Get specific card details',
        'PUT /api/v1/cards/:cardId/lock': 'Lock a card',
        'PUT /api/v1/cards/:cardId/unlock': 'Unlock a card',
        'PUT /api/v1/cards/:cardId/controls': 'Update card controls',
        'POST /api/v1/cards/:cardId/report-lost': 'Report card as lost/stolen'
      },
      transactions: {
        'GET /api/v1/cards/:cardId/transactions': 'Get transactions for a card',
        'GET /api/v1/transactions/:transactionId': 'Get specific transaction details'
      },
      alerts: {
        'GET /api/v1/alerts': 'Get all user alerts',
        'PUT /api/v1/alerts/:alertId/read': 'Mark alert as read',
        'PUT /api/v1/alerts/:alertId/dismiss': 'Dismiss alert',
        'GET /api/v1/alerts/preferences': 'Get alert preferences',
        'PUT /api/v1/alerts/preferences': 'Update alert preferences'
      },
      disputes: {
        'POST /api/v1/disputes': 'Submit a new dispute',
        'GET /api/v1/disputes': 'Get all user disputes',
        'GET /api/v1/disputes/:disputeId': 'Get specific dispute details',
        'POST /api/v1/disputes/:disputeId/comments': 'Add comment to dispute'
      },
      cardServices: {
        'POST /api/v1/card-services/view-pin': 'View PIN (with re-auth)',
        'POST /api/v1/card-services/change-pin': 'Change PIN',
        'POST /api/v1/card-services/request-replacement': 'Request card replacement',
        'POST /api/v1/card-services/activate': 'Activate new card'
      }
    }
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Database connection failed. Please check your database configuration.');
      process.exit(1);
    }

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Card Management System API running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
