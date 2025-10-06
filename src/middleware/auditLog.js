const { query } = require('../config/database');

// Audit logging middleware
const auditLog = (actionType, targetType) => {
  return async (req, res, next) => {
    // Store original res.json to capture response
    const originalJson = res.json;
    let responseData = null;
    
    // Override res.json to capture response data
    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    // Continue with the request
    next();

    // After response, log the action
    res.on('finish', async () => {
      try {
        // Only log successful actions (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const adminId = req.admin?.adminId;
          const targetId = req.params.id || req.params.customerId || req.params.cardId || req.params.transactionId || req.params.disputeId || req.params.alertId;
          
          // Extract IP address
          const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                           req.headers['x-real-ip'] ||
                           'unknown';

          // Extract user agent
          const userAgent = req.headers['user-agent'] || 'unknown';

          // Create action description
          let actionDescription = `${actionType} on ${targetType}`;
          if (targetId) {
            actionDescription += ` (ID: ${targetId})`;
          }

          // Determine before/after values based on action type
          let beforeValue = null;
          let afterValue = null;

          if (actionType.includes('UPDATE') || actionType.includes('LOCK') || actionType.includes('UNLOCK')) {
            // For updates, we could capture before/after values
            // This is a simplified version - in production you'd want more sophisticated change tracking
            if (responseData && responseData.data) {
              afterValue = responseData.data;
            }
          }

          // Insert audit log
          const auditQuery = `
            INSERT INTO audit_logs (
              admin_id, action_type, target_type, target_id, 
              action_description, before_value, after_value, 
              ip_address, user_agent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `;

          await query(auditQuery, [
            adminId,
            actionType,
            targetType,
            targetId,
            actionDescription,
            beforeValue ? JSON.stringify(beforeValue) : null,
            afterValue ? JSON.stringify(afterValue) : null,
            ipAddress,
            userAgent
          ]);

          console.log(`Audit log: ${actionType} by admin ${adminId} on ${targetType} ${targetId || ''}`);
        }
      } catch (error) {
        console.error('Audit logging error:', error);
        // Don't fail the request if audit logging fails
      }
    });
  };
};

// Specific audit log functions for common actions
const auditLogs = {
  customerSearch: auditLog('CUSTOMER_SEARCH', 'CUSTOMER'),
  cardLock: auditLog('CARD_LOCK', 'CARD'),
  cardUnlock: auditLog('CARD_UNLOCK', 'CARD'),
  cardControlUpdate: auditLog('CARD_CONTROL_UPDATE', 'CARD'),
  disputeUpdate: auditLog('DISPUTE_UPDATE', 'DISPUTE'),
  disputeAssign: auditLog('DISPUTE_ASSIGN', 'DISPUTE'),
  alertReview: auditLog('ALERT_REVIEW', 'ALERT'),
  alertDismiss: auditLog('ALERT_DISMISS', 'ALERT'),
  reportGenerate: auditLog('REPORT_GENERATE', 'REPORT'),
  noteAdd: auditLog('NOTE_ADD', 'NOTE'),
  adminLogin: auditLog('ADMIN_LOGIN', 'ADMIN')
};

module.exports = {
  auditLog,
  auditLogs
};
