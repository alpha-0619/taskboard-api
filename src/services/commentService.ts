import * as commentRepository from '../repositories/commentRepository';
import * as taskService from './taskService';
import * as auditRepository from '../repositories/auditRepository';
import { generateId } from '../utils/ids';
import { requireString } from '../utils/validation';
import { ForbiddenError, NotFoundError, ValidationError } from '../errors';
import { Comment } from '../types';

export function createComment(projectId: string, taskId: string, authorId: string, body: unknown): Comment {
  taskService.getTaskInProject(projectId, taskId);
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('request body is required');
  }
  const { body: rawBody } = body as Record<string, unknown>;
  const text = requireString(rawBody, 'body', { maxLength: 4000 });

  const comment = commentRepository.create({
    id: generateId(),
    taskId,
    authorId,
    body: text,
    createdAt: new Date().toISOString(),
  });
  auditRepository.record({ projectId, actorId: authorId, action: 'comment.created', metadata: { taskId, commentId: comment.id } });
  return comment;
}

export function listCommentsForTask(projectId: string, taskId: string): Comment[] {
  taskService.getTaskInProject(projectId, taskId);
  return commentRepository.listForTask(taskId);
}

export function deleteComment(projectId: string, taskId: string, commentId: string, actorId: string): void {
  taskService.getTaskInProject(projectId, taskId);
  const comment = commentRepository.findById(commentId);
  if (!comment || comment.taskId !== taskId) {
    throw new NotFoundError('comment not found');
  }
  if (comment.authorId !== actorId) {
    throw new ForbiddenError('you can only delete your own comments');
  }
  commentRepository.remove(commentId);
}
