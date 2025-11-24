/**
 * Card Services MCP Tools
 * Exposes secure card services like PIN management, activation, and replacement to AI agents
 */

module.exports = [
  {
    name: 'cms_view_pin',
    description: 'View card PIN securely. Requires re-authentication for security. WARNING: This is a sensitive operation',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier of the card',
        },
        password: {
          type: 'string',
          description: 'Customer password for re-authentication (required for security)',
        },
      },
      required: ['card_id', 'password'],
    },
  },
  {
    name: 'cms_change_pin',
    description: 'Change the PIN for a card. Requires current PIN for verification',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier of the card',
        },
        current_pin: {
          type: 'string',
          description: 'Current 4-digit PIN',
        },
        new_pin: {
          type: 'string',
          description: 'New 4-digit PIN',
        },
      },
      required: ['card_id', 'current_pin', 'new_pin'],
    },
  },
  {
    name: 'cms_request_replacement',
    description: 'Request a replacement card due to damage, loss, theft, or other reasons',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier of the card to replace',
        },
        reason: {
          type: 'string',
          description: 'Reason for requesting replacement',
          enum: ['lost', 'stolen', 'damaged', 'expired', 'compromised', 'other'],
        },
        expedited: {
          type: 'boolean',
          description: 'Request expedited shipping (may incur additional fee)',
        },
        shipping_address: {
          type: 'object',
          description: 'Alternative shipping address (optional, defaults to customer address)',
          properties: {
            address_line1: { type: 'string' },
            address_line2: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            postal_code: { type: 'string' },
            country: { type: 'string' },
          },
        },
      },
      required: ['card_id', 'reason'],
    },
  },
  {
    name: 'cms_activate_card',
    description: 'Activate a new card that has been received. Requires identity verification',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'The unique identifier of the card to activate',
        },
        last_four_ssn: {
          type: 'string',
          description: 'Last 4 digits of Social Security Number for identity verification',
        },
        cvv: {
          type: 'string',
          description: 'Card CVV code from the back of the card',
        },
        date_of_birth: {
          type: 'string',
          description: 'Date of birth in YYYY-MM-DD format for verification',
        },
      },
      required: ['card_id', 'last_four_ssn'],
    },
  },
];

