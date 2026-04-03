// ------------------------
// 1️⃣ Imports & setup
// ------------------------
const express = require('express');
const { sanitizeRequest } = require('./middleware/sanitize');
const { requireApiKey } = require('./middleware/api-key');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
require('dotenv').config();

// ------------------------
// 2️⃣ Environment variables
// ------------------------
const HTTPS_PORT = Number(process.env.HTTPS_PORT || 5445);
const HTTP_PORT = Number(process.env.PORT || 5050);
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || [];

// ------------------------
// 3️⃣ Initialize Express
// ------------------------
const app = express();

// JSON body parser
app.use(express.json({ limit: '10kb' }));

// Apply sanitation middleware globally
app.use(sanitizeRequest);

// ------------------------
// 4️⃣ Security Middlewares
// ------------------------
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    // In development, allow localhost origins
    if (isDev && (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
      callback(null, true);
    } else if (CORS_ORIGINS.includes(origin)) {
      callback(null, true);
    } else if (!origin && isDev) {
      // Allow requests with no origin in dev (e.g., curl)
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Global rate limiter
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MIN || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ------------------------
// 5️⃣ Routes
// ------------------------
// Public route (no API key required)
app.get('/', (req, res) => {
  res.json({ message: '✅ API key is valid 🎉 Backend secured & running over HTTPS!' });
});

// ------------------------
// 📧 Email Routes (PUBLIC - with stricter rate limiting)
// ------------------------
const emailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 emails per 15 min per IP
  message: { error: "Too many email requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const emailRoutes = require('./routes/email');
app.use('/api/email', emailRateLimiter, emailRoutes);

// Apply API key protection for all OTHER /api routes
app.use('/api', requireApiKey());

// Product routes (batch import uses multer for multipart, not JSON body parser)
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

// Protected test route
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ API key valid, route protected!' });
});

// ------------------------
// 🧹 Protected test-sanitize route
// ------------------------
app.post('/api/test-sanitize', (req, res) => {
  // Echo back the sanitized request body
  res.json({ sanitizedBody: req.body });
});

// ------------------------
// 6️⃣ HTTP & HTTPS Servers
// ------------------------
// Start HTTP server (primary for development)
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`✅ HTTP server running on http://localhost:${HTTP_PORT}`);
});

// Try to start HTTPS server if certificates exist
try {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'cert', 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'localhost.pem'))
  };
  
  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`✅ HTTPS server running on https://localhost:${HTTPS_PORT}`);
  });
} catch (err) {
  console.log(`ℹ️ HTTPS disabled (no certificates found)`);
}

