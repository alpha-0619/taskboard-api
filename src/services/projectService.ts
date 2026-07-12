import * as projectRepository from '../repositories/projectRepository';
import * as auditRepository from '../repositories/auditRepository';
import { generateId } from '../utils/ids';
import { optionalString, requireString } from '../utils/validation';
import { ForbiddenError, NotFoundError, ValidationError } from '../errors';
import { MemberRole, Project } from '../types';

export function createProject(ownerId: string, body: unknown): Project {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('request body is required');
  }
  const { name: rawName, description: rawDescription } = body as Record<string, unknown>;
  const name = requireString(rawName, 'name', { maxLength: 200 });
  const description = optionalString(rawDescription, 'description', { maxLength: 2000 });

  const now = new Date().toISOString();
  const project = projectRepository.create({ id: generateId(), name, description, ownerId, createdAt: now });
  projectRepository.addMember(project.id, ownerId, 'owner', now);
  auditRepository.record({ projectId: project.id, actorId: ownerId, action: 'project.created' });
  return project;
}

export function getProjectForMember(projectId: string, userId: string): Project {
  const membership = projectRepository.getMembership(projectId, userId);
  if (!membership) {
    throw new ForbiddenError('you are not a member of this project');
  }
  const project = projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundError('project not found');
  }
  return project;
}

export function listProjectsForUser(userId: string): Project[] {
  return projectRepository.listForUser(userId);
}

export function updateProject(projectId: string, userId: string, body: unknown): Project {
  const membership = projectRepository.getMembership(projectId, userId);
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new ForbiddenError('only the owner or an admin can update this project');
  }
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('request body is required');
  }
  const { name: rawName, description: rawDescription } = body as Record<string, unknown>;
  const fields: { name?: string; description?: string | null } = {};
  if (rawName !== undefined) fields.name = requireString(rawName, 'name', { maxLength: 200 });
  if (rawDescription !== undefined) fields.description = optionalString(rawDescription, 'description', { maxLength: 2000 });

  const updated = projectRepository.update(projectId, fields);
  if (!updated) {
    throw new NotFoundError('project not found');
  }
  auditRepository.record({ projectId, actorId: userId, action: 'project.updated' });
  return updated;
}

export function deleteProject(projectId: string, userId: string): void {
  const project = projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundError('project not found');
  }
  if (project.ownerId !== userId) {
    throw new ForbiddenError('only the owner can delete this project');
  }
  projectRepository.remove(projectId);
}

export function addMemberDirectly(projectId: string, requestedBy: string, body: unknown): void {
  const membership = projectRepository.getMembership(projectId, requestedBy);
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new ForbiddenError('only the owner or an admin can add members');
  }
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('request body is required');
  }
  const { userId: rawUserId, role: rawRole } = body as Record<string, unknown>;
  const userId = requireString(rawUserId, 'userId');
  const role = requireString(rawRole, 'role') as MemberRole;
  if (!['admin', 'editor', 'viewer'].includes(role)) {
    throw new ValidationError('role must be one of: admin, editor, viewer');
  }
  projectRepository.addMember(projectId, userId, role, new Date().toISOString());
  auditRepository.record({ projectId, actorId: requestedBy, action: 'project.member_added', metadata: { userId, role } });
}

export function listMembers(projectId: string, requestedBy: string) {
  const membership = projectRepository.getMembership(projectId, requestedBy);
  if (!membership) {
    throw new ForbiddenError('you are not a member of this project');
  }
  return projectRepository.listMembers(projectId);
}

export function isProjectMember(projectId: string, userId: string): boolean {
  return projectRepository.getMembership(projectId, userId) !== null;
}
