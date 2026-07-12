import { db } from '../db';
import { Attachment } from '../types';

interface AttachmentRow {
  id: string;
  task_id: string;
  uploaded_by: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  content_base64: string;
  created_at: string;
}

function toAttachment(row: AttachmentRow): Attachment {
  return {
    id: row.id,
    taskId: row.task_id,
    uploadedBy: row.uploaded_by,
    filename: row.filename,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    contentBase64: row.content_base64,
    createdAt: row.created_at,
  };
}

export function create(input: {
  id: string;
  taskId: string;
  uploadedBy: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  contentBase64: string;
  createdAt: string;
}): Attachment {
  db.prepare(
    `INSERT INTO attachments (id, task_id, uploaded_by, filename, content_type, size_bytes, content_base64, created_at)
     VALUES (@id, @taskId, @uploadedBy, @filename, @contentType, @sizeBytes, @contentBase64, @createdAt)`
  ).run(input);
  return {
    id: input.id,
    taskId: input.taskId,
    uploadedBy: input.uploadedBy,
    filename: input.filename,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    contentBase64: input.contentBase64,
    createdAt: input.createdAt,
  };
}

export function findById(id: string): Attachment | null {
  const row = db.prepare(`SELECT * FROM attachments WHERE id = ?`).get(id) as AttachmentRow | undefined;
  return row ? toAttachment(row) : null;
}

export function listForTask(taskId: string): Attachment[] {
  const rows = db.prepare(`SELECT * FROM attachments WHERE task_id = ? ORDER BY created_at ASC`).all(taskId) as AttachmentRow[];
  return rows.map(toAttachment);
}
