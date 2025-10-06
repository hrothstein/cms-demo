const { query } = require('../config/database');

/**
 * Customer Service - Handles customer-related database operations
 */
class CustomerService {
  // Get customer profile
  async getCustomerProfile(customerId) {
    const queryText = `
      SELECT 
        customer_id,
        username,
        email,
        phone,
        is_active,
        last_login,
        created_at
      FROM users
      WHERE customer_id = $1
    `;

    const result = await query(queryText, [customerId]);
    
    if (result.rows.length === 0) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }

    const user = result.rows[0];
    return {
      customerId: user.customer_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isActive: user.is_active,
      lastLogin: user.last_login,
      createdAt: user.created_at
    };
  }

  // Update customer profile
  async updateCustomerProfile(customerId, updates) {
    const allowedFields = ['email', 'phone'];
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    for (const [field, value] of Object.entries(updates)) {
      if (allowedFields.includes(field) && value !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('VALIDATION_ERROR');
    }

    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());

    paramCount++;
    values.push(customerId);

    const queryText = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE customer_id = $${paramCount}
      RETURNING customer_id, username, email, phone, is_active, last_login, created_at, updated_at
    `;

    const result = await query(queryText, values);
    
    if (result.rows.length === 0) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }

    const user = result.rows[0];
    return {
      success: true,
      message: 'Customer profile updated successfully',
      data: {
        customerId: user.customer_id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    };
  }
}

module.exports = new CustomerService();
