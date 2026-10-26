# TaskFlow Task Management System

TaskFlow is a responsive JavaScript task manager for planning, prioritising, updating, completing, and deleting work. It uses JSON Server as a mock REST backend, so the interface makes real API requests rather than relying on hard-coded browser data.

## Features
- Create tasks with a title, description, category, priority, and due date
- Search by title or description and filter by status, priority, or category
- Edit task details, mark tasks complete, and delete tasks with confirmation
- Visible loading, validation, and API error feedback
- Responsive desktop, tablet, and mobile layout

## Technology
HTML5, CSS3, modular JavaScript, Vite, JSON Server, Vitest, and GitHub.

## Run locally
```bash
npm install
npm run api
npm run dev
```

In a second terminal, run `npm run dev`. The API is available at `http://localhost:3000/tasks`.

## REST endpoints
| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /tasks | Read all tasks |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Replace a task |
| PATCH | /tasks/:id | Update completion status |
| DELETE | /tasks/:id | Remove a task |

## Tests
Run `npm test` for unit tests or `npm run coverage` for a coverage report. Tests cover validation plus GET, POST, PUT, PATCH, and DELETE request behaviour.

## Project delivery
- GitHub repository: https://github.com/Ibross10/task-management-system
- Live application: https://taskflow-cql5pj.v2.appdeploy.ai/
- Figma wireframe: To be added in Figma
- License: MIT
