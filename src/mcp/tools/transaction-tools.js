/**
 * Transaction Management MCP Tools
 * Exposes transaction viewing and search capabilities to AI agents
 */

module.exports = [
  {
    name: 'cms_get_transactions',
    description: 'Get all transactions for a specific card with optional date range filtering',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier of the card to get transactions for',
        },
        start_date: {
          type: 'string',
          description: 'Start date for filtering transactions in YYYY-MM-DD format (optional)',
        },
        end_date: {
          type: 'string',
          description: 'End date for filtering transactions in YYYY-MM-DD format (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of transactions to return (default: 50)',
        },
        offset: {
          type: 'number',
          description: 'Number of transactions to skip for pagination (default: 0)',
        },
        transaction_type: {
          type: 'string',
          description: 'Filter by transaction type',
          enum: ['PURCHASE', 'REFUND', 'WITHDRAWAL', 'TRANSFER', 'FEE'],
        },
        status: {
          type: 'string',
          description: 'Filter by transaction status',
          enum: ['PENDING', 'COMPLETED', 'DECLINED', 'DISPUTED'],
        },
      },
      required: ['card_id'],
    },
  },
  {
    name: 'cms_get_transaction',
    description: 'Get detailed information about a specific transaction by its unique ID',
    inputSchema: {
      type: 'object',
      properties: {
        transaction_id: {
          type: 'string',
          description: 'The unique identifier (UUID) of the transaction',
        },
      },
      required: ['transaction_id'],
    },
  },
  {
    name: 'cms_search_transactions',
    description: 'Search transactions by merchant name, amount range, or location for a specific card',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The card ID to search transactions for',
        },
        query: {
          type: 'string',
          description: 'Search term to match against merchant name or location (optional)',
        },
        min_amount: {
          type: 'number',
          description: 'Minimum transaction amount to filter by (optional)',
        },
        max_amount: {
          type: 'number',
          description: 'Maximum transaction amount to filter by (optional)',
        },
        merchant_category: {
          type: 'string',
          description: 'Filter by merchant category code or name (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 50)',
        },
      },
      required: ['card_id'],
    },
  },
];

