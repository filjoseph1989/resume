const express = require('express');
const router = express.Router();
const db = require('../db');

// List resumes
router.get('/resumes', async (req, res) => {
  try {
    const result = await db.query('SELECT slug, updated_at FROM resumes ORDER BY slug');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// One resume's JSON
router.get('/resumes/:slug', async (req, res) => {
  try {
    const result = await db.query('SELECT data FROM resumes WHERE slug = $1', [req.params.slug]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    res.json({ success: true, data: result.rows[0].data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Replace one resume's JSON
router.put('/resumes/:slug', async (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ success: false, error: 'Body must be a JSON object' });
  }
  try {
    const result = await db.query(`
      UPDATE resumes SET data = $1, updated_at = CURRENT_TIMESTAMP
      WHERE slug = $2
      RETURNING data;
    `, [JSON.stringify(data), req.params.slug]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    res.json({ success: true, data: result.rows[0].data });
  } catch (err) {
    console.error('Error updating resume:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset one resume to its seed file (data/<slug>.json)
router.post('/resumes/:slug/reset', async (req, res) => {
  try {
    const seed = require('../scripts/seed');
    await seed(req.params.slug);
    const result = await db.query('SELECT data FROM resumes WHERE slug = $1', [req.params.slug]);
    res.json({ success: true, data: result.rows[0].data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
