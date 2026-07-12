import { db } from '../db';
import { Task, TaskStatus } from '../types';

interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  assignee_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    assigneeId: row.assignee_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function create(input: {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigneeId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}): Task {
  db.prepare(
    `INSERT INTO tasks (id, project_id, title, description, status, assignee_id, created_by, created_at, updated_at)
     VALUES (@id, @projectId, @title, @description, @status, @assigneeId, @createdBy, @createdAt, @updatedAt)`
  ).run(input);
  return {
    id: input.id,
    projectId: input.projectId,
    title: input.title,
    description: input.description,
    status: input.status,
    assigneeId: input.assigneeId,
    createdBy: input.createdBy,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function findById(id: string): Task | null {
  const row = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(id) as TaskRow | undefined;
  return row ? toTask(row) : null;
}

export function listForProject(projectId: string, status?: TaskStatus): Task[] {
  const rows = status
    ? (db.prepare(`SELECT * FROM tasks WHERE project_id = ? AND status = ? ORDER BY created_at DESC`).all(projectId, status) as TaskRow[])
    : (db.prepare(`SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC`).all(projectId) as TaskRow[]);
  return rows.map(toTask);
}

export function update(
  id: string,
  fields: Partial<{ title: string; description: string | null; status: TaskStatus; assigneeId: string | null }>,
  updatedAt: string
): Task | null {
  const existing = findById(id);
  if (!existing) return null;
  const merged = {
    title: fields.title ?? existing.title,
    description: fields.description === undefined ? existing.description : fields.description,
    status: fields.status ?? existing.status,
    assigneeId: fields.assigneeId === undefined ? existing.assigneeId : fields.assigneeId,
  };
  db.prepare(
    `UPDATE tasks SET title = @title, description = @description, status = @status, assignee_id = @assigneeId, updated_at = @updatedAt WHERE id = @id`
  ).run({ ...merged, updatedAt, id });
  return findById(id);
}

export function remove(id: string): void {
  db.prepare(`DELETE FROM attachments WHERE task_id = ?`).run(id);
  db.prepare(`DELETE FROM comments WHERE task_id = ?`).run(id);
  db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
}
