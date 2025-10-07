const express = require('express');
const { query } = require('../../config/database');
const { checkPermission } = require('../../middleware/rbac');
const { auditLogs } = require('../../middleware/auditLog');

const router = express.Router();

// Get all cards with search and pagination
router.get('/', checkPermission('VIEW_CARDS'), async (req, res) => {
  try {
    const { 
      search = '', 
      limit = 20, 
      offset = 0, 
      status = '',
      cardType = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Build search conditions
    let searchConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      searchConditions.push(`(
        c.card_id ILIKE $${paramCount} OR 
        c.card_last_four ILIKE $${paramCount} OR 
        u.username ILIKE $${paramCount} OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      searchConditions.push(`c.card_status = $${paramCount}`);
      queryParams.push(status);
    }

    if (cardType) {
      paramCount++;
      searchConditions.push(`c.card_type = $${paramCount}`);
      queryParams.push(cardType);
    }

    const whereClause = searchConditions.length > 0 
      ? `WHERE ${searchConditions.join(' AND ')}`
      : '';

    // Validate sort parameters
    const allowedSortColumns = ['created_at', 'expiry_date', 'card_status', 'card_type'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get cards with customer info
    const cardsQuery = `
      SELECT 
        c.card_id,
        c.customer_id,
        u.username as customer_name,
        c.card_last_four,
        c.card_type,
        c.card_brand,
        c.card_status,
        c.card_sub_status,
        c.cardholder_name,
        c.issue_date,
        c.expiry_date,
        c.activation_date,
        c.credit_limit,
        c.available_credit,
        c.is_primary,
        c.card_format,
        c.created_at,
        c.locked_by,
        c.locked_at,
        au.username as locked_by_username,
        COALESCE(txn_stats.last_transaction_date, NULL) as last_transaction_date,
        COALESCE(txn_stats.transaction_count, 0) as transaction_count
      FROM cards c
      JOIN users u ON c.customer_id = u.customer_id
      LEFT JOIN admin_users au ON c.locked_by = au.admin_id
      LEFT JOIN (
        SELECT 
          card_id,
          MAX(transaction_date) as last_transaction_date,
          COUNT(*) as transaction_count
        FROM transactions 
        GROUP BY card_id
      ) txn_stats ON c.card_id = txn_stats.card_id
      ${whereClause}
      ORDER BY c.${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const cardsResult = await query(cardsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM cards c
      JOIN users u ON c.customer_id = u.customer_id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: cardsResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin cards list error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching cards'
      }
    });
  }
});

// Get detailed card information
router.get('/:cardId', checkPermission('VIEW_CARDS'), async (req, res) => {
  try {
    const { cardId } = req.params;

    // Get card details
    const cardQuery = `
      SELECT 
        c.*,
        u.username as customer_name,
        u.email as customer_email,
        au.username as locked_by_username
      FROM cards c
      JOIN users u ON c.customer_id = u.customer_id
      LEFT JOIN admin_users au ON c.locked_by = au.admin_id
      WHERE c.card_id = $1
    `;

    const cardResult = await query(cardQuery, [cardId]);
    
    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CARD_NOT_FOUND',
          message: 'Card not found'
        }
      });
    }

    const card = cardResult.rows[0];

    // Get card controls
    const controlsQuery = `
      SELECT * FROM card_controls WHERE card_id = $1
    `;
    const controlsResult = await query(controlsQuery, [cardId]);

    // Get recent transactions
    const transactionsQuery = `
      SELECT 
        transaction_id,
        transaction_date,
        merchant_name,
        merchant_category,
        amount,
        currency,
        status,
        fraud_score,
        fraud_flag,
        is_disputed
      FROM transactions 
      WHERE card_id = $1
      ORDER BY transaction_date DESC
      LIMIT 50
    `;
    const transactionsResult = await query(transactionsQuery, [cardId]);

    // Get related alerts
    const alertsQuery = `
      SELECT 
        alert_id,
        alert_type,
        severity,
        alert_date,
        alert_title,
        alert_message,
        status
      FROM alerts 
      WHERE card_id = $1
      ORDER BY alert_date DESC
      LIMIT 20
    `;
    const alertsResult = await query(alertsQuery, [cardId]);

    // Get admin notes
    const notesQuery = `
      SELECT 
        n.note_id,
        n.note_text,
        n.is_internal,
        n.created_at,
        au.username as admin_username
      FROM admin_notes n
      JOIN admin_users au ON n.admin_id = au.admin_id
      WHERE n.note_type = 'CARD' 
        AND n.reference_id = $1
      ORDER BY n.created_at DESC
      LIMIT 20
    `;
    const notesResult = await query(notesQuery, [cardId]);

    res.json({
      success: true,
      data: {
        ...card,
        controls: controlsResult.rows[0] || null,
        transactions: transactionsResult.rows,
        alerts: alertsResult.rows,
        adminNotes: notesResult.rows
      }
    });
  } catch (error) {
    console.error('Admin card detail error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching card details'
      }
    });
  }
});

// Lock card
router.post('/:cardId/lock', checkPermission('LOCK_CARDS'), auditLogs.cardLock, async (req, res) => {
  try {
    const { cardId } = req.params;
    const { reason = 'ADMIN_LOCK', notes = '' } = req.body;

    // Check if card exists and is not already locked
    const cardQuery = `
      SELECT card_id, card_status, customer_id 
      FROM cards 
      WHERE card_id = $1
    `;
    const cardResult = await query(cardQuery, [cardId]);

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CARD_NOT_FOUND',
          message: 'Card not found'
        }
      });
    }

    const card = cardResult.rows[0];
    
    if (card.card_status === 'LOCKED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CARD_ALREADY_LOCKED',
          message: 'Card is already locked'
        }
      });
    }

    // Lock the card
    const lockQuery = `
      UPDATE cards 
      SET card_status = 'LOCKED', 
          locked_by = $1, 
          locked_at = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE card_id = $3
    `;
    
    await query(lockQuery, [req.admin.adminId, new Date().toISOString(), cardId]);

    // Add admin note if provided
    if (notes) {
      const noteQuery = `
        INSERT INTO admin_notes (admin_id, note_type, reference_id, note_text, is_internal)
        VALUES ($1, 'CARD', $2, $3, true)
      `;
      await query(noteQuery, [req.admin.adminId, cardId, `Card locked: ${notes}`]);
    }

    res.json({
      success: true,
      message: 'Card locked successfully',
      data: {
        cardId,
        previousStatus: card.card_status,
        newStatus: 'LOCKED',
        lockedBy: req.admin.username,
        lockedAt: new Date().toISOString(),
        reason
      }
    });
  } catch (error) {
    console.error('Admin card lock error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while locking the card'
      }
    });
  }
});

// Unlock card
router.post('/:cardId/unlock', checkPermission('LOCK_CARDS'), auditLogs.cardUnlock, async (req, res) => {
  try {
    const { cardId } = req.params;
    const { notes = '' } = req.body;

    // Check if card exists and is locked
    const cardQuery = `
      SELECT card_id, card_status, customer_id 
      FROM cards 
      WHERE card_id = $1
    `;
    const cardResult = await query(cardQuery, [cardId]);

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CARD_NOT_FOUND',
          message: 'Card not found'
        }
      });
    }

    const card = cardResult.rows[0];
    
    if (card.card_status !== 'LOCKED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CARD_NOT_LOCKED',
          message: 'Card is not locked'
        }
      });
    }

    // Unlock the card
    const unlockQuery = `
      UPDATE cards 
      SET card_status = 'ACTIVE', 
          locked_by = NULL, 
          locked_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE card_id = $1
    `;
    
    await query(unlockQuery, [cardId]);

    // Add admin note if provided
    if (notes) {
      const noteQuery = `
        INSERT INTO admin_notes (admin_id, note_type, reference_id, note_text, is_internal)
        VALUES ($1, 'CARD', $2, $3, true)
      `;
      await query(noteQuery, [req.admin.adminId, cardId, `Card unlocked: ${notes}`]);
    }

    res.json({
      success: true,
      message: 'Card unlocked successfully',
      data: {
        cardId,
        previousStatus: card.card_status,
        newStatus: 'ACTIVE',
        unlockedBy: req.admin.username,
        unlockedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Admin card unlock error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while unlocking the card'
      }
    });
  }
});

// Update card controls
router.put('/:cardId/controls', checkPermission('UPDATE_CARD_CONTROLS'), auditLogs.cardControlUpdate, async (req, res) => {
  try {
    const { cardId } = req.params;
    const controls = req.body;

    // Check if card exists
    const cardQuery = `SELECT card_id FROM cards WHERE card_id = $1`;
    const cardResult = await query(cardQuery, [cardId]);

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CARD_NOT_FOUND',
          message: 'Card not found'
        }
      });
    }

    // Update or insert card controls
    const upsertQuery = `
      INSERT INTO card_controls (
        card_id, daily_limit, per_transaction_limit, atm_daily_limit,
        contactless_enabled, online_enabled, international_enabled,
        atm_enabled, magnetic_stripe_enabled, allowed_countries,
        blocked_merchant_categories, alert_threshold, velocity_limit_enabled,
        max_transactions_per_hour, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP
      )
      ON CONFLICT (card_id) 
      DO UPDATE SET
        daily_limit = EXCLUDED.daily_limit,
        per_transaction_limit = EXCLUDED.per_transaction_limit,
        atm_daily_limit = EXCLUDED.atm_daily_limit,
        contactless_enabled = EXCLUDED.contactless_enabled,
        online_enabled = EXCLUDED.online_enabled,
        international_enabled = EXCLUDED.international_enabled,
        atm_enabled = EXCLUDED.atm_enabled,
        magnetic_stripe_enabled = EXCLUDED.magnetic_stripe_enabled,
        allowed_countries = EXCLUDED.allowed_countries,
        blocked_merchant_categories = EXCLUDED.blocked_merchant_categories,
        alert_threshold = EXCLUDED.alert_threshold,
        velocity_limit_enabled = EXCLUDED.velocity_limit_enabled,
        max_transactions_per_hour = EXCLUDED.max_transactions_per_hour,
        updated_at = CURRENT_TIMESTAMP
    `;

    await query(upsertQuery, [
      cardId,
      controls.dailyLimit || null,
      controls.perTransactionLimit || null,
      controls.atmDailyLimit || null,
      controls.contactlessEnabled !== undefined ? controls.contactlessEnabled : true,
      controls.onlineEnabled !== undefined ? controls.onlineEnabled : true,
      controls.internationalEnabled !== undefined ? controls.internationalEnabled : false,
      controls.atmEnabled !== undefined ? controls.atmEnabled : true,
      controls.magneticStripeEnabled !== undefined ? controls.magneticStripeEnabled : true,
      controls.allowedCountries || null,
      controls.blockedMerchantCategories || null,
      controls.alertThreshold || null,
      controls.velocityLimitEnabled !== undefined ? controls.velocityLimitEnabled : false,
      controls.maxTransactionsPerHour || null
    ]);

    res.json({
      success: true,
      message: 'Card controls updated successfully',
      data: {
        cardId,
        updatedBy: req.admin.username,
        updatedAt: new Date().toISOString(),
        controls
      }
    });
  } catch (error) {
    console.error('Admin card controls update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating card controls'
      }
    });
  }
});

module.exports = router;
