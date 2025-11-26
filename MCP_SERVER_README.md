# CMS Admin MCP Server

## Overview

The CMS Admin MCP (Model Context Protocol) Server enables AI agents like Claude to interact directly with the Card Management System. This implementation exposes **29 tools** for customer management, card operations, transactions, alerts, disputes, and card services.

**✅ Status:** All 29 tools fully implemented and tested  
**📦 Data Store:** In-memory (50 customers, 68 cards, 947 transactions)  
**🧪 Testing:** HTTP server available on `localhost:3001` with Postman collection  
**📚 Documentation:** Complete implementation summary in `src/mcp/MCP_IMPLEMENTATION_SUMMARY.md`

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
│              In-Memory Data Store                       │
│  • 50 Customers (CUST-001 to CUST-050)                 │
│  • 68 Cards (CARD-001+)                                 │
│  • 947 Transactions (TXN-0001+)                         │
│  • 5 Alerts (ALERT-001 to ALERT-005)                   │
│  • 1 Dispute (DISPUTE-001)                              │
└─────────────────────────────────────────────────────────┘
```

## Installation

### Prerequisites

- Node.js 18+ installed
- No database required (uses in-memory storage)

### Install Dependencies

The MCP SDK is already included in package.json. If you need to install it manually:

```bash
cd cms-demo
npm install @modelcontextprotocol/sdk
```

### Quick Start

```bash
# Start HTTP server for testing (port 3001)
cd cms-demo/src/mcp
node http-server.js

# Or run MCP server directly (stdio mode for Claude)
node index.js
```

## Configuration

### 1. Environment Variables (Optional)

The server uses in-memory storage by default. For HTTP server port configuration:

```env
MCP_HTTP_PORT=3001
NODE_ENV=development
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
        "/Users/hrothstein/cursorrepos/CMS-V2/cms-demo/src/mcp/index.js"
      ],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

3. Replace the path with the actual path to your `cms-demo` directory

4. Restart Claude Desktop

5. Verify connection: Ask Claude "What MCP tools do you have access to?"

## Running the MCP Server

### Standalone Mode (Recommended for Claude Desktop)

Claude Desktop will automatically start the MCP server when needed. No manual startup required.

### HTTP Server for Testing (Recommended)

The easiest way to test the MCP server is via the HTTP wrapper:

```bash
cd /Users/hrothstein/cursorrepos/CMS-V2/cms-demo/src/mcp
node http-server.js
```

Server starts on `http://localhost:3001` with these endpoints:
- `GET /health` - Health check
- `GET /tools` - List all 29 tools
- `POST /tools/:toolName/execute` - Execute a tool
- `POST /tools/batch` - Execute multiple tools

**Use the included Postman collection** (`CMS_MCP_Postman_Collection.json`) to test all tools.

### Manual Testing (stdio mode)

To test the MCP server in stdio mode (as Claude uses it):

```bash
cd /path/to/cms-demo
node src/mcp/index.js
```

The server runs on stdio and communicates via stdin/stdout.

### Integrated with Express Server (Optional)

The MCP server is designed to run separately from the Express REST API. Both can run simultaneously without conflicts.

## Available MCP Tools (29 Total)

**Complete tool list with test data available in the Postman collection.**

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

## Testing with Postman

**Postman Collection:** `src/mcp/CMS_MCP_Postman_Collection.json`

### Import Collection

1. Open Postman
2. Click Import → Upload Files
3. Select `CMS_MCP_Postman_Collection.json`
4. Collection includes 33 requests (29 tools + 4 server endpoints)

### Test Scenarios

**Basic Testing:**
```
1. Health Check → GET /health
2. List Tools → GET /tools
3. Get Customers → POST /tools/cms_get_customers/execute
4. Get Cards → POST /tools/cms_get_cards/execute
```

**Fraud Response Workflow:**
```
1. Get customer transactions
2. Lock suspicious card
3. Create dispute for unauthorized transaction
4. Get alerts for customer
```

**Card Management:**
```
1. Create new card for customer
2. Update card controls (limits, international)
3. Lock/Unlock card
4. Request replacement card
```

## Security Considerations

### Current Implementation (In-Memory)
- ✅ **Demo/Development Safe**: Data resets on server restart
- ✅ **No PII Persistence**: All data is ephemeral
- ✅ **Fast Testing**: No database setup required

### Authentication
- No end-user authentication in MCP layer (handled by AI agent)
- Production deployment should add authentication/authorization

### Data Protection
- Sensitive data (PINs, CVVs) returned for demo purposes
- Production: Implement proper access controls
- Compliance with PCI-DSS, GDPR, CCPA for production

### Production Considerations
```javascript
// For production, replace in-memory storage with:
// - PostgreSQL database
// - Redis for caching
// - Proper authentication/authorization
// - Audit logging
// - Rate limiting
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

### Server Won't Start

**Problem**: "EPERM: operation not permitted" or port in use

**Solution**:
1. Check if port 3001 is already in use: `lsof -i :3001`
2. Kill existing process: `kill -9 <PID>`
3. Or change port in environment: `MCP_HTTP_PORT=3002 node http-server.js`

### Tool Execution Errors

**Problem**: Tools return errors or unexpected results

**Solution**:
1. Check if data exists in in-memory store (server logs on startup)
2. Restart server to reset data to initial state
3. Enable debug logging:
   ```bash
   NODE_ENV=development node src/mcp/index.js
   ```
4. Check tool handler implementation in `src/mcp/handlers/index.js`

### Data Reset

**Problem**: Need to reset test data

**Solution**:
Simply restart the server - all data is regenerated fresh:
```bash
# Kill server (Ctrl+C or kill process)
# Restart
node http-server.js

# New data will be generated:
# ✓ 50 customers
# ✓ 68 cards  
# ✓ 947 transactions
# ✓ 5 alerts
# ✓ 1 dispute
```

## Testing

### HTTP Testing with cURL

Test any tool via HTTP:

```bash
# Health check
curl http://localhost:3001/health

# List all tools
curl http://localhost:3001/tools | jq '.tools[].name'

# Get customers
curl -X POST http://localhost:3001/tools/cms_get_customers/execute \
  -H "Content-Type: application/json" \
  -d '{"limit": 5}'

# Lock a card
curl -X POST http://localhost:3001/tools/cms_lock_card/execute \
  -H "Content-Type: application/json" \
  -d '{"card_id": "CARD-001", "reason": "fraud_suspected"}'

# Get transactions
curl -X POST http://localhost:3001/tools/cms_get_transactions/execute \
  -H "Content-Type: application/json" \
  -d '{"card_id": "CARD-001", "limit": 10}'
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
    expect(result.customers.length).toBeLessThanOrEqual(10);
  });

  test('cms_get_customer returns single customer', async () => {
    const result = await handlers.cms_get_customer({ 
      customer_id: 'CUST-001' 
    });
    expect(result.success).toBe(true);
    expect(result.customers).toBeDefined();
  });
});
```

### Test Data Available

The in-memory store includes:
- **Customers:** CUST-001 through CUST-050
- **Cards:** CARD-001 through CARD-068 (mix of ACTIVE/INACTIVE)
- **Transactions:** TXN-0001+ (10-20 per active card)
- **Alerts:** ALERT-001 through ALERT-005
- **Disputes:** DISPUTE-001

Use these IDs in your tests and Postman requests.

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
  
  // Implementation using in-memory dataStore
  const filtered = dataStore.items.filter(item => 
    item.field === param1
  );
  
  return {
    success: true,
    data: filtered,
    total: filtered.length
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
├── index.js                          # MCP server (stdio mode)
├── http-server.js                    # HTTP wrapper for testing
├── sse-server.js                     # SSE transport (optional)
├── tools/                            # Tool definitions (29 tools)
│   ├── customer-tools.js             # 6 customer tools
│   ├── card-tools.js                 # 8 card tools
│   ├── transaction-tools.js          # 3 transaction tools
│   ├── alert-tools.js                # 4 alert tools
│   ├── dispute-tools.js              # 4 dispute tools
│   └── card-service-tools.js         # 4 card service tools
├── handlers/
│   └── index.js                      # All handlers + in-memory data store
├── CMS_MCP_Postman_Collection.json   # Full test collection
├── MCP_IMPLEMENTATION_SUMMARY.md     # Complete implementation docs
└── claude-desktop-config.example.json
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
// Development (In-Memory)
{
  "mcpServers": {
    "cms-admin": {
      "command": "node",
      "args": ["/Users/hrothstein/cursorrepos/CMS-V2/cms-demo/src/mcp/index.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}

// Production (Replace with database-backed version)
{
  "mcpServers": {
    "cms-admin": {
      "command": "node",
      "args": ["/opt/cms/src/mcp/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://prod-host/cms_prod?sslmode=require",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
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
- `src/mcp/index.js` - MCP server implementation (stdio)
- `src/mcp/http-server.js` - HTTP testing server
- `src/mcp/handlers/index.js` - All 29 tool handlers + in-memory data
- `src/mcp/tools/*.js` - Tool definitions (input schemas)
- `src/mcp/CMS_MCP_Postman_Collection.json` - Complete test collection
- `src/mcp/MCP_IMPLEMENTATION_SUMMARY.md` - Full documentation

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

