import * as userRepository from '../repositories/userRepository';
import { generateId } from '../utils/ids';
import { hashPassword, verifyPassword, generateApiKey } from '../utils/crypto';
import { requireEmail, requireString } from '../utils/validation';
import { ConflictError, UnauthorizedError, ValidationError } from '../errors';
import { User } from '../types';

export function register(body: unknown): { user: User; apiKey: string } {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('request body is required');
  }
  const { email: rawEmail, name: rawName, password: rawPassword } = body as Record<string, unknown>;
  const email = requireEmail(rawEmail);
  const name = requireString(rawName, 'name', { maxLength: 120 });
  const password = requireString(rawPassword, 'password', { maxLength: 200 });
  if (password.length < 8) {
    throw new ValidationError('password must be at least 8 characters');
  }

  if (userRepository.findByEmail(email)) {
    throw new ConflictError('an account with this email already exists');
  }

  const apiKey = generateApiKey();
  const user = userRepository.create({
    id: generateId(),
    email,
    name,
    passwordHash: hashPassword(password),
    apiKey,
    createdAt: new Date().toISOString(),
  });
  return { user, apiKey };
}

export function login(body: unknown): { user: User; apiKey: string } {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('request body is required');
  }
  const { email: rawEmail, password: rawPassword } = body as Record<string, unknown>;
  const email = requireEmail(rawEmail);
  const password = requireString(rawPassword, 'password');

  const record = userRepository.findByEmail(email);
  if (!record || !verifyPassword(password, record.passwordHash)) {
    throw new UnauthorizedError('invalid email or password');
  }

  const { passwordHash: _passwordHash, apiKey, ...user } = record;
  return { user, apiKey };
}
