const express = require('express');
const cors = require('cors');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Tradetron-Style Algo Trading Backend API is running healthy',
    timestamp: new Date().toISOString(),
  });
});

// Root API Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Algo Trading Platform Backend API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
const authRoutes = require('./routes/user/auth.routes');
app.use('/api/v1/auth', authRoutes);

// Admin Routes (Placeholder for next phase)
// app.use('/api/v1/admin', adminRoutes);

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
