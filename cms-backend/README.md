# Card Management System - Backend API

A Node.js/Express backend API for the Card Management System that demonstrates MuleSoft integration capabilities for financial services.

## Features

- **Authentication**: JWT-based authentication with password hashing
- **Card Management**: View, lock/unlock, and control cards
- **Transaction History**: View and filter transaction history
- **Alerts**: Manage alerts and notification preferences
- **Disputes**: Submit and track transaction disputes
- **Card Services**: PIN management, card replacement, activation
- **MuleSoft Integration**: Simulated integration with HBR Core Banking System
- **Security**: Rate limiting, CORS, input validation, audit logging

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up the database:**
   ```bash
   # From the cms-database directory
   cd ../cms-database
   npm install
   npm run setup
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All endpoints (except login) require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Demo Credentials
```
Email: sarah.demo@example.com
Password: Demo123!

Email: john.demo@example.com  
Password: Demo123!

Email: emma.demo@example.com
Password: Demo123!
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout  
- `GET /auth/me` - Get current user info

### Cards
- `GET /cards` - Get all user cards
- `GET /cards/:cardId` - Get specific card details
- `PUT /cards/:cardId/lock` - Lock a card
- `PUT /cards/:cardId/unlock` - Unlock a card
- `PUT /cards/:cardId/controls` - Update card controls
- `POST /cards/:cardId/report-lost` - Report card as lost/stolen

### Transactions
- `GET /cards/:cardId/transactions` - Get transactions for a card
- `GET /transactions/:transactionId` - Get specific transaction details

### Alerts
- `GET /alerts` - Get all user alerts
- `PUT /alerts/:alertId/read` - Mark alert as read
- `PUT /alerts/:alertId/dismiss` - Dismiss alert
- `GET /alerts/preferences` - Get alert preferences
- `PUT /alerts/preferences` - Update alert preferences

### Disputes
- `POST /disputes` - Submit a new dispute
- `GET /disputes` - Get all user disputes
- `GET /disputes/:disputeId` - Get specific dispute details
- `POST /disputes/:disputeId/comments` - Add comment to dispute

### Card Services
- `POST /card-services/view-pin` - View PIN (with re-auth)
- `POST /card-services/change-pin` - Change PIN
- `POST /card-services/request-replacement` - Request card replacement
- `POST /card-services/activate` - Activate new card

## MuleSoft Integration

The backend includes simulated MuleSoft integration points that demonstrate API-led connectivity:

- **Customer Sync**: Fetch and sync customer data with HBR Core Banking
- **Account Sync**: Real-time balance updates from HBR
- **Card Operations**: Lock/unlock and control sync with HBR
- **Transaction Streaming**: Real-time transaction updates
- **Fraud Management**: Dispute submission to HBR fraud system
- **Card Services**: Integration with HBR card production system

All MuleSoft calls are logged to the console for demo purposes.

## Development

### Project Structure
```
src/
├── config/          # Database and app configuration
├── middleware/      # Express middleware (auth, validation, error handling)
├── routes/          # API route handlers
├── services/        # External service integrations (MuleSoft)
└── server.js        # Express app setup and server start
```

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cms_development
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# MuleSoft (Simulated)
MULESOFT_API_URL=http://localhost:8081/api/v1
MULESOFT_API_KEY=your-api-key
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configurable origin restrictions
- **Audit Logging**: All actions logged for compliance
- **Error Handling**: Secure error responses without data leakage

## Testing

The API includes comprehensive test coverage:

```bash
npm test
```

Tests cover:
- Authentication flows
- Card operations
- Transaction queries
- Alert management
- Dispute submission
- Error handling

## Health Check

Check API health:
```bash
curl http://localhost:3000/health
```

## API Documentation

View interactive API documentation:
```
http://localhost:3000/api/v1/docs
```
