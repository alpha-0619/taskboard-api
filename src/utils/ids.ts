import { randomBytes, randomUUID } from 'node:crypto';

export function generateId(): string {
  return randomUUID();
}

export function generateInviteToken(): string {
  return randomBytes(24).toString('base64url');
}
