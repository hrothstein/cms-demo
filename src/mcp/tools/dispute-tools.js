/**
 * Dispute Management MCP Tools
 * Exposes dispute submission and tracking capabilities to AI agents
 */

module.exports = [
  {
    name: 'cms_create_dispute',
    description: 'Submit a new dispute for a suspicious or unauthorized transaction. This initiates the dispute resolution process',
    inputSchema: {
      type: 'object',
      properties: {
        transaction_id: {
          type: 'string',
          description: 'The unique identifier of the transaction being disputed',
        },
        dispute_type: {
          type: 'string',
          description: 'Type/category of the dispute',
          enum: [
            'unauthorized',
            'duplicate',
            'incorrect_amount',
            'merchandise_not_received',
            'merchandise_defective',
            'cancelled_recurring',
            'fraud',
            'other',
          ],
        },
        reason: {
          type: 'string',
          description: 'Detailed explanation of why the transaction is being disputed',
        },
        amount: {
          type: 'number',
          description: 'Disputed amount in dollars (if different from transaction amount)',
        },
        evidence_description: {
          type: 'string',
          description: 'Description of any supporting evidence for the dispute',
        },
      },
      required: ['transaction_id', 'dispute_type', 'reason'],
    },
  },
  {
    name: 'cms_get_disputes',
    description: 'Get all disputes for a customer with optional status filtering',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Filter disputes by customer ID (optional, defaults to authenticated user)',
        },
        status: {
          type: 'string',
          description: 'Filter by dispute status',
          enum: ['OPEN', 'PENDING_REVIEW', 'INVESTIGATING', 'RESOLVED_CUSTOMER_FAVOR', 'RESOLVED_MERCHANT_FAVOR', 'CLOSED'],
        },
        limit: {
          type: 'number',
          description: 'Maximum number of disputes to return (default: 20)',
        },
        offset: {
          type: 'number',
          description: 'Number of disputes to skip for pagination (default: 0)',
        },
      },
    },
  },
  {
    name: 'cms_get_dispute',
    description: 'Get detailed information about a specific dispute including status history and comments',
    inputSchema: {
      type: 'object',
      properties: {
        dispute_id: {
          type: 'string',
          description: 'The unique identifier of the dispute',
        },
      },
      required: ['dispute_id'],
    },
  },
  {
    name: 'cms_update_dispute',
    description: 'Update dispute information by adding additional details or evidence',
    inputSchema: {
      type: 'object',
      properties: {
        dispute_id: {
          type: 'string',
          description: 'The unique identifier of the dispute to update',
        },
        additional_info: {
          type: 'string',
          description: 'Additional information or evidence to add to the dispute',
        },
        evidence_description: {
          type: 'string',
          description: 'Updated or additional evidence description',
        },
      },
      required: ['dispute_id'],
    },
  },
];

