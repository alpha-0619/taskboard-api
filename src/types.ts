import { Request } from 'express';

export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
}

export type TaskStatus = 'open' | 'in_progress' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigneeId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  taskId: string;
  uploadedBy: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  contentBase64: string;
  createdAt: string;
}

export interface Invite {
  id: string;
  projectId: string;
  token: string;
  role: MemberRole;
  createdBy: string;
  maxUses: number;
  useCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  projectId: string | null;
  actorId: string;
  action: string;
  metadata: string | null;
  createdAt: string;
}

export interface AuthedRequest extends Request {
  user?: User;
  project?: Project;
  task?: Task;
}
