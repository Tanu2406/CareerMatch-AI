import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration - Allow both development and production
app.use(cors({
  origin: [
    'http://localhost:5173',      // Development frontend
    'https://careermatch-ai-1.onrender.com', // Production frontend (primary)
    'https://careermatch-ai.onrender.com'   // backend URL as some calls may originate here
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'API running',
    service: 'CareerMatch AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jobs', jobRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareerMatch AI Server is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`[Error] ${req.method} ${req.path} - ${status}: ${message}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error] Stack trace:', err.stack);
  }
  
  res.status(status).json({
    success: false,
    message,
    status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler - catch all unknown routes
app.use('*', (req, res) => {
  console.warn(`[404] Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careermatch';

console.log(`[Server] Starting on port ${PORT}...`);
console.log(`[Database] Connecting to ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);

// Connect to MongoDB (non-blocking for development)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[Database] ✓ Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.warn('[Database] ⚠ MongoDB connection failed:', err.message);
    console.warn('[Database] ⚠ Server will continue without database connectivity');
    console.warn('[Database] ⚠ Make sure MongoDB is running or Atlas connection is available');
  });

// Start server regardless of MongoDB connection status
const server = app.listen(PORT, () => {
  console.log(`[Server] ✓ Server running on http://localhost:${PORT}`);
  console.log(`[Server] ✓ Ready to accept requests`);
  console.log(`[Server] Available endpoints:`);
  console.log(`  - GET  http://localhost:${PORT}/api/health`);
  console.log(`  - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`  - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`  - GET  http://localhost:${PORT}/api/resume/history`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server] ✗ Port ${PORT} is already in use`);
    console.error(`[Server] Kill the process or use a different port: PORT=5001 npm run dev`);
    process.exit(1);
  } else {
    console.error('[Server] ✗ Server error:', err.message);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Error] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Error] Uncaught Exception:', err);
  process.exit(1);
});

export default app;
