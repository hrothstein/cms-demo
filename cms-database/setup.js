#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cms_development',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

async function setupDatabase() {
  const client = new Client(config);
  
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Read and execute schema migration
    console.log('📋 Creating database schema...');
    const schemaPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSQL);
    console.log('✅ Database schema created');

    // Read and execute seed data
    console.log('🌱 Seeding demo data...');
    const seedPath = path.join(__dirname, 'seeds', 'demo_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSQL);
    console.log('✅ Demo data seeded');

    console.log('\n🎉 Database setup complete!');
    console.log('\nDemo credentials:');
    console.log('Email: sarah.demo@example.com');
    console.log('Password: Demo123!');
    console.log('\nEmail: john.demo@example.com');
    console.log('Password: Demo123!');
    console.log('\nEmail: emma.demo@example.com');
    console.log('Password: Demo123!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, config };
