# Dynamic Resume & Portfolio

A full-stack, dynamic resume and portfolio web application built with **Node.js**, **Express**, and **PostgreSQL**.

## Architecture & Features

- **PostgreSQL Database (`resume_db`)**: Stores normalized relational data across 9 tables (`profiles`, `skill_categories`, `skills`, `experiences`, `projects`, `education`, `certifications`, `references`, `publications`).
- **RESTful API Backend**: Express server with routes for fetching aggregated resume payloads and performing CRUD updates.
- **Frontend & Dynamic Hydration**: Responsive glassmorphic UI that fetches data in real-time from `/api/resume`, while retaining graceful fallback capabilities.
- **Admin / Data Manager Modal**: Built-in modal accessible via the **"Edit Data"** button in the navigation bar to edit profile info, manage work experience, update projects, and add/remove skills directly from the browser.
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
| `npm test` | Run the full integration test suite verifying health, API endpoints, CRUD & DB |
| `npm run seed` | Re-seed `resume_db` tables with baseline resume data |
| `npm run db:init` | Initialize or update PostgreSQL tables schema |

---

## REST API Endpoints

- `GET /health` &mdash; Server and database connection health check
- `GET /api/resume` &mdash; Complete aggregated resume data payload
- `GET /api/profile` &bull; `PUT /api/profile` &mdash; Read/update personal details, summary, and expertise
- `GET /api/experiences` &bull; `POST /api/experiences` &bull; `PUT /api/experiences/:id` &bull; `DELETE /api/experiences/:id` &mdash; Work history
- `GET /api/projects` &bull; `POST /api/projects` &bull; `PUT /api/projects/:id` &bull; `DELETE /api/projects/:id` &mdash; Projects and portfolio
- `GET /api/categories` &bull; `POST /api/skills` &bull; `DELETE /api/skills/:id` &mdash; Skill management
- `POST /api/reset-seed` &mdash; Reset database to default baseline data
