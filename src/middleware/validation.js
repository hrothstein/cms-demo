const Joi = require('joi');

/**
 * Validation middleware for card controls
 */
const validateCardControls = (req, res, next) => {
  const schema = Joi.object({
    dailyLimit: Joi.number().min(0).max(10000).optional(),
    perTransactionLimit: Joi.number().min(0).max(5000).optional(),
    atmDailyLimit: Joi.number().min(0).max(2000).optional(),
    contactlessEnabled: Joi.boolean().optional(),
    onlineEnabled: Joi.boolean().optional(),
    internationalEnabled: Joi.boolean().optional(),
    atmEnabled: Joi.boolean().optional(),
    magneticStripeEnabled: Joi.boolean().optional(),
    allowedCountries: Joi.array().items(Joi.string().length(2)).optional(),
    blockedMerchantCategories: Joi.array().items(Joi.string()).optional(),
    alertThreshold: Joi.number().min(0).max(1000).optional(),
    velocityLimitEnabled: Joi.boolean().optional(),
    maxTransactionsPerHour: Joi.number().min(1).max(100).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.details.map(detail => detail.message).join(', '),
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
};

/**
 * Validation middleware for card requests
 */
const validateCardRequest = (req, res, next) => {
  const schema = Joi.object({
    cardType: Joi.string().valid('DEBIT', 'CREDIT', 'PREPAID').required(),
    cardBrand: Joi.string().valid('VISA', 'MASTERCARD', 'AMEX', 'DISCOVER').optional(),
    cardTier: Joi.string().optional(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().length(2).required()
    }).optional(),
    expeditedShipping: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.details.map(detail => detail.message).join(', '),
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
};

/**
 * Validation middleware for dispute filing
 */
const validateDisputeRequest = (req, res, next) => {
  const schema = Joi.object({
    transactionId: Joi.string().required(),
    disputeReason: Joi.string().valid(
      'UNAUTHORIZED_TRANSACTION',
      'MERCHANT_DISPUTE',
      'BILLING_ERROR',
      'FRAUD'
    ).required(),
    disputeAmount: Joi.number().min(0.01).required(),
    customerDescription: Joi.string().min(10).max(1000).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.details.map(detail => detail.message).join(', '),
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
};

/**
 * Validation middleware for fraud reports
 */
const validateFraudReport = (req, res, next) => {
  const schema = Joi.object({
    cardId: Joi.string().required(),
    description: Joi.string().min(10).max(1000).required(),
    transactionIds: Joi.array().items(Joi.string()).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.details.map(detail => detail.message).join(', '),
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
};

/**
 * Validation middleware for notification preferences
 */
const validateNotificationPreferences = (req, res, next) => {
  const schema = Joi.object({
    emailEnabled: Joi.boolean().optional(),
    emailAddress: Joi.string().email().optional(),
    smsEnabled: Joi.boolean().optional(),
    smsNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    pushEnabled: Joi.boolean().optional(),
    transactionAlerts: Joi.boolean().optional(),
    largeTransactionThreshold: Joi.number().min(0).max(10000).optional(),
    fraudAlerts: Joi.boolean().optional(),
    cardStatusAlerts: Joi.boolean().optional(),
    paymentDueAlerts: Joi.boolean().optional(),
    quietHoursStart: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    quietHoursEnd: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.details.map(detail => detail.message).join(', '),
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
};

module.exports = {
  validateCardControls,
  validateCardRequest,
  validateDisputeRequest,
  validateFraudReport,
  validateNotificationPreferences
};
