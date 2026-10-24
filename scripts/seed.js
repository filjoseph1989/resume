const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

// Each data/<slug>.json file is one resume.
const DATA_DIR = path.join(__dirname, '..', 'data');

function readSeedFiles(slug) {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  return files
    .map(f => ({ slug: path.basename(f, '.json'), file: path.join(DATA_DIR, f) }))
    .filter(r => !slug || r.slug === slug)
    .map(r => ({ slug: r.slug, data: JSON.parse(fs.readFileSync(r.file, 'utf8')) }));
}

// Seeds every resume, or only `slug` when given. Returns the seeded slugs.
async function seed(slug) {
  const resumes = readSeedFiles(slug);
  if (slug && resumes.length === 0) {
    throw new Error(`No seed file for resume "${slug}"`);
  }

  const client = await pool.connect();
  try {
    console.log('Beginning database seeding...');
    await client.query('BEGIN');

    for (const r of resumes) {
      await client.query(`
        INSERT INTO resumes (slug, data, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
      `, [r.slug, JSON.stringify(r.data)]);
      console.log(`  Seeded resume: ${r.slug}`);
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
    return resumes.map(r => r.slug);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seed(process.argv[2])
    .then(() => {
      console.log('Seeding process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seed;
