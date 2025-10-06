const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Validates JWT tokens for API access
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please provide a valid Bearer token.',
          timestamp: new Date().toISOString()
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const secret = process.env.JWT_SECRET || 'demo-secret-key';
    
    const decoded = jwt.verify(token, secret);
    
    // Add user information to request
    req.user = {
      customerId: decoded.customerId,
      type: decoded.type
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or malformed token',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired. Please login again.',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    return res.status(500).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication error occurred',
        timestamp: new Date().toISOString()
      }
    });
  }
};

module.exports = authMiddleware;
