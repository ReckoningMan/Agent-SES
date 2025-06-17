// server.js - Main entry point for Express API server

const express = require('express');
const cors = require('cors');
const http = require('http');
const searchRoutes = require('./backend/routes/searchRoutes');
const { initializeWebSocket } = require('./backend/controllers/searchController');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server instance
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both development servers
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Small Engine Parts Search API is running' });
});

// API routes
app.use('/api/search', searchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Not found middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Initialize WebSocket server
initializeWebSocket(server);

// Start HTTP server (instead of Express app directly)
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API: http://localhost:${PORT}/api/search/parts?query=532416954`);
  console.log(`WebSocket: ws://localhost:${PORT}/ws`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
