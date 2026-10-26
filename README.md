# TaskFlow — Task Management System

A responsive task manager built with React, Vite, Express, and a JSON-file database. Includes CRUD, search, status filters, priority/category metadata, due dates, validation, loading/error/success feedback, and persistent storage.

## Features
- Create, list, replace/edit, patch completion, and delete tasks.
- REST endpoints use GET, POST, PUT, PATCH, and DELETE.
- JSON persistence in `server/db.json` (survives refreshes and server restarts).
- Search by title, description, or category; filter by task status.
- Form validation and API error feedback.
- Responsive desktop/mobile layout.
- Automated API tests and coverage output.

## Requirements
- Node.js 18 or newer
- npm

## Run locally
```bash
npm install
npm run dev
```
The frontend is served by Vite at `http://localhost:5173`; API runs at `http://localhost:3001`. Vite proxies `/api` requests to the API.

## Build and test
```bash
npm run build
npm test
```
Coverage output is printed in the terminal and written to `coverage/`. Do not claim a coverage percentage until `npm test` has completed and the report is reviewed.

## REST API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Replace task fields |
| PATCH | `/api/tasks/:id` | Partial update (`title`, `completed`) |
| DELETE | `/api/tasks/:id` | Delete a task |

Example task:
```json
{
  "title": "Finish project",
  "description": "Complete the next milestone",
  "category": "Study",
  "priority": "high",
  "dueDate": "2026-12-01",
  "completed": false
}
```

## Deployment notes
- Set `PORT` to the platform-provided port for the Express API.
- Set `VITE_API_URL` at build time if the API is hosted on a separate domain. Configure CORS on the API host.
- The JSON file database is suitable for demos and small coursework projects. For multi-instance production deployment, use a managed database.
- The existing AppDeploy live app is separate from this downloadable project. The live AppDeploy source uses `@appdeploy/sdk`; this ZIP is a standalone equivalent project using Express and a local JSON store.

## GitHub workflow checklist
1. Create a feature branch for each logical change.
2. Commit meaningful increments (UI, API, validation, tests, docs, responsive styling).
3. Open a pull request and review it before merging.
4. Add a repository project board and a license appropriate to your course/team.
5. Add a screenshot of the running app and the measured coverage report after running tests.

## License
MIT — see `LICENSE`.
