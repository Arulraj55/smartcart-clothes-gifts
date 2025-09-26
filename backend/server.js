const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');
const recommendationRoutes = require('./routes/recommendations');
const searchRoutes = require('./routes/search');
const analyticsRoutes = require('./routes/analytics');
const imageRoutes = require('./routes/images');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

// Import ML services
const RecommendationEngine = require('./ml/recommendationEngine');
const SearchRanking = require('./ml/searchRanking');

const app = express();

// Security and performance middleware
// Allow cross-origin resource embedding (needed for image proxy consumed by frontend on a different origin)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // We don't need COEP for this app; disabling avoids strict embedder requirements during dev
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
// Reduce logging for image proxy requests to avoid spam
app.use(morgan('combined', {
  skip: (req, res) => req.path.startsWith('/api/images/proxy')
}));

// Rate limiting (exclude image proxy which needs many concurrent requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // increased limit for image-heavy app
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for image proxy
    return req.path.startsWith('/api/images/proxy');
  }
});
app.use('/api/', limiter);

// CORS configuration (allow localhost on common dev ports)
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://glittery-conkies-6d48e0.netlify.app'
].filter(Boolean));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ]
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize ML engines (constructed now, initialized after DB connects)
const recommendationEngine = new RecommendationEngine();
const searchRanking = new SearchRanking();

// Make ML engines available to routes
app.locals.recommendationEngine = recommendationEngine;
app.locals.searchRanking = searchRanking;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MERN E-commerce ML Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/images', imageRoutes);
// Ensure all image responses explicitly allow cross-origin embedding
app.use('/api/images', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  next();
});

// Serve cached images directly (used when catalogs point to /images/<filename>)
app.use('/images', (req, res, next) => {
  // Allow embedding across origins for image assets
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  next();
}, express.static(path.join(__dirname, 'public', 'images'), {
  maxAge: '30d',
  etag: true,
  immutable: true
}));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;
let server;

// Start server only after DB is connected to avoid initialization races
async function start() {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`🚀 MERN E-commerce ML Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🧠 ML-powered recommendations and search ranking enabled`);
      const rzpConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
      const rzpMasked = (process.env.RAZORPAY_KEY_ID || '').slice(0, 6) + (process.env.RAZORPAY_KEY_ID ? '****' : '');
      console.log(`💳 Payments • Razorpay configured: ${rzpConfigured} • Key: ${rzpMasked}`);

      // Initialize ML engines after DB is connected and server is up
      recommendationEngine.initialize();
      searchRanking.initialize();
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
