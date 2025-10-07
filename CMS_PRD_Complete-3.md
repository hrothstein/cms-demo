# Card Management System (CMS) - Product Requirements Document

## 🎯 Executive Summary

A demonstration **Card Management System** that showcases MuleSoft's API-led connectivity and integration capabilities for financial services. This standalone web application will demonstrate real-world card lifecycle management integrated with the HBR Core Banking System via MuleSoft.

**System Architecture:**
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

---

## 📋 Problem Statement

Financial institutions need modern card management capabilities that integrate seamlessly with core banking systems while providing excellent customer experience. This demo will showcase how MuleSoft enables:
- Real-time card operations
- Seamless system integration between disparate systems
- Modern customer-facing interfaces
- Secure transaction processing

---

## 🎯 Goals & Objectives

**Primary Goal:** Demonstrate MuleSoft/Salesforce value proposition for Financial Services card management

**Demo Objectives:**
1. Show API-led connectivity (MuleSoft) between CMS and core banking
2. Demonstrate real-time card operations with immediate updates
3. Showcase modern UI/UX for banking customers
4. Highlight security and compliance considerations
5. Prove integration capabilities between modern and legacy systems

---

## 👥 User Personas

**1. Bank Customer (Sarah - Primary User)**
- Age: 32, Tech-savvy professional
- Needs to manage her debit/credit cards on-the-go
- Wants instant control over card security
- Expects mobile-first, intuitive experience
- Values real-time notifications and controls

**2. Solutions Engineer (You - Demo Presenter)**
- Needs to showcase MuleSoft integration capabilities
- Demonstrates API-led connectivity patterns
- Shows real-time data synchronization
- Highlights security and compliance features

---

## ⭐ Core Features (MVP Scope)

### 1. Card Dashboard
**User Story:** As a customer, I want to see all my cards in one place so I can quickly access and manage them.

**Features:**
- Display all cards linked to customer account (from Core Banking)
- Card visual representation with card art/design
- Card details:
  - Card number (masked, showing last 4 digits)
  - Card type (Debit/Credit)
  - Card status (Active/Locked/Expired/Lost/Stolen)
  - Expiration date
  - Available balance (for debit) or credit limit/available credit (for credit cards)
- Quick action buttons: Lock/Unlock, View Details, Report Issue

**MuleSoft Integration:**
- Fetch card list from HBR Core Banking
- Real-time balance updates
- Card status synchronization

---

### 2. Card Controls & Security
**User Story:** As a customer, I want to control my card security settings so I can prevent unauthorized use.

**Features:**

**A. Instant Lock/Unlock**
- Toggle switch to temporarily disable card
- Immediate effect (prevents transactions)
- Re-enable with same toggle
- Confirmation message with timestamp

**B. Transaction Limits**
- Set daily spending limit
- Set per-transaction limit
- Different limits for:
  - ATM withdrawals
  - Online purchases
  - In-store purchases
  - International transactions

**C. Transaction Type Controls**
- Enable/Disable by type:
  - Contactless payments
  - Online purchases
  - International transactions
  - ATM withdrawals
  - Magnetic stripe (if applicable)

**D. Geographic Controls**
- Enable/disable by region:
  - Domestic only
  - International
  - Specific countries (whitelist/blacklist)
- Location-based alerts

**MuleSoft Integration:**
- Push card control changes to Core Banking in real-time
- Validate control rules before applying
- Synchronize status across all systems

---

### 3. Transaction Management
**User Story:** As a customer, I want to view my transaction history so I can track my spending and identify issues.

**Features:**

**Transaction List View:**
- Last 90 days of transactions
- Each transaction shows:
  - Merchant name
  - Transaction amount
  - Date & time
  - Location (city, state, country)
  - Category (auto-categorized)
  - Status (Pending/Completed/Declined)

**Transaction Filtering:**
- By date range
- By amount range
- By merchant
- By category
- By status
- By transaction type

**Transaction Details:**
- Full merchant information
- Authorization code
- Card used (last 4 digits)
- Original amount (if foreign currency)
- Exchange rate (if applicable)
- Fees charged
- Map showing transaction location

**Actions:**
- Report fraudulent transaction
- Dispute transaction
- Add note/memo to transaction
- Download transaction receipt (if available)

**MuleSoft Integration:**
- Fetch transactions from Core Banking
- Real-time transaction streaming for pending transactions
- Push dispute/fraud reports back to Core Banking
- Category enrichment via external service

---

### 4. Alerts & Notifications
**User Story:** As a customer, I want to receive alerts about my card activity so I can quickly identify suspicious transactions.

**Features:**

**Alert Types:**
- Transaction over specified amount
- International transaction
- Online purchase
- Card declined
- Failed PIN attempts
- Card locked/unlocked
- Unusual activity detected
- Low balance warning

**Alert Channels:**
- In-app notifications
- Email notifications
- SMS (optional, out of MVP scope but UI ready)

**Alert Configuration:**
- Enable/disable each alert type
- Set threshold amounts
- Choose notification channels
- Set quiet hours

**Alert History:**
- View all past alerts
- Mark as read/unread
- Dismiss or archive
- Take action (lock card, report fraud)

**MuleSoft Integration:**
- Receive alert triggers from Core Banking
- Push alert preferences to Core Banking
- Real-time alert delivery

---

### 5. Card Disputes & Fraud Reporting
**User Story:** As a customer, I want to report fraudulent transactions so I can protect my account.

**Features:**

**Report Fraud:**
- Select transaction(s) to report
- Provide reason:
  - Did not authorize
  - Card lost/stolen
  - Incorrect amount
  - Duplicate charge
  - Service not received
  - Other (with description)
- Upload supporting documents (optional)
- Submit fraud report

**Dispute Management:**
- View all open disputes
- Dispute status tracking:
  - Submitted
  - Under review
  - Additional information needed
  - Resolved (in customer's favor)
  - Denied
- Dispute timeline with updates
- Add comments/information to open dispute
- Provisional credit status (if applicable)

**Card Replacement (for Lost/Stolen):**
- Report card as lost or stolen
- Request replacement card
- Choose delivery address
- Expedited shipping option
- Temporary card number (if available)

**MuleSoft Integration:**
- Submit fraud reports to Core Banking fraud system
- Check dispute status
- Push provisional credits
- Trigger card replacement workflow

---

### 6. Account Integration
**User Story:** As a customer, I want to see how my cards relate to my accounts so I understand my finances.

**Features:**

**Account Summary:**
- View linked accounts from Core Banking
- Account balances
- Account types (Checking, Savings)
- Cards linked to each account

**Card-Account Linking:**
- See which account each debit card draws from
- View credit card payment account
- Change payment account for credit cards (if allowed)

**Recent Account Activity:**
- Card transactions reflected in account balance
- Pending vs. posted transactions
- Available balance vs. current balance

**MuleSoft Integration:**
- Fetch account data from HBR Core Banking
- Real-time balance updates
- Transaction posting synchronization

---

### 7. Card Services
**User Story:** As a customer, I want to access card services so I can manage my card needs.

**Features:**

**View PIN:**
- Authenticate with extra security (password re-entry or security question)
- Display PIN temporarily (30 seconds)
- Option to change PIN

**Change PIN:**
- Enter current PIN
- Enter new PIN (with strength indicator)
- Confirm new PIN
- Validate PIN rules (4-6 digits, not sequential, etc.)

**Request New Card:**
- Reason for request:
  - Damaged card
  - Upgrade card type
  - Replace expiring card
  - Add supplementary card
- Choose delivery address
- Estimated delivery date

**Activate New Card:**
- Enter new card number
- Enter CVV
- Set initial PIN
- Confirm activation

**Close Card:**
- Select card to close
- Confirm reason for closure
- Acknowledge terms
- Final balance transfer to account

**MuleSoft Integration:**
- Validate PIN changes with Core Banking
- Push card service requests
- Trigger card production system
- Update card status

---

## 🎨 UI/UX Requirements

### Design Principles
- **Modern & Clean:** Contemporary financial services design
- **Mobile-First:** Responsive design, works on all devices
- **Intuitive:** No learning curve, obvious navigation
- **Fast:** Loading states, optimistic UI updates
- **Secure:** Visual security indicators, clear confirmations

### Key Screens

**1. Login Screen**
- Email + password authentication
- "Remember me" option
- Forgot password link
- Clean, professional branding

**2. Dashboard/Home**
- Hero section: Account summary card
- Card carousel: All user's cards (swipeable)
- Quick actions: Lock card, View transactions, Report fraud
- Recent transactions list (5 most recent)
- Active alerts badge

**3. Card Detail View**
- Full card visual at top
- Card information section
- Controls section (toggles and settings)
- Recent transactions on this card
- Action buttons: Lock, Report lost, More options

**4. Transactions List**
- Search bar at top
- Filter chips (date, amount, category)
- Scrollable transaction list
- Pull-to-refresh
- Infinite scroll/pagination

**5. Transaction Detail**
- Transaction info card
- Merchant details
- Location map (if available)
- Actions: Dispute, Download receipt, Add note

**6. Card Controls**
- Organized sections:
  - Security (lock/unlock)
  - Spending limits
  - Transaction types
  - Geographic controls
  - Alerts
- Each control with clear toggle/slider
- Real-time status updates
- Save button (or auto-save with confirmation)

**7. Alerts Center**
- Notification list (grouped by date)
- Filter: All, Unread, Important
- Alert detail with action buttons
- Alert settings link

**8. Dispute Center**
- Open disputes list
- Dispute detail with timeline
- Submit new dispute flow
- Upload documents capability

### Visual Design
- **Color Scheme:**
  - Primary: Professional blue (#1E40AF)
  - Secondary: Accent green (#10B981)
  - Alert/Error: Red (#EF4444)
  - Warning: Amber (#F59E0B)
  - Success: Green (#10B981)
  - Background: Light gray (#F9FAFB)

- **Typography:**
  - Headings: Inter or similar sans-serif, bold
  - Body: Inter regular
  - Monospace: SF Mono for card numbers

- **Components:**
  - Rounded corners (8px standard, 16px for cards)
  - Shadows for elevation
  - Smooth transitions and animations
  - Loading skeletons
  - Toast notifications for confirmations

---

## 🗄️ Database Schema

**Technology:** PostgreSQL

### Core Tables

#### 1. customers
```sql
CREATE TABLE customers (
    customer_id VARCHAR(50) PRIMARY KEY,        -- Matches HBR Core Banking
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

#### 2. cards
```sql
CREATE TABLE cards (
    card_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    account_id VARCHAR(50),                     -- Links to HBR account
    card_number VARCHAR(100) NOT NULL,          -- Encrypted
    card_number_last4 VARCHAR(4) NOT NULL,
    card_type VARCHAR(20) NOT NULL,             -- DEBIT, CREDIT
    card_network VARCHAR(20),                    -- VISA, MASTERCARD, AMEX
    card_status VARCHAR(20) NOT NULL,           -- ACTIVE, LOCKED, EXPIRED, LOST, STOLEN, CLOSED
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    cvv VARCHAR(10),                            -- Encrypted
    card_art_url VARCHAR(500),
    available_balance DECIMAL(15, 2),           -- For debit
    credit_limit DECIMAL(15, 2),                -- For credit
    available_credit DECIMAL(15, 2),            -- For credit
    is_locked BOOLEAN DEFAULT FALSE,
    locked_at TIMESTAMP,
    locked_by VARCHAR(50),                      -- CUSTOMER or SYSTEM
    issued_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer (customer_id),
    INDEX idx_status (card_status),
    INDEX idx_last4 (card_number_last4)
);
```

#### 3. card_controls
```sql
CREATE TABLE card_controls (
    control_id SERIAL PRIMARY KEY,
    card_id VARCHAR(50) NOT NULL REFERENCES cards(card_id),
    
    -- Transaction Limits
    daily_limit DECIMAL(15, 2),
    per_transaction_limit DECIMAL(15, 2),
    atm_daily_limit DECIMAL(15, 2),
    online_daily_limit DECIMAL(15, 2),
    
    -- Transaction Type Controls
    contactless_enabled BOOLEAN DEFAULT TRUE,
    online_enabled BOOLEAN DEFAULT TRUE,
    international_enabled BOOLEAN DEFAULT FALSE,
    atm_enabled BOOLEAN DEFAULT TRUE,
    magstripe_enabled BOOLEAN DEFAULT TRUE,
    
    -- Geographic Controls
    domestic_only BOOLEAN DEFAULT FALSE,
    allowed_countries TEXT[],                    -- Array of country codes
    blocked_countries TEXT[],                    -- Array of country codes
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(card_id)
);
```

#### 4. transactions
```sql
CREATE TABLE transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    card_id VARCHAR(50) NOT NULL REFERENCES cards(card_id),
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    
    -- Transaction Details
    merchant_name VARCHAR(255) NOT NULL,
    merchant_category VARCHAR(100),              -- Auto-categorized
    merchant_city VARCHAR(100),
    merchant_state VARCHAR(50),
    merchant_country VARCHAR(50),
    merchant_lat DECIMAL(10, 8),
    merchant_lon DECIMAL(11, 8),
    
    -- Amount Details
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    original_amount DECIMAL(15, 2),              -- If foreign currency
    original_currency VARCHAR(3),
    exchange_rate DECIMAL(10, 6),
    fees DECIMAL(15, 2) DEFAULT 0,
    
    -- Transaction Info
    transaction_type VARCHAR(50) NOT NULL,       -- PURCHASE, ATM_WITHDRAWAL, ONLINE, etc.
    transaction_status VARCHAR(20) NOT NULL,     -- PENDING, COMPLETED, DECLINED, REVERSED
    authorization_code VARCHAR(50),
    
    -- Fraud/Dispute
    is_disputed BOOLEAN DEFAULT FALSE,
    dispute_id VARCHAR(50),
    is_fraudulent BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    transaction_date TIMESTAMP NOT NULL,
    posted_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_card (card_id),
    INDEX idx_customer (customer_id),
    INDEX idx_date (transaction_date),
    INDEX idx_status (transaction_status),
    INDEX idx_disputed (is_disputed)
);
```

#### 5. alerts
```sql
CREATE TABLE alerts (
    alert_id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    card_id VARCHAR(50) REFERENCES cards(card_id),
    transaction_id VARCHAR(50) REFERENCES transactions(transaction_id),
    
    -- Alert Details
    alert_type VARCHAR(50) NOT NULL,             -- HIGH_TRANSACTION, INTERNATIONAL, DECLINED, etc.
    alert_title VARCHAR(255) NOT NULL,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,               -- INFO, WARNING, CRITICAL
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMP,
    
    -- Action Taken
    action_taken VARCHAR(100),                   -- CARD_LOCKED, FRAUD_REPORTED, etc.
    action_taken_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_customer (customer_id),
    INDEX idx_unread (customer_id, is_read),
    INDEX idx_created (created_at)
);
```

#### 6. alert_preferences
```sql
CREATE TABLE alert_preferences (
    preference_id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    
    -- Alert Type Enablement
    high_transaction_enabled BOOLEAN DEFAULT TRUE,
    high_transaction_threshold DECIMAL(15, 2) DEFAULT 500.00,
    international_enabled BOOLEAN DEFAULT TRUE,
    online_purchase_enabled BOOLEAN DEFAULT TRUE,
    declined_transaction_enabled BOOLEAN DEFAULT TRUE,
    failed_pin_enabled BOOLEAN DEFAULT TRUE,
    card_locked_enabled BOOLEAN DEFAULT TRUE,
    unusual_activity_enabled BOOLEAN DEFAULT TRUE,
    low_balance_enabled BOOLEAN DEFAULT FALSE,
    low_balance_threshold DECIMAL(15, 2) DEFAULT 100.00,
    
    -- Notification Channels
    in_app_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,           -- Out of MVP scope
    
    -- Quiet Hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(customer_id)
);
```

#### 7. disputes
```sql
CREATE TABLE disputes (
    dispute_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    card_id VARCHAR(50) NOT NULL REFERENCES cards(card_id),
    transaction_id VARCHAR(50) REFERENCES transactions(transaction_id),
    
    -- Dispute Details
    dispute_type VARCHAR(50) NOT NULL,           -- FRAUD, UNAUTHORIZED, INCORRECT_AMOUNT, etc.
    dispute_reason TEXT NOT NULL,
    dispute_status VARCHAR(30) NOT NULL,         -- SUBMITTED, UNDER_REVIEW, INFO_NEEDED, RESOLVED, DENIED
    dispute_amount DECIMAL(15, 2) NOT NULL,
    
    -- Resolution
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    resolved_in_favor VARCHAR(20),               -- CUSTOMER, MERCHANT
    provisional_credit_issued BOOLEAN DEFAULT FALSE,
    provisional_credit_amount DECIMAL(15, 2),
    provisional_credit_date TIMESTAMP,
    
    -- Supporting Documents
    document_urls TEXT[],                        -- Array of document URLs
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_customer (customer_id),
    INDEX idx_status (dispute_status),
    INDEX idx_submitted (submitted_at)
);
```

#### 8. dispute_timeline
```sql
CREATE TABLE dispute_timeline (
    timeline_id SERIAL PRIMARY KEY,
    dispute_id VARCHAR(50) NOT NULL REFERENCES disputes(dispute_id),
    
    event_type VARCHAR(50) NOT NULL,             -- STATUS_CHANGE, COMMENT_ADDED, DOCUMENT_UPLOADED
    event_description TEXT NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    created_by VARCHAR(50),                      -- CUSTOMER, SYSTEM, AGENT
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_dispute (dispute_id),
    INDEX idx_created (created_at)
);
```

#### 9. card_service_requests
```sql
CREATE TABLE card_service_requests (
    request_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    card_id VARCHAR(50) REFERENCES cards(card_id),
    
    -- Request Details
    request_type VARCHAR(50) NOT NULL,           -- REPLACE_DAMAGED, NEW_CARD, PIN_CHANGE, ACTIVATE, CLOSE
    request_reason TEXT,
    request_status VARCHAR(30) NOT NULL,         -- PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    
    -- Delivery Info (for card replacements)
    delivery_address_line1 VARCHAR(255),
    delivery_address_line2 VARCHAR(255),
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(50),
    delivery_postal_code VARCHAR(20),
    delivery_country VARCHAR(50),
    expedited_shipping BOOLEAN DEFAULT FALSE,
    tracking_number VARCHAR(100),
    estimated_delivery_date DATE,
    
    -- Timestamps
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_customer (customer_id),
    INDEX idx_status (request_status),
    INDEX idx_requested (requested_at)
);
```

#### 10. audit_log
```sql
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(customer_id),
    card_id VARCHAR(50) REFERENCES cards(card_id),
    
    -- Action Details
    action_type VARCHAR(50) NOT NULL,            -- LOGIN, LOCK_CARD, UPDATE_CONTROLS, VIEW_PIN, etc.
    action_description TEXT,
    entity_type VARCHAR(50),                     -- CARD, TRANSACTION, DISPUTE, etc.
    entity_id VARCHAR(50),
    
    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    
    -- Result
    action_result VARCHAR(20),                   -- SUCCESS, FAILURE
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_customer (customer_id),
    INDEX idx_action (action_type),
    INDEX idx_created (created_at)
);
```

---

## 🔌 API Specifications

### Technology Stack
- **Backend:** Node.js with Express.js
- **Database:** PostgreSQL with connection pooling
- **Authentication:** JWT tokens
- **API Style:** RESTful
- **Documentation:** OpenAPI 3.0 (Swagger)

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All API endpoints (except login/register) require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

---

### API Endpoints

#### Authentication

**POST /auth/login**
```json
Request:
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "customerId": "CUST123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}
```

**POST /auth/logout**
```json
Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### Customer Profile

**GET /customers/me**
```json
Response: 200 OK
{
  "success": true,
  "data": {
    "customerId": "CUST123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "address": {
      "line1": "123 Main St",
      "line2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    },
    "dateOfBirth": "1990-05-15",
    "createdAt": "2023-01-15T10:30:00Z",
    "lastLogin": "2024-10-07T14:30:00Z"
  }
}
```

---

#### Cards

**GET /cards**
```json
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "cardId": "CARD789012",
      "customerId": "CUST123456",
      "accountId": "ACC456789",
      "cardNumberLast4": "4567",
      "cardType": "DEBIT",
      "cardNetwork": "VISA",
      "cardStatus": "ACTIVE",
      "expiryMonth": 12,
      "expiryYear": 2026,
      "cardArtUrl": "https://example.com/card-designs/blue-wave.png",
      "availableBalance": 2547.89,
      "isLocked": false,
      "issuedDate": "2023-06-15"
    },
    {
      "cardId": "CARD789013",
      "customerId": "CUST123456",
      "accountId": null,
      "cardNumberLast4": "8901",
      "cardType": "CREDIT",
      "cardNetwork": "MASTERCARD",
      "cardStatus": "ACTIVE",
      "expiryMonth": 8,
      "expiryYear": 2027,
      "cardArtUrl": "https://example.com/card-designs/silver-premium.png",
      "creditLimit": 10000.00,
      "availableCredit": 7234.56,
      "isLocked": false,
      "issuedDate": "2024-01-10"
    }
  ]
}
```

**GET /cards/:cardId**
```json
Response: 200 OK
{
  "success": true,
  "data": {
    "cardId": "CARD789012",
    "customerId": "CUST123456",
    "accountId": "ACC456789",
    "cardNumberLast4": "4567",
    "cardType": "DEBIT",
    "cardNetwork": "VISA",
    "cardStatus": "ACTIVE",
    "expiryMonth": 12,
    "expiryYear": 2026,
    "cardArtUrl": "https://example.com/card-designs/blue-wave.png",
    "availableBalance": 2547.89,
    "isLocked": false,
    "lockedAt": null,
    "lockedBy": null,
    "issuedDate": "2023-06-15",
    "controls": {
      "dailyLimit": 5000.00,
      "perTransactionLimit": 1000.00,
      "atmDailyLimit": 500.00,
      "onlineDailyLimit": 2000.00,
      "contactlessEnabled": true,
      "onlineEnabled": true,
      "internationalEnabled": false,
      "atmEnabled": true,
      "magstripeEnabled": true,
      "domesticOnly": false,
      "allowedCountries": [],
      "blockedCountries": []
    }
  }
}
```

**PUT /cards/:cardId/lock**
```json
Request:
{
  "reason": "Temporary hold while traveling"
}

Response: 200 OK
{
  "success": true,
  "message": "Card locked successfully",
  "data": {
    "cardId": "CARD789012",
    "isLocked": true,
    "lockedAt": "2024-10-07T15:23:45Z",
    "lockedBy": "CUSTOMER"
  }
}
```

**PUT /cards/:cardId/unlock**
```json
Response: 200 OK
{
  "success": true,
  "message": "Card unlocked successfully",
  "data": {
    "cardId": "CARD789012",
    "isLocked": false,
    "lockedAt": null,
    "lockedBy": null
  }
}
```

**PUT /cards/:cardId/controls**
```json
Request:
{
  "dailyLimit": 3000.00,
  "perTransactionLimit": 500.00,
  "atmDailyLimit": 300.00,
  "onlineDailyLimit": 1500.00,
  "contactlessEnabled": true,
  "onlineEnabled": true,
  "internationalEnabled": true,
  "atmEnabled": true,
  "magstripeEnabled": false,
  "domesticOnly": false,
  "allowedCountries": ["USA", "CAN", "MEX"],
  "blockedCountries": []
}

Response: 200 OK
{
  "success": true,
  "message": "Card controls updated successfully",
  "data": {
    "cardId": "CARD789012",
    "controls": { /* updated controls */ }
  }
}
```

**POST /cards/:cardId/report-lost**
```json
Request:
{
  "reportType": "LOST",  // or "STOLEN"
  "lastSeenLocation": "Central Park, New York, NY",
  "requestReplacement": true,
  "deliveryAddress": {
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "expeditedShipping": true
}

Response: 200 OK
{
  "success": true,
  "message": "Card reported as lost and locked. Replacement card requested.",
  "data": {
    "cardId": "CARD789012",
    "cardStatus": "LOST",
    "isLocked": true,
    "replacementRequest": {
      "requestId": "REQ334455",
      "status": "PENDING",
      "estimatedDeliveryDate": "2024-10-10"
    }
  }
}
```

---

#### Transactions

**GET /cards/:cardId/transactions**
```json
Query Parameters:
- startDate (optional): ISO date string
- endDate (optional): ISO date string
- limit (optional): number (default 50)
- offset (optional): number (default 0)
- status (optional): PENDING, COMPLETED, DECLINED
- minAmount (optional): number
- maxAmount (optional): number

Response: 200 OK
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transactionId": "TXN998877",
        "cardId": "CARD789012",
        "merchantName": "Starbucks #1234",
        "merchantCategory": "Coffee & Cafes",
        "merchantCity": "New York",
        "merchantState": "NY",
        "merchantCountry": "USA",
        "amount": 8.47,
        "currency": "USD",
        "transactionType": "PURCHASE",
        "transactionStatus": "COMPLETED",
        "authorizationCode": "AUTH123456",
        "isDisputed": false,
        "isFraudulent": false,
        "transactionDate": "2024-10-07T08:15:30Z",
        "postedDate": "2024-10-07T08:15:35Z"
      },
      {
        "transactionId": "TXN998876",
        "cardId": "CARD789012",
        "merchantName": "Amazon.com",
        "merchantCategory": "Online Shopping",
        "merchantCity": "Seattle",
        "merchantState": "WA",
        "merchantCountry": "USA",
        "amount": 156.78,
        "currency": "USD",
        "transactionType": "ONLINE",
        "transactionStatus": "PENDING",
        "authorizationCode": "AUTH123455",
        "isDisputed": false,
        "isFraudulent": false,
        "transactionDate": "2024-10-06T22:45:12Z",
        "postedDate": null
      }
    ],
    "pagination": {
      "total": 247,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**GET /transactions/:transactionId**
```json
Response: 200 OK
{
  "success": true,
  "data": {
    "transactionId": "TXN998877",
    "cardId": "CARD789012",
    "customerId": "CUST123456",
    "merchantName": "Starbucks #1234",
    "merchantCategory": "Coffee & Cafes",
    "merchantCity": "New York",
    "merchantState": "NY",
    "merchantCountry": "USA",
    "merchantLat": 40.7580,
    "merchantLon": -73.9855,
    "amount": 8.47,
    "currency": "USD",
    "originalAmount": null,
    "originalCurrency": null,
    "exchangeRate": null,
    "fees": 0.00,
    "transactionType": "PURCHASE",
    "transactionStatus": "COMPLETED",
    "authorizationCode": "AUTH123456",
    "isDisputed": false,
    "disputeId": null,
    "isFraudulent": false,
    "transactionDate": "2024-10-07T08:15:30Z",
    "postedDate": "2024-10-07T08:15:35Z"
  }
}
```

---

#### Alerts

**GET /alerts**
```json
Query Parameters:
- unreadOnly (optional): boolean
- limit (optional): number (default 20)
- offset (optional): number (default 0)

Response: 200 OK
{
  "success": true,
  "data": {
    "alerts": [
      {
        "alertId": 12345,
        "customerId": "CUST123456",
        "cardId": "CARD789012",
        "transactionId": "TXN998877",
        "alertType": "HIGH_TRANSACTION",
        "alertTitle": "Large Transaction Alert",
        "alertMessage": "A transaction of $1,247.89 was made at Apple Store Fifth Avenue",
        "severity": "WARNING",
        "isRead": false,
        "isDismissed": false,
        "actionTaken": null,
        "createdAt": "2024-10-07T14:30:22Z"
      },
      {
        "alertId": 12344,
        "customerId": "CUST123456",
        "cardId": "CARD789012",
        "transactionId": null,
        "alertType": "CARD_LOCKED",
        "alertTitle": "Card Locked",
        "alertMessage": "Your card ending in 4567 has been locked at your request",
        "severity": "INFO",
        "isRead": true,
        "readAt": "2024-10-07T13:15:10Z",
        "isDismissed": false,
        "actionTaken": "CARD_LOCKED",
        "actionTakenAt": "2024-10-07T13:15:00Z",
        "createdAt": "2024-10-07T13:15:05Z"
      }
    ],
    "unreadCount": 3,
    "pagination": {
      "total": 47,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**PUT /alerts/:alertId/read**
```json
Response: 200 OK
{
  "success": true,
  "message": "Alert marked as read"
}
```

**PUT /alerts/:alertId/dismiss**
```json
Response: 200 OK
{
  "success": true,
  "message": "Alert dismissed"
}
```

**GET /alerts/preferences**
```json
Response: 200 OK
{
  "success": true,
  "data": {
    "highTransactionEnabled": true,
    "highTransactionThreshold": 500.00,
    "internationalEnabled": true,
    "onlinePurchaseEnabled": true,
    "declinedTransactionEnabled": true,
    "failedPinEnabled": true,
    "cardLockedEnabled": true,
    "unusualActivityEnabled": true,
    "lowBalanceEnabled": false,
    "lowBalanceThreshold": 100.00,
    "inAppEnabled": true,
    "emailEnabled": true,
    "smsEnabled": false,
    "quietHoursEnabled": false,
    "quietHoursStart": null,
    "quietHoursEnd": null
  }
}
```

**PUT /alerts/preferences**
```json
Request:
{
  "highTransactionEnabled": true,
  "highTransactionThreshold": 750.00,
  "internationalEnabled": true,
  "onlinePurchaseEnabled": true,
  "declinedTransactionEnabled": true,
  "failedPinEnabled": true,
  "cardLockedEnabled": true,
  "unusualActivityEnabled": true,
  "lowBalanceEnabled": true,
  "lowBalanceThreshold": 200.00,
  "inAppEnabled": true,
  "emailEnabled": true,
  "smsEnabled": false,
  "quietHoursEnabled": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00"
}

Response: 200 OK
{
  "success": true,
  "message": "Alert preferences updated successfully",
  "data": { /* updated preferences */ }
}
```

---

#### Disputes

**POST /disputes**
```json
Request:
{
  "transactionId": "TXN998877",
  "disputeType": "FRAUD",
  "disputeReason": "I did not authorize this transaction. My card was stolen.",
  "disputeAmount": 1247.89,
  "supportingDocuments": [
    "https://example.com/uploads/police-report.pdf"
  ]
}

Response: 201 Created
{
  "success": true,
  "message": "Dispute submitted successfully",
  "data": {
    "disputeId": "DSP556677",
    "customerId": "CUST123456",
    "cardId": "CARD789012",
    "transactionId": "TXN998877",
    "disputeType": "FRAUD",
    "disputeReason": "I did not authorize this transaction. My card was stolen.",
    "disputeStatus": "SUBMITTED",
    "disputeAmount": 1247.89,
    "provisionalCreditIssued": false,
    "submittedAt": "2024-10-07T15:30:00Z"
  }
}
```

**GET /disputes**
```json
Query Parameters:
- status (optional): SUBMITTED, UNDER_REVIEW, INFO_NEEDED, RESOLVED, DENIED

Response: 200 OK
{
  "success": true,
  "data": {
    "disputes": [
      {
        "disputeId": "DSP556677",
        "customerId": "CUST123456",
        "cardId": "CARD789012",
        "transactionId": "TXN998877",
        "disputeType": "FRAUD",
        "disputeStatus": "UNDER_REVIEW",
        "disputeAmount": 1247.89,
        "provisionalCreditIssued": true,
        "provisionalCreditAmount": 1247.89,
        "provisionalCreditDate": "2024-10-08T10:00:00Z",
        "submittedAt": "2024-10-07T15:30:00Z",
        "updatedAt": "2024-10-08T10:00:00Z"
      }
    ]
  }
}
```

**GET /disputes/:disputeId**
```json
Response: 200 OK
{
  "success": true,
  "data": {
    "dispute": {
      "disputeId": "DSP556677",
      "customerId": "CUST123456",
      "cardId": "CARD789012",
      "transactionId": "TXN998877",
      "disputeType": "FRAUD",
      "disputeReason": "I did not authorize this transaction. My card was stolen.",
      "disputeStatus": "UNDER_REVIEW",
      "disputeAmount": 1247.89,
      "resolutionNotes": null,
      "resolvedAt": null,
      "resolvedInFavor": null,
      "provisionalCreditIssued": true,
      "provisionalCreditAmount": 1247.89,
      "provisionalCreditDate": "2024-10-08T10:00:00Z",
      "documentUrls": [
        "https://example.com/uploads/police-report.pdf"
      ],
      "submittedAt": "2024-10-07T15:30:00Z",
      "updatedAt": "2024-10-08T10:00:00Z"
    },
    "timeline": [
      {
        "timelineId": 1,
        "eventType": "STATUS_CHANGE",
        "eventDescription": "Dispute submitted by customer",
        "oldStatus": null,
        "newStatus": "SUBMITTED",
        "createdBy": "CUSTOMER",
        "createdAt": "2024-10-07T15:30:00Z"
      },
      {
        "timelineId": 2,
        "eventType": "STATUS_CHANGE",
        "eventDescription": "Dispute moved to under review. Provisional credit issued.",
        "oldStatus": "SUBMITTED",
        "newStatus": "UNDER_REVIEW",
        "createdBy": "SYSTEM",
        "createdAt": "2024-10-08T10:00:00Z"
      }
    ]
  }
}
```

**POST /disputes/:disputeId/comments**
```json
Request:
{
  "comment": "I found my receipt showing a different amount was charged."
}

Response: 201 Created
{
  "success": true,
  "message": "Comment added to dispute",
  "data": {
    "timelineId": 3,
    "eventType": "COMMENT_ADDED",
    "eventDescription": "I found my receipt showing a different amount was charged.",
    "createdBy": "CUSTOMER",
    "createdAt": "2024-10-08T14:22:00Z"
  }
}
```

---

#### Card Services

**POST /card-services/view-pin**
```json
Request:
{
  "cardId": "CARD789012",
  "password": "SecurePass123!"  // Re-authentication required
}

Response: 200 OK
{
  "success": true,
  "data": {
    "pin": "4567",
    "expiresAt": "2024-10-07T15:35:00Z"  // PIN visible for 30 seconds
  }
}
```

**POST /card-services/change-pin**
```json
Request:
{
  "cardId": "CARD789012",
  "currentPin": "4567",
  "newPin": "7890",
  "confirmPin": "7890"
}

Response: 200 OK
{
  "success": true,
  "message": "PIN changed successfully"
}
```

**POST /card-services/request-replacement**
```json
Request:
{
  "cardId": "CARD789012",
  "requestType": "REPLACE_DAMAGED",  // or NEW_CARD, UPGRADE
  "requestReason": "Card is damaged and won't swipe",
  "deliveryAddress": {
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "expeditedShipping": false
}

Response: 201 Created
{
  "success": true,
  "message": "Card replacement requested",
  "data": {
    "requestId": "REQ334456",
    "requestType": "REPLACE_DAMAGED",
    "requestStatus": "PENDING",
    "estimatedDeliveryDate": "2024-10-14",
    "requestedAt": "2024-10-07T15:40:00Z"
  }
}
```

**POST /card-services/activate**
```json
Request:
{
  "cardNumber": "4532123456784567",  // Full card number of new card
  "cvv": "123",
  "newPin": "7890"
}

Response: 200 OK
{
  "success": true,
  "message": "Card activated successfully",
  "data": {
    "cardId": "CARD789014",
    "cardStatus": "ACTIVE",
    "activatedAt": "2024-10-07T15:45:00Z"
  }
}
```

---

## 🔗 MuleSoft Integration Layer

### Purpose
MuleSoft acts as the integration middleware between the CMS application and the HBR Core Banking System, providing:
- API-led connectivity (Experience, Process, System APIs)
- Data transformation and enrichment
- Real-time synchronization
- Error handling and retry logic
- Security and rate limiting

### Integration Points

#### 1. Customer Data Sync
**Flow:** CMS → MuleSoft → HBR Core Banking

**Endpoints:**
- `GET /mulesoft/customers/{customerId}` - Fetch customer details from HBR
- `PUT /mulesoft/customers/{customerId}` - Update customer info in HBR

**Use Case:**
- When customer logs in, fetch their complete profile from HBR
- Sync address changes back to core banking

---

#### 2. Account & Balance Sync
**Flow:** CMS → MuleSoft → HBR Core Banking

**Endpoints:**
- `GET /mulesoft/accounts/{accountId}` - Get account details and balance
- `GET /mulesoft/accounts/{accountId}/balance` - Real-time balance check

**Use Case:**
- Display current account balances for linked debit cards
- Validate sufficient funds before transactions

---

#### 3. Card Operations
**Flow:** CMS → MuleSoft → HBR Core Banking

**Endpoints:**
- `PUT /mulesoft/cards/{cardId}/lock` - Lock card in core banking
- `PUT /mulesoft/cards/{cardId}/unlock` - Unlock card in core banking
- `PUT /mulesoft/cards/{cardId}/controls` - Update card controls in core banking
- `GET /mulesoft/cards/{cardId}/status` - Get real-time card status

**Use Case:**
- Customer locks card in CMS UI → MuleSoft pushes to HBR → Card blocked system-wide
- Card controls applied to authorization system

---

#### 4. Transaction Streaming
**Flow:** HBR Core Banking → MuleSoft → CMS

**Endpoints:**
- `GET /mulesoft/transactions/stream` - Server-Sent Events for real-time transactions
- `POST /mulesoft/transactions/webhook` - Webhook receiver for transaction events

**Use Case:**
- Real-time transaction notifications
- Immediate balance updates after transactions
- Trigger alerts for suspicious activity

---

#### 5. Fraud & Dispute Management
**Flow:** CMS → MuleSoft → HBR Core Banking Fraud System

**Endpoints:**
- `POST /mulesoft/disputes` - Submit dispute to core banking fraud system
- `GET /mulesoft/disputes/{disputeId}` - Check dispute status
- `POST /mulesoft/fraud/report` - Report fraudulent transaction

**Use Case:**
- Customer reports fraud → MuleSoft routes to HBR fraud detection system
- Provisional credits processed through core banking

---

#### 6. Card Services
**Flow:** CMS → MuleSoft → HBR Card Production System

**Endpoints:**
- `POST /mulesoft/card-services/replacement` - Request card replacement
- `POST /mulesoft/card-services/pin-change` - Change PIN in core banking
- `POST /mulesoft/card-services/activate` - Activate new card

**Use Case:**
- Card replacement orders routed to card production vendor
- PIN changes synchronized with ATM networks

---

### MuleSoft API Architecture

**3-Layer API Design:**

```
┌─────────────────────────────────────────┐
│       Experience API (CMS-facing)       │  ← Tailored for CMS UI needs
│  /api/v1/customers, /api/v1/cards      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        Process API (Orchestration)      │  ← Business logic & workflows
│  Card Lock Flow, Dispute Workflow      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│       System API (HBR Integration)      │  ← Direct HBR connectivity
│  /hbr/customers, /hbr/accounts         │
└─────────────────────────────────────────┘
```

**Benefits:**
- **Experience API:** Optimized payloads for CMS frontend
- **Process API:** Reusable business logic (e.g., card lock also triggers alerts)
- **System API:** Decouples CMS from HBR changes

---

## 🔐 Security & Compliance

### Authentication & Authorization
- JWT-based authentication with short-lived tokens (15 min)
- Refresh token rotation
- Role-based access control (RBAC)
- Multi-factor authentication (MFA) - future enhancement

### Data Security
- **Encryption at Rest:** AES-256 for database
- **Encryption in Transit:** TLS 1.3 for all API calls
- **PCI DSS Compliance:**
  - Full card numbers encrypted with strong encryption
  - CVV never stored (only collected for transactions)
  - Card data tokenized where possible
  - Audit logging for all card data access

### Sensitive Data Handling
- Card numbers: Encrypted, displayed as masked (●●●● 4567)
- PIN: Encrypted, never logged, view requires re-authentication
- CVV: Never stored persistently
- Passwords: Bcrypt hashing with salt

### API Security
- Rate limiting: 100 requests/minute per user
- IP whitelisting for MuleSoft integration endpoints
- API key rotation policy
- DDoS protection
- Input validation and sanitization

### Audit & Compliance
- Comprehensive audit logging (all card operations)
- User action tracking
- Failed authentication attempts monitoring
- Regular security audits
- GDPR compliance (data privacy)

---

## 🧪 Testing Strategy

### Unit Tests
- Backend API endpoints (80%+ coverage)
- Database models and queries
- Business logic functions
- Utility functions

### Integration Tests
- End-to-end API flows
- MuleSoft integration endpoints
- Database transactions
- Error handling scenarios

### UI Tests
- Component testing (React Testing Library)
- E2E testing (Playwright or Cypress)
- Cross-browser compatibility
- Mobile responsiveness

### Security Tests
- Penetration testing
- Vulnerability scanning
- Authentication bypass attempts
- SQL injection tests
- XSS prevention validation

### Performance Tests
- Load testing (100 concurrent users)
- Stress testing
- API response time benchmarks (<200ms for 95th percentile)
- Database query optimization

---

## 📅 Implementation Plan

### Phase 1: Foundation (Week 1)
**Goal:** Setup infrastructure and core authentication

**Tasks:**
- Initialize Git repository with branching strategy
- Setup Node.js/Express backend project structure
- Setup React frontend with TypeScript
- Configure PostgreSQL database
- Create database schema and migrations
- Implement authentication (JWT)
- Setup CI/CD pipeline (GitHub Actions)
- Deploy skeleton to staging environment

**Deliverables:**
- Working login/logout functionality
- Database with schema
- Basic API structure
- Deployed dev environment

---

### Phase 2: Core Features (Week 2)
**Goal:** Implement primary card management features

**Tasks:**
- Card dashboard UI
- Card list API
- Card detail view
- Lock/unlock card functionality (frontend + backend)
- Transaction list view
- Transaction detail view
- Basic card controls (limits, types)
- Alert system (basic)

**Deliverables:**
- Customer can view cards
- Customer can lock/unlock cards
- Customer can view transactions
- Basic card controls working

---

### Phase 3: Advanced Features (Week 3)
**Goal:** Complete feature set

**Tasks:**
- Full card controls UI (geographic, spending limits)
- Alert preferences
- Alert notifications (in-app, email)
- Dispute submission flow
- Dispute tracking UI
- Card services (PIN view/change, replacement request)
- Account integration view

**Deliverables:**
- Complete card controls
- Full alerts system
- Dispute management
- Card services

---

### Phase 4: MuleSoft Integration (Week 4)
**Goal:** Connect to HBR Core Banking via MuleSoft

**Tasks:**
- Setup MuleSoft integration endpoints
- Customer sync with HBR
- Account balance sync with HBR
- Card lock/unlock sync with HBR
- Transaction streaming from HBR
- Dispute submission to HBR fraud system
- Card services routing to HBR
- End-to-end testing

**Deliverables:**
- Full integration with HBR Core Banking
- Real-time data synchronization
- Working demo scenarios

---

### Phase 5: Polish & Demo Prep (Week 5)
**Goal:** Finalize demo and documentation

**Tasks:**
- UI polish and animations
- Error handling improvements
- Loading states and skeletons
- Demo data seeding
- Demo script creation
- Documentation (API docs, user guide)
- Performance optimization
- Security hardening
- Final testing

**Deliverables:**
- Production-ready demo
- Complete documentation
- Demo script and talking points

---

## 🎬 Demo Scenarios

### Scenario 1: Card Lock After Suspicious Activity
**Story:** Sarah receives an alert about a suspicious transaction and immediately locks her card.

**Demo Flow:**
1. Show transaction list with recent activity
2. Highlight suspicious transaction (wrong location)
3. Alert appears: "Unusual transaction detected"
4. Click alert → View transaction details
5. Click "Lock Card" button
6. Card status changes to "Locked" immediately
7. Show MuleSoft logs: CMS → MuleSoft → HBR
8. Explain: Card now blocked system-wide, no new transactions authorized

**Talking Points:**
- Real-time card control
- Immediate synchronization via MuleSoft
- Customer empowerment
- Fraud prevention

---

### Scenario 2: Setting International Travel Controls
**Story:** Sarah is traveling to Europe and wants to enable international transactions while restricting domestic use.

**Demo Flow:**
1. Navigate to Card Controls
2. Enable "International Transactions"
3. Add Europe countries to whitelist (France, Italy, Spain)
4. Set daily limit to €500
5. Save controls
6. Show confirmation toast
7. Display MuleSoft orchestration: Controls pushed to authorization system
8. Simulate European transaction → Approved
9. Simulate US transaction → Declined (outside allowed countries)

**Talking Points:**
- Flexible card controls
- Geographic restrictions
- API-led connectivity
- Authorization system integration

---

### Scenario 3: Dispute a Transaction
**Story:** Sarah notices an incorrect charge and files a dispute.

**Demo Flow:**
1. View transaction list
2. Find incorrect transaction
3. Click "Dispute Transaction"
4. Select dispute type: "Incorrect Amount"
5. Enter reason: "Charged $150 but should have been $50"
6. Upload receipt as evidence
7. Submit dispute
8. Show dispute created with status "Submitted"
9. View dispute timeline with initial entry
10. Show MuleSoft routing to HBR fraud system
11. Simulate dispute update: Status changed to "Under Review"
12. Provisional credit issued notification

**Talking Points:**
- Easy dispute process
- Document upload capability
- Real-time status tracking
- Integration with fraud management system
- Provisional credit automation

---

### Scenario 4: Real-Time Transaction Notifications
**Story:** Sarah makes a purchase and immediately sees it in the app.

**Demo Flow:**
1. Show CMS dashboard on screen
2. Simulate transaction in HBR (via Postman or script)
3. Transaction appears immediately in CMS (via MuleSoft streaming)
4. Alert pops up: "Transaction at Starbucks: $8.47"
5. Click notification → View transaction details
6. Show balance updated in real-time

**Talking Points:**
- Real-time transaction streaming
- Server-Sent Events (SSE) or WebSocket
- MuleSoft event-driven architecture
- Immediate customer visibility

---

## 📊 Success Metrics

### Technical Metrics
- API response time: <200ms (95th percentile)
- Uptime: 99.9%
- Transaction sync latency: <2 seconds
- Zero data loss

### Demo Effectiveness Metrics
- Clearly showcases MuleSoft API-led connectivity
- Demonstrates 3-layer API architecture (Experience, Process, System)
- Shows real-time data synchronization
- Highlights security features
- Proves integration between modern and legacy systems

### Business Value Metrics (for Prospects)
- Reduced fraud with instant card controls
- Improved customer satisfaction with real-time features
- Faster dispute resolution
- Lower operational costs through automation
- Enhanced security and compliance

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context + hooks (or Zustand for larger state)
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Forms:** React Hook Form
- **Charts:** Recharts or Chart.js
- **Icons:** Heroicons or Lucide React

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15
- **ORM:** Prisma (or raw SQL with connection pooling)
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod or Joi
- **API Documentation:** Swagger/OpenAPI

### Integration
- **MuleSoft:** Anypoint Platform
- **API Testing:** Postman, Insomnia
- **Event Streaming:** Server-Sent Events (SSE)

### DevOps
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Hosting:** Heroku, AWS, or Azure
- **Monitoring:** Datadog or New Relic
- **Logging:** Winston + CloudWatch

### Development Tools
- **Code Editor:** VS Code (or Cursor)
- **Linting:** ESLint, Prettier
- **Testing:** Jest, React Testing Library, Supertest
- **Database Tools:** pgAdmin, DBeaver

---

## 📦 Deliverables

### Code Repositories
1. **cms-frontend:** React application
2. **cms-backend:** Node.js API server
3. **cms-mulesoft:** MuleSoft integration flows

### Documentation
1. **API Documentation:** OpenAPI/Swagger spec
2. **User Guide:** How to use the CMS
3. **Integration Guide:** MuleSoft setup and configuration
4. **Architecture Diagram:** System components and flows
5. **Demo Script:** Step-by-step demo walkthrough

### Deployment
1. **Staging Environment:** For testing and demo prep
2. **Production Environment:** Final demo environment
3. **Database Backups:** Automated daily backups

### Demo Assets
1. **Demo Data:** Pre-seeded customers, cards, transactions
2. **Demo Script:** Talking points for each scenario
3. **Slide Deck:** Supporting presentation (optional)
4. **Video Recording:** Walkthrough video (optional)

---

## 🚀 Out of Scope (Future Enhancements)

These features are intentionally excluded from MVP but can be added later:

### Customer-Facing
- Mobile app (iOS/Android native)
- Biometric authentication (Face ID, Touch ID)
- Push notifications (requires mobile app)
- SMS alerts
- Bill pay integration
- Rewards/points tracking
- Card design customization
- Virtual card numbers for online shopping
- Spending analytics and insights
- Budget tracking

### Admin/Operations
- Bank employee admin portal
- Customer service interface
- Fraud analyst dashboard
- Reporting and analytics
- Bulk operations
- Card production tracking

### Technical
- GraphQL API (if needed)
- Real-time chat support
- Webhooks for third-party integrations
- Advanced fraud detection (AI/ML)
- A/B testing framework
- Performance monitoring dashboards

---

## 🎯 Key Differentiators for Demo

What makes this demo valuable for showcasing MuleSoft:

1. **API-Led Connectivity:** Clear demonstration of 3-layer API architecture
2. **Real-Time Integration:** Shows live data sync between systems
3. **Legacy Modernization:** Modern UI on top of legacy core banking
4. **Customer Experience:** Banking customer expectations (instant, secure, mobile)
5. **Reusability:** MuleSoft APIs can serve multiple channels (web, mobile, partners)
6. **Scalability:** Architecture designed for enterprise scale
7. **Security:** PCI DSS compliance and best practices

---

---

# 🛠️ BUILD INSTRUCTIONS FOR CURSOR

---

## 🎯 OBJECTIVE

Build a complete, standalone **Card Management System (CMS)** web application that demonstrates MuleSoft's integration capabilities for financial services. This system will integrate with the existing **HBR Core Banking System** via a MuleSoft integration layer.

---

## ⚠️ CRITICAL: GIT BRANCHING STRATEGY

**DO THIS FIRST - BEFORE ANY CODE CHANGES!**

### Why We Need Branching
Your existing HBR Core Banking System is working and deployed. We need to build the CMS separately without breaking anything. If something goes wrong with CMS development, we can easily go back to the working HBR system.

### Branch Strategy

```
master (main)
  └── Your working HBR Core Banking System (PROTECTED)
  
feature/cms
  └── New CMS development (SAFE TO BREAK)
```

### Step-by-Step Git Setup

1. **Create a backup of master (safety net)**
   ```bash
   git checkout master
   git branch master-backup-$(date +%Y%m%d)
   git push origin master-backup-$(date +%Y%m%d)
   ```

2. **Create feature branch for CMS**
   ```bash
   git checkout -b feature/cms
   git push -u origin feature/cms
   ```

3. **Verify you're on the correct branch**
   ```bash
   git branch
   # Should show: * feature/cms
   ```

4. **Set upstream tracking**
   ```bash
   git push --set-upstream origin feature/cms
   ```

### Working on Feature Branch

**ALL CMS development happens on `feature/cms` branch:**

```bash
# Make changes to code
git add .
git commit -m "feat: add card dashboard UI"
git push origin feature/cms

# Keep committing as you build features
git commit -m "feat: implement card lock/unlock"
git push origin feature/cms

git commit -m "feat: add transaction list view"
git push origin feature/cms
```

### When CMS is Complete and Tested

1. **Create Pull Request**
   - Go to GitHub
   - Create PR: `feature/cms` → `master`
   - Review all changes
   - Get approval (from yourself or team)

2. **Merge to Master**
   ```bash
   git checkout master
   git pull origin master
   git merge feature/cms --no-ff
   git push origin master
   ```

3. **Deploy merged code**
   ```bash
   git push heroku master
   ```

### If Something Goes Wrong

**Rollback to working HBR system:**
```bash
git checkout master
git reset --hard origin/master-backup-YYYYMMDD
git push -f origin master
```

---

## 📁 PROJECT STRUCTURE

Create this structure on the `feature/cms` branch:

```
/
├── cms-backend/              ← Node.js/Express API
│   ├── src/
│   │   ├── config/           ← Database, environment configs
│   │   ├── models/           ← Database models (Prisma or raw SQL)
│   │   ├── routes/           ← API route handlers
│   │   ├── controllers/      ← Business logic
│   │   ├── middleware/       ← Auth, validation, error handling
│   │   ├── services/         ← External integrations (MuleSoft, HBR)
│   │   ├── utils/            ← Helper functions
│   │   └── app.ts            ← Express app setup
│   ├── prisma/               ← Database schema (if using Prisma)
│   ├── tests/                ← Unit and integration tests
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── cms-frontend/             ← React/TypeScript SPA
│   ├── public/
│   ├── src/
│   │   ├── components/       ← Reusable UI components
│   │   ├── pages/            ← Page components
│   │   ├── hooks/            ← Custom React hooks
│   │   ├── services/         ← API client services
│   │   ├── context/          ← React Context (auth, app state)
│   │   ├── utils/            ← Helper functions
│   │   ├── types/            ← TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── cms-database/             ← Database migrations and seed data
│   ├── migrations/
│   └── seeds/
│
├── docs/                     ← Documentation
│   ├── API.md                ← API documentation
│   ├── ARCHITECTURE.md       ← System architecture
│   └── DEMO_SCRIPT.md        ← Demo walkthrough
│
└── README.md                 ← Project overview
```

---

## 🗄️ STEP 1: DATABASE SETUP

### Create PostgreSQL Database

```bash
# Local development
createdb cms_development

# Create tables using the schema provided in the PRD
# Run migrations
```

### Seed Demo Data

Create demo data for:
- 3-5 customers
- 2-3 cards per customer (mix of debit/credit)
- 50-100 transactions per card
- Various alerts
- 1-2 disputes

**Demo User Credentials:**
```
Email: sarah.demo@example.com
Password: Demo123!

Email: john.demo@example.com
Password: Demo123!
```

---

## 🔧 STEP 2: BACKEND DEVELOPMENT (cms-backend)

### Initialize Backend

```bash
cd cms-backend
npm init -y
npm install express typescript ts-node @types/node @types/express
npm install pg prisma @prisma/client  # If using Prisma
npm install jsonwebtoken bcrypt dotenv cors express-validator
npm install --save-dev nodemon @types/jsonwebtoken @types/bcrypt
```

### Build Order (Incremental Development)

#### Phase 1: Foundation
1. **Setup Express server** (`src/app.ts`)
   - Basic Express setup
   - CORS configuration
   - Error handling middleware
   - Health check endpoint: `GET /health`

2. **Setup database connection** (`src/config/database.ts`)
   - PostgreSQL connection with pooling
   - Connection testing

3. **Authentication** (`src/routes/auth.ts`)
   - `POST /api/v1/auth/login`
   - `POST /api/v1/auth/logout`
   - JWT token generation
   - Password hashing with bcrypt

**Test:** Can log in and receive JWT token

#### Phase 2: Core Card Features
4. **Customer Profile** (`src/routes/customers.ts`)
   - `GET /api/v1/customers/me`

5. **Cards API** (`src/routes/cards.ts`)
   - `GET /api/v1/cards` - List all cards
   - `GET /api/v1/cards/:cardId` - Card details
   - `PUT /api/v1/cards/:cardId/lock` - Lock card
   - `PUT /api/v1/cards/:cardId/unlock` - Unlock card
   - `PUT /api/v1/cards/:cardId/controls` - Update card controls

**Test:** Can view cards, lock/unlock, update controls

#### Phase 3: Transactions
6. **Transactions API** (`src/routes/transactions.ts`)
   - `GET /api/v1/cards/:cardId/transactions` - List transactions
   - `GET /api/v1/transactions/:transactionId` - Transaction details
   - Query parameters: pagination, filtering

**Test:** Can view transaction history with filters

#### Phase 4: Alerts
7. **Alerts API** (`src/routes/alerts.ts`)
   - `GET /api/v1/alerts` - List alerts
   - `PUT /api/v1/alerts/:alertId/read` - Mark as read
   - `PUT /api/v1/alerts/:alertId/dismiss` - Dismiss alert
   - `GET /api/v1/alerts/preferences` - Get preferences
   - `PUT /api/v1/alerts/preferences` - Update preferences

**Test:** Can view and manage alerts

#### Phase 5: Disputes
8. **Disputes API** (`src/routes/disputes.ts`)
   - `POST /api/v1/disputes` - Submit dispute
   - `GET /api/v1/disputes` - List disputes
   - `GET /api/v1/disputes/:disputeId` - Dispute details
   - `POST /api/v1/disputes/:disputeId/comments` - Add comment

**Test:** Can file and track disputes

#### Phase 6: Card Services
9. **Card Services API** (`src/routes/card-services.ts`)
   - `POST /api/v1/card-services/view-pin` - View PIN (with re-auth)
   - `POST /api/v1/card-services/change-pin` - Change PIN
   - `POST /api/v1/card-services/request-replacement` - Request new card
   - `POST /api/v1/card-services/activate` - Activate card

**Test:** Can view PIN, change PIN, request replacement

#### Phase 7: MuleSoft Integration (Simulated)
10. **MuleSoft Service Layer** (`src/services/mulesoft.ts`)
    - Create service functions that will call MuleSoft APIs
    - For now, simulate responses (return mock data)
    - Add console logs to show integration points
    - Structure code so real MuleSoft calls can be added later

**Example:**
```typescript
// src/services/mulesoft.ts
export async function syncCardLockToHBR(cardId: string, isLocked: boolean) {
  console.log(`[MULESOFT] Syncing card lock to HBR: ${cardId}, locked: ${isLocked}`);
  
  // TODO: Replace with actual MuleSoft API call
  // const response = await axios.post('http://mulesoft-url/cards/lock', {...});
  
  // For now, simulate success
  return {
    success: true,
    message: 'Card status synced to HBR Core Banking',
    timestamp: new Date().toISOString()
  };
}
```

**Test:** Logs show integration points being called

---

## 🎨 STEP 3: FRONTEND DEVELOPMENT (cms-frontend)

### Initialize Frontend

```bash
cd cms-frontend
npm create vite@latest . -- --template react-ts
npm install
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install @heroicons/react
npm install react-hook-form zod
```

### Build Order (Incremental Development)

#### Phase 1: Foundation
1. **Setup routing** (`src/App.tsx`)
   - React Router setup
   - Public routes (login)
   - Protected routes (dashboard, etc.)

2. **Authentication Context** (`src/context/AuthContext.tsx`)
   - Login state management
   - JWT token storage (localStorage)
   - Auto-logout on token expiry
   - Protected route wrapper

3. **API Client** (`src/services/api.ts`)
   - Axios instance with interceptors
   - Automatic token attachment
   - Error handling
   - Base URL configuration

4. **Login Page** (`src/pages/Login.tsx`)
   - Login form (email + password)
   - Form validation
   - Error display
   - Remember me checkbox

**Test:** Can log in and be redirected to dashboard

#### Phase 2: Dashboard & Cards
5. **Dashboard Layout** (`src/components/Layout.tsx`)
   - Header with logo, user menu
   - Navigation menu
   - Logout button

6. **Dashboard Page** (`src/pages/Dashboard.tsx`)
   - Account summary card (balance, account info)
   - Card carousel (swipeable cards)
   - Recent transactions (5 most recent)
   - Active alerts badge

7. **Card List Component** (`src/components/CardList.tsx`)
   - Display all cards in a grid
   - Card visual with gradient
   - Card details (last 4, type, status, balance)
   - Quick actions (Lock, View)

8. **Card Detail Page** (`src/pages/CardDetail.tsx`)
   - Full card visual
   - Card information section
   - Lock/unlock toggle
   - Recent transactions on this card
   - Link to card controls

**Test:** Can view dashboard, see cards, lock/unlock cards

#### Phase 3: Card Controls
9. **Card Controls Page** (`src/pages/CardControls.tsx`)
   - Security section (lock toggle)
   - Spending limits (daily, per-transaction)
   - Transaction types (toggles for contactless, online, international, ATM)
   - Geographic controls (country whitelist/blacklist)
   - Save button (or auto-save with toast)

**Test:** Can update card controls and see changes

#### Phase 4: Transactions
10. **Transaction List Page** (`src/pages/Transactions.tsx`)
    - Search bar
    - Filter chips (date range, amount, category)
    - Transaction list (scrollable, paginated)
    - Transaction item component

11. **Transaction Detail Page** (`src/pages/TransactionDetail.tsx`)
    - Transaction info card
    - Merchant details
    - Location map (optional, can use static image)
    - Actions: Dispute, Download receipt, Add note

**Test:** Can view and filter transactions

#### Phase 5: Alerts
12. **Alerts Page** (`src/pages/Alerts.tsx`)
    - Alert list (grouped by date)
    - Unread indicator
    - Alert detail on click
    - Mark as read, dismiss actions

13. **Alert Preferences Page** (`src/pages/AlertPreferences.tsx`)
    - Toggle each alert type
    - Set threshold amounts
    - Choose notification channels
    - Quiet hours configuration

**Test:** Can view alerts and update preferences

#### Phase 6: Disputes
14. **Dispute List Page** (`src/pages/Disputes.tsx`)
    - Open disputes list
    - Dispute status badges

15. **Dispute Detail Page** (`src/pages/DisputeDetail.tsx`)
    - Dispute information
    - Timeline with status updates
    - Add comment section

16. **Submit Dispute Modal** (`src/components/SubmitDisputeModal.tsx`)
    - Select transaction
    - Choose dispute type
    - Enter reason
    - Upload documents (optional, can skip in MVP)
    - Submit button

**Test:** Can file dispute and track status

#### Phase 7: Card Services
17. **Card Services Page** (`src/pages/CardServices.tsx`)
    - View PIN (with re-auth prompt)
    - Change PIN form
    - Request replacement card form
    - Activate new card form

**Test:** Can view PIN, change PIN, request replacement

#### Phase 8: Polish
18. **Loading States**
    - Skeleton screens for all pages
    - Spinners for async actions

19. **Error Handling**
    - Toast notifications for errors
    - Empty states (no cards, no transactions)

20. **Responsive Design**
    - Test on mobile, tablet, desktop
    - Mobile menu

**Test:** UI is polished and responsive

---

## 🔗 STEP 4: MULESOFT INTEGRATION (Simulated)

For the MVP demo, we'll **simulate** MuleSoft integration with console logs and mock responses. This shows where MuleSoft would fit without needing actual MuleSoft setup.

### Backend Integration Points

In `cms-backend/src/services/mulesoft.ts`, create functions for each integration point:

```typescript
// Example integration functions

export async function fetchCustomerFromHBR(customerId: string) {
  console.log(`[MULESOFT → HBR] Fetching customer: ${customerId}`);
  // Simulate API call
  return { success: true, data: { /* customer data */ } };
}

export async function syncCardLockToHBR(cardId: string, isLocked: boolean) {
  console.log(`[CMS → MULESOFT → HBR] Syncing card lock: ${cardId}`);
  // Simulate API call
  return { success: true };
}

export async function fetchTransactionsFromHBR(accountId: string) {
  console.log(`[MULESOFT → HBR] Fetching transactions: ${accountId}`);
  // Simulate API call
  return { success: true, data: [ /* transactions */ ] };
}

export async function submitDisputeToHBR(disputeData: any) {
  console.log(`[CMS → MULESOFT → HBR Fraud System] Submitting dispute`);
  // Simulate API call
  return { success: true, disputeId: 'DSP123456' };
}
```

### Frontend Integration Indicators

Add visual indicators in the UI to show MuleSoft integration:

```typescript
// Example: After locking a card
<Toast>
  Card locked successfully
  ✓ Synced to Core Banking via MuleSoft
</Toast>
```

### Demo Script Addition

In your demo, mention:
- "Behind the scenes, MuleSoft is orchestrating this request to the HBR Core Banking System"
- "The 3-layer API architecture (Experience, Process, System) ensures scalability"
- Show console logs during demo to illustrate integration points

---

## 🧪 STEP 5: TESTING

### Backend Tests

```bash
npm install --save-dev jest supertest @types/jest
```

**Test Coverage:**
- Auth endpoints (login, logout)
- Card CRUD operations
- Transaction listing and filtering
- Alert management
- Dispute submission

**Run tests:**
```bash
npm test
```

### Frontend Tests

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

**Test Coverage:**
- Login flow
- Card listing
- Card lock/unlock
- Transaction filtering
- Dispute submission

**Run tests:**
```bash
npm run test
```

### Manual Testing Checklist

- [ ] Login/logout works
- [ ] Dashboard displays correctly
- [ ] Can view all cards
- [ ] Can lock/unlock cards
- [ ] Card controls update successfully
- [ ] Transactions load and filter
- [ ] Alerts display and can be managed
- [ ] Can submit dispute
- [ ] Can view PIN (with re-auth)
- [ ] Can change PIN
- [ ] Responsive on mobile
- [ ] No console errors

---

## 🚀 STEP 6: DEPLOYMENT

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/cms_production
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=15m
CORS_ORIGIN=https://your-frontend-url.com
MULESOFT_API_URL=https://mulesoft-integration-url.com
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=https://your-backend-url.com/api/v1
```

### Deployment Options

#### Option 1: Heroku (Easiest)

**Backend:**
```bash
cd cms-backend
heroku create cms-backend-demo
heroku addons:create heroku-postgresql:hobby-dev
git push heroku feature/cms:main
```

**Frontend:**
```bash
cd cms-frontend
npm run build
# Deploy dist/ folder to Netlify, Vercel, or S3
```

#### Option 2: AWS/Azure

- Backend: Deploy to EC2/App Service
- Frontend: Deploy to S3/CloudFront or Azure Blob Storage
- Database: RDS/Azure SQL

### Post-Deployment

1. **Seed production database** with demo data
2. **Test all endpoints** in production
3. **Verify frontend** connects to backend API
4. **Create demo user accounts**

---

## 📝 STEP 7: DOCUMENTATION

### Create Documentation Files

1. **README.md** - Project overview, setup instructions
2. **docs/API.md** - API documentation (copy from PRD)
3. **docs/ARCHITECTURE.md** - System architecture diagram
4. **docs/DEMO_SCRIPT.md** - Step-by-step demo walkthrough

### Demo Script

Create a detailed demo script with:
- What to show on screen
- What to say (talking points)
- Which features to highlight
- MuleSoft integration callouts
- Screenshots for each step

---

## ✅ ACCEPTANCE CRITERIA

The CMS is complete when:

- [ ] User can log in with demo credentials
- [ ] Dashboard displays cards and recent transactions
- [ ] User can lock/unlock cards instantly
- [ ] User can update card controls (limits, types, geographic)
- [ ] User can view transaction history with filtering
- [ ] User can view and manage alerts
- [ ] User can submit and track disputes
- [ ] User can view/change PIN and request replacement card
- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] Loading states and error handling work
- [ ] Backend logs show MuleSoft integration points
- [ ] Demo script is ready
- [ ] Application is deployed and accessible

---

## 🎯 CRITICAL SUCCESS FACTORS

1. **Build on Feature Branch:** All development on `feature/cms`, never touch `master` until ready
2. **Commit Frequently:** Small, meaningful commits with clear messages
3. **Test as You Build:** Don't wait until the end to test features
4. **Simulate MuleSoft:** Use console logs and mock data to show integration points
5. **Focus on Demo:** Build features that showcase MuleSoft value (real-time, integration, security)
6. **Polish UI:** Make it look professional, this is a customer-facing demo
7. **Document as You Go:** Don't leave documentation for the end

---

## 🆘 TROUBLESHOOTING

### Database Connection Issues
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify credentials

### CORS Errors
- Check CORS_ORIGIN in backend .env
- Ensure frontend API_BASE_URL is correct

### JWT Token Expiry
- Check JWT_EXPIRES_IN (15 minutes recommended for demo)
- Implement refresh token if needed

### Deployment Errors
- Check environment variables in production
- Verify database migrations ran
- Check logs for errors

---

## 📅 ESTIMATED TIMELINE

**Total: 4-5 weeks**

- Week 1: Backend foundation + auth + cards API
- Week 2: Frontend foundation + dashboard + card features
- Week 3: Transactions + alerts + disputes
- Week 4: Card services + MuleSoft integration + testing
- Week 5: Polish + deployment + documentation + demo prep

---

## 🎉 FINAL STEPS

When everything is built and tested on `feature/cms`:

1. **Create Pull Request**
   ```bash
   # On GitHub, create PR: feature/cms → master
   ```

2. **Review Changes**
   - Review all files changed
   - Ensure no breaking changes to HBR system
   - Check for any sensitive data

3. **Merge to Master**
   ```bash
   git checkout master
   git merge feature/cms --no-ff -m "feat: add Card Management System"
   git push origin master
   ```

4. **Deploy to Production**
   ```bash
   git push heroku master
   ```

5. **Test Production Deployment**
   - Verify all features work
   - Test with demo credentials
   - Run through demo script

6. **You're Ready to Demo!** 🚀

---

## 📞 QUESTIONS?

If you encounter issues or have questions during development:
- Check the PRD for detailed specifications
- Review the API documentation section
- Test each feature incrementally
- Use console logs liberally for debugging
- Commit often so you can roll back if needed

**Remember:** The goal is a working demo that showcases MuleSoft's integration capabilities for Financial Services. Focus on the features that best demonstrate this value!

---

**Good luck with the build!** 💪
