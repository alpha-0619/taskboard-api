import { Router, Response } from 'express';
import * as projectService from '../services/projectService';
import { requireAuth } from '../middleware/auth';
import { requireProjectMembership } from '../middleware/projectContext';
import { AuthedRequest } from '../types';

export const router = Router();

router.use(requireAuth);

router.post('/', (req: AuthedRequest, res: Response) => {
  const project = projectService.createProject(req.user!.id, req.body);
  res.status(201).json({ project });
});

router.get('/', (req: AuthedRequest, res: Response) => {
  const projects = projectService.listProjectsForUser(req.user!.id);
  res.json({ projects });
});

router.get('/:projectId', requireProjectMembership, (req: AuthedRequest, res: Response) => {
  res.json({ project: req.project });
});

router.patch('/:projectId', (req: AuthedRequest, res: Response) => {
  const project = projectService.updateProject(req.params.projectId, req.user!.id, req.body);
  res.json({ project });
});

router.delete('/:projectId', (req: AuthedRequest, res: Response) => {
  projectService.deleteProject(req.params.projectId, req.user!.id);
  res.status(204).send();
});

router.get('/:projectId/members', requireProjectMembership, (req: AuthedRequest, res: Response) => {
  const members = projectService.listMembers(req.params.projectId, req.user!.id);
  res.json({ members });
});

router.post('/:projectId/members', (req: AuthedRequest, res: Response) => {
  projectService.addMemberDirectly(req.params.projectId, req.user!.id, req.body);
  res.status(201).json({ status: 'added' });
});
