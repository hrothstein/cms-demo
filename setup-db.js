const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Enable UUID extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ UUID extension enabled');
    
    // Create customers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id VARCHAR(50) PRIMARY KEY, 
        email VARCHAR(255) UNIQUE NOT NULL, 
        first_name VARCHAR(100) NOT NULL, 
        last_name VARCHAR(100) NOT NULL, 
        password_hash VARCHAR(255) NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Customers table created');
    
    // Create cards table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cards (
        card_id VARCHAR(50) PRIMARY KEY, 
        customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id), 
        card_number_last4 VARCHAR(4) NOT NULL, 
        card_type VARCHAR(20) NOT NULL, 
        card_status VARCHAR(20) NOT NULL, 
        is_locked BOOLEAN DEFAULT FALSE, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Cards table created');
    
    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id VARCHAR(50) PRIMARY KEY, 
        card_id VARCHAR(50) NOT NULL REFERENCES cards(card_id), 
        customer_id VARCHAR(50) NOT NULL, 
        amount DECIMAL(10,2) NOT NULL, 
        merchant_name VARCHAR(255), 
        transaction_type VARCHAR(50), 
        status VARCHAR(20), 
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Transactions table created');
    
    // Insert demo data
    await pool.query(`
      INSERT INTO customers (customer_id, email, first_name, last_name, password_hash) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (customer_id) DO NOTHING
    `, ['CUST-001', 'sarah.demo@example.com', 'Sarah', 'Johnson', 'Demo123!']);
    
    await pool.query(`
      INSERT INTO customers (customer_id, email, first_name, last_name, password_hash) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (customer_id) DO NOTHING
    `, ['CUST-002', 'john.demo@example.com', 'John', 'Smith', 'Demo123!']);
    
    await pool.query(`
      INSERT INTO customers (customer_id, email, first_name, last_name, password_hash) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (customer_id) DO NOTHING
    `, ['CUST-003', 'emma.demo@example.com', 'Emma', 'Davis', 'Demo123!']);
    console.log('✅ Demo customers added');
    
    await pool.query(`
      INSERT INTO cards (card_id, customer_id, card_number_last4, card_type, card_status, is_locked) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (card_id) DO NOTHING
    `, ['CARD-001', 'CUST-001', '1234', 'Debit', 'Active', false]);
    
    await pool.query(`
      INSERT INTO cards (card_id, customer_id, card_number_last4, card_type, card_status, is_locked) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (card_id) DO NOTHING
    `, ['CARD-002', 'CUST-001', '5678', 'Credit', 'Active', false]);
    
    await pool.query(`
      INSERT INTO cards (card_id, customer_id, card_number_last4, card_type, card_status, is_locked) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (card_id) DO NOTHING
    `, ['CARD-003', 'CUST-002', '9012', 'Debit', 'Active', false]);
    console.log('✅ Demo cards added');
    
    await pool.query(`
      INSERT INTO transactions (transaction_id, card_id, customer_id, amount, merchant_name, transaction_type, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      ON CONFLICT (transaction_id) DO NOTHING
    `, ['TXN-001', 'CARD-001', 'CUST-001', 25.50, 'Coffee Shop', 'Purchase', 'Completed']);
    
    await pool.query(`
      INSERT INTO transactions (transaction_id, card_id, customer_id, amount, merchant_name, transaction_type, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      ON CONFLICT (transaction_id) DO NOTHING
    `, ['TXN-002', 'CARD-001', 'CUST-001', 89.99, 'Online Store', 'Purchase', 'Completed']);
    
    await pool.query(`
      INSERT INTO transactions (transaction_id, card_id, customer_id, amount, merchant_name, transaction_type, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      ON CONFLICT (transaction_id) DO NOTHING
    `, ['TXN-003', 'CARD-002', 'CUST-001', 150.00, 'Gas Station', 'Purchase', 'Completed']);
    console.log('✅ Demo transactions added');
    
    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
