import { db } from '../db';
import { MemberRole, Project, ProjectMember } from '../types';

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

interface MemberRow {
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ownerId: row.owner_id,
    createdAt: row.created_at,
  };
}

function toMember(row: MemberRow): ProjectMember {
  return {
    projectId: row.project_id,
    userId: row.user_id,
    role: row.role as MemberRole,
    joinedAt: row.joined_at,
  };
}

export function create(input: { id: string; name: string; description: string | null; ownerId: string; createdAt: string }): Project {
  db.prepare(
    `INSERT INTO projects (id, name, description, owner_id, created_at) VALUES (@id, @name, @description, @ownerId, @createdAt)`
  ).run(input);
  return { id: input.id, name: input.name, description: input.description, ownerId: input.ownerId, createdAt: input.createdAt };
}

export function findById(id: string): Project | null {
  const row = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(id) as ProjectRow | undefined;
  return row ? toProject(row) : null;
}

export function update(id: string, fields: { name?: string; description?: string | null }): Project | null {
  const existing = findById(id);
  if (!existing) return null;
  const name = fields.name ?? existing.name;
  const description = fields.description === undefined ? existing.description : fields.description;
  db.prepare(`UPDATE projects SET name = ?, description = ? WHERE id = ?`).run(name, description, id);
  return findById(id);
}

export function remove(id: string): void {
  db.prepare(`DELETE FROM attachments WHERE task_id IN (SELECT id FROM tasks WHERE project_id = ?)`).run(id);
  db.prepare(`DELETE FROM comments WHERE task_id IN (SELECT id FROM tasks WHERE project_id = ?)`).run(id);
  db.prepare(`DELETE FROM tasks WHERE project_id = ?`).run(id);
  db.prepare(`DELETE FROM project_members WHERE project_id = ?`).run(id);
  db.prepare(`DELETE FROM audit_log WHERE project_id = ?`).run(id);
  db.prepare(`DELETE FROM projects WHERE id = ?`).run(id);
}

export function listForUser(userId: string): Project[] {
  const rows = db
    .prepare(
      `SELECT p.* FROM projects p
       JOIN project_members m ON m.project_id = p.id
       WHERE m.user_id = ?
       ORDER BY p.created_at DESC`
    )
    .all(userId) as ProjectRow[];
  return rows.map(toProject);
}

export function addMember(projectId: string, userId: string, role: MemberRole, joinedAt: string): void {
  db.prepare(
    `INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(project_id, user_id) DO UPDATE SET role = excluded.role`
  ).run(projectId, userId, role, joinedAt);
}

export function getMembership(projectId: string, userId: string): ProjectMember | null {
  const row = db
    .prepare(`SELECT * FROM project_members WHERE project_id = ? AND user_id = ?`)
    .get(projectId, userId) as MemberRow | undefined;
  return row ? toMember(row) : null;
}

export function listMembers(projectId: string): ProjectMember[] {
  const rows = db.prepare(`SELECT * FROM project_members WHERE project_id = ?`).all(projectId) as MemberRow[];
  return rows.map(toMember);
}
