-- Seed data for Card Management System Demo
-- This file contains realistic demo data for testing and demonstration

-- Insert demo users
INSERT INTO users (customer_id, username, password_hash, email, phone, is_active) VALUES
('CUST-12345', 'john.doe', '$2b$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'john.doe@example.com', '+1-212-555-0123', true),
('CUST-12346', 'jane.smith', '$2b$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'jane.smith@example.com', '+1-212-555-0124', true),
('CUST-12347', 'bob.johnson', '$2b$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'bob.johnson@example.com', '+1-212-555-0125', true);

-- Insert demo cards
INSERT INTO cards (card_id, customer_id, account_number, card_number_encrypted, card_last_four, card_type, card_brand, card_status, cardholder_name, issue_date, expiry_date, cvv_encrypted, credit_limit, available_credit, is_primary) VALUES
('CRD-0001', 'CUST-12345', 'ACC-789456123', 'encrypted_card_number_1', '4532', 'DEBIT', 'VISA', 'ACTIVE', 'JOHN DOE', '2024-01-15', '2028-01-31', 'encrypted_cvv_123', NULL, NULL, true),
('CRD-0002', 'CUST-12345', 'ACC-789456123', 'encrypted_card_number_2', '9012', 'CREDIT', 'MASTERCARD', 'ACTIVE', 'JOHN DOE', '2024-01-15', '2027-12-31', 'encrypted_cvv_456', 5000.00, 4500.00, false),
('CRD-0003', 'CUST-12346', 'ACC-789456124', 'encrypted_card_number_3', '1111', 'DEBIT', 'VISA', 'LOCKED', 'JANE SMITH', '2024-02-01', '2026-06-30', 'encrypted_cvv_789', NULL, NULL, true),
('CRD-0004', 'CUST-12346', 'ACC-789456124', 'encrypted_card_number_4', '2222', 'CREDIT', 'AMEX', 'ACTIVE', 'JANE SMITH', '2024-02-01', '2027-08-15', 'encrypted_cvv_012', 10000.00, 8500.00, false),
('CRD-0005', 'CUST-12346', 'ACC-789456124', 'encrypted_card_number_5', '3333', 'DEBIT', 'VISA', 'ACTIVE', 'JANE SMITH', '2024-03-01', '2026-12-31', 'encrypted_cvv_345', NULL, NULL, false),
('CRD-0006', 'CUST-12347', 'ACC-789456125', 'encrypted_card_number_6', '4444', 'DEBIT', 'VISA', 'ACTIVE', 'BOB JOHNSON', '2024-01-20', '2026-09-30', 'encrypted_cvv_678', NULL, NULL, true);

-- Insert card controls
INSERT INTO card_controls (card_id, daily_limit, per_transaction_limit, atm_daily_limit, contactless_enabled, online_enabled, international_enabled, atm_enabled, allowed_countries, alert_threshold) VALUES
('CRD-0001', 1000.00, 500.00, 300.00, true, true, false, true, ARRAY['US'], 200.00),
('CRD-0002', 2000.00, 1000.00, 500.00, true, true, true, true, ARRAY['US', 'CA'], 500.00),
('CRD-0003', 800.00, 400.00, 200.00, true, true, false, true, ARRAY['US'], 150.00),
('CRD-0004', 3000.00, 1500.00, 1000.00, true, true, true, true, ARRAY['US', 'CA', 'MX'], 750.00),
('CRD-0005', 1200.00, 600.00, 400.00, true, true, false, true, ARRAY['US'], 250.00),
('CRD-0006', 1500.00, 750.00, 500.00, true, true, false, true, ARRAY['US'], 300.00);

-- Insert demo transactions (last 30 days)
INSERT INTO transactions (transaction_id, card_id, customer_id, transaction_date, post_date, merchant_name, merchant_id, merchant_category, merchant_category_code, amount, currency, transaction_type, transaction_method, status, authorization_code, location_city, location_state, location_country, is_international, is_online, fraud_score, fraud_flag) VALUES
-- John Doe transactions
('TXN-20241005-001', 'CRD-0001', 'CUST-12345', '2024-10-05 18:45:22', '2024-10-06', 'Starbucks Coffee #2547', 'MER-STB-2547', 'DINING', '5812', 5.75, 'USD', 'PURCHASE', 'CONTACTLESS', 'APPROVED', 'AUTH-547821', 'New York', 'NY', 'US', false, false, 0.05, false),
('TXN-20241005-002', 'CRD-0001', 'CUST-12345', '2024-10-05 14:30:15', '2024-10-06', 'Shell Gas Station', 'MER-SHELL-123', 'GAS', '5541', 45.20, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547822', 'New York', 'NY', 'US', false, false, 0.12, false),
('TXN-20241004-003', 'CRD-0002', 'CUST-12345', '2024-10-04 20:15:30', '2024-10-05', 'Amazon.com', 'MER-AMZN-001', 'SHOPPING', '5999', 89.99, 'USD', 'PURCHASE', 'ONLINE', 'APPROVED', 'AUTH-547823', 'New York', 'NY', 'US', false, true, 0.08, false),
('TXN-20241004-004', 'CRD-0001', 'CUST-12345', '2024-10-04 12:00:00', '2024-10-05', 'Whole Foods Market', 'MER-WFM-456', 'GROCERY', '5411', 125.50, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547824', 'New York', 'NY', 'US', false, false, 0.15, false),
('TXN-20241003-005', 'CRD-0002', 'CUST-12345', '2024-10-03 19:30:45', '2024-10-04', 'Uber', 'MER-UBER-789', 'TRANSPORTATION', '4121', 23.45, 'USD', 'PURCHASE', 'ONLINE', 'APPROVED', 'AUTH-547825', 'New York', 'NY', 'US', false, true, 0.03, false),

-- Jane Smith transactions
('TXN-20241005-006', 'CRD-0004', 'CUST-12346', '2024-10-05 16:20:10', '2024-10-06', 'Target Store #1234', 'MER-TGT-1234', 'SHOPPING', '5310', 156.99, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547826', 'Los Angeles', 'CA', 'US', false, false, 0.25, false),
('TXN-20241005-007', 'CRD-0004', 'CUST-12346', '2024-10-05 11:45:30', '2024-10-06', 'Electronics Store', 'MER-ELEC-999', 'ELECTRONICS', '5732', 845.00, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547827', 'Los Angeles', 'CA', 'US', false, false, 0.85, true),
('TXN-20241004-008', 'CRD-0003', 'CUST-12346', '2024-10-04 09:15:20', '2024-10-05', 'McDonalds', 'MER-MCD-456', 'DINING', '5814', 12.50, 'USD', 'PURCHASE', 'CONTACTLESS', 'APPROVED', 'AUTH-547828', 'Los Angeles', 'CA', 'US', false, false, 0.02, false),
('TXN-20241003-009', 'CRD-0004', 'CUST-12346', '2024-10-03 14:30:15', '2024-10-04', 'Nordstrom', 'MER-NORD-789', 'SHOPPING', '5651', 299.99, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547829', 'Los Angeles', 'CA', 'US', false, false, 0.18, false),
('TXN-20241002-010', 'CRD-0005', 'CUST-12346', '2024-10-02 17:45:30', '2024-10-03', 'CVS Pharmacy', 'MER-CVS-123', 'PHARMACY', '5912', 45.75, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547830', 'Los Angeles', 'CA', 'US', false, false, 0.10, false),

-- Bob Johnson transactions
('TXN-20241005-011', 'CRD-0006', 'CUST-12347', '2024-10-05 13:20:45', '2024-10-06', 'Home Depot', 'MER-HD-456', 'HOME_IMPROVEMENT', '5200', 78.50, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547831', 'Chicago', 'IL', 'US', false, false, 0.12, false),
('TXN-20241004-012', 'CRD-0006', 'CUST-12347', '2024-10-04 10:30:20', '2024-10-05', 'Walmart Supercenter', 'MER-WMT-789', 'GROCERY', '5411', 95.25, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547832', 'Chicago', 'IL', 'US', false, false, 0.08, false),
('TXN-20241003-013', 'CRD-0006', 'CUST-12347', '2024-10-03 15:45:10', '2024-10-04', 'BP Gas Station', 'MER-BP-123', 'GAS', '5541', 52.30, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547833', 'Chicago', 'IL', 'US', false, false, 0.15, false),
('TXN-20241002-014', 'CRD-0006', 'CUST-12347', '2024-10-02 12:15:30', '2024-10-03', 'Subway', 'MER-SUB-456', 'DINING', '5814', 8.75, 'USD', 'PURCHASE', 'CONTACTLESS', 'APPROVED', 'AUTH-547834', 'Chicago', 'IL', 'US', false, false, 0.05, false),
('TXN-20241001-015', 'CRD-0006', 'CUST-12347', '2024-10-01 18:30:45', '2024-10-02', 'Netflix', 'MER-NFLX-001', 'ENTERTAINMENT', '7841', 15.99, 'USD', 'PURCHASE', 'ONLINE', 'APPROVED', 'AUTH-547835', 'Chicago', 'IL', 'US', false, true, 0.02, false),

-- Additional transactions for more realistic data
('TXN-20240930-016', 'CRD-0001', 'CUST-12345', '2024-09-30 19:20:15', '2024-10-01', 'Pizza Hut', 'MER-PH-789', 'DINING', '5812', 28.50, 'USD', 'PURCHASE', 'ONLINE', 'APPROVED', 'AUTH-547836', 'New York', 'NY', 'US', false, true, 0.08, false),
('TXN-20240930-017', 'CRD-0002', 'CUST-12345', '2024-09-30 14:45:30', '2024-10-01', 'Apple Store', 'MER-APPLE-001', 'ELECTRONICS', '5732', 1299.00, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547837', 'New York', 'NY', 'US', false, false, 0.25, false),
('TXN-20240929-018', 'CRD-0004', 'CUST-12346', '2024-09-29 16:30:20', '2024-09-30', 'Costco', 'MER-COSTCO-123', 'GROCERY', '5411', 245.75, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547838', 'Los Angeles', 'CA', 'US', false, false, 0.20, false),
('TXN-20240929-019', 'CRD-0005', 'CUST-12346', '2024-09-29 11:15:45', '2024-09-30', 'Starbucks Coffee', 'MER-STB-789', 'DINING', '5812', 4.95, 'USD', 'PURCHASE', 'CONTACTLESS', 'APPROVED', 'AUTH-547839', 'Los Angeles', 'CA', 'US', false, false, 0.03, false),
('TXN-20240928-020', 'CRD-0006', 'CUST-12347', '2024-09-28 13:30:10', '2024-09-29', 'Best Buy', 'MER-BB-456', 'ELECTRONICS', '5732', 199.99, 'USD', 'PURCHASE', 'CHIP', 'APPROVED', 'AUTH-547840', 'Chicago', 'IL', 'US', false, false, 0.15, false);

-- Insert demo alerts
INSERT INTO alerts (card_id, customer_id, alert_type, severity, alert_date, alert_title, alert_message, related_transaction_id, status, action_required) VALUES
('CRD-0004', 'CUST-12346', 'FRAUD_ALERT', 'HIGH', '2024-10-05 16:25:00', 'Unusual Transaction Detected', 'A transaction of $845.00 at Electronics Store was flagged as unusual', 'TXN-20241005-007', 'NEW', true),
('CRD-0001', 'CUST-12345', 'LARGE_TRANSACTION', 'MEDIUM', '2024-09-30 14:50:00', 'Large Transaction Alert', 'A transaction of $1,299.00 at Apple Store exceeded your alert threshold', 'TXN-20240930-017', 'READ', false),
('CRD-0002', 'CUST-12345', 'CARD_STATUS_CHANGE', 'LOW', '2024-10-01 09:00:00', 'Card Status Update', 'Your credit card has been successfully activated', NULL, 'READ', false),
('CRD-0003', 'CUST-12346', 'CARD_LOCKED', 'MEDIUM', '2024-10-04 10:00:00', 'Card Locked', 'Your debit card has been locked due to suspicious activity', NULL, 'NEW', true),
('CRD-0006', 'CUST-12347', 'PAYMENT_DUE', 'LOW', '2024-10-01 08:00:00', 'Payment Due Reminder', 'Your credit card payment is due in 5 days', NULL, 'READ', false);

-- Insert demo disputes
INSERT INTO disputes (dispute_id, card_id, transaction_id, customer_id, dispute_date, dispute_reason, dispute_amount, status, customer_description, case_number) VALUES
('DSP-001', 'CRD-0004', 'TXN-20241005-007', 'CUST-12346', '2024-10-05', 'UNAUTHORIZED_TRANSACTION', 845.00, 'SUBMITTED', 'I did not make this transaction. My card was in my possession at the time.', 'CASE-20241005-001');

-- Insert notification preferences
INSERT INTO notification_preferences (customer_id, email_address, sms_number, transaction_alerts, large_transaction_threshold, fraud_alerts, card_status_alerts, payment_due_alerts, quiet_hours_start, quiet_hours_end) VALUES
('CUST-12345', 'john.doe@example.com', '+1-212-555-0123', false, 200.00, true, true, true, '22:00', '08:00'),
('CUST-12346', 'jane.smith@example.com', '+1-212-555-0124', true, 500.00, true, true, true, '23:00', '07:00'),
('CUST-12347', 'bob.johnson@example.com', '+1-212-555-0125', false, 100.00, true, true, false, '21:00', '09:00');
