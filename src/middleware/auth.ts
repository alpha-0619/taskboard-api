import { NextFunction, Response } from 'express';
import * as userRepository from '../repositories/userRepository';
import * as projectRepository from '../repositories/projectRepository';
import { ForbiddenError, UnauthorizedError } from '../errors';
import { AuthedRequest, MemberRole } from '../types';

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

export function requireProjectRole(allowedRoles: MemberRole[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction): void => {
    const membership = projectRepository.getMembership(req.params.projectId, req.user!.id);
    if (!membership || !allowedRoles.includes(membership.role)) {
      throw new ForbiddenError('you do not have permission to perform this action');
    }
    next();
  };
}
