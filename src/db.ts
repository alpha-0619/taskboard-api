import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { DB_PATH } from './config';

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS project_members (
    project_id TEXT NOT NULL REFERENCES projects(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT NOT NULL,
    joined_at TEXT NOT NULL,
    PRIMARY KEY (project_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    assignee_id TEXT REFERENCES users(id),
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id),
    author_id TEXT NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id),
    uploaded_by TEXT NOT NULL REFERENCES users(id),
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    content_base64 TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    actor_id TEXT NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS project_invites (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    token TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    created_by TEXT NOT NULL REFERENCES users(id),
    max_uses INTEGER NOT NULL,
    use_count INTEGER NOT NULL DEFAULT 0,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
  CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
  CREATE INDEX IF NOT EXISTS idx_attachments_task ON attachments(task_id);
  CREATE INDEX IF NOT EXISTS idx_audit_project ON audit_log(project_id);
  CREATE INDEX IF NOT EXISTS idx_invites_project ON project_invites(project_id);
`);
