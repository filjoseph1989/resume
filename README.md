# Dynamic Resume & Portfolio

A full-stack, dynamic resume and portfolio web application built with **Node.js**, **Express**, and **PostgreSQL**.

## Architecture & Features

- **Resume JSON (`data/*.json`)**: Each resume is one JSON file, named by its slug: `tech`, `virtual-assistant`, `data-entry`. These files are the seed data.
- **PostgreSQL Database (`resume_db`)**: A single `resumes` table (`slug`, `data JSONB`, `updated_at`) holds one row per resume.
- **RESTful API Backend**: Express routes to list, read, replace and reset each resume's JSON.
- **JSON-rendered pages**: Every resume page renders from `/api/resumes/<slug>`; the slug comes from `<body data-resume="...">`.
  - `/tech/` uses `script.js`.
  - `/profile-apm/` (`virtual-assistant`) and `/profile-data-entry/` (`data-entry`) share `one-page.js`.
- **JSON Editor**: The **"Edit Data"** button on the tech resume opens the resume's JSON for editing, saving and resetting to its seed file.
- **Interactive Features**: Real-time search, skill chip quick-filtering, project category filters, Recruiter vs Detailed view toggles, dark/light theme switcher, raw markdown viewer, and print-to-PDF formatting.

---

## Database Configuration

The application connects to PostgreSQL using credentials matching your local environment:

```env
DATABASE_URL=postgresql://fil:@localhost:5432/resume_db?schema=public
PORT=3000
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Start the Express server on `http://localhost:3000` |
| `npm run dev` | Start development server with automatic file watching |
| `npm test` | Run the integration tests for health and the resume JSON endpoints |
| `npm run seed [slug]` | Load `data/*.json` into the `resumes` table (all, or one slug) |
| `npm run db:init` | Create the `resumes` table (drops the old normalized tables) |

---

## REST API Endpoints

- `GET /health` &mdash; Server and database connection health check
- `GET /api/resumes` &mdash; List resume slugs
- `GET /api/resumes/:slug` &mdash; One resume's JSON
- `PUT /api/resumes/:slug` &mdash; Replace one resume's JSON
- `POST /api/resumes/:slug/reset` &mdash; Reset one resume to `data/<slug>.json`

---

## Backing Up the Database

Use `pg_dump` (installed with PostgreSQL) to back up `resume_db`. Pass the connection details as flags, not `DATABASE_URL`, because the `?schema=public` part of that URL is not accepted by `pg_dump`/`psql`.

```bash
mkdir -p backups
```

### Option 1: Custom-format dump (recommended)

A compressed binary dump that `pg_restore` can restore selectively.

```bash
# Backup
pg_dump -U fil -h localhost -d resume_db -Fc -f backups/resume_db_$(date +%Y%m%d_%H%M%S).dump

# Restore (replaces the existing tables in resume_db)
pg_restore -U fil -h localhost -d resume_db --clean --if-exists backups/<file>.dump
```

### Option 2: Plain SQL dump

A readable `.sql` file of `CREATE TABLE` and data statements.

```bash
# Backup
pg_dump -U fil -h localhost -d resume_db -f backups/resume_db_$(date +%Y%m%d_%H%M%S).sql

# Restore into a fresh database
dropdb -U fil -h localhost resume_db
createdb -U fil -h localhost resume_db
psql -U fil -h localhost -d resume_db -f backups/<file>.sql
```

### Option 3: Export resumes back to `data/*.json`

Edits saved through the JSON editor live only in the database, and `npm run seed` overwrites them with `data/*.json`. To keep those edits in git, write each resume back to its seed file:

```bash
for slug in tech virtual-assistant data-entry; do
  psql -U fil -h localhost -d resume_db -Atc "SELECT jsonb_pretty(data) FROM resumes WHERE slug = '$slug'" > "data/$slug.json"
done
```

PostgreSQL stores JSONB with its keys sorted, so the exported files will have their keys in a different order than the originals. The content is the same.

> `backups/` is git-ignored: dumps contain personal details (phone number, address), so keep them out of the repository.
