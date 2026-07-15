import { Router, Response } from 'express';
import * as taskService from '../services/taskService';
import { requireAuth } from '../middleware/auth';
import { requireProjectMembership, requireTaskInProject } from '../middleware/projectContext';
import { AuthedRequest } from '../types';

export const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireProjectMembership);

router.post('/', (req: AuthedRequest, res: Response) => {
  const task = taskService.createTask(req.params.projectId, req.user!.id, req.body);
  res.status(201).json({ task });
});

router.get('/', (req: AuthedRequest, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const tasks = taskService.listTasksForProject(req.params.projectId, status);
  res.json({ tasks });
});

router.get('/summary', (req: AuthedRequest, res: Response) => {
  try {
    const tasks = taskService.listTasksForProject(req.params.projectId);
    const summary = tasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.status] = (acc[task.status] ?? 0) + 1;
      return acc;
    }, {});
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message, stack: (err as Error).stack });
  }
});

router.get('/:taskId', requireTaskInProject, (req: AuthedRequest, res: Response) => {
  res.json({ task: req.task });
});

router.patch('/:taskId', (req: AuthedRequest, res: Response) => {
  const task = taskService.updateTask(req.params.projectId, req.params.taskId, req.user!.id, req.body);
  res.json({ task });
});

router.delete('/:taskId', (req: AuthedRequest, res: Response) => {
  taskService.deleteTask(req.params.projectId, req.params.taskId, req.user!.id);
  res.status(204).send();
});
