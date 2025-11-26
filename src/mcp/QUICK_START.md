# CMS MCP Server - Quick Start Guide

## 🚀 Start the Server

```bash
cd /Users/hrothstein/cursorrepos/CMS-V2/cms-demo/src/mcp
node http-server.js
```

✅ Server running on: `http://localhost:3001`  
✅ Tools available: **29**  
✅ Test data: 50 customers, 68 cards, 947 transactions

---

## 🧪 Test with Postman

1. **Import Collection:** `CMS_MCP_Postman_Collection.json`
2. **Run Tests:** 33 pre-built requests organized by category
3. **Key Endpoints:**
   - Health: `GET /health`
   - List Tools: `GET /tools`
   - Execute: `POST /tools/:toolName/execute`

---

## 🤖 Connect to Claude Desktop

1. **Edit config:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cms-admin": {
      "command": "node",
      "args": ["/Users/hrothstein/cursorrepos/CMS-V2/cms-demo/src/mcp/index.js"],
      "env": { "NODE_ENV": "development" }
    }
  }
}
```

2. **Restart Claude Desktop**
3. **Test:** Ask Claude "What MCP tools do you have access to?"

---

## 📊 Available Tools (29)

- **Customer (6):** Get, Create, Update, Delete, Search
- **Card (8):** Get, Create, Update, Delete, Lock, Unlock, Controls
- **Transaction (3):** Get, Get by ID, Search
- **Alert (4):** Get, Mark Read, Get/Update Preferences
- **Dispute (4):** Create, Get, Get by ID, Update
- **Card Services (4):** View PIN, Change PIN, Replace, Activate

---

## 💡 Quick Test Commands

```bash
# Health check
curl http://localhost:3001/health

# List all tools
curl http://localhost:3001/tools | jq '.totalTools'

# Get customers
curl -X POST http://localhost:3001/tools/cms_get_customers/execute \
  -H "Content-Type: application/json" \
  -d '{"limit": 5}' | jq

# Lock a card
curl -X POST http://localhost:3001/tools/cms_lock_card/execute \
  -H "Content-Type: application/json" \
  -d '{"card_id": "CARD-001", "reason": "fraud_suspected"}' | jq
```

---

## 📚 Documentation

- **Full Details:** `MCP_IMPLEMENTATION_SUMMARY.md`
- **Setup Guide:** `../../../MCP_SERVER_README.md`
- **PRD Reference:** Section 17 in `MuleSoft_APIKit_Router_PRD_CMS_Demo_API-mcp.md`

---

## 🎯 Test Data IDs

- **Customers:** CUST-001 to CUST-050
- **Cards:** CARD-001 to CARD-068
- **Transactions:** TXN-0001+
- **Alerts:** ALERT-001 to ALERT-005
- **Disputes:** DISPUTE-001

---

**Status:** ✅ Complete | **Version:** 1.0.0 | **Date:** Nov 26, 2025

