const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Aggregated Full Resume Payload
router.get('/resume', async (req, res) => {
  try {
    const profileRes = await db.query('SELECT * FROM profiles ORDER BY id LIMIT 1');
    const categoriesRes = await db.query('SELECT * FROM skill_categories ORDER BY display_order ASC, id ASC');
    const skillsRes = await db.query('SELECT * FROM skills ORDER BY display_order ASC, id ASC');
    const expRes = await db.query('SELECT * FROM experiences ORDER BY display_order ASC, id ASC');
    const projRes = await db.query('SELECT * FROM projects ORDER BY display_order ASC, id ASC');
    const eduRes = await db.query('SELECT * FROM education ORDER BY display_order ASC, id ASC');
    const certRes = await db.query('SELECT * FROM certifications ORDER BY display_order ASC, id ASC');
    const refRes = await db.query('SELECT * FROM "references" ORDER BY display_order ASC, id ASC');
    const pubRes = await db.query('SELECT * FROM publications ORDER BY display_order ASC, id ASC');

    // Organize skills by category
    const skillsByCategory = categoriesRes.rows.map(cat => {
      return {
        ...cat,
        skills: skillsRes.rows.filter(s => s.category_id === cat.id)
      };
    });

    res.json({
      success: true,
      data: {
        profile: profileRes.rows[0] || null,
        skillCategories: skillsByCategory,
        experiences: expRes.rows,
        projects: projRes.rows,
        education: eduRes.rows,
        certifications: certRes.rows,
        references: refRes.rows,
        publications: pubRes.rows
      }
    });
  } catch (err) {
    console.error('Error fetching resume data:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Profile endpoints
router.get('/profile', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles ORDER BY id LIMIT 1');
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const {
      name, initials, tagline, location, address, phone, email,
      linkedin_url, github_url, website_url, status_text, status_available,
      summary_paragraphs, expertise, stats
    } = req.body;

    const query = `
      UPDATE profiles
      SET
        name = COALESCE($1, name),
        initials = COALESCE($2, initials),
        tagline = COALESCE($3, tagline),
        location = COALESCE($4, location),
        address = COALESCE($5, address),
        phone = COALESCE($6, phone),
        email = COALESCE($7, email),
        linkedin_url = COALESCE($8, linkedin_url),
        github_url = COALESCE($9, github_url),
        website_url = COALESCE($10, website_url),
        status_text = COALESCE($11, status_text),
        status_available = COALESCE($12, status_available),
        summary_paragraphs = COALESCE($13, summary_paragraphs),
        expertise = COALESCE($14, expertise),
        stats = COALESCE($15, stats),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM profiles ORDER BY id LIMIT 1)
      RETURNING *;
    `;

    const values = [
      name, initials, tagline, location, address, phone, email,
      linkedin_url, github_url, website_url, status_text, status_available,
      summary_paragraphs ? JSON.stringify(summary_paragraphs) : null,
      expertise ? JSON.stringify(expertise) : null,
      stats ? JSON.stringify(stats) : null
    ];

    const result = await db.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Experiences endpoints
router.get('/experiences', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM experiences ORDER BY display_order ASC, id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/experiences', async (req, res) => {
  try {
    const {
      company, role, location, employment_type, start_date, end_date, duration,
      is_current, description, achievements, technologies, display_order
    } = req.body;

    const query = `
      INSERT INTO experiences (
        company, role, location, employment_type, start_date, end_date, duration,
        is_current, description, achievements, technologies, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      company, role, location, employment_type, start_date, end_date, duration,
      is_current || false, description,
      JSON.stringify(achievements || []),
      JSON.stringify(technologies || []),
      display_order || 0
    ];

    const result = await db.query(query, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/experiences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company, role, location, employment_type, start_date, end_date, duration,
      is_current, description, achievements, technologies, display_order
    } = req.body;

    const query = `
      UPDATE experiences
      SET
        company = COALESCE($1, company),
        role = COALESCE($2, role),
        location = COALESCE($3, location),
        employment_type = COALESCE($4, employment_type),
        start_date = COALESCE($5, start_date),
        end_date = COALESCE($6, end_date),
        duration = COALESCE($7, duration),
        is_current = COALESCE($8, is_current),
        description = COALESCE($9, description),
        achievements = CASE WHEN $10::jsonb IS NOT NULL THEN $10::jsonb ELSE achievements END,
        technologies = CASE WHEN $11::jsonb IS NOT NULL THEN $11::jsonb ELSE technologies END,
        display_order = COALESCE($12, display_order)
      WHERE id = $13
      RETURNING *;
    `;

    const values = [
      company, role, location, employment_type, start_date, end_date, duration,
      is_current, description,
      achievements ? JSON.stringify(achievements) : null,
      technologies ? JSON.stringify(technologies) : null,
      display_order,
      id
    ];

    const result = await db.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Experience not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/experiences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM experiences WHERE id = $1', [id]);
    res.json({ success: true, message: 'Experience deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Projects endpoints
router.get('/projects', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects ORDER BY display_order ASC, id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const {
      title, slug, role, category, overview, scale_architecture,
      responsibilities, technologies, live_url, github_url, is_featured, display_order
    } = req.body;

    const query = `
      INSERT INTO projects (
        title, slug, role, category, overview, scale_architecture,
        responsibilities, technologies, live_url, github_url, is_featured, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      title, slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), role, category,
      overview, scale_architecture,
      JSON.stringify(responsibilities || []),
      JSON.stringify(technologies || []),
      live_url, github_url, is_featured ?? true, display_order || 0
    ];

    const result = await db.query(query, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, slug, role, category, overview, scale_architecture,
      responsibilities, technologies, live_url, github_url, is_featured, display_order
    } = req.body;

    const query = `
      UPDATE projects
      SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        role = COALESCE($3, role),
        category = COALESCE($4, category),
        overview = COALESCE($5, overview),
        scale_architecture = COALESCE($6, scale_architecture),
        responsibilities = CASE WHEN $7::jsonb IS NOT NULL THEN $7::jsonb ELSE responsibilities END,
        technologies = CASE WHEN $8::jsonb IS NOT NULL THEN $8::jsonb ELSE technologies END,
        live_url = COALESCE($9, live_url),
        github_url = COALESCE($10, github_url),
        is_featured = COALESCE($11, is_featured),
        display_order = COALESCE($12, display_order)
      WHERE id = $13
      RETURNING *;
    `;

    const values = [
      title, slug, role, category, overview, scale_architecture,
      responsibilities ? JSON.stringify(responsibilities) : null,
      technologies ? JSON.stringify(technologies) : null,
      live_url, github_url, is_featured, display_order, id
    ];

    const result = await db.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Skills & Categories endpoints
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM skill_categories ORDER BY display_order ASC, id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/skills', async (req, res) => {
  try {
    const { category_id, name, years_experience, display_order } = req.body;
    const result = await db.query(`
      INSERT INTO skills (category_id, name, years_experience, display_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [category_id, name, years_experience, display_order || 0]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, years_experience, display_order } = req.body;
    const result = await db.query(`
      UPDATE skills
      SET
        category_id = COALESCE($1, category_id),
        name = COALESCE($2, name),
        years_experience = COALESCE($3, years_experience),
        display_order = COALESCE($4, display_order)
      WHERE id = $5
      RETURNING *;
    `, [category_id, name, years_experience, display_order, id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM skills WHERE id = $1', [id]);
    res.json({ success: true, message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Reset Database endpoint (allows resetting to default seed data)
router.post('/reset-seed', async (req, res) => {
  try {
    const seed = require('../scripts/seed');
    await seed();
    res.json({ success: true, message: 'Database reset and re-seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
