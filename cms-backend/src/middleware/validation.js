const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    next();
  };
};

// Common validation schemas
const schemas = {
  // Authentication
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  // Card operations
  cardLock: Joi.object({
    reason: Joi.string().max(255).optional()
  }),

  cardControls: Joi.object({
    dailyLimit: Joi.number().min(0).optional(),
    perTransactionLimit: Joi.number().min(0).optional(),
    atmDailyLimit: Joi.number().min(0).optional(),
    onlineDailyLimit: Joi.number().min(0).optional(),
    contactlessEnabled: Joi.boolean().optional(),
    onlineEnabled: Joi.boolean().optional(),
    internationalEnabled: Joi.boolean().optional(),
    atmEnabled: Joi.boolean().optional(),
    magstripeEnabled: Joi.boolean().optional(),
    domesticOnly: Joi.boolean().optional(),
    allowedCountries: Joi.array().items(Joi.string().length(3)).optional(),
    blockedCountries: Joi.array().items(Joi.string().length(3)).optional()
  }),

  reportLost: Joi.object({
    reportType: Joi.string().valid('LOST', 'STOLEN').required(),
    lastSeenLocation: Joi.string().max(255).optional(),
    requestReplacement: Joi.boolean().default(true),
    deliveryAddress: Joi.object({
      line1: Joi.string().required(),
      line2: Joi.string().optional(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    expeditedShipping: Joi.boolean().default(false)
  }),

  // Transaction queries
  transactionQuery: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('PENDING', 'COMPLETED', 'DECLINED').optional(),
    minAmount: Joi.number().min(0).optional(),
    maxAmount: Joi.number().min(0).optional()
  }),

  // Alert preferences
  alertPreferences: Joi.object({
    highTransactionEnabled: Joi.boolean().optional(),
    highTransactionThreshold: Joi.number().min(0).optional(),
    internationalEnabled: Joi.boolean().optional(),
    onlinePurchaseEnabled: Joi.boolean().optional(),
    declinedTransactionEnabled: Joi.boolean().optional(),
    failedPinEnabled: Joi.boolean().optional(),
    cardLockedEnabled: Joi.boolean().optional(),
    unusualActivityEnabled: Joi.boolean().optional(),
    lowBalanceEnabled: Joi.boolean().optional(),
    lowBalanceThreshold: Joi.number().min(0).optional(),
    inAppEnabled: Joi.boolean().optional(),
    emailEnabled: Joi.boolean().optional(),
    smsEnabled: Joi.boolean().optional(),
    quietHoursEnabled: Joi.boolean().optional(),
    quietHoursStart: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    quietHoursEnd: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
  }),

  // Disputes
  dispute: Joi.object({
    transactionId: Joi.string().required(),
    disputeType: Joi.string().valid('FRAUD', 'UNAUTHORIZED', 'INCORRECT_AMOUNT', 'DUPLICATE_CHARGE', 'SERVICE_NOT_RECEIVED', 'OTHER').required(),
    disputeReason: Joi.string().min(10).max(1000).required(),
    disputeAmount: Joi.number().min(0).required(),
    supportingDocuments: Joi.array().items(Joi.string().uri()).optional()
  }),

  disputeComment: Joi.object({
    comment: Joi.string().min(1).max(500).required()
  }),

  // Card services
  viewPin: Joi.object({
    cardId: Joi.string().required(),
    password: Joi.string().required()
  }),

  changePin: Joi.object({
    cardId: Joi.string().required(),
    currentPin: Joi.string().pattern(/^\d{4,6}$/).required(),
    newPin: Joi.string().pattern(/^\d{4,6}$/).required(),
    confirmPin: Joi.string().pattern(/^\d{4,6}$/).required()
  }),

  requestReplacement: Joi.object({
    cardId: Joi.string().required(),
    requestType: Joi.string().valid('REPLACE_DAMAGED', 'NEW_CARD', 'UPGRADE', 'REPLACE_EXPIRING').required(),
    requestReason: Joi.string().max(500).optional(),
    deliveryAddress: Joi.object({
      line1: Joi.string().required(),
      line2: Joi.string().optional(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    expeditedShipping: Joi.boolean().default(false)
  }),

  activateCard: Joi.object({
    cardNumber: Joi.string().pattern(/^\d{16}$/).required(),
    cvv: Joi.string().pattern(/^\d{3,4}$/).required(),
    newPin: Joi.string().pattern(/^\d{4,6}$/).required()
  })
};

module.exports = {
  validate,
  schemas
};
