const { pool } = require('../db');

async function initDB() {
  const client = await pool.connect();
  try {
    console.log('Beginning database schema initialization...');
    await client.query('BEGIN');

    // Profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        initials VARCHAR(10) DEFAULT 'FE',
        tagline TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        linkedin_url VARCHAR(255),
        github_url VARCHAR(255),
        website_url VARCHAR(255),
        status_text VARCHAR(255),
        status_available BOOLEAN DEFAULT TRUE,
        summary_paragraphs JSONB DEFAULT '[]'::jsonb,
        expertise JSONB DEFAULT '[]'::jsonb,
        stats JSONB DEFAULT '[]'::jsonb,
        raw_markdown TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Skill Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS skill_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50) DEFAULT 'code',
        display_order INT DEFAULT 0
      );
    `);

    // Skills table
    await client.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        category_id INT REFERENCES skill_categories(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        years_experience VARCHAR(50),
        display_order INT DEFAULT 0
      );
    `);

    // Experiences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        company VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        employment_type VARCHAR(100),
        start_date VARCHAR(100),
        end_date VARCHAR(100),
        duration VARCHAR(100),
        is_current BOOLEAN DEFAULT FALSE,
        description TEXT,
        achievements JSONB DEFAULT '[]'::jsonb,
        sub_projects JSONB DEFAULT '[]'::jsonb,
        technologies JSONB DEFAULT '[]'::jsonb,
        display_order INT DEFAULT 0
      );
    `);

    // Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255),
        role VARCHAR(255),
        category VARCHAR(100) DEFAULT 'fullstack',
        overview TEXT,
        scale_architecture TEXT,
        responsibilities JSONB DEFAULT '[]'::jsonb,
        technologies JSONB DEFAULT '[]'::jsonb,
        live_url VARCHAR(255),
        github_url VARCHAR(255),
        is_featured BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0
      );
    `);

    // Education table
    await client.query(`
      CREATE TABLE IF NOT EXISTS education (
        id SERIAL PRIMARY KEY,
        institution VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        field_of_study VARCHAR(255),
        location VARCHAR(255),
        campus_address TEXT,
        dates VARCHAR(100),
        thesis TEXT,
        leadership JSONB DEFAULT '[]'::jsonb,
        core_focus TEXT,
        description TEXT,
        display_order INT DEFAULT 0
      );
    `);

    // Certifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS certifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(255),
        display_order INT DEFAULT 0
      );
    `);

    // References table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "references" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(100),
        profile_url VARCHAR(255),
        relationship VARCHAR(255),
        quote TEXT,
        display_order INT DEFAULT 0
      );
    `);

    // Publications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS publications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0
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
