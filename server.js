const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as time, current_database() as db');
    res.json({
      status: 'healthy',
      database: dbRes.rows[0].db,
      timestamp: dbRes.rows[0].time
    });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Lead Generation Resume Route
app.get('/lead-generation', (req, res) => {
  res.sendFile(path.join(__dirname, 'lead-generation', 'index.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// 404 / Fallback handler for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Resume server is dynamically serving on http://localhost:${PORT}`);
  console.log(`Connected to PostgreSQL database: resume_db`);
});

module.exports = server;
