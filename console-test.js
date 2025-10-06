// Console test script - paste this into browser console
console.log('Testing login functionality...');

// Test 1: Check if fetch is available
console.log('Fetch available:', typeof fetch);

// Test 2: Test API endpoint
fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: 'john.doe@example.com',
        password: 'demo123'
    })
})
.then(response => {
    console.log('Response status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Login response:', data);
})
.catch(error => {
    console.error('Login error:', error);
});

// Test 3: Check if React app is loaded
console.log('React app loaded:', !!document.querySelector('#root'));
console.log('Login form present:', !!document.querySelector('form'));
