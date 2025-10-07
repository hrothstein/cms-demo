// Role-Based Access Control middleware

// Define permissions for each role
const rolePermissions = {
  CSR: [
    'VIEW_CUSTOMERS',
    'VIEW_CARDS', 
    'LOCK_CARDS',
    'UPDATE_CARD_CONTROLS',
    'VIEW_TRANSACTIONS',
    'VIEW_DISPUTES',
    'VIEW_ALERTS',
    'GENERATE_REPORTS',
    'ADD_NOTES'
  ],
  FRAUD_ANALYST: [
    'VIEW_CUSTOMERS',
    'VIEW_CARDS',
    'VIEW_FULL_CARD_NUMBER',
    'LOCK_CARDS',
    'UPDATE_CARD_CONTROLS',
    'VIEW_TRANSACTIONS',
    'VIEW_DISPUTES',
    'UPDATE_DISPUTES',
    'VIEW_ALERTS',
    'DISMISS_ALERTS',
    'GENERATE_REPORTS',
    'ADD_NOTES'
  ],
  SUPERVISOR: [
    'VIEW_CUSTOMERS',
    'VIEW_CARDS',
    'VIEW_FULL_CARD_NUMBER',
    'LOCK_CARDS',
    'UPDATE_CARD_CONTROLS',
    'VIEW_TRANSACTIONS',
    'VIEW_DISPUTES',
    'UPDATE_DISPUTES',
    'APPROVE_REFUNDS',
    'VIEW_ALERTS',
    'DISMISS_ALERTS',
    'GENERATE_REPORTS',
    'VIEW_AUDIT_LOGS',
    'ADD_NOTES'
  ],
  ADMIN: [
    'VIEW_CUSTOMERS',
    'VIEW_CARDS',
    'VIEW_FULL_CARD_NUMBER',
    'LOCK_CARDS',
    'UPDATE_CARD_CONTROLS',
    'VIEW_TRANSACTIONS',
    'VIEW_DISPUTES',
    'UPDATE_DISPUTES',
    'APPROVE_REFUNDS',
    'VIEW_ALERTS',
    'DISMISS_ALERTS',
    'GENERATE_REPORTS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_ADMIN_USERS',
    'ADD_NOTES'
  ]
};

// Check if admin has required permission
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Admin authentication required'
        }
      });
    }

    const adminRole = req.admin.role.toUpperCase();
    const permissions = rolePermissions[adminRole] || [];
    
    if (permissions.includes(requiredPermission)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Insufficient permissions. Required: ${requiredPermission}`,
          adminRole: adminRole,
          requiredPermission: requiredPermission
        }
      });
    }
  };
};

// Check if admin has any of the required permissions
const checkAnyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Admin authentication required'
        }
      });
    }

    const adminRole = req.admin.role.toUpperCase();
    const permissions = rolePermissions[adminRole] || [];
    
    const hasPermission = requiredPermissions.some(permission => 
      permissions.includes(permission)
    );
    
    if (hasPermission) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Insufficient permissions. Required one of: ${requiredPermissions.join(', ')}`,
          adminRole: adminRole,
          requiredPermissions: requiredPermissions
        }
      });
    }
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  rolePermissions
};
