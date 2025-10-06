const { query } = require('../config/database');

/**
 * Notification Service - Handles alerts and notification preferences
 */
class NotificationService {
  // Get alerts for a customer with filters
  async getAlertsByCustomer(customerId, filters = {}) {
    const {
      status,
      severity,
      limit = 20,
      offset = 0
    } = filters;

    let whereConditions = ['a.customer_id = $1'];
    let queryParams = [customerId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereConditions.push(`a.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (severity) {
      paramCount++;
      whereConditions.push(`a.severity = $${paramCount}`);
      queryParams.push(severity);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM alerts a
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get alerts with pagination
    const alertsQuery = `
      SELECT 
        a.alert_id,
        a.card_id,
        a.customer_id,
        a.alert_type,
        a.severity,
        a.alert_date,
        a.alert_title,
        a.alert_message,
        a.related_transaction_id,
        a.status,
        a.action_required,
        a.read_date,
        a.created_at
      FROM alerts a
      WHERE ${whereClause}
      ORDER BY a.alert_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const result = await query(alertsQuery, queryParams);

    // Get summary counts
    const summaryQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'NEW' THEN 1 END) as unread_count,
        COUNT(CASE WHEN action_required = true THEN 1 END) as action_required_count
      FROM alerts a
      WHERE a.customer_id = $1
    `;
    const summaryResult = await query(summaryQuery, [customerId]);
    const summary = summaryResult.rows[0];

    // Format alerts
    const alerts = result.rows.map(row => this.formatAlert(row));

    return {
      success: true,
      data: alerts,
      count: total,
      summary: {
        unreadCount: parseInt(summary.unread_count),
        actionRequiredCount: parseInt(summary.action_required_count)
      }
    };
  }

  // Mark alert as read
  async markAlertAsRead(alertId, customerId) {
    const queryText = `
      UPDATE alerts 
      SET status = 'READ', read_date = $1
      WHERE alert_id = $2 AND customer_id = $3
      RETURNING alert_id, status, read_date
    `;

    const result = await query(queryText, [new Date().toISOString(), alertId, customerId]);
    
    if (result.rows.length === 0) {
      throw new Error('ALERT_NOT_FOUND');
    }

    return {
      success: true,
      message: 'Alert marked as read',
      data: {
        alertId: result.rows[0].alert_id,
        status: result.rows[0].status,
        readDate: result.rows[0].read_date
      }
    };
  }

  // Get notification preferences for customer
  async getNotificationPreferences(customerId) {
    const queryText = `
      SELECT 
        customer_id,
        email_enabled,
        email_address,
        sms_enabled,
        sms_number,
        push_enabled,
        transaction_alerts,
        large_transaction_threshold,
        fraud_alerts,
        card_status_alerts,
        payment_due_alerts,
        quiet_hours_start,
        quiet_hours_end,
        created_at,
        updated_at
      FROM notification_preferences
      WHERE customer_id = $1
    `;

    const result = await query(queryText, [customerId]);
    
    if (result.rows.length === 0) {
      // Create default preferences if none exist
      return await this.createDefaultPreferences(customerId);
    }

    const prefs = result.rows[0];
    return {
      customerId: prefs.customer_id,
      emailEnabled: prefs.email_enabled,
      emailAddress: prefs.email_address,
      smsEnabled: prefs.sms_enabled,
      smsNumber: prefs.sms_number,
      pushEnabled: prefs.push_enabled,
      transactionAlerts: prefs.transaction_alerts,
      largeTransactionThreshold: prefs.large_transaction_threshold ? parseFloat(prefs.large_transaction_threshold) : null,
      fraudAlerts: prefs.fraud_alerts,
      cardStatusAlerts: prefs.card_status_alerts,
      paymentDueAlerts: prefs.payment_due_alerts,
      quietHoursStart: prefs.quiet_hours_start,
      quietHoursEnd: prefs.quiet_hours_end,
      createdAt: prefs.created_at,
      updatedAt: prefs.updated_at
    };
  }

  // Update notification preferences
  async updateNotificationPreferences(customerId, updates) {
    const allowedFields = [
      'emailEnabled', 'emailAddress', 'smsEnabled', 'smsNumber', 'pushEnabled',
      'transactionAlerts', 'largeTransactionThreshold', 'fraudAlerts',
      'cardStatusAlerts', 'paymentDueAlerts', 'quietHoursStart', 'quietHoursEnd'
    ];

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
      UPDATE notification_preferences 
      SET ${updateFields.join(', ')}
      WHERE customer_id = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);
    
    if (result.rows.length === 0) {
      // Create preferences if they don't exist
      await this.createDefaultPreferences(customerId);
      return await this.updateNotificationPreferences(customerId, updates);
    }

    return {
      success: true,
      message: 'Notification preferences updated',
      data: {
        updatedFields: Object.keys(updates).filter(field => allowedFields.includes(field))
      }
    };
  }

  // Create default notification preferences
  async createDefaultPreferences(customerId) {
    const queryText = `
      INSERT INTO notification_preferences (
        customer_id, email_enabled, sms_enabled, push_enabled,
        transaction_alerts, fraud_alerts, card_status_alerts, payment_due_alerts
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await query(queryText, [
      customerId,
      true,  // email_enabled
      true,  // sms_enabled
      true,  // push_enabled
      false, // transaction_alerts
      true,  // fraud_alerts
      true,  // card_status_alerts
      true   // payment_due_alerts
    ]);

    const prefs = result.rows[0];
    return {
      customerId: prefs.customer_id,
      emailEnabled: prefs.email_enabled,
      emailAddress: prefs.email_address,
      smsEnabled: prefs.sms_enabled,
      smsNumber: prefs.sms_number,
      pushEnabled: prefs.push_enabled,
      transactionAlerts: prefs.transaction_alerts,
      largeTransactionThreshold: prefs.large_transaction_threshold ? parseFloat(prefs.large_transaction_threshold) : null,
      fraudAlerts: prefs.fraud_alerts,
      cardStatusAlerts: prefs.card_status_alerts,
      paymentDueAlerts: prefs.payment_due_alerts,
      quietHoursStart: prefs.quiet_hours_start,
      quietHoursEnd: prefs.quiet_hours_end,
      createdAt: prefs.created_at,
      updatedAt: prefs.updated_at
    };
  }

  // Format alert data for API response
  formatAlert(row) {
    return {
      alertId: row.alert_id,
      cardId: row.card_id,
      customerId: row.customer_id,
      alertType: row.alert_type,
      severity: row.severity,
      alertDate: row.alert_date,
      alertTitle: row.alert_title,
      alertMessage: row.alert_message,
      relatedTransactionId: row.related_transaction_id,
      status: row.status,
      actionRequired: row.action_required,
      readDate: row.read_date,
      createdAt: row.created_at
    };
  }
}

module.exports = new NotificationService();
