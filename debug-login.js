// Debug login function
async function testLogin() {
    console.log('Testing login...');
    
    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'john.doe@example.com',
                password: 'demo123'
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        return { error: error.message };
    }
}

// Test the login
testLogin();
