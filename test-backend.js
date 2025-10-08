const { query } = require('./src/config/database');

async function testLogin() {
  try {
    console.log('Testing login query...');
    const result = await query('SELECT customer_id, email, first_name, last_name, password_hash FROM customers WHERE email = $1', ['sarah.demo@example.com']);
    console.log('Query result:', result.rows);
    if (result.rows.length > 0) {
      console.log('✅ User found:', result.rows[0]);
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

testLogin();
