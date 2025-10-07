const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const userResult = await query(
      'SELECT customer_id, email, first_name, last_name, password_hash FROM customers WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: user.customer_id,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // Update last login
    await query(
      'UPDATE customers SET last_login = CURRENT_TIMESTAMP WHERE customer_id = $1',
      [user.customer_id]
    );

    // Log successful login
    await query(
      'INSERT INTO audit_log (customer_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        user.customer_id,
        'LOGIN',
        'User logged in successfully',
        'CUSTOMER',
        user.customer_id,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.json({
      success: true,
      data: {
        token,
        customerId: user.customer_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    // Log logout action
    await query(
      'INSERT INTO audit_log (customer_id, action_type, action_description, entity_type, entity_id, ip_address, user_agent, action_result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        req.user.customer_id,
        'LOGOUT',
        'User logged out successfully',
        'CUSTOMER',
        req.user.customer_id,
        req.ip,
        req.get('User-Agent'),
        'SUCCESS'
      ]
    );

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/v1/auth/me - Get current user info
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userResult = await query(
      `SELECT 
        customer_id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        address_line1, 
        address_line2, 
        city, 
        state, 
        postal_code, 
        country, 
        date_of_birth, 
        created_at, 
        last_login 
      FROM customers 
      WHERE customer_id = $1`,
      [req.user.customer_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      data: {
        customerId: user.customer_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        address: {
          line1: user.address_line1,
          line2: user.address_line2,
          city: user.city,
          state: user.state,
          postalCode: user.postal_code,
          country: user.country
        },
        dateOfBirth: user.date_of_birth,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
