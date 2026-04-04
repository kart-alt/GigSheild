const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Allow all origins for Vercel deployment
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/policy', require('./routes/policy'));
app.use('/api/premium', require('./routes/premium'));
app.use('/api/claims', require('./routes/claims'));

// Basic health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'GigShield API is running', timestamp: new Date().toISOString() });
});

// Export for Vercel serverless
module.exports = app;

// Start server locally only (not on Vercel)
if (process.env.NODE_ENV !== 'production' || process.env.LOCAL_SERVER === 'true') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
