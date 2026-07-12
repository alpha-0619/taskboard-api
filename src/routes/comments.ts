import { Router, Response } from 'express';
import * as commentService from '../services/commentService';
import { requireAuth } from '../middleware/auth';
import { requireProjectMembership } from '../middleware/projectContext';
import { AuthedRequest } from '../types';

export const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireProjectMembership);

router.post('/', (req: AuthedRequest, res: Response) => {
  const comment = commentService.createComment(req.params.projectId, req.params.taskId, req.user!.id, req.body);
  res.status(201).json({ comment });
});

router.get('/', (req: AuthedRequest, res: Response) => {
  const comments = commentService.listCommentsForTask(req.params.projectId, req.params.taskId);
  res.json({ comments });
});

router.delete('/:commentId', (req: AuthedRequest, res: Response) => {
  commentService.deleteComment(req.params.projectId, req.params.taskId, req.params.commentId, req.user!.id);
  res.status(204).send();
});
