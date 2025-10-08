const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080', 
    'http://localhost:5173',
    'https://cms-frontend-fixed-acee297f6c24.herokuapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign(
      { adminId: 'ADMIN-001', username: 'admin', role: 'ADMIN', type: 'admin' },
      'admin-demo-secret-key',
      { expiresIn: '1h' }
    );

    return res.json({
      success: true,
      data: { token, adminId: 'ADMIN-001', username: 'admin', role: 'ADMIN' }
    });
  }

  return res.status(401).json({
    success: false,
    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } });
});

app.listen(PORT, () => {
  console.log('Backend API running on port', PORT);
});

module.exports = app;
