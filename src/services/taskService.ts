import * as taskRepository from '../repositories/taskRepository';
import * as auditRepository from '../repositories/auditRepository';
import { generateId } from '../utils/ids';
import { optionalString, requireString, validateTaskStatus } from '../utils/validation';
import { NotFoundError, ValidationError } from '../errors';
import { Task, TaskStatus } from '../types';

export function createTask(projectId: string, createdBy: string, body: unknown): Task {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('request body is required');
  }
  const { title: rawTitle, description: rawDescription, assigneeId: rawAssigneeId } = body as Record<string, unknown>;
  const title = requireString(rawTitle, 'title', { maxLength: 200 });
  const description = optionalString(rawDescription, 'description', { maxLength: 4000 });
  const assigneeId = optionalString(rawAssigneeId, 'assigneeId');

  const now = new Date().toISOString();
  const task = taskRepository.create({
    id: generateId(),
    projectId,
    title,
    description,
    status: 'open',
    assigneeId,
    createdBy,
    createdAt: now,
    updatedAt: now,
  });
  auditRepository.record({ projectId, actorId: createdBy, action: 'task.created', metadata: { taskId: task.id } });
  return task;
}

export function getTaskInProject(projectId: string, taskId: string): Task {
  const task = taskRepository.findById(taskId);
  if (!task || task.projectId !== projectId) {
    throw new NotFoundError('task not found');
  }
  return task;
}

export function listTasksForProject(projectId: string, status?: string): Task[] {
  const validatedStatus = status !== undefined ? validateTaskStatus(status) : undefined;
  return taskRepository.listForProject(projectId, validatedStatus as TaskStatus | undefined);
}

export function updateTask(projectId: string, taskId: string, actorId: string, body: unknown): Task {
  const existing = getTaskInProject(projectId, taskId);
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('request body is required');
  }
  const { title: rawTitle, description: rawDescription, status: rawStatus, assigneeId: rawAssigneeId } = body as Record<string, unknown>;
  const fields: Partial<{ title: string; description: string | null; status: TaskStatus; assigneeId: string | null }> = {};
  if (rawTitle !== undefined) fields.title = requireString(rawTitle, 'title', { maxLength: 200 });
  if (rawDescription !== undefined) fields.description = optionalString(rawDescription, 'description', { maxLength: 4000 });
  if (rawStatus !== undefined) fields.status = validateTaskStatus(rawStatus);
  if (rawAssigneeId !== undefined) fields.assigneeId = optionalString(rawAssigneeId, 'assigneeId');

  const updated = taskRepository.update(existing.id, fields, new Date().toISOString());
  if (!updated) {
    throw new NotFoundError('task not found');
  }
  auditRepository.record({ projectId, actorId, action: 'task.updated', metadata: { taskId } });
  return updated;
}

export function deleteTask(projectId: string, taskId: string, actorId: string): void {
  getTaskInProject(projectId, taskId);
  taskRepository.remove(taskId);
  auditRepository.record({ projectId, actorId, action: 'task.deleted', metadata: { taskId } });
}
