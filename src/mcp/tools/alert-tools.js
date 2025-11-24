/**
 * Alert Management MCP Tools
 * Exposes alert and notification management to AI agents
 */

module.exports = [
  {
    name: 'cms_get_alerts',
    description: 'Get all alerts for a customer with optional filtering by read status',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Filter alerts by customer ID (optional, defaults to authenticated user)',
        },
        unread_only: {
          type: 'boolean',
          description: 'If true, only return unread alerts (default: false)',
        },
        alert_type: {
          type: 'string',
          description: 'Filter by alert type',
          enum: ['TRANSACTION', 'FRAUD', 'SECURITY', 'CARD_STATUS', 'SYSTEM', 'PROMOTION'],
        },
        limit: {
          type: 'number',
          description: 'Maximum number of alerts to return (default: 50)',
        },
        offset: {
          type: 'number',
          description: 'Number of alerts to skip for pagination (default: 0)',
        },
      },
    },
  },
  {
    name: 'cms_mark_alert_read',
    description: 'Mark a specific alert as read by its alert ID',
    inputSchema: {
      type: 'object',
      properties: {
        alert_id: {
          type: 'string',
          description: 'The unique identifier of the alert to mark as read',
        },
      },
      required: ['alert_id'],
    },
  },
  {
    name: 'cms_get_alert_preferences',
    description: 'Get notification preferences for a customer (email, SMS, push)',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'The customer ID to get preferences for',
        },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'cms_update_alert_preferences',
    description: 'Update notification preferences for a customer (email, SMS, push notifications)',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'The customer ID to update preferences for',
        },
        email_enabled: {
          type: 'boolean',
          description: 'Enable/disable email notifications',
        },
        sms_enabled: {
          type: 'boolean',
          description: 'Enable/disable SMS notifications',
        },
        push_enabled: {
          type: 'boolean',
          description: 'Enable/disable push notifications',
        },
        transaction_alerts: {
          type: 'boolean',
          description: 'Enable/disable transaction alerts',
        },
        fraud_alerts: {
          type: 'boolean',
          description: 'Enable/disable fraud alerts',
        },
        security_alerts: {
          type: 'boolean',
          description: 'Enable/disable security alerts',
        },
      },
      required: ['customer_id'],
    },
  },
];

