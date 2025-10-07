const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/database');
const { auditLogs } = require('../../middleware/auditLog');

const router = express.Router();

// Admin login endpoint
router.post('/login', auditLogs.adminLogin, async (req, res) => {
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

    // Query admin user from database
    const adminQuery = `
      SELECT id as admin_id, username, password_hash, email, first_name, last_name, role, department, is_active
      FROM admin_users 
      WHERE username = $1 AND is_active = true
    `;
    
    const result = await query(adminQuery, [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }

    const admin = result.rows[0];
    
    // Check password using bcrypt
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
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
      'UPDATE admin_users SET last_login = $1 WHERE id = $2',
      [new Date().toISOString(), admin.admin_id]
    );

    // Define permissions based on role
    const rolePermissions = {
      CSR: ['VIEW_CUSTOMERS', 'VIEW_CARDS', 'LOCK_CARDS', 'UPDATE_CARD_CONTROLS', 'VIEW_TRANSACTIONS', 'VIEW_DISPUTES', 'VIEW_ALERTS', 'GENERATE_REPORTS', 'ADD_NOTES'],
      FRAUD_ANALYST: ['VIEW_CUSTOMERS', 'VIEW_CARDS', 'VIEW_FULL_CARD_NUMBER', 'LOCK_CARDS', 'UPDATE_CARD_CONTROLS', 'VIEW_TRANSACTIONS', 'VIEW_DISPUTES', 'UPDATE_DISPUTES', 'VIEW_ALERTS', 'DISMISS_ALERTS', 'GENERATE_REPORTS', 'ADD_NOTES'],
      SUPERVISOR: ['VIEW_CUSTOMERS', 'VIEW_CARDS', 'VIEW_FULL_CARD_NUMBER', 'LOCK_CARDS', 'UPDATE_CARD_CONTROLS', 'VIEW_TRANSACTIONS', 'VIEW_DISPUTES', 'UPDATE_DISPUTES', 'APPROVE_REFUNDS', 'VIEW_ALERTS', 'DISMISS_ALERTS', 'GENERATE_REPORTS', 'VIEW_AUDIT_LOGS', 'ADD_NOTES'],
      ADMIN: ['VIEW_CUSTOMERS', 'VIEW_CARDS', 'VIEW_FULL_CARD_NUMBER', 'LOCK_CARDS', 'UPDATE_CARD_CONTROLS', 'VIEW_TRANSACTIONS', 'VIEW_DISPUTES', 'UPDATE_DISPUTES', 'APPROVE_REFUNDS', 'VIEW_ALERTS', 'DISMISS_ALERTS', 'GENERATE_REPORTS', 'VIEW_AUDIT_LOGS', 'MANAGE_ADMIN_USERS', 'ADD_NOTES']
    };

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
    
    res.json({
      success: true,
      data: {
        token,
        adminId: admin.admin_id,
        username: admin.username,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role,
        department: admin.department,
        permissions: rolePermissions[admin.role] || [],
        expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1h'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during admin login'
      }
    });
  }
});

// Admin logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Admin logged out successfully'
  });
});

// Get current admin profile
router.get('/profile', (req, res) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Admin authentication required'
      }
    });
  }

  res.json({
    success: true,
    data: {
      adminId: req.admin.adminId,
      username: req.admin.username,
      firstName: req.admin.firstName,
      lastName: req.admin.lastName,
      role: req.admin.role,
      department: req.admin.department
    }
  });
});

// Admin profile endpoint
router.get('/profile', async (req, res) => {
  try {
    console.log('Profile endpoint hit');
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid auth header');
      return res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Admin authentication token required'
        }
      });
    }

    const token = authHeader.substring(7);
    console.log('Token:', token);
    
    // Verify admin JWT token
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin-demo-secret-key');
    console.log('Decoded token:', decoded);
    
    if (decoded.type !== 'admin') {
      console.log('Invalid token type:', decoded.type);
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
    
    res.json({
      success: true,
      data: {
        adminId: admin.admin_id,
        username: admin.username,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role,
        department: admin.department,
        permissions: [] // Add permissions based on role if needed
      }
    });
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

    console.error('Admin profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching admin profile'
      }
    });
  }
});

module.exports = router;
