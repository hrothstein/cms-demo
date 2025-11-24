# CMS Admin MCP Server

## Overview

The CMS Admin MCP (Model Context Protocol) Server enables AI agents like Claude to interact directly with the Card Management System backend. This implementation exposes 30+ tools for customer management, card operations, transactions, alerts, disputes, and card services.

## What is MCP?

Model Context Protocol (MCP) is an open standard that enables AI assistants to securely connect to external data sources and tools. With MCP, Claude and other AI agents can:

- Query and manage customer data
- Perform card operations (lock/unlock, update controls)
- View transactions and create disputes
- Manage alerts and preferences
- Activate cards and request replacements

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Server                           │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ Authentication  │  │      Tool Handlers          │  │
│  │    Manager      │  │                             │  │
│  │                 │  │  ┌─────────────────────┐   │  │
│  │  - Token Cache  │  │  │  Customer Tools     │   │  │
│  │  - Auto Login   │  │  ├─────────────────────┤   │  │
│  └─────────────────┘  │  │  Card Tools         │   │  │
│                       │  ├─────────────────────┤   │  │
│                       │  │  Transaction Tools  │   │  │
│                       │  ├─────────────────────┤   │  │
│                       │  │  Alert Tools        │   │  │
│                       │  ├─────────────────────┤   │  │
│                       │  │  Dispute Tools      │   │  │
│                       │  ├─────────────────────┤   │  │
│                       │  │  Card Service Tools │   │  │
│                       │  └─────────────────────┘   │  │
│                       └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              CMS PostgreSQL Database                    │
└─────────────────────────────────────────────────────────┘
```

## Installation

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- CMS backend application setup complete

### Install Dependencies

The MCP SDK is already included in package.json. If you need to install it manually:

```bash
npm install @modelcontextprotocol/sdk
```

## Configuration

### 1. Environment Variables

Create or update your `.env` file with database connection details:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/cms_database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cms_database
DATABASE_USER=username
DATABASE_PASSWORD=password
DATABASE_SSL=false
NODE_ENV=production
```

### 2. Claude Desktop Configuration

To connect Claude Desktop to the MCP server:

1. Locate your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the MCP server configuration:

```json
{
  "mcpServers": {
    "cms-admin": {
      "command": "node",
      "args": [
        "/absolute/path/to/cms-demo/src/mcp/index.js"
      ],
      "env": {
        "DATABASE_URL": "postgresql://username:password@localhost:5432/cms_database"
      }
    }
  }
}
```

3. Replace `/absolute/path/to/cms-demo` with the actual path to your project

4. Restart Claude Desktop

## Running the MCP Server

### Standalone Mode (Recommended for Claude Desktop)

Claude Desktop will automatically start the MCP server when needed. No manual startup required.

### Manual Testing

To test the MCP server manually:

```bash
cd /path/to/cms-demo
node src/mcp/index.js
```

The server runs on stdio and communicates via stdin/stdout.

### Integrated with Express Server (Optional)

The MCP server is designed to run separately from the Express REST API. Both can run simultaneously without conflicts.

## Available MCP Tools

### Customer Management Tools (6 tools)

| Tool Name | Description |
|-----------|-------------|
| `cms_get_customers` | Retrieve all customers with filtering and pagination |
| `cms_get_customer` | Get specific customer by ID |
| `cms_create_customer` | Create new customer record |
| `cms_update_customer` | Update existing customer |
| `cms_delete_customer` | Delete (soft delete) customer |
| `cms_search_customers` | Search customers by name/email/username |

### Card Management Tools (8 tools)

| Tool Name | Description |
|-----------|-------------|
| `cms_get_cards` | Retrieve all cards with filtering |
| `cms_get_card` | Get specific card by ID |
| `cms_create_card` | Create new card for customer |
| `cms_update_card` | Update card details |
| `cms_delete_card` | Delete (cancel) card |
| `cms_lock_card` | Lock card to prevent transactions |
| `cms_unlock_card` | Unlock a locked card |
| `cms_update_card_controls` | Update card spending/transaction controls |

### Transaction Tools (3 tools)

| Tool Name | Description |
|-----------|-------------|
| `cms_get_transactions` | Get transactions for a card |
| `cms_get_transaction` | Get specific transaction details |
| `cms_search_transactions` | Search transactions by merchant/amount |

### Alert Tools (4 tools)

| Tool Name | Description |
|-----------|-------------|
| `cms_get_alerts` | Get customer alerts |
| `cms_mark_alert_read` | Mark alert as read |
| `cms_get_alert_preferences` | Get notification preferences |
| `cms_update_alert_preferences` | Update notification preferences |

### Dispute Tools (4 tools)

| Tool Name | Description |
|-----------|-------------|
| `cms_create_dispute` | Submit new transaction dispute |
| `cms_get_disputes` | Get all disputes for customer |
| `cms_get_dispute` | Get specific dispute details |
| `cms_update_dispute` | Update dispute information |

### Card Services Tools (4 tools)

| Tool Name | Description |
|-----------|-------------|
| `cms_view_pin` | View card PIN (requires re-auth) |
| `cms_change_pin` | Change card PIN |
| `cms_request_replacement` | Request replacement card |
| `cms_activate_card` | Activate new card |

## Usage Examples with Claude

Once configured, you can interact with the CMS through Claude using natural language:

### Example: Customer Management

```
User: "Find all customers with the name John"
Claude: [Uses cms_search_customers tool]

User: "Show me customer details for ID abc-123"
Claude: [Uses cms_get_customer tool]

User: "Create a new customer named Jane Doe with email jane@example.com"
Claude: [Uses cms_create_customer tool]
```

### Example: Fraud Response

```
User: "Customer reports their card ending in 1234 was stolen"
Claude: [Uses cms_search_cards to find card]
Claude: [Uses cms_lock_card with reason='stolen']
Claude: "I've locked the card ending in 1234 to prevent unauthorized transactions."

User: "Show me recent transactions on that card"
Claude: [Uses cms_get_transactions]
Claude: [Displays transaction list]

User: "The last 3 transactions look suspicious. File disputes for them"
Claude: [Uses cms_create_dispute for each transaction]
Claude: "I've created 3 dispute cases for the suspicious transactions."
```

### Example: Card Management

```
User: "Update card controls for card xyz-789 to disable international transactions"
Claude: [Uses cms_update_card_controls]
Claude: "International transactions have been disabled for card xyz-789."

User: "List all locked cards"
Claude: [Uses cms_get_cards with status='LOCKED']
```

## Financial Services Use Cases

### 1. Fraud Response
- Lock compromised cards immediately
- Review suspicious transactions
- Create disputes automatically
- Generate fraud reports

### 2. Customer Onboarding
- Create customer accounts
- Issue initial cards
- Set up alert preferences
- Activate cards

### 3. Customer Service
- Retrieve customer information
- View transaction history
- Update customer details
- Manage card controls

### 4. Dispute Resolution
- Track dispute status
- Update dispute information
- Add supporting evidence
- Close resolved disputes

### 5. Alert Management
- Review customer alerts
- Update notification preferences
- Mark alerts as read
- Filter by alert type

## Security Considerations

### Database Access
- MCP server has direct database access
- Use read-only database user where possible
- Implement row-level security policies
- Enable audit logging

### Authentication
- No end-user authentication in MCP layer (handled by AI agent)
- Database credentials stored securely in environment
- Consider IP whitelisting for production

### Data Protection
- Sensitive data (PINs, CVVs) handled securely
- PII logging disabled
- Encryption at rest and in transit
- Compliance with PCI-DSS, GDPR, CCPA

### Production Hardening
```javascript
// Recommended: Use connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Recommended: Enable SSL
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
```

## Troubleshooting

### Claude Desktop Can't Find MCP Server

**Problem**: Claude shows "MCP server not available"

**Solution**:
1. Check config file path is correct
2. Verify absolute path to `index.js`
3. Ensure database connection string is valid
4. Check Claude Desktop logs:
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

### Database Connection Errors

**Problem**: "connection refused" or "timeout"

**Solution**:
1. Verify PostgreSQL is running: `pg_isready`
2. Check database credentials in .env
3. Test connection: `psql $DATABASE_URL`
4. Verify firewall allows connections

### Tool Execution Errors

**Problem**: Tools return errors or unexpected results

**Solution**:
1. Check database schema matches expected structure
2. Verify required tables exist (users, cards, transactions, etc.)
3. Enable debug logging:
   ```bash
   NODE_ENV=development node src/mcp/index.js
   ```
4. Check tool handler implementation in `src/mcp/handlers/index.js`

### Performance Issues

**Problem**: Slow tool responses

**Solution**:
1. Add database indexes:
   ```sql
   CREATE INDEX idx_cards_customer ON cards(customer_id);
   CREATE INDEX idx_transactions_card ON transactions(card_id);
   CREATE INDEX idx_users_email ON users(email);
   ```
2. Use pagination for large result sets
3. Enable database connection pooling
4. Monitor query performance with EXPLAIN

## Testing

### Manual Testing with cURL

MCP uses stdio transport, so manual HTTP testing isn't directly applicable. Use Claude Desktop or implement a test client:

```javascript
const CMSMCPServer = require('./src/mcp/index');

// Test initialization
const server = new CMSMCPServer();
console.log('MCP Server initialized with tools:', server.tools.length);
```

### Automated Testing

Create test files in `tests/mcp/`:

```javascript
const handlers = require('../../src/mcp/handlers');

describe('Customer Tools', () => {
  test('cms_get_customers returns customer list', async () => {
    const result = await handlers.cms_get_customers({ limit: 10 });
    expect(result.success).toBe(true);
    expect(result.customers).toBeInstanceOf(Array);
  });

  test('cms_get_customer returns single customer', async () => {
    const result = await handlers.cms_get_customer({ 
      customer_id: 'test-customer-id' 
    });
    expect(result.success).toBe(true);
    expect(result.customer).toBeDefined();
  });
});
```

Run tests:
```bash
npm test tests/mcp/
```

## Development

### Adding New Tools

1. Define tool in appropriate file in `src/mcp/tools/`:

```javascript
module.exports = [
  {
    name: 'cms_my_new_tool',
    description: 'Description of what this tool does',
    inputSchema: {
      type: 'object',
      properties: {
        param1: {
          type: 'string',
          description: 'Parameter description',
        },
      },
      required: ['param1'],
    },
  },
];
```

2. Implement handler in `src/mcp/handlers/index.js`:

```javascript
async function cms_my_new_tool(args) {
  const { param1 } = args;
  
  // Implementation using existing database/services
  const result = await query('SELECT * FROM ...', [param1]);
  
  return {
    success: true,
    data: result.rows,
  };
}

// Add to exports
module.exports = {
  // ... existing exports
  cms_my_new_tool,
};
```

3. Tool will be automatically registered by MCP server

### Code Structure

```
src/mcp/
├── index.js                      # MCP server setup and initialization
├── tools/                        # Tool definitions (schemas)
│   ├── customer-tools.js         # Customer management tools
│   ├── card-tools.js             # Card management tools
│   ├── transaction-tools.js      # Transaction tools
│   ├── alert-tools.js            # Alert tools
│   ├── dispute-tools.js          # Dispute tools
│   └── card-service-tools.js     # Card service tools
├── handlers/                     # Tool implementations
│   └── index.js                  # All tool handlers
└── claude-desktop-config.example.json  # Example config
```

## Production Deployment

### Recommended Setup

1. **Separate MCP Server**: Run MCP server on dedicated infrastructure
2. **Database Replication**: Use read replica for MCP queries
3. **Connection Pooling**: Implement PgBouncer or similar
4. **Monitoring**: Add logging and metrics
5. **Rate Limiting**: Protect against tool abuse
6. **Audit Trail**: Log all MCP tool invocations

### Environment-Specific Configs

```json
// Development
{
  "mcpServers": {
    "cms-admin": {
      "command": "node",
      "args": ["./src/mcp/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/cms_dev",
        "NODE_ENV": "development"
      }
    }
  }
}

// Production
{
  "mcpServers": {
    "cms-admin": {
      "command": "node",
      "args": ["/opt/cms/src/mcp/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://prod-host/cms_prod?sslmode=require",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Support and Resources

### Documentation
- **MCP Specification**: https://modelcontextprotocol.io
- **MCP SDK**: https://github.com/modelcontextprotocol/sdk
- **CMS PRD**: See `MuleSoft_APIKit_Router_PRD_CMS_Demo_API-mcp.md`

### Related Files
- `src/mcp/index.js` - MCP server implementation
- `src/mcp/handlers/index.js` - Tool handlers (business logic)
- `src/mcp/tools/*.js` - Tool definitions (schemas)
- `src/config/database.js` - Database configuration

### Contributing

When adding features to MCP server:

1. Follow existing tool naming convention: `cms_<verb>_<noun>`
2. Reuse existing database queries from handlers
3. Add comprehensive input validation
4. Include error handling with descriptive messages
5. Update this README with new tools
6. Add tests for new functionality

## License

Same license as the CMS Demo project.

---

**End of MCP Server Documentation**

*For questions or issues, refer to the main CMS Demo repository.*

