# Card Management System (CMS)

A comprehensive demonstration of MuleSoft's API-led connectivity and integration capabilities for financial services. This standalone web application showcases real-world card lifecycle management integrated with the HBR Core Banking System via MuleSoft.

## 🎯 Overview

The Card Management System is a modern, full-stack web application that demonstrates how MuleSoft enables seamless integration between customer-facing applications and core banking systems. It showcases API-led connectivity patterns, real-time data synchronization, and modern user experience design.

## 🏗️ Architecture

```
┌─────────────────────────┐
│  Customer Web Portal    │  ← React/TypeScript Frontend
│   (CMS Frontend)        │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│    CMS Backend API      │  ← Node.js/Express
│  (Card Management)      │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   MuleSoft Layer        │  ← Integration & Orchestration
│  (API-Led Connectivity) │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  HBR Core Banking API   │  ← Existing System
└─────────────────────────┘
```

## ✨ Features

### Customer Features
- **Card Dashboard**: View all cards with real-time status and balances
- **Card Controls**: Lock/unlock cards, set spending limits, configure transaction types
- **Transaction Management**: View history, filter transactions, dispute charges
- **Alerts & Notifications**: Real-time alerts for suspicious activity
- **Dispute Management**: Submit and track transaction disputes
- **Card Services**: PIN management, card replacement, activation

### Technical Features
- **API-Led Connectivity**: 3-layer API architecture (Experience, Process, System)
- **Real-time Integration**: Live data sync with core banking system
- **Security**: JWT authentication, rate limiting, audit logging
- **Responsive Design**: Mobile-first UI that works on all devices
- **MuleSoft Integration**: Simulated integration points for demo purposes
- **🤖 AI Agent Integration**: MCP Server enables Claude and other AI agents to interact with the CMS (30+ tools)

## 🤖 AI Agent Integration (MCP Server)

The CMS includes a **Model Context Protocol (MCP) Server** that enables AI agents like Claude to interact directly with the Card Management System. This provides 30+ tools for customer management, card operations, transactions, alerts, disputes, and card services.

### MCP Features
- **Customer Management**: Create, read, update, delete customers
- **Card Operations**: Lock/unlock cards, update controls, manage lifecycle
- **Transactions**: View and search transaction history
- **Disputes**: Submit and track transaction disputes
- **Alerts**: Manage notifications and preferences
- **Card Services**: PIN management, activation, replacements

### Setup MCP with Claude Desktop

1. Install dependencies (already included):
```bash
npm install @modelcontextprotocol/sdk
```

2. Configure Claude Desktop by editing your config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

3. Add MCP server configuration:
```json
{
  "mcpServers": {
    "cms-admin": {
      "command": "node",
      "args": ["/absolute/path/to/cms-demo/src/mcp/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://username:password@localhost:5432/cms_database"
      }
    }
  }
}
```

4. Restart Claude Desktop

### Using MCP with Claude

Once configured, interact with the CMS through natural language:

```
"Find all customers with active cards"
"Lock card ending in 1234 due to suspected fraud"
"Show recent transactions for customer john.demo@example.com"
"Create a dispute for transaction ID xyz-123"
```

**📖 Full MCP Documentation**: See [MCP_SERVER_README.md](./MCP_SERVER_README.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### 1. Database Setup
```bash
cd cms-database
npm install
npm run setup
```

### 2. Backend Setup
```bash
cd cms-backend
npm install
cp env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd cms-frontend
npm install
cp .env.example .env
# Edit .env with your backend API URL
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/v1/docs

## 🔑 Demo Credentials

```
Email: sarah.demo@example.com
Password: Demo123!

Email: john.demo@example.com
Password: Demo123!

Email: emma.demo@example.com
Password: Demo123!
```

## 📁 Project Structure

```
/
├── cms-backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # MuleSoft integration layer
│   │   └── server.js         # Express app setup
│   ├── package.json
│   └── README.md
│
├── cms-frontend/             # React/TypeScript SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context (Auth)
│   │   ├── services/         # API client services
│   │   └── App.jsx           # Main app component
│   ├── package.json
│   └── README.md
│
├── cms-database/             # Database setup and seed data
│   ├── migrations/           # SQL schema migrations
│   ├── seeds/                # Demo data
│   ├── setup.js              # Database setup script
│   └── package.json
│
└── README.md                 # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user info

### Cards
- `GET /api/v1/cards` - Get all user cards
- `GET /api/v1/cards/:cardId` - Get specific card details
- `PUT /api/v1/cards/:cardId/lock` - Lock a card
- `PUT /api/v1/cards/:cardId/unlock` - Unlock a card
- `PUT /api/v1/cards/:cardId/controls` - Update card controls

### Transactions
- `GET /api/v1/cards/:cardId/transactions` - Get transactions for a card
- `GET /api/v1/transactions/:transactionId` - Get specific transaction details

### Alerts
- `GET /api/v1/alerts` - Get all user alerts
- `PUT /api/v1/alerts/:alertId/read` - Mark alert as read
- `GET /api/v1/alerts/preferences` - Get alert preferences
- `PUT /api/v1/alerts/preferences` - Update alert preferences

### Disputes
- `POST /api/v1/disputes` - Submit a new dispute
- `GET /api/v1/disputes` - Get all user disputes
- `GET /api/v1/disputes/:disputeId` - Get specific dispute details

### Card Services
- `POST /api/v1/card-services/view-pin` - View PIN (with re-auth)
- `POST /api/v1/card-services/change-pin` - Change PIN
- `POST /api/v1/card-services/request-replacement` - Request card replacement

## 🔗 MuleSoft Integration

The system includes simulated MuleSoft integration points that demonstrate API-led connectivity:

### Integration Points
- **Customer Sync**: Fetch and sync customer data with HBR Core Banking
- **Account Sync**: Real-time balance updates from HBR
- **Card Operations**: Lock/unlock and control sync with HBR
- **Transaction Streaming**: Real-time transaction updates
- **Fraud Management**: Dispute submission to HBR fraud system
- **Card Services**: Integration with HBR card production system

### 3-Layer API Architecture
1. **Experience API**: Tailored for CMS UI needs
2. **Process API**: Business logic and workflows
3. **System API**: Direct HBR connectivity

## 🎬 Demo Scenarios

### 1. Card Lock After Suspicious Activity
1. Show transaction list with recent activity
2. Highlight suspicious transaction
3. Alert appears: "Unusual transaction detected"
4. Click alert → View transaction details
5. Click "Lock Card" button
6. Card status changes to "Locked" immediately
7. Show MuleSoft logs: CMS → MuleSoft → HBR

### 2. Setting International Travel Controls
1. Navigate to Card Controls
2. Enable "International Transactions"
3. Add countries to whitelist
4. Set daily limit
5. Save controls
6. Show MuleSoft orchestration

### 3. Dispute a Transaction
1. View transaction list
2. Find incorrect transaction
3. Click "Dispute Transaction"
4. Select dispute type and enter reason
5. Submit dispute
6. Show dispute created with status tracking
7. Show MuleSoft routing to HBR fraud system

## 🛠️ Technology Stack

### Backend
- **Node.js 20** with Express.js
- **PostgreSQL** with connection pooling
- **JWT** authentication
- **Joi** validation
- **Rate limiting** and security middleware

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **Axios** for API calls
- **React Hook Form** for forms
- **Vite** for build tooling

### Integration
- **MuleSoft** Anypoint Platform (simulated)
- **API-led connectivity** patterns
- **Real-time data synchronization**

## 🔐 Security Features

- **JWT Authentication** with short-lived tokens
- **Password Hashing** with bcrypt
- **Rate Limiting** (100 requests per 15 minutes)
- **Input Validation** with Joi schemas
- **CORS Protection** with configurable origins
- **Audit Logging** for all actions
- **Error Handling** without data leakage

## 📊 Database Schema

The system uses PostgreSQL with the following key tables:
- `customers` - Customer information
- `cards` - Card details and status
- `card_controls` - Card control settings
- `transactions` - Transaction history
- `alerts` - Alert notifications
- `disputes` - Dispute management
- `audit_log` - Security audit trail

## 🚀 Deployment

### Development
```bash
# Start all services
npm run dev:all
```

### Production
```bash
# Build frontend
cd cms-frontend && npm run build

# Start backend
cd cms-backend && npm start
```

### Docker (Optional)
```bash
docker-compose up -d
```

## 📈 Success Metrics

### Technical Metrics
- API response time: <200ms (95th percentile)
- Uptime: 99.9%
- Transaction sync latency: <2 seconds
- Zero data loss

### Demo Effectiveness
- Clearly showcases MuleSoft API-led connectivity
- Demonstrates 3-layer API architecture
- Shows real-time data synchronization
- Highlights security features
- Proves integration between modern and legacy systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or support, please contact the development team or refer to the individual README files in each component directory.

---

**Built with ❤️ to demonstrate MuleSoft's integration capabilities for Financial Services**