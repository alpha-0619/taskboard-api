# taskboard-api

A small Express + TypeScript REST API for project/task management.

## Stack

- Node.js + TypeScript
- Express 4
- better-sqlite3 (file-backed SQLite, zero external services required)

## Data model

- `users` — email/password auth, plus a bearer API key issued at registration
- `projects` — has an owner; other users join via `project_members`
- `tasks` — belong to a project
- `comments` — belong to a task
- `attachments` — belong to a task, content stored as base64 in SQLite
- `audit_log` — append-only record of notable actions

## Running it

```
npm install
npm run build
npm start
```

The server listens on `PORT` (default `3000`) and creates a SQLite file at
`data/taskboard.sqlite` on first run.

## Auth

All routes except `POST /users/register` and `POST /users/login` require:

```
Authorization: Bearer <apiKey>
```

`apiKey` is returned by `register`/`login`.
