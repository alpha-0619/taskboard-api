import * as attachmentRepository from '../repositories/attachmentRepository';
import * as taskService from './taskService';
import * as auditRepository from '../repositories/auditRepository';
import { generateId } from '../utils/ids';
import { requireString } from '../utils/validation';
import { NotFoundError, ValidationError } from '../errors';
import { Attachment } from '../types';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function createAttachment(projectId: string, taskId: string, uploadedBy: string, body: unknown): Attachment {
  taskService.getTaskInProject(projectId, taskId);
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('request body is required');
  }
  const { filename: rawFilename, contentType: rawContentType, contentBase64: rawContentBase64 } = body as Record<string, unknown>;
  const filename = requireString(rawFilename, 'filename', { maxLength: 255 });
  const contentType = requireString(rawContentType, 'contentType', { maxLength: 100 });
  const contentBase64 = requireString(rawContentBase64, 'contentBase64');

  let buffer: Buffer;
  try {
    buffer = Buffer.from(contentBase64, 'base64');
  } catch {
    throw new ValidationError('contentBase64 must be valid base64');
  }
  if (buffer.length === 0) {
    throw new ValidationError('attachment content must not be empty');
  }
  if (buffer.length > MAX_SIZE_BYTES) {
    throw new ValidationError(`attachment must be smaller than ${MAX_SIZE_BYTES} bytes`);
  }

  const attachment = attachmentRepository.create({
    id: generateId(),
    taskId,
    uploadedBy,
    filename,
    contentType,
    sizeBytes: buffer.length,
    contentBase64,
    createdAt: new Date().toISOString(),
  });
  auditRepository.record({ projectId, actorId: uploadedBy, action: 'attachment.created', metadata: { taskId, attachmentId: attachment.id } });
  return attachment;
}

export function listAttachmentsForTask(projectId: string, taskId: string): Attachment[] {
  taskService.getTaskInProject(projectId, taskId);
  return attachmentRepository.listForTask(taskId);
}

export function getAttachmentInTask(projectId: string, taskId: string, attachmentId: string): Attachment {
  taskService.getTaskInProject(projectId, taskId);
  const attachment = attachmentRepository.findById(attachmentId);
  if (!attachment || attachment.taskId !== taskId) {
    throw new NotFoundError('attachment not found');
  }
  return attachment;
}
