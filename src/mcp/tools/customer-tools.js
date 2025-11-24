/**
 * Customer Management MCP Tools
 * Exposes customer CRUD operations to AI agents
 */

module.exports = [
  {
    name: 'cms_get_customers',
    description: 'Retrieve all customers with optional filtering by KYC status, risk rating, search term, and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of customers to return (default: 20)',
        },
        offset: {
          type: 'number',
          description: 'Number of customers to skip for pagination (default: 0)',
        },
        search: {
          type: 'string',
          description: 'Search term to filter customers by customer ID, username, email, or name',
        },
        status: {
          type: 'string',
          description: 'Filter by account status',
          enum: ['active', 'inactive'],
        },
        sortBy: {
          type: 'string',
          description: 'Column to sort by',
          enum: ['created_at', 'last_login', 'customer_id', 'username'],
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
    name: 'cms_get_customer',
    description: 'Retrieve a specific customer by their unique customer ID',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'The unique identifier (UUID) of the customer',
        },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'cms_create_customer',
    description: 'Create a new customer record in the Card Management System',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Unique username for the customer',
        },
        email: {
          type: 'string',
          description: 'Customer email address',
        },
        password: {
          type: 'string',
          description: 'Customer account password',
        },
        phone: {
          type: 'string',
          description: 'Customer phone number',
        },
        first_name: {
          type: 'string',
          description: 'Customer first name',
        },
        last_name: {
          type: 'string',
          description: 'Customer last name',
        },
        date_of_birth: {
          type: 'string',
          description: 'Date of birth in YYYY-MM-DD format',
        },
        address_line1: {
          type: 'string',
          description: 'Street address line 1',
        },
        address_line2: {
          type: 'string',
          description: 'Street address line 2 (optional)',
        },
        city: {
          type: 'string',
          description: 'City',
        },
        state: {
          type: 'string',
          description: 'State or province',
        },
        postal_code: {
          type: 'string',
          description: 'Postal/ZIP code',
        },
        country: {
          type: 'string',
          description: 'Country code (e.g., US, CA)',
        },
      },
      required: ['username', 'email', 'password'],
    },
  },
  {
    name: 'cms_update_customer',
    description: 'Update an existing customer record',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'The unique identifier of the customer to update',
        },
        email: {
          type: 'string',
          description: 'Updated email address',
        },
        phone: {
          type: 'string',
          description: 'Updated phone number',
        },
        first_name: {
          type: 'string',
          description: 'Updated first name',
        },
        last_name: {
          type: 'string',
          description: 'Updated last name',
        },
        address_line1: {
          type: 'string',
          description: 'Updated street address line 1',
        },
        address_line2: {
          type: 'string',
          description: 'Updated street address line 2',
        },
        city: {
          type: 'string',
          description: 'Updated city',
        },
        state: {
          type: 'string',
          description: 'Updated state or province',
        },
        postal_code: {
          type: 'string',
          description: 'Updated postal/ZIP code',
        },
        country: {
          type: 'string',
          description: 'Updated country code',
        },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'cms_delete_customer',
    description: 'Delete a customer record (soft delete - marks as inactive)',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'The unique identifier of the customer to delete',
        },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'cms_search_customers',
    description: 'Search customers by name, email, or username with fuzzy matching',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to match against customer names, emails, or usernames',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 20)',
        },
      },
      required: ['query'],
    },
  },
];

