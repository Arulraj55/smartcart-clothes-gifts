const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const colors = require('colors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);

// Welcome route - redirect to frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Token-Based Email Verification System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'GET /api/auth/verify/:token': 'Verify email with token',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/resend-verification': 'Resend verification email',
        'POST /api/auth/forgot-password': 'Send password reset email',
        'POST /api/auth/reset-password/:token': 'Reset password with token',
        'GET /api/auth/profile': 'Get current user profile'
      }
    },
    features: [
      'JWT Token-based authentication',
      'Email verification with secure tokens',
      'Password reset functionality',
      'Protected routes',
      'Role-based access control',
      'Secure password hashing',
      'Email templates',
      'Frontend interface'
    ]
  });
});

// Test route for protected access
app.get('/api/protected', require('./middleware/auth').protect, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: req.user
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.yellow.bold);
  console.log(`Environment: ${process.env.NODE_ENV}`.blue.bold);
});
