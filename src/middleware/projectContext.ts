import { NextFunction, Response } from 'express';
import * as projectRepository from '../repositories/projectRepository';
import * as taskService from '../services/taskService';
import { ForbiddenError, NotFoundError } from '../errors';
import { AuthedRequest } from '../types';

export function requireProjectMembership(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const { projectId } = req.params;
  const project = projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundError('project not found');
  }
  const membership = projectRepository.getMembership(projectId, req.user!.id);
  if (!membership) {
    throw new ForbiddenError('you are not a member of this project');
  }
  req.project = project;
  next();
}

export function requireTaskInProject(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const { projectId, taskId } = req.params;
  req.task = taskService.getTaskInProject(projectId, taskId);
  next();
}
