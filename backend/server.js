const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
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

// Behind a reverse proxy (Render/Netlify), trust proxy for correct IP detection
// This fixes express-rate-limit validations and ensures req.ip is derived from X-Forwarded-For
app.set('trust proxy', 1);

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

// CORS configuration (allow production frontend + FRONTEND_URL(S) from env)
const extraOrigins = [];
if (process.env.FRONTEND_URL) extraOrigins.push(process.env.FRONTEND_URL);
if (process.env.FRONTEND_URLS) extraOrigins.push(...process.env.FRONTEND_URLS.split(',').map(s => s.trim()).filter(Boolean));
const normalizeOrigin = (value) => String(value || '').trim().replace(/\/$/, '');
const allowedOrigins = new Set([
  'https://smartcart-clothes-gifts-frontend.onrender.com',
  ...extraOrigins.map(normalizeOrigin)
].map(normalizeOrigin).filter(Boolean));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    const isNetlify = /^https?:\/\/([a-zA-Z0-9-]+)\.netlify\.app$/.test(origin);
    if (allowedOrigins.has(origin) || isNetlify) {
      return callback(null, true);
    }
    // Log disallowed origin for debugging
    console.warn('CORS blocked origin:', origin);
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

// Allow-all switch for troubleshooting (set CORS_ALLOW_ALL=true in env)
const useAllowAllCors = String(process.env.CORS_ALLOW_ALL || '').toLowerCase() === 'true';
const selectedCors = useAllowAllCors ? cors({ origin: true, credentials: true }) : cors(corsOptions);

app.use(selectedCors);

// Handle preflight requests
app.options('*', selectedCors);

// Rate limiting (exclude image proxy which needs many concurrent requests)
// NOTE: Must be applied after CORS so preflight isn't blocked and to avoid proxy header issues
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
const publicDir = path.join(__dirname, 'public');
const indexHtmlPath = path.join(publicDir, 'index.html');
const hasBuiltFrontend = fs.existsSync(indexHtmlPath);

// Root route: serve SPA if present, otherwise act as a backend health indicator
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production' && hasBuiltFrontend) {
    return res.sendFile(indexHtmlPath);
  }

  return res.json({
    status: 'SmartCart Backend Running',
    health: '/health'
  });
});

// Serve static files in production only when a built frontend exists
if (process.env.NODE_ENV === 'production' && hasBuiltFrontend) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => res.sendFile(indexHtmlPath));
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
