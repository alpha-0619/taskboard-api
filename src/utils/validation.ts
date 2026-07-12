import { ValidationError } from '../errors';
import { TaskStatus } from '../types';

const TASK_STATUSES: TaskStatus[] = ['open', 'in_progress', 'done'];

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
