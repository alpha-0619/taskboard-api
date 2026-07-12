import { db } from '../db';
import { User } from '../types';

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  api_key: string;
  created_at: string;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function create(input: { id: string; email: string; name: string; passwordHash: string; apiKey: string; createdAt: string }): User {
  db.prepare(
    `INSERT INTO users (id, email, name, password_hash, api_key, created_at) VALUES (@id, @email, @name, @passwordHash, @apiKey, @createdAt)`
  ).run(input);
  return { id: input.id, email: input.email, name: input.name, createdAt: input.createdAt };
}

export function findByEmail(email: string): (User & { passwordHash: string; apiKey: string }) | null {
  const row = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as UserRow | undefined;
  if (!row) return null;
  return { ...toUser(row), passwordHash: row.password_hash, apiKey: row.api_key };
}

export function findById(id: string): User | null {
  const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function findByApiKey(apiKey: string): User | null {
  const row = db.prepare(`SELECT * FROM users WHERE api_key = ?`).get(apiKey) as UserRow | undefined;
  return row ? toUser(row) : null;
}
