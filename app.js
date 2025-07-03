const express = require('express');
const cors = require('cors');
const eventsRouter = require('./api/eventsRouter');
const consumerRouter = require('./api/consumerRouter');
const campaignRouter = require('./api/campaignRouter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// JSON parsing with better error handling
app.use(express.json({
  limit: '10mb',
  strict: true
}));

// JSON parsing error handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON parsing error:', error.message);
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains malformed JSON. Please check your JSON syntax.'
    });
  }
  next(error);
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/consumer', consumerRouter);
app.use('/api/campaigns', campaignRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Loyalty Rules Engine server running on port ${PORT}`);
});

module.exports = app;
