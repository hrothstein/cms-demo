/**
 * Global error handling middleware
 * Handles errors and returns consistent API error responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.message === 'CARD_NOT_FOUND') {
    return res.status(404).json({
      error: {
        code: 'CARD_NOT_FOUND',
        message: 'The requested card could not be found',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }

  if (err.message === 'UNAUTHORIZED') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'You are not authorized to access this resource',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }

  if (err.message === 'CARD_ALREADY_LOCKED') {
    return res.status(409).json({
      error: {
        code: 'CARD_ALREADY_LOCKED',
        message: 'Card is already locked',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }

  if (err.message === 'CARD_NOT_LOCKED') {
    return res.status(400).json({
      error: {
        code: 'CARD_NOT_LOCKED',
        message: 'Card is not currently locked',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }

  if (err.message === 'CARD_ALREADY_CLOSED') {
    return res.status(400).json({
      error: {
        code: 'CARD_ALREADY_CLOSED',
        message: 'Card is already closed',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }

  if (err.message === 'CARD_CANNOT_TRANSACT') {
    return res.status(400).json({
      error: {
        code: 'CARD_CANNOT_TRANSACT',
        message: 'Card cannot be used for transactions',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }

  if (err.message.startsWith('CARD_CONTROLS_VIOLATION:')) {
    return res.status(400).json({
      error: {
        code: 'CARD_CONTROLS_VIOLATION',
        message: err.message.replace('CARD_CONTROLS_VIOLATION: ', ''),
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }

  if (err.message === 'CONTROLS_NOT_FOUND') {
    return res.status(404).json({
      error: {
        code: 'CONTROLS_NOT_FOUND',
        message: 'Card controls not found',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }

  if (err.message === 'TRANSACTION_NOT_FOUND') {
    return res.status(404).json({
      error: {
        code: 'TRANSACTION_NOT_FOUND',
        message: 'The requested transaction could not be found',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }

  if (err.message === 'DISPUTE_NOT_ELIGIBLE') {
    return res.status(400).json({
      error: {
        code: 'DISPUTE_NOT_ELIGIBLE',
        message: 'This transaction is not eligible for dispute',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }

  if (err.message === 'VALIDATION_ERROR') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        details: err.details || 'Invalid request data'
      }
    });
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        details: err.details.map(detail => detail.message).join(', ')
      }
    });
  }

  // Handle rate limiting errors
  if (err.status === 429) {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        retryAfter: err.retryAfter || 15
      }
    });
  }

  // Default error response
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      requestId: req.headers['x-request-id'] || 'unknown'
    }
  });
};

module.exports = errorHandler;
