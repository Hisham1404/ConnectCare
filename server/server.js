const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Get port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS middleware - configure for your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081', // Default Expo dev server port
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'ConnectCare AI Backend Service is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Import and use checkin routes
const checkinRoutes = require('./routes/checkin');
app.use('/api/checkin', checkinRoutes);

// API routes placeholder - will be expanded for ConnectCare AI features
app.use('/api/v1', (req, res, next) => {
  // Placeholder for future API routes
  res.status(404).json({
    error: 'API endpoint not implemented yet',
    message: 'This endpoint will be implemented as part of ConnectCare AI development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ConnectCare AI Backend Server running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/`);
  console.log(`🩺 Check-in endpoint available at: http://localhost:${PORT}/api/checkin`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});