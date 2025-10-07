const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Admin authentication token required'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify admin JWT token
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin-demo-secret-key');
    
    if (decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_TYPE',
          message: 'Invalid token type for admin access'
        }
      });
    }

    // Get admin user details from database
    const adminQuery = `
      SELECT id as admin_id, username, email, first_name, last_name, role, department, is_active
      FROM admin_users 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await query(adminQuery, [decoded.adminId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin user not found or inactive'
        }
      });
    }

    const admin = result.rows[0];
    
    // Add admin info to request object
    req.admin = {
      adminId: admin.admin_id,
      username: admin.username,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      role: admin.role,
      department: admin.department
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid admin authentication token'
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Admin authentication token has expired'
        }
      });
    }

    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during admin authentication'
      }
    });
  }
};

module.exports = adminAuth;
