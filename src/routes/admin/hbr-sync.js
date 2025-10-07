const express = require('express');
const { query } = require('../../config/database');
const { checkPermission } = require('../../middleware/rbac');

const router = express.Router();

// HBR Core System Integration
// This endpoint syncs customer data from HBR Core to CMS

// Sync customer from HBR Core System
router.post('/customers/sync', checkPermission('MANAGE_ADMIN_USERS'), async (req, res) => {
  try {
    const { hbrCustomerId, customerData } = req.body;

    // Validate required fields
    if (!hbrCustomerId || !customerData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'hbrCustomerId and customerData are required'
        }
      });
    }

    // Extract customer information from HBR data
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country = 'US',
      hbrAccountNumber,
      hbrCustomerStatus = 'ACTIVE'
    } = customerData;

    // Check if customer already exists in CMS
    const existingCustomerQuery = `
      SELECT customer_id, username, email, first_name, last_name 
      FROM users 
      WHERE hbr_customer_id = $1 OR email = $2
    `;
    const existingCustomer = await query(existingCustomerQuery, [hbrCustomerId, email]);

    let customerId;
    let action;

    if (existingCustomer.rows.length > 0) {
      // Update existing customer
      customerId = existingCustomer.rows[0].customer_id;
      action = 'updated';

      const updateQuery = `
        UPDATE users SET
          first_name = $1,
          last_name = $2,
          email = $3,
          phone = $4,
          date_of_birth = $5,
          address = $6,
          city = $7,
          state = $8,
          zip_code = $9,
          country = $10,
          hbr_customer_id = $11,
          hbr_account_number = $12,
          hbr_sync_status = 'SYNCED',
          hbr_last_sync = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE customer_id = $13
      `;

      await query(updateQuery, [
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        address,
        city,
        state,
        zipCode,
        country,
        hbrCustomerId,
        hbrAccountNumber,
        customerId
      ]);
    } else {
      // Create new customer
      customerId = `CUST-${Date.now()}`;
      action = 'created';

      const insertQuery = `
        INSERT INTO users (
          customer_id, username, email, phone, first_name, last_name,
          date_of_birth, address, city, state, zip_code, country,
          hbr_customer_id, hbr_account_number, hbr_sync_status, hbr_last_sync,
          status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'SYNCED', CURRENT_TIMESTAMP, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `;

      // Generate username from email or create one
      const username = email ? email.split('@')[0] : `customer${Date.now()}`;

      await query(insertQuery, [
        customerId,
        username,
        email,
        phone,
        firstName,
        lastName,
        dateOfBirth,
        address,
        city,
        state,
        zipCode,
        country,
        hbrCustomerId,
        hbrAccountNumber,
        hbrCustomerStatus
      ]);
    }

    res.json({
      success: true,
      message: `Customer ${action} successfully from HBR Core`,
      data: {
        customerId,
        action,
        hbrCustomerId,
        customerName: `${firstName} ${lastName}`,
        email,
        syncedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('HBR sync error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HBR_SYNC_ERROR',
        message: 'An error occurred while syncing customer from HBR Core',
        details: error.message
      }
    });
  }
});

// Bulk sync customers from HBR Core System
router.post('/customers/bulk-sync', checkPermission('MANAGE_ADMIN_USERS'), async (req, res) => {
  try {
    const { customers } = req.body;

    if (!customers || !Array.isArray(customers)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'customers array is required'
        }
      });
    }

    const results = {
      total: customers.length,
      created: 0,
      updated: 0,
      errors: 0,
      details: []
    };

    for (const customerData of customers) {
      try {
        const { hbrCustomerId, firstName, lastName, email } = customerData;

        // Check if customer exists
        const existingCustomerQuery = `
          SELECT customer_id FROM users WHERE hbr_customer_id = $1 OR email = $2
        `;
        const existingCustomer = await query(existingCustomerQuery, [hbrCustomerId, email]);

        let customerId;
        let action;

        if (existingCustomer.rows.length > 0) {
          // Update existing customer
          customerId = existingCustomer.rows[0].customer_id;
          action = 'updated';
          results.updated++;

          const updateQuery = `
            UPDATE users SET
              first_name = $1,
              last_name = $2,
              email = $3,
              phone = $4,
              date_of_birth = $5,
              address = $6,
              city = $7,
              state = $8,
              zip_code = $9,
              country = $10,
              hbr_customer_id = $11,
              hbr_account_number = $12,
              hbr_sync_status = 'SYNCED',
              hbr_last_sync = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
            WHERE customer_id = $13
          `;

          await query(updateQuery, [
            customerData.firstName,
            customerData.lastName,
            customerData.email,
            customerData.phone,
            customerData.dateOfBirth,
            customerData.address,
            customerData.city,
            customerData.state,
            customerData.zipCode,
            customerData.country || 'US',
            hbrCustomerId,
            customerData.hbrAccountNumber,
            customerId
          ]);
        } else {
          // Create new customer
          customerId = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          action = 'created';
          results.created++;

          const insertQuery = `
            INSERT INTO users (
              customer_id, username, email, phone, first_name, last_name,
              date_of_birth, address, city, state, zip_code, country,
              hbr_customer_id, hbr_account_number, hbr_sync_status, hbr_last_sync,
              status, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'SYNCED', CURRENT_TIMESTAMP, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
          `;

          const username = customerData.email ? customerData.email.split('@')[0] : `customer${Date.now()}`;

          await query(insertQuery, [
            customerId,
            username,
            customerData.email,
            customerData.phone,
            customerData.firstName,
            customerData.lastName,
            customerData.dateOfBirth,
            customerData.address,
            customerData.city,
            customerData.state,
            customerData.zipCode,
            customerData.country || 'US',
            hbrCustomerId,
            customerData.hbrAccountNumber,
            customerData.hbrCustomerStatus || 'ACTIVE'
          ]);
        }

        results.details.push({
          hbrCustomerId,
          customerId,
          action,
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          email: customerData.email
        });

      } catch (error) {
        results.errors++;
        results.details.push({
          hbrCustomerId: customerData.hbrCustomerId,
          error: error.message,
          action: 'failed'
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk sync completed: ${results.created} created, ${results.updated} updated, ${results.errors} errors`,
      data: results
    });

  } catch (error) {
    console.error('HBR bulk sync error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HBR_BULK_SYNC_ERROR',
        message: 'An error occurred during bulk sync from HBR Core',
        details: error.message
      }
    });
  }
});

// Get sync status for customers
router.get('/customers/sync-status', checkPermission('VIEW_CUSTOMERS'), async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const syncStatusQuery = `
      SELECT 
        customer_id,
        username,
        first_name,
        last_name,
        email,
        hbr_customer_id,
        hbr_account_number,
        hbr_sync_status,
        hbr_last_sync,
        created_at,
        updated_at
      FROM users 
      WHERE hbr_customer_id IS NOT NULL
      ORDER BY hbr_last_sync DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users 
      WHERE hbr_customer_id IS NOT NULL
    `;

    const [customers, count] = await Promise.all([
      query(syncStatusQuery, [limit, offset]),
      query(countQuery)
    ]);

    res.json({
      success: true,
      data: {
        customers: customers.rows,
        pagination: {
          total: parseInt(count.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(count.rows[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('HBR sync status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HBR_SYNC_STATUS_ERROR',
        message: 'An error occurred while fetching sync status',
        details: error.message
      }
    });
  }
});

module.exports = router;
