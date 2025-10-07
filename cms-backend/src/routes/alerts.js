const express = require('express');
const { query } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { sendAlertToHBR } = require('../services/mulesoft');

const router = express.Router();

// GET /api/v1/alerts - Get all alerts for authenticated user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { unreadOnly, limit = 20, offset = 0 } = req.query;

    let whereClause = 'WHERE a.customer_id = $1';
    let queryParams = [req.user.customer_id];
    let paramCount = 1;

    if (unreadOnly === 'true') {
      paramCount++;
      whereClause += ` AND a.is_read = FALSE`;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM alerts a ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total);

    // Get unread count
    const unreadResult = await query(
      'SELECT COUNT(*) as unread_count FROM alerts WHERE customer_id = $1 AND is_read = FALSE',
      [req.user.customer_id]
    );
    const unreadCount = parseInt(unreadResult.rows[0].unread_count);

    // Get alerts with pagination
    paramCount++;
    queryParams.push(limit);
    paramCount++;
    queryParams.push(offset);

    const alertsResult = await query(
      `SELECT 
        a.alert_id,
        a.customer_id,
        a.card_id,
        a.transaction_id,
        a.alert_type,
        a.alert_title,
        a.alert_message,
        a.severity,
        a.is_read,
        a.read_at,
        a.is_dismissed,
        a.dismissed_at,
        a.action_taken,
        a.action_taken_at,
        a.created_at
      FROM alerts a
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      queryParams
    );

    const alerts = alertsResult.rows.map(alert => ({
      alertId: alert.alert_id,
      customerId: alert.customer_id,
      cardId: alert.card_id,
      transactionId: alert.transaction_id,
      alertType: alert.alert_type,
      alertTitle: alert.alert_title,
      alertMessage: alert.alert_message,
      severity: alert.severity,
      isRead: alert.is_read,
      readAt: alert.read_at,
      isDismissed: alert.is_dismissed,
      dismissedAt: alert.dismissed_at,
      actionTaken: alert.action_taken,
      actionTakenAt: alert.action_taken_at,
      createdAt: alert.created_at
    }));

    res.json({
      success: true,
      data: {
        alerts,
        unreadCount,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/alerts/:alertId/read - Mark alert as read
router.put('/:alertId/read', authenticateToken, async (req, res, next) => {
  try {
    const { alertId } = req.params;

    const result = await query(
      'UPDATE alerts SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE alert_id = $1 AND customer_id = $2 RETURNING alert_id',
      [alertId, req.user.customer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert marked as read'
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/alerts/:alertId/dismiss - Dismiss alert
router.put('/:alertId/dismiss', authenticateToken, async (req, res, next) => {
  try {
    const { alertId } = req.params;

    const result = await query(
      'UPDATE alerts SET is_dismissed = TRUE, dismissed_at = CURRENT_TIMESTAMP WHERE alert_id = $1 AND customer_id = $2 RETURNING alert_id',
      [alertId, req.user.customer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert dismissed'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/v1/alerts/preferences - Get alert preferences
router.get('/preferences', authenticateToken, async (req, res, next) => {
  try {
    const preferencesResult = await query(
      `SELECT 
        high_transaction_enabled,
        high_transaction_threshold,
        international_enabled,
        online_purchase_enabled,
        declined_transaction_enabled,
        failed_pin_enabled,
        card_locked_enabled,
        unusual_activity_enabled,
        low_balance_enabled,
        low_balance_threshold,
        in_app_enabled,
        email_enabled,
        sms_enabled,
        quiet_hours_enabled,
        quiet_hours_start,
        quiet_hours_end
      FROM alert_preferences 
      WHERE customer_id = $1`,
      [req.user.customer_id]
    );

    if (preferencesResult.rows.length === 0) {
      // Create default preferences if none exist
      await query(
        `INSERT INTO alert_preferences (customer_id) VALUES ($1)`,
        [req.user.customer_id]
      );
      
      // Return default preferences
      res.json({
        success: true,
        data: {
          highTransactionEnabled: true,
          highTransactionThreshold: 500.00,
          internationalEnabled: true,
          onlinePurchaseEnabled: true,
          declinedTransactionEnabled: true,
          failedPinEnabled: true,
          cardLockedEnabled: true,
          unusualActivityEnabled: true,
          lowBalanceEnabled: false,
          lowBalanceThreshold: 100.00,
          inAppEnabled: true,
          emailEnabled: true,
          smsEnabled: false,
          quietHoursEnabled: false,
          quietHoursStart: null,
          quietHoursEnd: null
        }
      });
      return;
    }

    const prefs = preferencesResult.rows[0];

    res.json({
      success: true,
      data: {
        highTransactionEnabled: prefs.high_transaction_enabled,
        highTransactionThreshold: parseFloat(prefs.high_transaction_threshold),
        internationalEnabled: prefs.international_enabled,
        onlinePurchaseEnabled: prefs.online_purchase_enabled,
        declinedTransactionEnabled: prefs.declined_transaction_enabled,
        failedPinEnabled: prefs.failed_pin_enabled,
        cardLockedEnabled: prefs.card_locked_enabled,
        unusualActivityEnabled: prefs.unusual_activity_enabled,
        lowBalanceEnabled: prefs.low_balance_enabled,
        lowBalanceThreshold: parseFloat(prefs.low_balance_threshold),
        inAppEnabled: prefs.in_app_enabled,
        emailEnabled: prefs.email_enabled,
        smsEnabled: prefs.sms_enabled,
        quietHoursEnabled: prefs.quiet_hours_enabled,
        quietHoursStart: prefs.quiet_hours_start,
        quietHoursEnd: prefs.quiet_hours_end
      }
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/alerts/preferences - Update alert preferences
router.put('/preferences', authenticateToken, validate(schemas.alertPreferences), async (req, res, next) => {
  try {
    const preferences = req.body;

    // Update or insert preferences
    await query(
      `INSERT INTO alert_preferences (
        customer_id, high_transaction_enabled, high_transaction_threshold,
        international_enabled, online_purchase_enabled, declined_transaction_enabled,
        failed_pin_enabled, card_locked_enabled, unusual_activity_enabled,
        low_balance_enabled, low_balance_threshold, in_app_enabled,
        email_enabled, sms_enabled, quiet_hours_enabled,
        quiet_hours_start, quiet_hours_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (customer_id) DO UPDATE SET
        high_transaction_enabled = EXCLUDED.high_transaction_enabled,
        high_transaction_threshold = EXCLUDED.high_transaction_threshold,
        international_enabled = EXCLUDED.international_enabled,
        online_purchase_enabled = EXCLUDED.online_purchase_enabled,
        declined_transaction_enabled = EXCLUDED.declined_transaction_enabled,
        failed_pin_enabled = EXCLUDED.failed_pin_enabled,
        card_locked_enabled = EXCLUDED.card_locked_enabled,
        unusual_activity_enabled = EXCLUDED.unusual_activity_enabled,
        low_balance_enabled = EXCLUDED.low_balance_enabled,
        low_balance_threshold = EXCLUDED.low_balance_threshold,
        in_app_enabled = EXCLUDED.in_app_enabled,
        email_enabled = EXCLUDED.email_enabled,
        sms_enabled = EXCLUDED.sms_enabled,
        quiet_hours_enabled = EXCLUDED.quiet_hours_enabled,
        quiet_hours_start = EXCLUDED.quiet_hours_start,
        quiet_hours_end = EXCLUDED.quiet_hours_end,
        updated_at = CURRENT_TIMESTAMP`,
      [
        req.user.customer_id,
        preferences.highTransactionEnabled,
        preferences.highTransactionThreshold,
        preferences.internationalEnabled,
        preferences.onlinePurchaseEnabled,
        preferences.declinedTransactionEnabled,
        preferences.failedPinEnabled,
        preferences.cardLockedEnabled,
        preferences.unusualActivityEnabled,
        preferences.lowBalanceEnabled,
        preferences.lowBalanceThreshold,
        preferences.inAppEnabled,
        preferences.emailEnabled,
        preferences.smsEnabled,
        preferences.quietHoursEnabled,
        preferences.quietHoursStart,
        preferences.quietHoursEnd
      ]
    );

    // Sync preferences to HBR via MuleSoft
    await sendAlertToHBR({
      customerId: req.user.customer_id,
      alertType: 'PREFERENCES_UPDATE',
      preferences
    });

    res.json({
      success: true,
      message: 'Alert preferences updated successfully',
      data: preferences
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
