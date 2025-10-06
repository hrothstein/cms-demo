-- Card Management System Database Schema
-- PostgreSQL Database Schema for CMS Demo

-- Create database (run this separately)
-- CREATE DATABASE cms_db;
-- \c cms_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authentication)
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

-- Cards table
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

-- Card controls table
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

-- Transactions table
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

-- Alerts table
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

-- Disputes table
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

-- Card requests table
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

-- Notification preferences table
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

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_card_controls_updated_at BEFORE UPDATE ON card_controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_card_requests_updated_at BEFORE UPDATE ON card_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
