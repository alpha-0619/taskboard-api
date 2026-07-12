import { db } from '../db';
import { generateId } from '../utils/ids';

export function record(input: { projectId: string | null; actorId: string; action: string; metadata?: Record<string, unknown> }): void {
  db.prepare(
    `INSERT INTO audit_log (id, project_id, actor_id, action, metadata, created_at) VALUES (@id, @projectId, @actorId, @action, @metadata, @createdAt)`
  ).run({
    id: generateId(),
    projectId: input.projectId,
    actorId: input.actorId,
    action: input.action,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    createdAt: new Date().toISOString(),
  });
}

export function listForProject(projectId: string, limit = 100) {
  return db
    .prepare(`SELECT * FROM audit_log WHERE project_id = ? ORDER BY created_at DESC LIMIT ?`)
    .all(projectId, limit);
}
