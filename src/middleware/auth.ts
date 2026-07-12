import { NextFunction, Response } from 'express';
import * as userRepository from '../repositories/userRepository';
import { UnauthorizedError } from '../errors';
import { AuthedRequest } from '../types';

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.header('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedError('missing or malformed Authorization header');
  }
  const user = userRepository.findByApiKey(token);
  if (!user) {
    throw new UnauthorizedError('invalid API key');
  }
  req.user = user;
  next();
}
