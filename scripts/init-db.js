const { pool } = require('../db');

// Tables from the old normalized schema, replaced by the single `resumes` table.
const LEGACY_TABLES = [
  'profiles', 'skills', 'skill_categories', 'experiences', 'projects',
  'education', 'certifications', '"references"', 'publications'
];

async function initDB() {
  const client = await pool.connect();
  try {
    console.log('Beginning database schema initialization...');
    await client.query('BEGIN');

    await client.query(`DROP TABLE IF EXISTS ${LEGACY_TABLES.join(', ')} CASCADE`);

    // One row per resume; the whole resume is stored as a JSON document.
    await client.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        slug VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Database tables created successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  initDB()
    .then(() => {
      console.log('Schema setup completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initDB;
