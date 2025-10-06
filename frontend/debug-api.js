// Debug API configuration
console.log('Environment variables:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1');

// Test direct fetch
console.log('Testing direct fetch...');
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
    console.log('Direct fetch success:', response.status);
    return response.json();
})
.then(data => {
    console.log('Direct fetch data:', data);
})
.catch(error => {
    console.error('Direct fetch error:', error);
});

// Test with relative URL
console.log('Testing relative URL...');
fetch('/api/v1/auth/login', {
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
    console.log('Relative fetch success:', response.status);
    return response.json();
})
.then(data => {
    console.log('Relative fetch data:', data);
})
.catch(error => {
    console.error('Relative fetch error:', error);
});
