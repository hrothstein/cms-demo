# Card Management System - Admin Portal PRD

**Version:** 1.0 (Admin Interface)  
**Date:** October 6, 2025  
**Sprint:** Admin/CSR Portal  
**Target:** Internal Bank Operations Dashboard  
**Built On:** Existing CMS Backend (Heroku)

---

## Executive Summary

Build an **Admin/CSR Portal** for the Card Management System that allows bank employees (Customer Service Representatives, fraud analysts, supervisors) to view and manage all customer data, cards, transactions, disputes, and alerts across the entire system. This is the internal operations dashboard that complements the customer-facing app.

### Purpose

Enable bank staff to:
- Search and view any customer's data
- Monitor all cards and transactions system-wide
- Manage disputes and fraud cases
- View and respond to alerts
- Generate reports
- Support customers with card issues

### Architecture

```
Admin Portal (React)
       ↓
CMS Backend API (existing + new admin endpoints)
       ↓
PostgreSQL Database (existing + admin tables)
```

---

## Table of Contents

1. [Goals & Objectives](#goals--objectives)
2. [User Personas](#user-personas)
3. [Core Admin Features](#core-admin-features)
4. [Database Changes](#database-changes)
5. [Admin API Endpoints](#admin-api-endpoints)
6. [Admin UI Requirements](#admin-ui-requirements)
7. [Security & Permissions](#security--permissions)
8. [Implementation Plan](#implementation-plan)
9. [Demo Scenarios](#demo-scenarios)
10. [Cursor Build Prompt](#cursor-build-prompt)

---

## Goals & Objectives

### Primary Goal

Build a comprehensive admin portal that gives bank employees full visibility and control over all customer accounts, cards, transactions, and operations within the Card Management System.

### Key Requirements

- **System-wide view:** See all customers, not just one user's data
- **Search & filter:** Quickly find customers, cards, transactions
- **Dispute management:** Review and resolve fraud cases
- **Alert monitoring:** See all system alerts and take action
- **Customer support:** Tools to help customers with card issues
- **Reporting:** Generate reports on transactions, disputes, fraud
- **Audit trail:** Track all admin actions for compliance
- **Role-based access:** Different permissions for CSR vs. Supervisor vs. Admin

---

## User Personas

### 1. Customer Service Representative (CSR)
**Primary User**
- Handles customer inquiries about cards and transactions
- Needs to view customer card details and transaction history
- Can lock/unlock cards on behalf of customer
- Can view and update disputes
- Cannot delete data or change system settings

**Typical Tasks:**
- "Customer John Doe called about a suspicious transaction - let me look up his account"
- "Help customer update card spending limits"
- "View customer's recent transactions to troubleshoot declined payment"

### 2. Fraud Analyst
**Specialized User**
- Reviews fraud alerts and suspicious transactions
- Investigates dispute cases
- Can lock cards flagged for fraud
- Needs detailed transaction data and fraud scores
- Cannot approve new cards

**Typical Tasks:**
- "Review all high-severity fraud alerts from today"
- "Investigate transaction pattern for customer CUST-12345"
- "Lock card immediately due to confirmed fraud"

### 3. Supervisor/Manager
**Administrative User**
- Oversees CSR team operations
- Can approve/deny card requests
- Views team performance metrics
- Can close disputes and issue refunds
- Full read access to all data

**Typical Tasks:**
- "Approve new credit card application"
- "Review team's dispute resolution metrics"
- "Generate monthly transaction report"

### 4. System Administrator
**Technical User**
- Full system access
- Can manage admin users
- Can view audit logs
- Can modify system settings
- Emergency access to all functions

---

## Core Admin Features

### 1. Dashboard & Analytics

**Overview Dashboard:**
- Total active cards (system-wide)
- Total transactions today/this week/this month
- Open disputes count
- Unresolved alerts count
- Fraud alerts count
- Quick stats: total customers, locked cards, etc.

**Charts & Visualizations:**
- Transaction volume over time (line chart)
- Transactions by category (pie chart)
- Disputes by status (bar chart)
- Cards by status (active, locked, closed)
- Fraud detection rate

### 2. Customer Management

**Customer Search:**
- Search by: customer ID, name, email, phone, account number
- Filter by: status, card count, registration date
- Paginated results table

**Customer Detail View:**
- Customer profile information
- List of all cards for this customer
- Recent transactions (last 30 days)
- Open disputes
- Active alerts
- Account activity timeline
- Quick actions: lock all cards, view full history

### 3. Card Management

**Card Search:**
- Search by: card ID, last 4 digits, customer name, status
- Filter by: card type (debit/credit), card status, expiry date, brand
- Bulk actions: lock multiple cards, generate report

**Card Detail View:**
- Full card information (encrypted data visible to authorized users)
- Current card controls and limits
- Transaction history for this card
- Related disputes
- Related alerts
- Card lifecycle history (issued, activated, locked, etc.)

**Card Actions (Admin):**
- Lock/unlock card
- Update card controls
- View PIN (with additional authentication)
- Issue replacement card
- Close card permanently
- Add internal notes

### 4. Transaction Monitoring

**Transaction Search:**
- Search by: transaction ID, amount, merchant, customer
- Filter by: date range, status, category, amount range, fraud flag
- Advanced filters: international transactions, declined only, disputed only

**Transaction List View:**
- Paginated table with sortable columns
- Color-coded by status (approved=green, declined=red, disputed=yellow)
- Fraud score indicator
- Quick view modal for details

**Transaction Detail View:**
- Full transaction information
- Merchant details and location (map)
- Card used
- Customer information
- Fraud analysis details
- Timeline of transaction events
- Related alerts

**Transaction Actions:**
- Flag as suspicious
- Create alert
- Initiate dispute on behalf of customer
- Add internal notes
- Export transaction details

### 5. Dispute Management

**Dispute Dashboard:**
- All disputes system-wide
- Filter by: status, date range, amount, customer, resolution type
- Sort by: submission date, amount, priority

**Dispute Queue:**
- New disputes (need review)
- Under investigation
- Pending customer response
- Ready for resolution
- Resolved

**Dispute Detail View:**
- Full dispute information
- Related transaction details
- Customer description
- Supporting documents (if uploaded)
- Timeline of dispute activities
- Internal notes and investigation details
- Resolution options

**Dispute Actions:**
- Assign to analyst
- Update status
- Add internal notes
- Request additional info from customer
- Approve refund
- Deny dispute
- Close dispute with resolution notes

### 6. Alert Management

**Alert Dashboard:**
- All alerts system-wide
- Filter by: severity, type, status, date, customer
- Color-coded by severity

**Alert Types:**
- Fraud alerts (high priority)
- Large transaction alerts
- Card locked alerts
- Multiple failed attempts
- Unusual spending pattern
- International transaction alerts

**Alert Detail View:**
- Alert information
- Related card and customer
- Related transaction (if applicable)
- Recommended actions
- Investigation notes

**Alert Actions:**
- Mark as reviewed
- Escalate to fraud team
- Contact customer
- Lock card
- Create dispute
- Dismiss alert
- Add investigation notes

### 7. Card Request Management

**Request Queue:**
- All new card requests
- Replacement card requests
- Upgrade requests
- Filter by: status, card type, date

**Request Detail View:**
- Customer eligibility check
- Request details
- Credit check results (for credit cards)
- Approval/denial reason

**Request Actions:**
- Approve request
- Deny request (with reason)
- Request additional documentation
- Issue card immediately
- Track card shipment

### 8. Reporting & Analytics

**Pre-built Reports:**
- Daily transaction summary
- Weekly dispute report
- Monthly fraud analysis
- Card issuance report
- Customer activity report
- Declined transactions report

**Custom Reports:**
- Select date range
- Choose metrics and dimensions
- Filter by customer segment, card type, etc.
- Export to CSV/PDF

**Report Contents:**
- Transaction volume and value
- Dispute statistics
- Fraud detection rates
- Card activation rates
- Customer engagement metrics
- Average transaction amount
- Merchant category breakdown

### 9. Audit Logging

**Audit Trail:**
- All admin actions logged
- View by: admin user, action type, date range, customer affected
- Cannot be modified or deleted

**Logged Actions:**
- Customer searches
- Card locks/unlocks
- Card control changes
- Dispute updates
- Alert actions
- Report generation
- Admin user logins

**Audit Log Detail:**
- Timestamp
- Admin user
- Action performed
- Target (customer/card/transaction ID)
- Before/after values (for updates)
- IP address
- User agent

---

## Database Changes

### New Tables

#### admin_users Table

```sql
CREATE TABLE admin_users (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- CSR, FRAUD_ANALYST, SUPERVISOR, ADMIN
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_username ON admin_users(username);
CREATE INDEX idx_admin_role ON admin_users(role);
```

#### audit_logs Table

```sql
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(admin_id),
    action_type VARCHAR(100) NOT NULL,  -- CUSTOMER_SEARCH, CARD_LOCK, DISPUTE_UPDATE, etc.
    target_type VARCHAR(50) NOT NULL,   -- CUSTOMER, CARD, TRANSACTION, DISPUTE, etc.
    target_id VARCHAR(100),
    action_description TEXT NOT NULL,
    before_value JSONB,
    after_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_action ON audit_logs(action_type);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at DESC);
```

#### admin_notes Table

```sql
CREATE TABLE admin_notes (
    note_id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(admin_id),
    note_type VARCHAR(50) NOT NULL,  -- CUSTOMER, CARD, TRANSACTION, DISPUTE
    reference_id VARCHAR(100) NOT NULL,
    note_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,  -- Internal notes vs. customer-visible
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_reference ON admin_notes(note_type, reference_id);
CREATE INDEX idx_notes_admin ON admin_notes(admin_id);
```

### Schema Updates

#### Add admin-specific fields to existing tables:

```sql
-- Add to disputes table
ALTER TABLE disputes ADD COLUMN assigned_to INTEGER REFERENCES admin_users(admin_id);
ALTER TABLE disputes ADD COLUMN resolved_by INTEGER REFERENCES admin_users(admin_id);

-- Add to cards table
ALTER TABLE cards ADD COLUMN locked_by INTEGER REFERENCES admin_users(admin_id);
ALTER TABLE cards ADD COLUMN locked_at TIMESTAMP;

-- Add to alerts table
ALTER TABLE alerts ADD COLUMN reviewed_by INTEGER REFERENCES admin_users(admin_id);
ALTER TABLE alerts ADD COLUMN reviewed_at TIMESTAMP;
```

---

## Admin API Endpoints

### Authentication

#### POST /api/v1/admin/auth/login
Admin login (separate from customer login)

**Request:**
```json
{
  "username": "admin.user",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "admin-jwt-token",
    "adminId": 1,
    "username": "admin.user",
    "role": "CSR",
    "permissions": ["VIEW_CUSTOMERS", "VIEW_CARDS", "LOCK_CARDS"],
    "expiresIn": 3600
  }
}
```

---

### Customer Management

#### GET /api/v1/admin/customers
Search/list all customers

**Query Parameters:**
- `search`: Search term (name, email, customer ID)
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset
- `status`: Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "customerId": "CUST-12345",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-212-555-0123",
      "accountNumber": "ACC-789456123",
      "cardCount": 2,
      "activeCardCount": 2,
      "totalTransactions": 156,
      "openDisputes": 0,
      "accountStatus": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 523,
    "limit": 20,
    "offset": 0
  }
}
```

#### GET /api/v1/admin/customers/:customerId
Get detailed customer information

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "CUST-12345",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-212-555-0123",
    "accountNumber": "ACC-789456123",
    "cards": [
      {
        "cardId": "CRD-0001",
        "cardLastFour": "4532",
        "cardType": "DEBIT",
        "cardStatus": "ACTIVE"
      }
    ],
    "recentTransactions": [],
    "openDisputes": [],
    "activeAlerts": [],
    "accountCreatedAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2025-10-06T09:15:00Z"
  }
}
```

---

### Card Management

#### GET /api/v1/admin/cards
Search all cards system-wide

**Query Parameters:**
- `search`: Card ID, last 4 digits, customer name
- `status`: ACTIVE, LOCKED, CLOSED, EXPIRED
- `cardType`: DEBIT, CREDIT, PREPAID
- `limit`, `offset`: Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "cardId": "CRD-0001",
      "customerId": "CUST-12345",
      "customerName": "John Doe",
      "cardLastFour": "4532",
      "cardType": "DEBIT",
      "cardBrand": "VISA",
      "cardStatus": "ACTIVE",
      "expiryDate": "2028-01-31",
      "dailyLimit": 1000.00,
      "lastTransactionDate": "2025-10-05T18:45:22Z"
    }
  ],
  "pagination": {
    "total": 1247,
    "limit": 20,
    "offset": 0
  }
}
```

#### POST /api/v1/admin/cards/:cardId/lock
Admin locks a card

**Request:**
```json
{
  "reason": "FRAUD_SUSPECTED",
  "notes": "Customer reported suspicious activity"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Card locked by admin",
  "data": {
    "cardId": "CRD-0001",
    "previousStatus": "ACTIVE",
    "newStatus": "LOCKED",
    "lockedBy": "admin.user",
    "lockedAt": "2025-10-06T10:35:12Z"
  }
}
```

#### PUT /api/v1/admin/cards/:cardId/controls
Admin updates card controls

---

### Transaction Management

#### GET /api/v1/admin/transactions
Search all transactions system-wide

**Query Parameters:**
- `search`: Transaction ID, customer, merchant
- `startDate`, `endDate`: Date range
- `minAmount`, `maxAmount`: Amount range
- `status`: APPROVED, DECLINED, DISPUTED
- `category`: Merchant category
- `fraudFlag`: true/false
- `limit`, `offset`: Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "transactionId": "TXN-20251005-789456",
      "cardId": "CRD-0001",
      "customerId": "CUST-12345",
      "customerName": "John Doe",
      "transactionDate": "2025-10-05T18:45:22Z",
      "merchant": {
        "name": "Starbucks Coffee #2547",
        "category": "DINING"
      },
      "amount": 5.75,
      "currency": "USD",
      "status": "APPROVED",
      "fraudScore": 0.05,
      "fraudFlag": false,
      "isDisputed": false
    }
  ],
  "pagination": {
    "total": 15643,
    "limit": 50,
    "offset": 0
  },
  "summary": {
    "totalAmount": 456789.12,
    "averageAmount": 29.18,
    "approvedCount": 15520,
    "declinedCount": 123
  }
}
```

#### POST /api/v1/admin/transactions/:transactionId/flag
Flag transaction as suspicious

**Request:**
```json
{
  "reason": "UNUSUAL_AMOUNT",
  "notes": "Transaction amount 10x customer average"
}
```

---

### Dispute Management

#### GET /api/v1/admin/disputes
List all disputes

**Query Parameters:**
- `status`: SUBMITTED, UNDER_REVIEW, RESOLVED, DENIED
- `priority`: HIGH, MEDIUM, LOW
- `assignedTo`: Admin user ID
- `startDate`, `endDate`: Date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "disputeId": "DSP-0042",
      "transactionId": "TXN-20251004-456789",
      "customerId": "CUST-12345",
      "customerName": "John Doe",
      "disputeAmount": 156.99,
      "disputeReason": "UNAUTHORIZED_TRANSACTION",
      "status": "UNDER_REVIEW",
      "disputeDate": "2025-10-06",
      "assignedTo": "fraud.analyst",
      "priority": "HIGH",
      "daysOpen": 3
    }
  ],
  "pagination": {
    "total": 47,
    "limit": 20,
    "offset": 0
  },
  "summary": {
    "newDisputes": 12,
    "underReview": 25,
    "resolved": 8,
    "denied": 2
  }
}
```

#### PUT /api/v1/admin/disputes/:disputeId
Update dispute status

**Request:**
```json
{
  "status": "RESOLVED",
  "resolutionNotes": "Refund approved. Transaction confirmed as fraudulent.",
  "refundAmount": 156.99,
  "resolvedBy": 5
}
```

#### POST /api/v1/admin/disputes/:disputeId/assign
Assign dispute to analyst

**Request:**
```json
{
  "assignedTo": 3
}
```

---

### Alert Management

#### GET /api/v1/admin/alerts
List all system alerts

**Query Parameters:**
- `severity`: LOW, MEDIUM, HIGH, CRITICAL
- `type`: FRAUD_ALERT, LARGE_TRANSACTION, CARD_LOCKED, etc.
- `status`: NEW, REVIEWED, RESOLVED
- `startDate`, `endDate`: Date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "alertId": 125,
      "customerId": "CUST-12345",
      "customerName": "John Doe",
      "cardId": "CRD-0001",
      "alertType": "FRAUD_ALERT",
      "severity": "HIGH",
      "alertDate": "2025-10-05T22:15:30Z",
      "alertTitle": "Unusual Transaction Detected",
      "alertMessage": "Transaction of $845.00 flagged as unusual",
      "relatedTransactionId": "TXN-20251005-998877",
      "status": "NEW",
      "actionRequired": true
    }
  ],
  "pagination": {
    "total": 89,
    "limit": 20,
    "offset": 0
  },
  "summary": {
    "criticalAlerts": 5,
    "highAlerts": 15,
    "newAlerts": 34,
    "requireAction": 12
  }
}
```

#### PUT /api/v1/admin/alerts/:alertId/review
Mark alert as reviewed

**Request:**
```json
{
  "reviewedBy": 2,
  "reviewNotes": "Contacted customer. Confirmed transaction is legitimate.",
  "actionTaken": "DISMISSED"
}
```

---

### Reporting

#### GET /api/v1/admin/reports/dashboard
Get dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 523,
    "totalCards": 1247,
    "activeCards": 1089,
    "lockedCards": 23,
    "transactionsToday": 456,
    "transactionsThisWeek": 3421,
    "transactionsThisMonth": 15643,
    "transactionVolumeToday": 12456.78,
    "openDisputes": 47,
    "unresolvedAlerts": 89,
    "criticalAlerts": 5
  }
}
```

#### POST /api/v1/admin/reports/generate
Generate custom report

**Request:**
```json
{
  "reportType": "TRANSACTIONS",
  "startDate": "2025-10-01",
  "endDate": "2025-10-06",
  "groupBy": "CATEGORY",
  "filters": {
    "minAmount": 100,
    "status": "APPROVED"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "RPT-20251006-001",
    "reportUrl": "/api/v1/admin/reports/download/RPT-20251006-001",
    "generatedAt": "2025-10-06T11:00:00Z",
    "summary": {
      "totalTransactions": 1523,
      "totalAmount": 45678.90
    }
  }
}
```

---

### Audit Logs

#### GET /api/v1/admin/audit-logs
View audit trail

**Query Parameters:**
- `adminId`: Filter by admin user
- `actionType`: Filter by action
- `targetType`: CUSTOMER, CARD, TRANSACTION, etc.
- `startDate`, `endDate`: Date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "logId": 12345,
      "adminId": 2,
      "adminUsername": "john.csr",
      "actionType": "CARD_LOCK",
      "targetType": "CARD",
      "targetId": "CRD-0001",
      "actionDescription": "Admin locked card CRD-0001",
      "beforeValue": {"cardStatus": "ACTIVE"},
      "afterValue": {"cardStatus": "LOCKED"},
      "ipAddress": "192.168.1.100",
      "createdAt": "2025-10-06T10:35:12Z"
    }
  ],
  "pagination": {
    "total": 5643,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Admin Notes

#### GET /api/v1/admin/notes/:referenceType/:referenceId
Get notes for a customer/card/transaction

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "noteId": 456,
      "adminId": 2,
      "adminName": "John CSR",
      "noteText": "Customer called about transaction - confirmed legitimate",
      "isInternal": true,
      "createdAt": "2025-10-06T09:30:00Z"
    }
  ]
}
```

#### POST /api/v1/admin/notes
Add note

**Request:**
```json
{
  "noteType": "CUSTOMER",
  "referenceId": "CUST-12345",
  "noteText": "Customer called about suspicious transaction. Verified identity via security questions.",
  "isInternal": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "noteId": 457,
    "createdAt": "2025-10-06T11:00:00Z"
  }
}
```

---

## Admin UI Requirements

### Technology Stack
- **Frontend Framework:** React + Vite (same as customer app)
- **UI Library:** Tailwind CSS + shadcn/ui components
- **Routing:** React Router
- **State Management:** React Query + Zustand
- **Charts:** Recharts or Chart.js
- **Tables:** TanStack Table (React Table)
- **Forms:** React Hook Form

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Top Navigation Bar                                      │
│  [Logo] [Dashboard] [Customers] [Cards] [Transactions]  │
│         [Disputes] [Alerts] [Reports] [Admin: John CSR ▼]│
└─────────────────────────────────────────────────────────┘
│                                                           │
│  Main Content Area                                        │
│  - Dashboard widgets                                      │
│  - Search results tables                                  │
│  - Detail views                                           │
│  - Forms and modals                                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Key Pages/Routes

| Route | Description |
|-------|-------------|
| `/admin` | Redirect to dashboard |
| `/admin/login` | Admin login page |
| `/admin/dashboard` | Main dashboard with stats |
| `/admin/customers` | Customer search and list |
| `/admin/customers/:id` | Customer detail view |
| `/admin/cards` | Card search and list |
| `/admin/cards/:id` | Card detail view |
| `/admin/transactions` | Transaction search and list |
| `/admin/transactions/:id` | Transaction detail view |
| `/admin/disputes` | Dispute queue and list |
| `/admin/disputes/:id` | Dispute detail and management |
| `/admin/alerts` | Alert dashboard |
| `/admin/alerts/:id` | Alert detail view |
| `/admin/reports` | Report generation and list |
| `/admin/audit-logs` | Audit trail viewer |
| `/admin/settings` | Admin user settings |

### Dashboard Components

**Stats Cards (Top Row):**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Cards  │ │ Transactions │ │ Open         │ │ Critical     │
│              │ │ Today        │ │ Disputes     │ │ Alerts       │
│ 1,247        │ │ 456          │ │ 47           │ │ 5            │
│ ↑ 12 active  │ │ $12,456.78   │ │ ↑ 3 new      │ │ ⚠️ Review    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Charts (Middle Section):**
- Transaction volume over time (line chart)
- Transactions by category (pie chart)
- Dispute resolution rate (bar chart)

**Recent Activity Tables (Bottom Section):**
- Recent disputes (last 10)
- Recent fraud alerts (last 10)
- Recent admin actions (last 10)

### Customer Search/List Page

**Search Bar:**
```
┌──────────────────────────────────────────────────────────┐
│ 🔍 Search customers by name, email, customer ID...       │
└──────────────────────────────────────────────────────────┘

[Filters: ▼ Status] [▼ Card Type] [▼ Date Range] [Clear]
```

**Results Table:**
```
┌────────────┬──────────────┬────────────────────┬───────┬──────────┐
│ Customer ID│ Name         │ Email              │ Cards │ Status   │
├────────────┼──────────────┼────────────────────┼───────┼──────────┤
│ CUST-12345 │ John Doe     │ john.doe@ex.com   │ 2     │ Active   │
│ CUST-12346 │ Jane Smith   │ jane.smith@ex.com │ 3     │ Active   │
│ CUST-12347 │ Bob Johnson  │ bob.j@example.com │ 1     │ Locked   │
└────────────┴──────────────┴────────────────────┴───────┴──────────┘
[← Previous] [Page 1 of 27] [Next →]
```

### Customer Detail Page

**Header:**
```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Customers                                       │
│                                                           │
│ John Doe                                    [+ Add Note]  │
│ CUST-12345 | john.doe@example.com                        │
│ Account: ACC-789456123 | Member since: Jan 15, 2024      │
│                                                           │
│ [Lock All Cards] [View Full History] [Contact Customer]  │
└──────────────────────────────────────────────────────────┘
```

**Tabs:**
- **Overview:** Summary stats, recent activity
- **Cards (2):** List of customer's cards
- **Transactions:** Recent transactions
- **Disputes (0):** Open/closed disputes
- **Alerts (1):** Active alerts
- **Notes (3):** Internal notes
- **Audit Log:** Actions on this customer

### Card Detail Page

**Card Visual:**
```
┌─────────────────────────────────────┐
│ 💳 VISA Debit                       │
│                                     │
│ •••• •••• •••• 4532                 │
│                                     │
│ JOHN DOE                 01/28      │
│                                     │
│ Status: 🟢 ACTIVE                   │
└─────────────────────────────────────┘

[🔒 Lock Card] [✏️ Edit Controls] [🔄 Replace Card]
```

**Card Info Tabs:**
- **Details:** Full card information
- **Controls:** Limits and toggles
- **Transactions:** Transaction history
- **Alerts:** Related alerts
- **History:** Card lifecycle events

### Transaction Search Page

**Advanced Filters:**
```
┌──────────────────────────────────────────────────────────┐
│ Date Range: [Oct 1, 2025] to [Oct 6, 2025]              │
│ Amount: [$0] to [$999,999]                               │
│ Status: [All ▼] Category: [All ▼] Fraud: [All ▼]        │
│ [Search] [Clear Filters] [Export CSV]                    │
└──────────────────────────────────────────────────────────┘
```

**Transaction Table:**
```
┌─────────────┬──────────┬──────────────┬──────────┬────────┬──────┐
│ Date/Time   │ Customer │ Merchant     │ Amount   │ Status │ Fraud│
├─────────────┼──────────┼──────────────┼──────────┼────────┼──────┤
│ Oct 5 18:45 │ John Doe │ Starbucks    │ $5.75    │ ✅ APP │ 0.05 │
│ Oct 5 17:30 │ Jane S.  │ Best Buy     │ $899.00  │ ❌ DEC │ 0.85 │
│ Oct 5 15:20 │ Bob J.   │ Shell Gas    │ $45.00   │ ✅ APP │ 0.02 │
└─────────────┴──────────┴──────────────┴──────────┴────────┴──────┘
```

### Dispute Management Page

**Dispute Queue (Kanban-style):**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ New (12)    │ │ Reviewing   │ │ Pending     │ │ Resolved    │
│             │ │ (25)        │ │ (8)         │ │ (2)         │
├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤
│ DSP-0042    │ │ DSP-0038    │ │ DSP-0035    │ │ DSP-0032    │
│ $156.99     │ │ $45.00      │ │ $234.50     │ │ $67.89      │
│ John Doe    │ │ Jane Smith  │ │ Bob Johnson │ │ Mary Davis  │
│ 🔴 HIGH     │ │ 🟡 MEDIUM   │ │ 🟢 LOW      │ │ ✅ APPROVED │
│ [View]      │ │ [View]      │ │ [View]      │ │ [View]      │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### Dispute Detail Page

**Dispute Header:**
```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Disputes                                        │
│                                                           │
│ Dispute #DSP-0042                         🔴 HIGH PRIORITY│
│ Status: Under Review | Assigned to: fraud.analyst        │
│                                                           │
│ [Approve Refund] [Deny] [Request Info] [Escalate]       │
└──────────────────────────────────────────────────────────┘
```

**Dispute Details:**
```
Transaction: TXN-20251004-456789
Amount: $156.99
Date: Oct 4, 2025
Merchant: Electronics Store, Miami FL

Customer: John Doe (CUST-12345)
Card: •••• 4532 (Visa Debit)

Reason: Unauthorized Transaction
Customer Statement: "I did not make this transaction. My card was 
in my possession at the time."

Investigation Notes:
- Oct 6 10:30 AM: Case assigned to fraud analyst
- Oct 6 11:15 AM: Reviewed transaction pattern - matches fraud signature
- Oct 6 2:00 PM: Card locked as precaution

[Add Investigation Note] [View Transaction Details]
```

### Alert Dashboard

**Alert Summary Cards:**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Critical (5) │ │ High (15)    │ │ Medium (34)  │ │ Low (35)     │
│ ⚠️ Immediate  │ │ 🔴 Review    │ │ 🟡 Monitor   │ │ 🟢 Info      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Alert List (Filterable):**
```
┌────────┬──────────┬─────────────────────┬──────────┬────────┬────────┐
│ Time   │ Customer │ Alert Type          │ Details  │ Status │ Action │
├────────┼──────────┼─────────────────────┼──────────┼────────┼────────┤
│ 22:15  │ John Doe │ 🔴 Fraud Alert      │ $845.00  │ NEW    │ [View] │
│ 18:30  │ Jane S.  │ 🟡 Large Transaction│ $500.00  │ NEW    │ [View] │
│ 15:20  │ Bob J.   │ 🟢 Card Locked      │ By user  │ READ   │ [View] │
└────────┴──────────┴─────────────────────┴──────────┴────────┴────────┘
```

### Reports Page

**Report Templates:**
```
┌──────────────────────────────────────┐
│ 📊 Pre-built Reports                 │
├──────────────────────────────────────┤
│ □ Daily Transaction Summary          │
│ □ Weekly Dispute Report              │
│ □ Monthly Fraud Analysis             │
│ □ Card Issuance Report               │
│ □ Declined Transactions Report       │
│                                      │
│ [Generate Selected Reports]          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 🔧 Custom Report Builder             │
├──────────────────────────────────────┤
│ Date Range: [Oct 1] to [Oct 6]      │
│ Report Type: [Transactions ▼]        │
│ Group By: [Category ▼]               │
│ Filters: [Add Filter +]              │
│                                      │
│ [Generate Report] [Save Template]    │
└──────────────────────────────────────┘
```

### Design Requirements

**Color Scheme:**
- Primary: Blue (#1f4788) - professional banking color
- Success: Green (#10b981) - approved transactions
- Warning: Yellow/Orange (#f59e0b) - alerts, warnings
- Danger: Red (#ef4444) - critical alerts, declined
- Gray: (#6b7280) - neutral, inactive

**Typography:**
- Headings: Inter or similar sans-serif
- Body: System fonts for fast loading
- Monospace: For card numbers, transaction IDs

**Responsive Design:**
- Desktop-first (admins typically use desktops)
- Minimum width: 1280px recommended
- Tables should scroll horizontally if needed
- Mobile-friendly for emergency access

**Accessibility:**
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- High contrast mode option

---

## Security & Permissions

### Role-Based Access Control (RBAC)

| Permission | CSR | Fraud Analyst | Supervisor | Admin |
|------------|-----|---------------|------------|-------|
| View customers | ✅ | ✅ | ✅ | ✅ |
| View cards | ✅ | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ | ✅ |
| Lock/unlock cards | ✅ | ✅ | ✅ | ✅ |
| Update card controls | ✅ | ✅ | ✅ | ✅ |
| View full card number | ❌ | ✅ | ✅ | ✅ |
| View disputes | ✅ | ✅ | ✅ | ✅ |
| Update disputes | ❌ | ✅ | ✅ | ✅ |
| Approve refunds | ❌ | ❌ | ✅ | ✅ |
| View alerts | ✅ | ✅ | ✅ | ✅ |
| Dismiss alerts | ❌ | ✅ | ✅ | ✅ |
| Generate reports | ✅ | ✅ | ✅ | ✅ |
| View audit logs | ❌ | ❌ | ✅ | ✅ |
| Manage admin users | ❌ | ❌ | ❌ | ✅ |

### Authentication & Security

**Admin Authentication:**
- Separate login from customer app
- JWT tokens with shorter expiration (1 hour)
- Require re-authentication for sensitive actions
- Multi-factor authentication (MFA) required for Admin role
- IP whitelist option for corporate network

**Session Management:**
- Auto-logout after 30 minutes of inactivity
- Concurrent session detection
- Force logout capability (by supervisor)

**Audit Logging:**
- ALL admin actions logged (no exceptions)
- Logs cannot be deleted or modified
- Retention: 7 years for compliance
- Regular audit log reviews by supervisors

**Data Access:**
- Principle of least privilege
- Need-to-know basis for customer PII
- Encrypted data at rest and in transit
- Mask sensitive data by default (show full with explicit action)

**Security Headers:**
- CSP (Content Security Policy)
- X-Frame-Options: DENY
- Strict-Transport-Security
- X-Content-Type-Options: nosniff

---

## Implementation Plan

### Sprint Breakdown (2-3 weeks)

#### Week 1: Backend & Database

**Days 1-2: Database Setup**
- Create admin_users table
- Create audit_logs table
- Create admin_notes table
- Update existing tables with admin fields
- Create demo admin users with different roles

**Days 3-5: Admin API Endpoints**
- Admin authentication endpoints
- Customer management endpoints
- Card management endpoints (admin views)
- Basic reporting endpoints

#### Week 2: Core Admin APIs & Frontend Setup

**Days 1-2: More Admin APIs**
- Transaction search endpoints
- Dispute management endpoints
- Alert management endpoints
- Audit log endpoints

**Days 3-5: Frontend Foundation**
- Set up React admin app structure
- Admin login page
- Dashboard page with stats
- Navigation and layout
- Admin context/auth

#### Week 3: Admin UI & Polish

**Days 1-2: Search & List Pages**
- Customer search and list
- Card search and list
- Transaction search and list

**Days 3-4: Detail Pages & Management**
- Customer detail page
- Card detail page
- Dispute management UI
- Alert management UI

**Day 5: Testing & Polish**
- Test all admin features
- Add loading states
- Error handling
- Demo data verification
- Documentation

---

## Demo Scenarios

### Scenario 1: Customer Service Call
**Role: CSR**

1. Customer John Doe calls about a declined transaction
2. CSR logs into admin portal
3. Search for "John Doe" or "CUST-12345"
4. View customer detail page
5. Navigate to transactions tab
6. Find the declined transaction
7. See decline reason: "Daily limit exceeded"
8. Check card controls - daily limit is $1000
9. Add note: "Customer called about declined transaction. Explained daily limit."
10. Advise customer they can increase limit in their app

### Scenario 2: Fraud Investigation
**Role: Fraud Analyst**

1. Analyst reviews fraud alert dashboard
2. See HIGH priority alert for Jane Smith - $845 Electronics Store transaction
3. Click alert to view details
4. Review transaction: unusual amount, unusual merchant, location mismatch
5. View Jane's transaction history - typical transactions are $10-$50
6. Fraud score: 0.85 (high risk)
7. Decision: Lock card immediately
8. Create dispute on behalf of customer
9. Assign dispute to self for investigation
10. Add investigation note
11. System sends alert to customer

### Scenario 3: Dispute Resolution
**Role: Supervisor**

1. View dispute queue
2. See DSP-0042 in "Under Review" column
3. Click to view dispute details
4. Review fraud analyst's investigation notes
5. Review transaction evidence
6. Transaction confirmed as fraudulent
7. Approve refund: $156.99
8. Update dispute status to "Resolved"
9. Add resolution notes
10. System processes refund and notifies customer

### Scenario 4: Reporting
**Role: Supervisor**

1. Navigate to Reports page
2. Select "Daily Transaction Summary"
3. Set date: October 6, 2025
4. Generate report
5. View results:
   - Total transactions: 456
   - Total volume: $12,456.78
   - Approval rate: 97.3%
   - Fraud rate: 0.4%
6. Export to PDF for management meeting

### Scenario 5: Audit Review
**Role: Admin**

1. Navigate to Audit Logs
2. Filter by date: Last 7 days
3. Filter by admin: "john.csr"
4. Review all actions taken by CSR
5. Notice multiple customer searches
6. Verify all actions are legitimate
7. Generate audit report for compliance

---

## Success Criteria

### Functional Requirements
- ✅ Admin can search and view all customers
- ✅ Admin can search and view all cards
- ✅ Admin can search and view all transactions
- ✅ Admin can lock/unlock cards
- ✅ Admin can manage disputes
- ✅ Admin can review and act on alerts
- ✅ Admin can generate reports
- ✅ All admin actions are logged
- ✅ Role-based permissions enforced

### Performance Requirements
- Dashboard loads in < 2 seconds
- Search results return in < 1 second
- All API calls respond in < 500ms
- Support 50+ concurrent admin users

### Security Requirements
- All admin actions audited
- Sensitive data encrypted
- Role-based access enforced
- Session management secure
- MFA for admin roles

### Usability Requirements
- Intuitive navigation
- Clear visual hierarchy
- Helpful error messages
- Responsive design
- Keyboard shortcuts for power users

---

## Out of Scope (Future Enhancements)

- Advanced fraud detection rules engine
- Automated dispute processing
- Customer communication tools (email/SMS from admin)
- Bulk operations (lock 100 cards at once)
- Advanced analytics and BI dashboards
- Mobile admin app
- Real-time chat with customers
- Workflow automation
- Custom report scheduler
- Data export to external systems

---

# Cursor Build Prompt

## 🚨 CRITICAL: Build Admin INTO Existing App 🚨

**DO NOT create a separate admin application. DO NOT create new Heroku apps.**

```
✅ CORRECT APPROACH:
cms-webapp/
├── frontend/
│   ├── pages/
│   │   ├── Login.jsx          ← EXISTING customer pages
│   │   ├── Dashboard.jsx      ← EXISTING
│   │   └── admin/             ← ADD admin pages HERE
│   │       ├── AdminLogin.jsx
│   │       └── AdminDashboard.jsx

❌ WRONG APPROACH:
cms-webapp/              ← existing app
admin-webapp/            ← DON'T create this!
```

You are **ADDING** admin functionality to the EXISTING CMS web application. Same codebase, same deployment, two interfaces (customer + admin).

---

## 🔀 Git Workflow - MUST DO FIRST!

**BEFORE writing any code, set up Git branches properly:**

### Step 1: Backup Current Master Branch
```bash
# Make sure you're on master and it's up to date
git checkout master
git pull origin master

# Create a backup branch (snapshot of working customer app)
git checkout -b master-backup-before-admin
git push origin master-backup-before-admin

# Confirm backup exists
git branch -a
# You should see: master-backup-before-admin
```

### Step 2: Create Feature Branch for Admin Portal
```bash
# Go back to master
git checkout master

# Create new feature branch for admin work
git checkout -b feature/admin-portal

# Confirm you're on the new branch
git branch
# You should see: * feature/admin-portal
```

### Step 3: Work on Feature Branch
```bash
# All your admin development happens on feature/admin-portal
# Make commits as you build:

git add .
git commit -m "Add admin database tables and migrations"

git add .
git commit -m "Add admin API routes and authentication"

git add .
git commit -m "Add admin frontend pages and components"

# Push feature branch to GitHub
git push origin feature/admin-portal
```

### Step 4: After Sprint Complete - Create Pull Request
```bash
# Push final changes
git add .
git commit -m "Complete admin portal implementation"
git push origin feature/admin-portal

# Then on GitHub:
# 1. Go to repository
# 2. Click "Pull Requests"
# 3. Click "New Pull Request"
# 4. Base: master <- Compare: feature/admin-portal
# 5. Create PR for review
# 6. After approval, merge to master
```

### Git Branch Strategy Summary:
```
master                    ← Production customer app (don't touch during sprint)
  ├── master-backup-before-admin  ← Safety backup (snapshot before changes)
  └── feature/admin-portal        ← YOUR WORK GOES HERE
          ↓
      [After review & approval]
          ↓
        master              ← Merge back when ready
```

### Important Git Rules:
- ✅ DO: Work on `feature/admin-portal` branch
- ✅ DO: Commit frequently with clear messages
- ✅ DO: Push to GitHub regularly
- ❌ DON'T: Commit directly to `master` during development
- ❌ DON'T: Delete `master-backup-before-admin` (it's your safety net)

---

## Build the Admin Portal for Card Management System

You are building an **Admin/CSR Portal** for the existing Card Management System. This is an internal tool for bank employees to view and manage all customer data, cards, transactions, disputes, and alerts.

### System Architecture

**IMPORTANT:** This is ONE application with TWO interfaces (customer + admin), not two separate apps.

```
┌─────────────────────────────────────────────────────────────┐
│                    CMS Web Application                       │
│                  (Single React + Node.js App)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
┌───────────────────┐                    ┌──────────────────────┐
│  Customer Routes  │                    │    Admin Routes      │
│  /login           │                    │  /admin/login        │
│  /dashboard       │                    │  /admin/dashboard    │
│  /cards           │                    │  /admin/customers    │
│  /transactions    │                    │  /admin/cards        │
│  ...              │                    │  /admin/transactions │
└─────────┬─────────┘                    │  /admin/disputes     │
          │                              │  /admin/alerts       │
          │                              │  ...                 │
          │                              └──────────┬───────────┘
          │                                         │
          └─────────────────┬───────────────────────┘
                            ↓
                ┌───────────────────────┐
                │   Backend API Server  │
                │   (Node.js/Express)   │
                └───────────┬───────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                 ┌─────────────────────┐
│  Customer API    │                 │    Admin API        │
│  /api/v1/auth    │                 │  /api/v1/admin/auth │
│  /api/v1/cards   │                 │  /api/v1/admin/...  │
│  /api/v1/trans.. │                 │                     │
└────────┬─────────┘                 └──────────┬──────────┘
         │                                      │
         └──────────────┬───────────────────────┘
                        ↓
              ┌──────────────────┐
              │   PostgreSQL DB  │
              │   - cards        │
              │   - transactions │
              │   - customers    │
              │   - admin_users  │ ← NEW
              │   - audit_logs   │ ← NEW
              │   - admin_notes  │ ← NEW
              └──────────────────┘
```

**Key Points:**
- Same frontend app, different routes (`/` vs `/admin/*`)
- Same backend app, different API routes (`/api/v1/*` vs `/api/v1/admin/*`)
- Same database, new tables for admin functionality
- Different authentication tokens (customer JWT vs admin JWT)
- Different layouts and navigation
- Deploy to EXISTING Heroku apps

The CMS backend and customer-facing frontend are already deployed:
- **Backend API:** https://cms-backend-1759769281-c3f75c1b055e.herokuapp.com/
- **Customer App:** https://cms-frontend-1759769376-89e39b75295e.herokuapp.com/
- **Database:** PostgreSQL with cards, transactions, disputes, alerts tables

### What You Need to Build

**IMPORTANT:** Build admin features INTO the existing CMS app, not as a separate application.

1. **Backend Extensions (Node.js/Express):**
   - New database tables: `admin_users`, `audit_logs`, `admin_notes`
   - Update existing tables with admin fields
   - Admin API endpoints under `/api/v1/admin/*` routes (all endpoints in Section 5 of PRD)
   - Admin authentication middleware (separate from customer auth)
   - Role-based access control middleware
   - Audit logging middleware
   - Admin seed data (4-5 admin users with different roles)

2. **Frontend Admin Portal (Same React App):**
   - Add admin routes under `/admin/*` path
   - Admin pages listed in Section 6 of PRD
   - Dashboard with statistics and charts
   - Customer/card/transaction search with filters
   - Dispute management interface
   - Alert monitoring dashboard
   - Report generation
   - Audit log viewer
   - Separate admin layout/navigation from customer layout

3. **Deployment:**
   - Deploy to EXISTING Heroku apps (no new apps needed)
   - Backend: Add admin routes to existing backend
   - Frontend: Add admin pages to existing frontend
   - Use route-based authentication (customer vs admin routes)

### Project Structure

**IMPORTANT:** Add admin features to the EXISTING cms-webapp, don't create a new app.

```
cms-webapp/
├── backend/                   # EXISTING backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js        # EXISTING: Customer auth
│   │   │   ├── cards.js       # EXISTING: Customer card routes
│   │   │   ├── transactions.js # EXISTING: Customer transaction routes
│   │   │   └── admin/         # NEW: Admin routes
│   │   │       ├── auth.js    # NEW: Admin authentication
│   │   │       ├── customers.js # NEW: Admin customer management
│   │   │       ├── cards.js   # NEW: Admin card management
│   │   │       ├── transactions.js # NEW: Admin transaction management
│   │   │       ├── disputes.js # NEW: Admin dispute management
│   │   │       ├── alerts.js  # NEW: Admin alert management
│   │   │       ├── reports.js # NEW: Admin reports
│   │   │       └── auditLogs.js # NEW: Admin audit logs
│   │   ├── controllers/
│   │   │   ├── customer/      # EXISTING: Customer controllers
│   │   │   └── admin/         # NEW: Admin controllers
│   │   ├── models/
│   │   │   ├── card.js        # EXISTING
│   │   │   ├── transaction.js # EXISTING
│   │   │   └── admin/         # NEW: Admin models
│   │   │       ├── adminUser.js
│   │   │       ├── auditLog.js
│   │   │       └── adminNote.js
│   │   ├── middleware/
│   │   │   ├── auth.js        # EXISTING: Customer auth middleware
│   │   │   ├── adminAuth.js   # NEW: Admin authentication
│   │   │   ├── rbac.js        # NEW: Role-based access control
│   │   │   └── auditLog.js    # NEW: Audit logging
│   │   └── ...
│   └── ...
├── frontend/                  # EXISTING frontend - ADD admin pages here
│   ├── src/
│   │   ├── components/
│   │   │   ├── customer/      # EXISTING: Customer components
│   │   │   └── admin/         # NEW: Admin components
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── AdminNav.jsx
│   │   │       ├── StatsCard.jsx
│   │   │       ├── DataTable.jsx
│   │   │       └── ...
│   │   ├── pages/
│   │   │   ├── Login.jsx      # EXISTING: Customer login
│   │   │   ├── Dashboard.jsx  # EXISTING: Customer dashboard
│   │   │   ├── Cards.jsx      # EXISTING: Customer cards
│   │   │   └── admin/         # NEW: Admin pages
│   │   │       ├── AdminLogin.jsx
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── Customers.jsx
│   │   │       ├── CustomerDetail.jsx
│   │   │       ├── Cards.jsx
│   │   │       ├── CardDetail.jsx
│   │   │       ├── Transactions.jsx
│   │   │       ├── Disputes.jsx
│   │   │       ├── Alerts.jsx
│   │   │       ├── Reports.jsx
│   │   │       └── AuditLogs.jsx
│   │   ├── services/
│   │   │   ├── api.js         # EXISTING: Customer API
│   │   │   └── adminApi.js    # NEW: Admin API client
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # EXISTING: Customer auth
│   │   │   └── AdminContext.jsx # NEW: Admin auth
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx            # UPDATE: Add admin routes
│   ├── package.json
│   └── ...
└── database/
    ├── migrations/
    │   ├── 001_initial.sql    # EXISTING
    │   ├── 002_cards.sql      # EXISTING
    │   ├── 003_transactions.sql # EXISTING
    │   └── 004_admin_tables.sql  # NEW: Admin tables
    └── seeds/
        ├── 001_customers.sql  # EXISTING
        ├── 002_cards.sql      # EXISTING
        ├── 003_transactions.sql # EXISTING
        └── 004_admin_users.sql   # NEW: Demo admin users
```

### Frontend Routing Structure

**App.jsx should have both customer AND admin routes:**

```jsx
// src/App.jsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
        <Route path="/cards/:id" element={<ProtectedRoute><CardDetail /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        {/* ... other customer routes */}

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="cards" element={<AdminCards />} />
          <Route path="cards/:id" element={<AdminCardDetail />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="disputes" element={<Disputes />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Database Changes

**1. Create admin_users table:**
```sql
CREATE TABLE admin_users (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- CSR, FRAUD_ANALYST, SUPERVISOR, ADMIN
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. Create audit_logs table:**
```sql
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(admin_id),
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100),
    action_description TEXT NOT NULL,
    before_value JSONB,
    after_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**3. Create admin_notes table:**
```sql
CREATE TABLE admin_notes (
    note_id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(admin_id),
    note_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100) NOT NULL,
    note_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**4. Update existing tables:**
```sql
ALTER TABLE disputes ADD COLUMN assigned_to INTEGER REFERENCES admin_users(admin_id);
ALTER TABLE disputes ADD COLUMN resolved_by INTEGER REFERENCES admin_users(admin_id);
ALTER TABLE cards ADD COLUMN locked_by INTEGER REFERENCES admin_users(admin_id);
ALTER TABLE cards ADD COLUMN locked_at TIMESTAMP;
ALTER TABLE alerts ADD COLUMN reviewed_by INTEGER REFERENCES admin_users(admin_id);
ALTER TABLE alerts ADD COLUMN reviewed_at TIMESTAMP;
```

**5. Create demo admin users:**
```sql
-- Password for all: admin123 (hashed with bcrypt)
INSERT INTO admin_users (username, password_hash, email, first_name, last_name, role, department) VALUES
('admin.user', '$2b$10$...', 'admin@cms-bank.com', 'Admin', 'User', 'ADMIN', 'IT'),
('john.csr', '$2b$10$...', 'john.csr@cms-bank.com', 'John', 'CSR', 'CSR', 'Customer Service'),
('fraud.analyst', '$2b$10$...', 'fraud@cms-bank.com', 'Fraud', 'Analyst', 'FRAUD_ANALYST', 'Fraud Prevention'),
('supervisor.jane', '$2b$10$...', 'supervisor@cms-bank.com', 'Jane', 'Supervisor', 'SUPERVISOR', 'Operations');
```

### Backend Implementation Guide

**Admin Authentication:**
```javascript
// src/routes/admin/auth.js
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Validate credentials against admin_users table
  // Generate JWT with admin role and permissions
  // Log login to audit_logs
});
```

**RBAC Middleware:**
```javascript
// src/middleware/rbac.js
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const adminRole = req.admin.role;
    const permissions = rolePermissions[adminRole];
    if (permissions.includes(requiredPermission)) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};
```

**Audit Logging Middleware:**
```javascript
// src/middleware/auditLog.js
const auditLog = (actionType, targetType) => {
  return async (req, res, next) => {
    // Capture request details
    // After response, log to audit_logs table
    // Include before/after values for updates
  };
};
```

**Admin API Routes:**
- `/api/v1/admin/auth/login` - Admin login
- `/api/v1/admin/customers` - Search customers
- `/api/v1/admin/customers/:id` - Get customer details
- `/api/v1/admin/cards` - Search cards
- `/api/v1/admin/cards/:id/lock` - Lock card (with audit)
- `/api/v1/admin/transactions` - Search transactions
- `/api/v1/admin/disputes` - List/manage disputes
- `/api/v1/admin/alerts` - List/manage alerts
- `/api/v1/admin/reports/dashboard` - Dashboard stats
- `/api/v1/admin/audit-logs` - View audit trail

### Frontend Implementation Guide

**Tech Stack:**
- React + Vite
- Tailwind CSS + shadcn/ui
- React Router for navigation
- React Query for data fetching
- TanStack Table for data tables
- Recharts for charts

**Key Components to Build:**

1. **Dashboard.jsx:**
   - Stats cards (total cards, transactions, disputes, alerts)
   - Charts (transaction volume, categories, disputes)
   - Recent activity tables

2. **CustomerSearch.jsx & CustomerDetail.jsx:**
   - Search with filters
   - Paginated results table
   - Customer detail with tabs (cards, transactions, disputes, alerts, notes)

3. **CardSearch.jsx & CardDetail.jsx:**
   - Card search with advanced filters
   - Card detail with all information
   - Lock/unlock button with confirmation

4. **TransactionSearch.jsx:**
   - Advanced filters (date, amount, status, category)
   - Large paginated table with sorting
   - Transaction detail modal

5. **DisputeManagement.jsx:**
   - Kanban-style board OR filterable list
   - Dispute detail modal with actions
   - Assign to analyst, update status, approve/deny

6. **AlertDashboard.jsx:**
   - Alert summary cards by severity
   - Filterable alert list
   - Alert detail modal with actions

7. **Reports.jsx:**
   - Pre-built report templates
   - Custom report builder
   - Report results viewer

8. **AuditLogs.jsx:**
   - Searchable/filterable audit trail
   - Cannot modify logs (read-only)

**Admin Context:**
```javascript
// src/context/AdminContext.jsx
export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [permissions, setPermissions] = useState([]);
  
  const login = async (username, password) => {
    const response = await adminApi.login(username, password);
    setAdmin(response.data);
    setPermissions(response.data.permissions);
    localStorage.setItem('adminToken', response.data.token);
  };
  
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };
  
  return (
    <AdminContext.Provider value={{ admin, login, hasPermission }}>
      {children}
    </AdminContext.Provider>
  );
};
```

### UI Design Guidelines

**Color Scheme:**
- Primary: Blue (#1f4788)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)
- Background: Light gray (#f9fafb)

**Layout:**
- Top navigation bar with logo and menu
- Main content area with proper spacing
- Use cards/panels for sections
- Consistent padding and margins

**Tables:**
- Use TanStack Table for all data tables
- Sortable columns
- Pagination (20 items per page default)
- Row actions (view, edit, etc.)
- Loading skeleton states

**Forms:**
- Use React Hook Form
- Validation with clear error messages
- Loading states on submit
- Success/error toasts

**Charts:**
- Use Recharts
- Responsive sizing
- Tooltips on hover
- Clear labels and legends

### Security Implementation

1. **Admin JWT separate from customer JWT:**
   - Different secret key
   - Shorter expiration (1 hour)
   - Include role and permissions in token

2. **All admin routes protected:**
   - Require valid admin JWT
   - Check permissions for each action
   - Re-authenticate for sensitive actions

3. **Audit everything:**
   - Log all admin actions
   - Include before/after values for updates
   - Cannot delete or modify logs

4. **Rate limiting:**
   - Stricter limits for admin endpoints
   - Prevent brute force on admin login

### Testing Checklist

- [ ] Admin login works with all 4 demo users
- [ ] Dashboard displays correct statistics
- [ ] Customer search returns results
- [ ] Can view customer details
- [ ] Card search and filters work
- [ ] Can lock/unlock cards (audit logged)
- [ ] Transaction search with filters works
- [ ] Can view and update disputes
- [ ] Alert dashboard shows all alerts
- [ ] Can generate reports
- [ ] Audit logs show all admin actions
- [ ] Role-based permissions enforced
- [ ] All actions logged correctly
- [ ] UI is responsive
- [ ] No console errors

### Demo Credentials

After building, these admin logins should work:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| admin.user | admin123 | ADMIN | Full system access |
| john.csr | admin123 | CSR | Customer service rep |
| fraud.analyst | admin123 | FRAUD_ANALYST | Fraud investigations |
| supervisor.jane | admin123 | SUPERVISOR | Team supervisor |

### Deployment

**IMPORTANT:** Deploy to the EXISTING Heroku apps, not new ones.

### During Development (Optional - Test Before Merge):
```bash
# You can deploy feature branch to Heroku for testing
# This updates the live apps but from your feature branch

# Backend
git checkout feature/admin-portal
git push heroku-backend feature/admin-portal:master

# Frontend  
git push heroku-frontend feature/admin-portal:master
```

### After Merge to Master (Final Deployment):
```bash
# After PR is approved and merged to master
git checkout master
git pull origin master

# Deploy master branch to production
git push heroku-backend master
git push heroku-frontend master
```

### Deployment Steps:

1. **Backend (Same Heroku App):**
   - Run new migrations to create admin tables
   - Seed admin users
   - Deploy updated backend code to EXISTING backend Heroku app
   - Admin routes will be at: `https://cms-backend.../api/v1/admin/*`

2. **Frontend (Same Heroku App):**
   - Add admin pages and routes to existing frontend
   - Deploy updated frontend code to EXISTING frontend Heroku app
   - Admin portal will be at: `https://cms-frontend.../admin/*`
   - Customer app remains at: `https://cms-frontend.../*`

3. **Environment Variables (Add to existing .env):**
   ```
   # Backend (add these to existing backend .env)
   ADMIN_JWT_SECRET=your-admin-jwt-secret-different-from-customer
   ADMIN_JWT_EXPIRES_IN=1h
   
   # Frontend (existing .env works, no changes needed)
   VITE_API_URL=https://cms-backend.../api/v1
   ```

### Access After Deployment

**Customer App:** `https://cms-frontend-1759769376-89e39b75295e.herokuapp.com/`
- Login: `john.doe@example.com` / `demo123`

**Admin Portal:** `https://cms-frontend-1759769376-89e39b75295e.herokuapp.com/admin`
- Login: `john.csr` / `admin123`
- Different UI, different permissions, same app!

### Rollback Plan (If Needed):
```bash
# If something goes wrong, you can quickly rollback to backup
git checkout master-backup-before-admin
git push heroku-backend master-backup-before-admin:master --force
git push heroku-frontend master-backup-before-admin:master --force

# This restores the working customer app
```

### Success Criteria

- ✅ Admin can login with role-based credentials
- ✅ Dashboard shows system-wide statistics
- ✅ Can search and view all customers
- ✅ Can search and view all cards
- ✅ Can search and view all transactions
- ✅ Can manage disputes
- ✅ Can review alerts
- ✅ Can generate reports
- ✅ All admin actions logged to audit trail
- ✅ Role-based permissions enforced
- ✅ UI is clean, professional, responsive
- ✅ Deployed and accessible

### Start Building!

**CRITICAL: Build admin features INTO the existing CMS app, not as a separate application.**

### ⚠️ BEFORE YOU WRITE ANY CODE:

**Step 0: Set Up Git Branches (REQUIRED)**
```bash
# 1. Backup master
git checkout master
git pull origin master
git checkout -b master-backup-before-admin
git push origin master-backup-before-admin

# 2. Create feature branch
git checkout master
git checkout -b feature/admin-portal
git push origin feature/admin-portal

# 3. Confirm you're on feature branch
git branch
# Should show: * feature/admin-portal

# NOW you can start coding!
```

**Implementation Order:**
1. ✅ **Git Setup** (above) - DO THIS FIRST!
2. Database: Add admin tables to existing database
3. Backend: Add admin routes/controllers to existing backend
4. Frontend: Add admin pages/components to existing frontend
5. Test: Verify customer app still works + admin portal works
6. Deploy: Push feature branch to Heroku for testing
7. PR: Create Pull Request on GitHub for review
8. Merge: After approval, merge to master and deploy

**What You're Adding:**
- Backend: `/api/v1/admin/*` routes alongside existing `/api/v1/*` routes
- Frontend: `/admin/*` pages alongside existing customer pages
- Database: `admin_users`, `audit_logs`, `admin_notes` tables
- Authentication: Separate admin JWT system

**Git Commit Strategy:**
```bash
# Commit after each major milestone:
git add .
git commit -m "Add admin database tables and migrations"

git add .
git commit -m "Add admin authentication and RBAC middleware"

git add .  
git commit -m "Add admin API routes (customers, cards, transactions)"

git add .
git commit -m "Add admin API routes (disputes, alerts, reports)"

git add .
git commit -m "Add admin frontend layout and navigation"

git add .
git commit -m "Add admin dashboard and customer management pages"

git add .
git commit -m "Add admin dispute and alert management pages"

git add .
git commit -m "Add admin reports and audit log pages"

git add .
git commit -m "Complete admin portal - ready for review"

# Push to GitHub regularly
git push origin feature/admin-portal
```

**Testing:**
- Customer app at: `/` (existing, should still work!)
- Admin portal at: `/admin` (new)
- Customer login: `john.doe@example.com` / `demo123`
- Admin login: `john.csr` / `admin123`

**After Sprint Complete:**
1. Push final commits to `feature/admin-portal`
2. Create Pull Request on GitHub: `feature/admin-portal` → `master`
3. Review and test
4. Merge to master
5. Deploy master to production

Focus on building the backend first (database + APIs), then the frontend. Test each feature as you build. Use the PRD as your complete specification - everything you need is documented above.

**Remember:** 
- This is ONE codebase, ONE deployment, TWO interfaces
- Work on `feature/admin-portal` branch only
- `master-backup-before-admin` is your safety net
- Commit and push frequently

Good luck! 🚀

---

## 📋 Quick Reference: Complete Workflow

```
STEP 1: GIT SETUP (FIRST!)
┌─────────────────────────────────────┐
│ git checkout master                 │
│ git checkout -b master-backup-...   │ ← Safety backup
│ git push origin master-backup-...   │
│                                     │
│ git checkout master                 │
│ git checkout -b feature/admin-portal│ ← Work here
│ git push origin feature/admin-portal│
└─────────────────────────────────────┘

STEP 2: BUILD (On feature branch)
┌─────────────────────────────────────┐
│ 1. Add database tables              │
│ 2. Add backend admin APIs           │
│ 3. Add frontend admin pages         │
│ 4. Test both customer + admin       │
│ 5. Commit & push frequently         │
└─────────────────────────────────────┘

STEP 3: DEPLOY & TEST (Optional)
┌─────────────────────────────────────┐
│ git push heroku feature/...:master  │ ← Test in production
│ Verify both interfaces work         │
└─────────────────────────────────────┘

STEP 4: MERGE (After approval)
┌─────────────────────────────────────┐
│ 1. Create PR on GitHub              │
│ 2. Review & approve                 │
│ 3. Merge feature → master           │
│ 4. Deploy master to production      │
└─────────────────────────────────────┘

RESULT:
✅ Customer App: /
✅ Admin Portal: /admin
✅ Same codebase, same deployment
✅ Safe backup available if needed
```