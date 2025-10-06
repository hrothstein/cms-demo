#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
} : {
  user: process.env.DB_USER || 'cms_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cms_db',
  password: process.env.DB_PASSWORD || 'cms_password',
  port: process.env.DB_PORT || 5432,
};

async function setupDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Read and execute schema
    console.log('📋 Creating database schema...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Database schema created');
    
    // Read and execute seed data
    console.log('🌱 Loading seed data...');
    const seedPath = path.join(__dirname, '../database/seeds/seed_data.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedData);
    console.log('✅ Seed data loaded');
    
    // Verify data
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const cardCount = await pool.query('SELECT COUNT(*) FROM cards');
    const transactionCount = await pool.query('SELECT COUNT(*) FROM transactions');
    
    console.log('\n📊 Database Summary:');
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Cards: ${cardCount.rows[0].count}`);
    console.log(`   Transactions: ${transactionCount.rows[0].count}`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nDemo credentials:');
    console.log('   john.doe / demo123');
    console.log('   jane.smith / demo123');
    console.log('   bob.johnson / demo123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
setupDatabase();
