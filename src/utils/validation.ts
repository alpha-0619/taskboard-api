import { ValidationError } from '../errors';
import { MemberRole, TaskStatus } from '../types';

const TASK_STATUSES: TaskStatus[] = ['open', 'in_progress', 'done'];
const INVITABLE_ROLES: MemberRole[] = ['viewer', 'editor'];

export function requireString(value: unknown, field: string, opts: { maxLength?: number } = {}): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${field} is required`);
  }
  if (opts.maxLength && value.length > opts.maxLength) {
    throw new ValidationError(`${field} must be at most ${opts.maxLength} characters`);
  }
  return value.trim();
}

export function optionalString(value: unknown, field: string, opts: { maxLength?: number } = {}): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`);
  }
  if (opts.maxLength && value.length > opts.maxLength) {
    throw new ValidationError(`${field} must be at most ${opts.maxLength} characters`);
  }
  return value.trim();
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, 'email', { maxLength: 254 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('email must be a valid email address');
  }
  return email.toLowerCase();
}

export function validateTaskStatus(value: unknown): TaskStatus {
  if (typeof value !== 'string' || !TASK_STATUSES.includes(value as TaskStatus)) {
    throw new ValidationError(`status must be one of: ${TASK_STATUSES.join(', ')}`);
  }
  return value as TaskStatus;
}

export function validateInviteRequest(body: unknown): { role: MemberRole; maxUses: number; expiresInDays: number } {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('request body is required');
  }
  const { role: rawRole, maxUses: rawMaxUses, expiresInDays: rawExpiresInDays } = body as Record<string, unknown>;

  const role: MemberRole =
    typeof rawRole === 'string' && INVITABLE_ROLES.includes(rawRole as MemberRole) ? (rawRole as MemberRole) : 'editor';

  const maxUses = typeof rawMaxUses === 'number' && rawMaxUses > 0 ? Math.min(Math.floor(rawMaxUses), 50) : 1;
  const expiresInDays =
    typeof rawExpiresInDays === 'number' && rawExpiresInDays > 0 ? Math.min(Math.floor(rawExpiresInDays), 30) : 7;

  return { role, maxUses, expiresInDays };
}
