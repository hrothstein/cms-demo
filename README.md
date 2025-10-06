# Card Management System (CMS)

A comprehensive demo Card Management System built with Node.js, React, and PostgreSQL. This system demonstrates modern card lifecycle management for financial services and provides REST APIs that MuleSoft can integrate with to showcase API-led connectivity patterns.

## 🚀 Features

### Core Functionality
- **Card Management**: View, lock/unlock, and control debit/credit cards
- **Transaction History**: Comprehensive transaction tracking with search and filters
- **Fraud Management**: Dispute filing and fraud reporting capabilities
- **Alerts & Notifications**: Real-time security alerts and customizable notifications
- **User Settings**: Profile management and notification preferences

### Technical Features
- **RESTful APIs**: Complete API suite with Swagger documentation
- **JWT Authentication**: Secure token-based authentication
- **Database Integration**: PostgreSQL with proper schema and relationships
- **Responsive UI**: Modern React frontend with Tailwind CSS
- **Docker Support**: Easy deployment with Docker Compose
- **Demo Data**: Realistic seed data for testing and demonstration

## 🏗️ Architecture

```
Customer Web UI (React)
       ↓
CMS Backend (Node.js/Express)
       ↓
CMS Database (PostgreSQL)
       ↓
REST APIs (exposed to MuleSoft)
       ↓
[MuleSoft Integration Layer]
       ↓
HBR Core Banking System APIs
```

## 🛠️ Technology Stack

### Backend
- **Node.js** (v18+) - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** (v14+) - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Swagger** - API documentation

### Frontend
- **React** (v18+) - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **React Query** - Data fetching/caching
- **Zustand** - State management

### Development
- **Docker & Docker Compose** - Containerization
- **ESLint + Prettier** - Code formatting
- **Jest + Supertest** - Testing

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CMS
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs
   - Database: localhost:5432

### Option 2: Manual Setup

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd CMS
   ```

2. **Install dependencies**
   ```bash
   # Backend
   npm install

   # Frontend
   cd frontend
   npm install
   cd ..
   ```

3. **Setup database**
   ```bash
   # Start PostgreSQL (using Docker)
   docker run --name cms-postgres -e POSTGRES_DB=cms_db -e POSTGRES_USER=cms_user -e POSTGRES_PASSWORD=cms_password -p 5432:5432 -d postgres:14

   # Run migrations and seed data
   psql -h localhost -U cms_user -d cms_db -f database/schema.sql
   psql -h localhost -U cms_user -d cms_db -f database/seeds/seed_data.sql
   ```

4. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Start the application**
   ```bash
   # Terminal 1 - Backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 🔐 Demo Credentials

| Username | Password | Description |
|----------|----------|-------------|
| john.doe | demo123 | Customer with 2 cards |
| jane.smith | demo123 | Customer with fraud alert |
| bob.johnson | demo123 | Customer with locked card |

## 📚 API Documentation

Once the application is running, visit http://localhost:3000/api-docs for interactive API documentation.

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login

#### Cards
- `GET /api/v1/cards` - Get all cards for customer
- `GET /api/v1/cards/:cardId` - Get specific card details
- `POST /api/v1/cards/:cardId/lock` - Lock a card
- `POST /api/v1/cards/:cardId/unlock` - Unlock a card
- `GET /api/v1/cards/:cardId/controls` - Get card controls
- `PUT /api/v1/cards/:cardId/controls` - Update card controls

#### Transactions
- `GET /api/v1/transactions` - Get transaction history
- `GET /api/v1/transactions/:transactionId` - Get transaction details
- `GET /api/v1/transactions/search` - Search transactions

#### Fraud & Disputes
- `GET /api/v1/fraud/disputes` - Get all disputes
- `POST /api/v1/fraud/disputes` - File a new dispute
- `POST /api/v1/fraud/report-fraud` - Report suspected fraud

#### Notifications
- `GET /api/v1/notifications/alerts` - Get alerts
- `PUT /api/v1/notifications/alerts/:alertId/read` - Mark alert as read
- `GET /api/v1/notifications/preferences` - Get notification preferences
- `PUT /api/v1/notifications/preferences` - Update preferences

## 🎯 Demo Scenarios

### Scenario 1: Lock Card While Traveling
1. Login as john.doe
2. Navigate to Cards page
3. Click on a card to view details
4. Click "Lock Card" button
5. Card status changes to LOCKED

### Scenario 2: View Recent Transactions
1. Login as jane.smith
2. Navigate to Transactions page
3. View list of recent transactions
4. Use filters to search by category or date
5. Click on a transaction for details

### Scenario 3: Set Spending Limit
1. Login as john.doe
2. Go to card details page
3. Click "Update Controls"
4. Set daily limit to $500
5. Save changes

### Scenario 4: Report Fraud
1. Login as jane.smith
2. Navigate to Transactions page
3. Find the suspicious $845 transaction
4. Click "File Dispute"
5. Fill out dispute form

### Scenario 5: View Alerts
1. Login as any user
2. Navigate to Alerts page
3. View security alerts
4. Mark alerts as read

## 🗄️ Database Schema

The system uses PostgreSQL with the following main tables:

- **users** - User authentication and profiles
- **cards** - Card information and status
- **card_controls** - Card spending limits and restrictions
- **transactions** - Transaction history and details
- **alerts** - Security alerts and notifications
- **disputes** - Fraud disputes and cases
- **notification_preferences** - User notification settings

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cms_db
DB_USER=cms_user
DB_PASSWORD=cms_password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=1h

# Encryption Configuration
ENCRYPTION_KEY=your-32-char-encryption-key-here
```

### Frontend Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🧪 Testing

### Backend Tests
```bash
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Remove volumes (reset database)
docker-compose down -v
```

## 📁 Project Structure

```
CMS/
├── backend/
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Auth, validation
│   │   ├── services/       # External integrations
│   │   ├── utils/          # Helper functions
│   │   └── config/         # Configuration
│   ├── tests/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   ├── stores/         # State management
│   │   ├── utils/          # Utilities
│   │   └── App.jsx
│   ├── package.json
│   └── index.html
├── database/
│   ├── migrations/         # DB migrations
│   ├── seeds/             # Demo data
│   └── schema.sql         # DB schema
├── docker-compose.yml     # Local development
└── README.md
```

## 🤝 MuleSoft Integration

This CMS is designed to integrate with MuleSoft for API-led connectivity demonstrations. The system provides:

- **RESTful APIs** for all card management operations
- **JWT Authentication** for secure API access
- **Comprehensive Error Handling** with standardized error responses
- **Swagger Documentation** for easy API discovery
- **Demo Data** for realistic testing scenarios

### Integration Points

MuleSoft can integrate with the CMS through:

1. **Authentication Flow**: Validate user credentials and obtain JWT tokens
2. **Card Operations**: Fetch card data, update controls, lock/unlock cards
3. **Transaction Processing**: Retrieve transaction history and details
4. **Fraud Management**: Handle disputes and fraud reports
5. **Notification Management**: Send alerts and manage preferences

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists and migrations are run

2. **Frontend Not Loading**
   - Check if backend is running on port 3000
   - Verify `VITE_API_URL` in frontend `.env`
   - Check browser console for errors

3. **Authentication Issues**
   - Verify JWT_SECRET is set in `.env`
   - Check if demo users exist in database
   - Clear browser localStorage and try again

4. **Docker Issues**
   - Run `docker-compose down -v` to reset
   - Check logs with `docker-compose logs`
   - Ensure ports 3000, 5173, and 5432 are available

### Getting Help

1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Test API endpoints directly: http://localhost:3000/health
4. Check browser developer tools for frontend errors

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for MuleSoft integration demonstrations
- Inspired by modern banking applications
- Uses industry-standard security practices
- Designed for educational and demo purposes

---

**Note**: This is a DEMO system. It uses simulated data and should NOT be used with real card numbers or customer information. All card numbers are mock data for demonstration purposes only.