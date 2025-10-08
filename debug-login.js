const { query } = require('./src/config/database');

async function debugLogin() {
  try {
    console.log('Testing database connection...');
    
    // Test simple query
    const testResult = await query('SELECT 1 as test');
    console.log('✅ Simple query works:', testResult.rows);
    
    // Test customers table
    const customersResult = await query('SELECT customer_id, email FROM customers LIMIT 1');
    console.log('✅ Customers query works:', customersResult.rows);
    
    // Test login query
    const loginQuery = `
      SELECT customer_id, email, first_name, last_name, password_hash
      FROM customers 
      WHERE email = $1
    `;
    
    console.log('Testing login query with sarah.demo@example.com...');
    const loginResult = await query(loginQuery, ['sarah.demo@example.com']);
    console.log('✅ Login query works:', loginResult.rows);
    
    if (loginResult.rows.length > 0) {
      console.log('✅ User found:', loginResult.rows[0]);
    } else {
      console.log('❌ No user found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

debugLogin();
