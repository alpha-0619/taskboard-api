import { db } from '../db';
import { Invite, MemberRole } from '../types';

interface InviteRow {
  id: string;
  project_id: string;
  token: string;
  role: string;
  created_by: string;
  max_uses: number;
  use_count: number;
  expires_at: string;
  created_at: string;
}

function toInvite(row: InviteRow): Invite {
  return {
    id: row.id,
    projectId: row.project_id,
    token: row.token,
    role: row.role as MemberRole,
    createdBy: row.created_by,
    maxUses: row.max_uses,
    useCount: row.use_count,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export function create(input: {
  id: string;
  projectId: string;
  token: string;
  role: MemberRole;
  createdBy: string;
  maxUses: number;
  expiresAt: string;
  createdAt: string;
}): Invite {
  db.prepare(
    `INSERT INTO project_invites (id, project_id, token, role, created_by, max_uses, use_count, expires_at, created_at)
     VALUES (@id, @projectId, @token, @role, @createdBy, @maxUses, 0, @expiresAt, @createdAt)`
  ).run(input);
  return { ...input, useCount: 0 };
}

export function findActiveByToken(token: string): Invite | null {
  const row = db
    .prepare(`SELECT * FROM project_invites WHERE token = ? AND use_count < max_uses AND expires_at > ?`)
    .get(token, new Date().toISOString()) as InviteRow | undefined;
  return row ? toInvite(row) : null;
}

export function recordUse(id: string): void {
  db.prepare(`UPDATE project_invites SET use_count = use_count + 1 WHERE id = ?`).run(id);
}

export function hasActiveInviteForProject(projectId: string): boolean {
  const row = db
    .prepare(`SELECT 1 FROM project_invites WHERE project_id = ? AND use_count < max_uses AND expires_at > ? LIMIT 1`)
    .get(projectId, new Date().toISOString());
  return row !== undefined;
}
