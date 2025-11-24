/**
 * Card Management MCP Tools
 * Exposes card CRUD and control operations to AI agents
 */

module.exports = [
  {
    name: 'cms_get_cards',
    description: 'Retrieve all cards with optional filtering by customer, status, or card type',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Filter cards by customer ID',
        },
        status: {
          type: 'string',
          description: 'Filter by card status',
          enum: ['ACTIVE', 'LOCKED', 'EXPIRED', 'CANCELLED', 'PENDING_ACTIVATION'],
        },
        card_type: {
          type: 'string',
          description: 'Filter by card type',
          enum: ['CREDIT', 'DEBIT', 'PREPAID'],
        },
        limit: {
          type: 'number',
          description: 'Maximum number of cards to return (default: 20)',
        },
        offset: {
          type: 'number',
          description: 'Number of cards to skip for pagination (default: 0)',
        },
        sortBy: {
          type: 'string',
          description: 'Column to sort by',
          enum: ['created_at', 'expiry_date', 'card_status', 'card_type'],
        },
        sortOrder: {
          type: 'string',
          description: 'Sort direction',
          enum: ['ASC', 'DESC'],
        },
      },
    },
  },
  {
    name: 'cms_get_card',
    description: 'Retrieve a specific card by its unique card ID with full details including controls',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier (UUID) of the card',
        },
      },
      required: ['card_id'],
    },
  },
  {
    name: 'cms_create_card',
    description: 'Create a new card for a customer. Requires customer_id and card type',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'The customer ID to associate with this card',
        },
        card_type: {
          type: 'string',
          description: 'Type of card to create',
          enum: ['CREDIT', 'DEBIT', 'PREPAID'],
        },
        card_brand: {
          type: 'string',
          description: 'Card brand',
          enum: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'],
        },
        cardholder_name: {
          type: 'string',
          description: 'Name to print on the card',
        },
        credit_limit: {
          type: 'number',
          description: 'Credit limit for credit cards (optional)',
        },
        is_primary: {
          type: 'boolean',
          description: 'Whether this is the primary card for the customer',
        },
      },
      required: ['customer_id', 'card_type'],
    },
  },
  {
    name: 'cms_update_card',
    description: 'Update card details such as credit limit, expiry date, or cardholder name',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier of the card to update',
        },
        cardholder_name: {
          type: 'string',
          description: 'Updated cardholder name',
        },
        credit_limit: {
          type: 'number',
          description: 'Updated credit limit',
        },
        expiry_date: {
          type: 'string',
          description: 'Updated expiry date in YYYY-MM-DD format',
        },
      },
      required: ['card_id'],
    },
  },
  {
    name: 'cms_delete_card',
    description: 'Delete a card record (marks card as CANCELLED)',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier of the card to delete',
        },
      },
      required: ['card_id'],
    },
  },
  {
    name: 'cms_lock_card',
    description: 'Immediately lock a card to prevent any transactions. Use for fraud prevention, lost/stolen cards, or customer requests',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier of the card to lock',
        },
        reason: {
          type: 'string',
          description: 'Reason for locking the card',
          enum: ['lost', 'stolen', 'fraud_suspected', 'customer_request', 'other'],
        },
        notes: {
          type: 'string',
          description: 'Additional notes or context for the lock action',
        },
      },
      required: ['card_id'],
    },
  },
  {
    name: 'cms_unlock_card',
    description: 'Unlock a previously locked card to allow transactions again',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier of the card to unlock',
        },
        notes: {
          type: 'string',
          description: 'Reason or notes for unlocking the card',
        },
      },
      required: ['card_id'],
    },
  },
  {
    name: 'cms_update_card_controls',
    description: 'Update card control settings to enable/disable specific transaction types and set spending limits',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier of the card',
        },
        international_enabled: {
          type: 'boolean',
          description: 'Allow international transactions',
        },
        online_enabled: {
          type: 'boolean',
          description: 'Allow online/e-commerce transactions',
        },
        contactless_enabled: {
          type: 'boolean',
          description: 'Allow contactless/tap payments',
        },
        atm_enabled: {
          type: 'boolean',
          description: 'Allow ATM withdrawals',
        },
        daily_limit: {
          type: 'number',
          description: 'Daily spending limit in dollars',
        },
        transaction_limit: {
          type: 'number',
          description: 'Per-transaction spending limit in dollars',
        },
      },
      required: ['card_id'],
    },
  },
];

