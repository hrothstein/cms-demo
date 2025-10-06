# Card Management System - Product Requirements Document

**Version:** 2.0 (Standalone)  
**Date:** October 6, 2025  
**Author:** Product Management  
**Target:** MuleSoft Integration Demo  
**Architecture:** Standalone Web App + REST APIs

---

## Executive Summary

A standalone Card Management System (CMS) web application that demonstrates modern card lifecycle management for financial services. This is a **DEMO system** similar to the HBR Core Banking demo - it provides REST APIs that MuleSoft can integrate with to showcase API-led connectivity patterns.

### System Architecture

This CMS is a standalone web application with its own database, backend APIs, and customer-facing UI. MuleSoft sits between this CMS and the HBR Core Banking System to orchestrate data flows.

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

---

## Table of Contents

1. [Goals & Objectives](#goals--objectives)
2. [System Overview](#system-overview)
3. [Core Features (MVP Scope)](#core-features-mvp-scope)
4. [Technical Architecture](#technical-architecture)
5. [Database Schema](#database-schema)
6. [REST API Specifications](#rest-api-specifications)
7. [Frontend/UI Requirements](#frontendui-requirements)
8. [Integration Points (for MuleSoft)](#integration-points-for-mulesoft)
9. [Security & Authentication](#security--authentication)
10. [Implementation Plan](#implementation-plan)
11. [Demo Data & Scenarios](#demo-data--scenarios)
12. [Technical Stack](#technical-stack)
13. [Cursor Build Prompt](#cursor-build-prompt)

---

## Goals & Objectives

### Primary Goal

Build a standalone demo Card Management System that MuleSoft can integrate with to demonstrate API-led connectivity patterns in financial services.

### Key Requirements

- Standalone web application (like HBR Core Banking demo)
- Own database and backend APIs
- Customer-facing web interface for card management
- REST APIs that MuleSoft can call for integration
- Demo-ready with seed data
- Simple, clear architecture for showcasing integration patterns

---

## System Overview

### What This System Does

The Card Management System is a web application that allows bank customers to manage their debit and credit cards. Customers can view cards, lock/unlock them, set spending limits, view transactions, and report fraud.

### System Components

- **Backend API Server:** Node.js/Express with REST endpoints
- **Database:** PostgreSQL with cards, transactions, alerts tables
- **Frontend:** React web application with responsive UI
- **Authentication:** JWT-based auth with session management
- **Integration APIs:** Exposed endpoints for MuleSoft to call

### Integration with HBR Core Banking

MuleSoft orchestrates data between CMS and HBR Core Banking. For example, when a customer views their card dashboard, MuleSoft fetches customer data from HBR and card data from CMS, then combines them for display.

---

## Core Features (MVP Scope)

### Card Dashboard
- View all cards linked to customer
- Card details: last 4 digits, type, status, expiry
- Visual card display
- Quick lock/unlock actions

### Card Controls
- Lock/Unlock card instantly
- Set daily spending limits
- Set per-transaction limits
- Enable/disable contactless payments
- Enable/disable international transactions
- Enable/disable online purchases

### Transaction History
- View recent transactions (30 days)
- Transaction details: merchant, amount, date, location
- Search and filter transactions
- Auto-categorization (dining, shopping, gas, etc.)

### Fraud & Disputes
- Report suspicious transactions
- Lock card immediately if fraud detected
- File dispute on transaction
- Track dispute status

### Alerts & Notifications
- Transaction alerts (configurable)
- Large transaction warnings
- Card status change notifications
- Fraud alerts

### Card Lifecycle
- Request new card
- Report lost/stolen card
- Request replacement card
- Activate new card
- Close card permanently

---

## Technical Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React + Vite | Customer web interface |
| UI Framework | Tailwind CSS | Modern, responsive styling |
| Backend | Node.js + Express | REST API server |
| Database | PostgreSQL | Data persistence |
| Authentication | JWT + bcrypt | Secure auth |
| API Docs | Swagger/OpenAPI | API documentation |
| Testing | Jest + Supertest | Unit & integration tests |

### Project Structure

```
cms-webapp/
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
│   │   ├── hooks/          # Custom hooks
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

---

## Database Schema

### cards Table

```sql
CREATE TABLE cards (
    card_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    card_number_encrypted TEXT NOT NULL,
    card_last_four VARCHAR(4) NOT NULL,
    card_type VARCHAR(20) NOT NULL,  -- DEBIT, CREDIT, PREPAID
    card_brand VARCHAR(20) NOT NULL, -- VISA, MASTERCARD, AMEX
    card_status VARCHAR(20) NOT NULL, -- ACTIVE, LOCKED, CLOSED, EXPIRED
    card_sub_status VARCHAR(20),     -- LOST, STOLEN, DAMAGED, FRAUD
    cardholder_name VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    activation_date TIMESTAMP,
    cvv_encrypted TEXT NOT NULL,
    pin_hash TEXT,
    credit_limit DECIMAL(12,2),
    available_credit DECIMAL(12,2),
    is_primary BOOLEAN DEFAULT false,
    card_format VARCHAR(20) DEFAULT 'PHYSICAL', -- PHYSICAL, VIRTUAL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cards_customer ON cards(customer_id);
CREATE INDEX idx_cards_status ON cards(card_status);
CREATE INDEX idx_cards_account ON cards(account_number);
```

### card_controls Table

```sql
CREATE TABLE card_controls (
    control_id SERIAL PRIMARY KEY,
    card_id VARCHAR(50) NOT NULL REFERENCES cards(card_id) ON DELETE CASCADE,
    daily_limit DECIMAL(12,2),
    per_transaction_limit DECIMAL(12,2),
    atm_daily_limit DECIMAL(12,2),
    contactless_enabled BOOLEAN DEFAULT true,
    online_enabled BOOLEAN DEFAULT true,
    international_enabled BOOLEAN DEFAULT false,
    atm_enabled BOOLEAN DEFAULT true,
    magnetic_stripe_enabled BOOLEAN DEFAULT true,
    allowed_countries TEXT[],
    blocked_merchant_categories TEXT[],
    alert_threshold DECIMAL(12,2),
    velocity_limit_enabled BOOLEAN DEFAULT false,
    max_transactions_per_hour INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(card_id)
);
```

### transactions Table

```sql
CREATE TABLE transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    card_id VARCHAR(50) NOT NULL REFERENCES cards(card_id),
    customer_id VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    post_date DATE,
    merchant_name VARCHAR(200) NOT NULL,
    merchant_id VARCHAR(100),
    merchant_category VARCHAR(50),
    merchant_category_code VARCHAR(4),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    original_amount DECIMAL(12,2),
    original_currency VARCHAR(3),
    transaction_type VARCHAR(30) NOT NULL, -- PURCHASE, REFUND, ATM_WITHDRAWAL
    transaction_method VARCHAR(30),        -- CHIP, CONTACTLESS, ONLINE, ATM
    status VARCHAR(20) NOT NULL,          -- APPROVED, DECLINED, PENDING, DISPUTED
    decline_reason VARCHAR(100),
    authorization_code VARCHAR(50),
    location_city VARCHAR(100),
    location_state VARCHAR(50),
    location_country VARCHAR(50),
    location_lat DECIMAL(10,7),
    location_lng DECIMAL(10,7),
    is_international BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    fraud_score DECIMAL(3,2),
    fraud_flag BOOLEAN DEFAULT false,
    is_disputed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_txn_card ON transactions(card_id);
CREATE INDEX idx_txn_customer ON transactions(customer_id);
CREATE INDEX idx_txn_date ON transactions(transaction_date DESC);
CREATE INDEX idx_txn_status ON transactions(status);
CREATE INDEX idx_txn_merchant_category ON transactions(merchant_category);
```

### alerts Table

```sql
CREATE TABLE alerts (
    alert_id SERIAL PRIMARY KEY,
    card_id VARCHAR(50) NOT NULL REFERENCES cards(card_id),
    customer_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,     -- LOW, MEDIUM, HIGH, CRITICAL
    alert_date TIMESTAMP NOT NULL,
    alert_title VARCHAR(200) NOT NULL,
    alert_message TEXT NOT NULL,
    related_transaction_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'NEW', -- NEW, READ, ACKNOWLEDGED, RESOLVED
    read_date TIMESTAMP,
    action_required BOOLEAN DEFAULT false,
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_card ON alerts(card_id);
CREATE INDEX idx_alerts_customer ON alerts(customer_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_date ON alerts(alert_date DESC);
```

### disputes Table

```sql
CREATE TABLE disputes (
    dispute_id VARCHAR(50) PRIMARY KEY,
    card_id VARCHAR(50) NOT NULL REFERENCES cards(card_id),
    transaction_id VARCHAR(50) NOT NULL REFERENCES transactions(transaction_id),
    customer_id VARCHAR(50) NOT NULL,
    dispute_date DATE NOT NULL,
    dispute_reason VARCHAR(50) NOT NULL,
    dispute_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL,          -- SUBMITTED, UNDER_REVIEW, RESOLVED, DENIED
    customer_description TEXT,
    resolution_date DATE,
    resolution_notes TEXT,
    refund_amount DECIMAL(12,2),
    case_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disputes_card ON disputes(card_id);
CREATE INDEX idx_disputes_customer ON disputes(customer_id);
CREATE INDEX idx_disputes_status ON disputes(status);
```

### card_requests Table

```sql
CREATE TABLE card_requests (
    request_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    request_type VARCHAR(30) NOT NULL, -- NEW, REPLACEMENT, UPGRADE
    card_type VARCHAR(20) NOT NULL,
    card_tier VARCHAR(20),
    reason VARCHAR(50),
    original_card_id VARCHAR(50),
    new_card_id VARCHAR(50),
    status VARCHAR(30) NOT NULL,      -- PENDING, APPROVED, DENIED, ISSUED
    request_date TIMESTAMP NOT NULL,
    approval_date DATE,
    denial_reason TEXT,
    shipping_address JSONB,
    expedited_shipping BOOLEAN DEFAULT false,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_requests_customer ON card_requests(customer_id);
CREATE INDEX idx_requests_status ON card_requests(status);
```

### notification_preferences Table

```sql
CREATE TABLE notification_preferences (
    preference_id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    email_address VARCHAR(255),
    sms_enabled BOOLEAN DEFAULT true,
    sms_number VARCHAR(20),
    push_enabled BOOLEAN DEFAULT true,
    transaction_alerts BOOLEAN DEFAULT false,
    large_transaction_threshold DECIMAL(12,2),
    fraud_alerts BOOLEAN DEFAULT true,
    card_status_alerts BOOLEAN DEFAULT true,
    payment_due_alerts BOOLEAN DEFAULT true,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### users Table (for authentication)

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_customer ON users(customer_id);
```

---

## REST API Specifications

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

All protected endpoints require JWT Bearer token in Authorization header.

#### POST /api/v1/auth/login

**Request:**
```json
{
  "username": "john.doe",
  "password": "demo123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "customerId": "CUST-12345",
    "username": "john.doe",
    "expiresIn": 3600
  }
}
```

---

### Card Endpoints

#### GET /api/v1/cards

Get all cards for authenticated customer.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "cardId": "CRD-0001",
      "customerId": "CUST-12345",
      "accountNumber": "ACC-789456123",
      "cardNumber": "************4532",
      "cardType": "DEBIT",
      "cardBrand": "VISA",
      "cardStatus": "ACTIVE",
      "cardSubStatus": null,
      "cardholderName": "JOHN DOE",
      "issueDate": "2024-01-15",
      "expiryDate": "2028-01-31",
      "isPrimary": true,
      "cardFormat": "PHYSICAL",
      "controls": {
        "dailyLimit": 1000.00,
        "perTransactionLimit": 500.00,
        "contactlessEnabled": true,
        "onlineEnabled": true,
        "internationalEnabled": false
      }
    }
  ],
  "count": 2
}
```

#### GET /api/v1/cards/:cardId

Get specific card details.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "cardId": "CRD-0001",
    "customerId": "CUST-12345",
    "accountNumber": "ACC-789456123",
    "cardNumber": "************4532",
    "cardType": "DEBIT",
    "cardBrand": "VISA",
    "cardStatus": "ACTIVE",
    "cardholderName": "JOHN DOE",
    "expiryDate": "2028-01-31",
    "isPrimary": true,
    "controls": {
      "dailyLimit": 1000.00,
      "perTransactionLimit": 500.00,
      "atmDailyLimit": 300.00,
      "contactlessEnabled": true,
      "onlineEnabled": true,
      "internationalEnabled": false,
      "atmEnabled": true,
      "allowedCountries": ["US", "CA"],
      "alertThreshold": 200.00
    }
  }
}
```

#### POST /api/v1/cards/:cardId/lock

Lock a card.

**Request:**
```json
{
  "reason": "CUSTOMER_REQUEST",
  "notes": "Traveling, securing card temporarily"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Card locked successfully",
  "data": {
    "cardId": "CRD-0001",
    "previousStatus": "ACTIVE",
    "newStatus": "LOCKED",
    "timestamp": "2025-10-06T10:35:12Z"
  }
}
```

#### POST /api/v1/cards/:cardId/unlock

Unlock a card.

**Request:**
```json
{
  "notes": "Back from travel"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Card unlocked successfully",
  "data": {
    "cardId": "CRD-0001",
    "previousStatus": "LOCKED",
    "newStatus": "ACTIVE",
    "timestamp": "2025-10-06T14:22:33Z"
  }
}
```

#### GET /api/v1/cards/:cardId/controls

Get card control settings.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "cardId": "CRD-0001",
    "dailyLimit": 1000.00,
    "perTransactionLimit": 500.00,
    "atmDailyLimit": 300.00,
    "contactlessEnabled": true,
    "onlineEnabled": true,
    "internationalEnabled": false,
    "atmEnabled": true,
    "magneticStripeEnabled": true,
    "allowedCountries": ["US", "CA"],
    "blockedMerchantCategories": [],
    "alertThreshold": 200.00,
    "velocityLimitEnabled": false,
    "maxTransactionsPerHour": null,
    "updatedAt": "2025-10-01T09:15:00Z"
  }
}
```

#### PUT /api/v1/cards/:cardId/controls

Update card control settings.

**Request:**
```json
{
  "dailyLimit": 1500.00,
  "perTransactionLimit": 750.00,
  "internationalEnabled": true,
  "alertThreshold": 250.00
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Card controls updated successfully",
  "data": {
    "cardId": "CRD-0001",
    "updatedFields": ["dailyLimit", "perTransactionLimit", "internationalEnabled", "alertThreshold"],
    "timestamp": "2025-10-06T10:30:45Z"
  }
}
```

#### POST /api/v1/cards/request

Request a new card.

**Request:**
```json
{
  "customerId": "CUST-12345",
  "accountNumber": "ACC-789456123",
  "cardType": "CREDIT",
  "cardTier": "GOLD",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "expeditedShipping": false
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Card request submitted successfully",
  "data": {
    "requestId": "REQ-0089",
    "status": "PENDING",
    "estimatedDeliveryDate": "2025-10-14"
  }
}
```

#### POST /api/v1/cards/:cardId/replace

Request card replacement.

**Request:**
```json
{
  "reason": "LOST",
  "notes": "Lost card during travel",
  "expeditedShipping": true
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Replacement card requested",
  "data": {
    "requestId": "REQ-0090",
    "originalCardId": "CRD-0001",
    "newCardId": "CRD-0112",
    "originalCardStatus": "LOCKED",
    "estimatedDeliveryDate": "2025-10-09"
  }
}
```

---

### Transaction Endpoints

#### GET /api/v1/cards/:cardId/transactions

Get transaction history for a card.

**Query Parameters:**
- `limit` (optional): Number of records (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `category` (optional): Filter by merchant category
- `status` (optional): Filter by status

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "transactionId": "TXN-20251005-789456",
      "cardId": "CRD-0001",
      "transactionDate": "2025-10-05T18:45:22Z",
      "postDate": "2025-10-06",
      "merchant": {
        "name": "Starbucks Coffee #2547",
        "merchantId": "MER-STB-2547",
        "category": "DINING",
        "categoryCode": "5812"
      },
      "amount": 5.75,
      "currency": "USD",
      "status": "APPROVED",
      "transactionType": "PURCHASE",
      "transactionMethod": "CONTACTLESS",
      "location": {
        "city": "New York",
        "state": "NY",
        "country": "US"
      },
      "isInternational": false,
      "isOnline": false,
      "fraudScore": 0.05,
      "fraudFlag": false,
      "isDisputed": false
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "summary": {
    "totalAmount": 1245.89,
    "transactionCount": 42,
    "averageAmount": 29.66
  }
}
```

#### GET /api/v1/transactions/:transactionId

Get detailed transaction information.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transactionId": "TXN-20251005-789456",
    "cardId": "CRD-0001",
    "customerId": "CUST-12345",
    "transactionDate": "2025-10-05T18:45:22Z",
    "postDate": "2025-10-06",
    "merchant": {
      "name": "Starbucks Coffee #2547",
      "merchantId": "MER-STB-2547",
      "category": "DINING",
      "categoryCode": "5812"
    },
    "amount": 5.75,
    "currency": "USD",
    "status": "APPROVED",
    "transactionType": "PURCHASE",
    "transactionMethod": "CONTACTLESS",
    "authorizationCode": "AUTH-547821",
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "US",
      "coordinates": {
        "lat": 40.7580,
        "lng": -73.9855
      }
    },
    "fraudAnalysis": {
      "score": 0.05,
      "flag": false,
      "riskLevel": "LOW"
    },
    "isDisputed": false
  }
}
```

#### GET /api/v1/transactions/search

Search transactions with advanced filters.

**Query Parameters:**
- `query`: Search term (merchant name, amount, etc.)
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `minAmount`: Minimum amount
- `maxAmount`: Maximum amount
- `category`: Merchant category
- `status`: Transaction status

---

### Dispute Endpoints

#### POST /api/v1/transactions/:transactionId/dispute

File a dispute for a transaction.

**Request:**
```json
{
  "reason": "UNAUTHORIZED_TRANSACTION",
  "description": "I did not make this transaction. My card was in my possession at the time.",
  "disputeAmount": 156.99
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Dispute submitted successfully",
  "data": {
    "disputeId": "DSP-0042",
    "transactionId": "TXN-20251004-456789",
    "status": "SUBMITTED",
    "caseNumber": "CASE-20251006-001",
    "disputeDate": "2025-10-06",
    "expectedResolutionDate": "2025-11-05"
  }
}
```

#### GET /api/v1/disputes/:disputeId

Get dispute details.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "disputeId": "DSP-0042",
    "transactionId": "TXN-20251004-456789",
    "cardId": "CRD-0001",
    "customerId": "CUST-12345",
    "caseNumber": "CASE-20251006-001",
    "status": "UNDER_REVIEW",
    "disputeReason": "UNAUTHORIZED_TRANSACTION",
    "description": "I did not make this transaction",
    "disputeAmount": 156.99,
    "disputeDate": "2025-10-06",
    "expectedResolutionDate": "2025-11-05"
  }
}
```

#### GET /api/v1/disputes

Get all disputes for customer.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "disputeId": "DSP-0042",
      "transactionId": "TXN-20251004-456789",
      "status": "UNDER_REVIEW",
      "disputeAmount": 156.99,
      "disputeDate": "2025-10-06"
    }
  ],
  "count": 1
}
```

---

### Alert Endpoints

#### GET /api/v1/alerts

Get alerts for customer.

**Query Parameters:**
- `status` (optional): Filter by status (NEW, READ, RESOLVED)
- `severity` (optional): Filter by severity
- `limit` (optional): Number of records
- `offset` (optional): Pagination offset

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "alertId": 125,
      "cardId": "CRD-0001",
      "alertType": "FRAUD_ALERT",
      "severity": "HIGH",
      "alertDate": "2025-10-05T22:15:30Z",
      "alertTitle": "Unusual Transaction Detected",
      "alertMessage": "A transaction of $845.00 at Electronics Store was flagged as unusual",
      "relatedTransactionId": "TXN-20251005-998877",
      "status": "NEW",
      "actionRequired": true
    }
  ],
  "count": 5,
  "summary": {
    "unreadCount": 3,
    "actionRequiredCount": 1
  }
}
```

#### PUT /api/v1/alerts/:alertId/read

Mark alert as read.

**Response 200:**
```json
{
  "success": true,
  "message": "Alert marked as read",
  "data": {
    "alertId": 125,
    "status": "READ",
    "readDate": "2025-10-06T10:00:00Z"
  }
}
```

---

### Notification Preferences Endpoints

#### GET /api/v1/notifications/preferences

Get notification preferences for customer.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "customerId": "CUST-12345",
    "emailEnabled": true,
    "emailAddress": "john.doe@example.com",
    "smsEnabled": true,
    "smsNumber": "+1-212-555-0123",
    "pushEnabled": true,
    "transactionAlerts": false,
    "largeTransactionThreshold": 200.00,
    "fraudAlerts": true,
    "cardStatusAlerts": true,
    "paymentDueAlerts": true,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00"
  }
}
```

#### PUT /api/v1/notifications/preferences

Update notification preferences.

**Request:**
```json
{
  "transactionAlerts": true,
  "largeTransactionThreshold": 250.00,
  "quietHoursStart": "23:00",
  "quietHoursEnd": "07:00"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Notification preferences updated",
  "data": {
    "updatedFields": ["transactionAlerts", "largeTransactionThreshold", "quietHoursStart", "quietHoursEnd"]
  }
}
```

---

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "CARD_NOT_FOUND",
    "message": "The requested card could not be found",
    "details": "Card with ID CRD-9999 does not exist",
    "timestamp": "2025-10-06T15:30:45Z"
  }
}
```

**Common Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `CARD_NOT_FOUND` | 404 | Card does not exist |
| `TRANSACTION_NOT_FOUND` | 404 | Transaction does not exist |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `CARD_ALREADY_LOCKED` | 409 | Card is already locked |
| `INSUFFICIENT_FUNDS` | 402 | Insufficient balance |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Frontend/UI Requirements

### Technology: React + Tailwind CSS

Modern, responsive web interface built with React and styled with Tailwind CSS for a clean, professional banking experience.

### Key Pages/Routes

| Route | Description |
|-------|-------------|
| `/login` | Login page with username/password |
| `/dashboard` | Main dashboard with card carousel |
| `/cards` | List all cards |
| `/cards/:id` | Card detail view with controls |
| `/transactions` | Transaction history |
| `/transactions/:id` | Transaction detail view |
| `/alerts` | Alerts and notifications |
| `/settings` | Account and notification settings |
| `/help` | Help and support |

### Key Components

- **CardDisplay:** Visual card representation with details
- **TransactionList:** Paginated transaction list with filters
- **CardControls:** Toggle switches and sliders for limits
- **AlertBanner:** Notification banners for important alerts
- **LockButton:** Quick action button to lock/unlock cards
- **DisputeForm:** Modal form to file transaction disputes
- **StatsSummary:** Spending statistics and charts

### Design Requirements

- Mobile-responsive (works on phone, tablet, desktop)
- Clean, modern banking aesthetic
- Accessible (WCAG 2.1 AA compliant)
- Fast page loads (< 2 seconds)
- Real-time updates where appropriate
- Clear error messages and loading states

---

## Integration Points (for MuleSoft)

### How MuleSoft Integrates

MuleSoft acts as the integration layer between the CMS and HBR Core Banking System. It orchestrates data flows and combines information from both systems.

### Integration Scenarios

**Customer Login:**  
MuleSoft authenticates user against HBR Core Banking, then provides CMS access token

**View Dashboard:**  
MuleSoft fetches customer data from HBR and card data from CMS, combines and returns

**View Transactions:**  
MuleSoft gets transactions from CMS and enriches with account balance from HBR

**Lock Card:**  
Frontend calls MuleSoft → MuleSoft calls CMS lock API → MuleSoft notifies HBR

**Request New Card:**  
MuleSoft validates customer eligibility in HBR, then creates card request in CMS

### CMS APIs Exposed to MuleSoft

All CMS REST APIs are available to MuleSoft for integration. MuleSoft can:

- Call CMS APIs to fetch card and transaction data
- Update card controls via CMS APIs
- Create alerts and notifications
- Process card requests
- Handle disputes

---

## Security & Authentication

### Authentication

- JWT (JSON Web Tokens) for stateless authentication
- Bcrypt password hashing with salt
- Token expiration (1 hour)
- Refresh token mechanism
- Session management

### Data Security

- Card numbers encrypted at rest (AES-256)
- CVV encrypted at rest
- PIN stored as bcrypt hash (never plain text)
- HTTPS/TLS for all API communications
- Environment variables for sensitive config

### API Security

- Bearer token required for all protected endpoints
- Rate limiting (100 requests per minute per user)
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- CORS configuration

### Demo Disclaimer

**Important:** This is a DEMO system. It uses simulated data and should NOT be used with real card numbers or customer information. All card numbers are mock data for demonstration purposes only.

---

## Implementation Plan

### Week 1: Backend Foundation
- Set up Node.js/Express project structure
- Configure PostgreSQL database
- Create database schema and migrations
- Implement authentication (JWT)
- Build card CRUD endpoints
- Add basic error handling

### Week 2: Core Features
- Implement card lock/unlock endpoints
- Build card controls endpoints
- Create transaction endpoints
- Add alert system
- Implement dispute endpoints
- Write unit tests

### Week 3: Frontend Development
- Set up React + Vite project
- Create login and dashboard pages
- Build card display components
- Implement transaction list view
- Add card controls UI
- Integrate with backend APIs

### Week 4: Polish & Demo Prep
- Add demo data seed scripts
- Create Swagger/OpenAPI documentation
- Performance optimization
- Security hardening
- Docker containerization
- Write demo scenarios and scripts

---

## Demo Data & Scenarios

### Demo Customers

| Customer ID | Name | Cards | Account |
|-------------|------|-------|---------|
| CUST-12345 | John Doe | 2 (Debit + Credit) | ACC-789456123 |
| CUST-12346 | Jane Smith | 3 (2 Debit + Credit) | ACC-789456124 |
| CUST-12347 | Bob Johnson | 1 (Debit) | ACC-789456125 |

### Demo Login Credentials

| Username | Password | Description |
|----------|----------|-------------|
| john.doe | demo123 | Customer with 2 cards |
| jane.smith | demo123 | Customer with fraud alert |
| bob.johnson | demo123 | Customer with locked card |

### Demo Scenarios

**Scenario 1: Lock Card While Traveling**  
John logs in, sees his Visa debit card, clicks lock button. Card status changes to LOCKED. System shows confirmation and alert.

**Scenario 2: View Recent Transactions**  
Jane logs in, views her credit card, sees list of recent transactions with merchant names, amounts, and categories. Can filter by date range.

**Scenario 3: Set Spending Limit**  
John goes to card controls, sets daily limit to $500. System validates and saves. Future transactions over $500 will be declined.

**Scenario 4: Report Fraud**  
Jane sees suspicious transaction for $845 at Electronics Store. Clicks 'Dispute', files fraud report. Card is automatically locked. Dispute case is created.

**Scenario 5: Enable International Purchases**  
Bob is traveling to Europe. He enables 'International Transactions' toggle. System updates card controls in real-time.

---

## Technical Stack

### Backend
- Node.js (v18+) - Runtime environment
- Express.js - Web framework
- PostgreSQL (v14+) - Database
- node-postgres (pg) - Database driver
- jsonwebtoken - JWT authentication
- bcrypt - Password hashing
- express-validator - Input validation
- helmet - Security headers
- cors - CORS middleware
- dotenv - Environment variables
- crypto - Encryption (built-in)

### Frontend
- React (v18+) - UI library
- Vite - Build tool
- React Router - Client-side routing
- Tailwind CSS - Styling
- Axios - HTTP client
- React Query - Data fetching/caching
- Zustand or Context API - State management
- Chart.js / Recharts - Transaction charts
- date-fns - Date formatting
- React Hook Form - Form handling

### Development Tools
- Docker & Docker Compose - Containerization
- ESLint + Prettier - Code formatting
- Jest + Supertest - Testing
- Swagger/OpenAPI - API documentation
- Postman - API testing
- nodemon - Development server

### Running the Application

```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or manually:
# 1. Start PostgreSQL
# 2. Run migrations
cd backend
npm install
npm run migrate
npm run seed  # Load demo data
npm start     # Starts on port 3000

# 3. Start frontend
cd frontend
npm install
npm run dev   # Starts on port 5173

# Access application at: http://localhost:5173
# API docs at: http://localhost:3000/api-docs
```

---

## Deliverables

### What You'll Get

- Complete source code (backend + frontend)
- PostgreSQL database schema and migrations
- Demo data seed scripts (customers, cards, transactions)
- REST API documentation (Swagger/OpenAPI)
- Docker Compose configuration for easy setup
- README with setup instructions
- Postman collection for API testing
- Demo scenario scripts
- Integration guide for MuleSoft

### Success Criteria

- Application runs successfully with Docker Compose
- All demo scenarios work end-to-end
- APIs respond in < 500ms
- UI is responsive on mobile and desktop
- Demo data is realistic and comprehensive
- Code is well-documented and clean
- MuleSoft can successfully call all exposed APIs

---

## Out of Scope

The following are NOT included in this demo MVP:

- Real payment processing
- Production-grade security hardening
- Scalability/load testing
- Mobile native apps
- Email/SMS notifications (mock only)
- Full KYC/compliance workflows
- Rewards/loyalty programs
- Bill payment features
- Apple Pay/Google Pay integration

---

# Cursor Build Prompt

## Instructions for Building the Card Management System

You are tasked with building a **complete Card Management System (CMS)** web application based on the PRD above. This is a standalone demo system similar to a core banking application.

### What to Build

Build a full-stack web application with:

1. **Backend (Node.js/Express):**
   - REST API server with all endpoints specified in the PRD
   - PostgreSQL database integration
   - JWT authentication
   - Card management functionality (CRUD, lock/unlock, controls)
   - Transaction management
   - Dispute handling
   - Alert system
   - Proper error handling and validation
   - API documentation with Swagger

2. **Frontend (React + Vite):**
   - Modern, responsive UI with Tailwind CSS
   - Login page
   - Dashboard with card carousel
   - Card detail pages with controls
   - Transaction list and detail views
   - Alerts/notifications page
   - Settings page
   - All components listed in the PRD

3. **Database (PostgreSQL):**
   - All tables from the database schema section
   - Migrations for schema creation
   - Seed data for demo (3 customers, 5-6 cards, 50+ transactions)

4. **Docker Setup:**
   - Docker Compose file for easy deployment
   - PostgreSQL container
   - Backend container
   - Frontend container (or serve via backend)

### Project Structure

Create the following structure:

```
cms-webapp/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── config/
│   ├── tests/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   └── index.html
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
├── docker-compose.yml
└── README.md
```

### Key Implementation Notes

**Backend:**
- Use Express.js for routing
- Use `pg` (node-postgres) for database access
- Use `jsonwebtoken` for JWT auth
- Use `bcrypt` for password hashing
- Use `crypto` module for encrypting card numbers and CVV
- Implement all REST endpoints from Section 6 of the PRD
- Add proper error handling middleware
- Add request validation middleware
- Add rate limiting
- Set up Swagger for API docs

**Frontend:**
- Use Vite for fast development
- Use Tailwind CSS for styling
- Use React Router for navigation
- Use Axios for API calls
- Use React Query for data fetching and caching
- Create reusable components (CardDisplay, TransactionList, etc.)
- Make it mobile-responsive
- Add loading states and error handling
- Use environment variables for API URL

**Database:**
- Create all tables from Section 5
- Add proper indexes
- Create migrations for schema setup
- Create seed data:
  - 3 demo users (john.doe, jane.smith, bob.johnson)
  - 5-6 cards with different statuses
  - 50+ realistic transactions with various merchants
  - Card controls for each card
  - A few alerts
  - 1-2 sample disputes

**Demo Data Details:**
- Use realistic merchant names (Starbucks, Amazon, Shell Gas, etc.)
- Use proper merchant categories (DINING, SHOPPING, GAS, etc.)
- Generate transactions over last 30 days
- Include some declined transactions
- Include one transaction with fraud flag for demo
- Card numbers should be mock (don't use real card patterns)

**Docker Compose:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: cms_db
      POSTGRES_USER: cms_user
      POSTGRES_PASSWORD: cms_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://cms_user:cms_password@postgres:5432/cms_db
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres
  
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Environment Variables

**Backend (.env):**
```
PORT=3000
DATABASE_URL=postgresql://cms_user:cms_password@localhost:5432/cms_db
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=1h
ENCRYPTION_KEY=your-32-char-encryption-key-here
NODE_ENV=development
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000/api/v1
```

### Authentication Flow

1. User submits username/password to `/api/v1/auth/login`
2. Backend validates credentials, generates JWT
3. Frontend stores JWT in localStorage
4. All subsequent requests include `Authorization: Bearer {token}` header
5. Backend middleware validates JWT on protected routes

### Card Number Encryption

Use AES-256 encryption for card numbers and CVV:
- Store encrypted in database
- Decrypt only when needed
- Return masked format (****4532) in API responses
- Full number only shown with additional authentication (PIN reveal)

### Testing

Create at least:
- Unit tests for utility functions
- Integration tests for main API endpoints
- Test authentication flow
- Test card lock/unlock
- Test transaction retrieval

### README Requirements

Create a comprehensive README with:
- Project description
- Prerequisites (Node.js, Docker, etc.)
- Setup instructions
- How to run with Docker Compose
- How to run manually
- API documentation link
- Demo credentials
- Demo scenarios
- Troubleshooting

### Deliverables Checklist

- [ ] Backend API with all endpoints working
- [ ] Frontend with all pages and components
- [ ] Database schema and migrations
- [ ] Seed data for demo
- [ ] Docker Compose setup
- [ ] Authentication and authorization
- [ ] Error handling
- [ ] Input validation
- [ ] API documentation (Swagger)
- [ ] README with instructions
- [ ] Working demo scenarios

### Demo Scenarios to Test

1. Login as john.doe
2. View dashboard with cards
3. Click on a card to see details
4. Lock/unlock a card
5. View transactions
6. Update card controls (set spending limit)
7. File a dispute on a transaction
8. View alerts
9. Update notification preferences

### Final Notes

- Focus on functionality over perfection - this is a demo
- Use realistic data but clearly mark as DEMO/TEST
- Make the UI clean and professional
- Ensure all API responses follow the format in the PRD
- Add helpful error messages
- Make it easy to run with Docker Compose
- Document everything clearly

### Start Building!

Begin with the backend database and API, then build the frontend. Test each feature as you build it. Use the PRD as your complete specification - everything you need is documented above.

**Good luck! 🚀**
