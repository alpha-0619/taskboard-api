import { db } from '../db';
import { Comment } from '../types';

interface CommentRow {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    taskId: row.task_id,
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function create(input: { id: string; taskId: string; authorId: string; body: string; createdAt: string }): Comment {
  db.prepare(
    `INSERT INTO comments (id, task_id, author_id, body, created_at) VALUES (@id, @taskId, @authorId, @body, @createdAt)`
  ).run(input);
  return { id: input.id, taskId: input.taskId, authorId: input.authorId, body: input.body, createdAt: input.createdAt };
}

export function findById(id: string): Comment | null {
  const row = db.prepare(`SELECT * FROM comments WHERE id = ?`).get(id) as CommentRow | undefined;
  return row ? toComment(row) : null;
}

export function listForTask(taskId: string): Comment[] {
  const rows = db.prepare(`SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC`).all(taskId) as CommentRow[];
  return rows.map(toComment);
}

export function remove(id: string): void {
  db.prepare(`DELETE FROM comments WHERE id = ?`).run(id);
}
