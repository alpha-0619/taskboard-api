import { Router, Response } from 'express';
import * as attachmentService from '../services/attachmentService';
import { requireAuth } from '../middleware/auth';
import { requireProjectMembership } from '../middleware/projectContext';
import { AuthedRequest } from '../types';

export const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireProjectMembership);

router.post('/', (req: AuthedRequest, res: Response) => {
  const attachment = attachmentService.createAttachment(req.params.projectId, req.params.taskId, req.user!.id, req.body);
  res.status(201).json({ attachment });
});

router.get('/', (req: AuthedRequest, res: Response) => {
  const attachments = attachmentService.listAttachmentsForTask(req.params.projectId, req.params.taskId);
  res.json({ attachments });
});

router.get('/:attachmentId', (req: AuthedRequest, res: Response) => {
  const attachment = attachmentService.getAttachmentInTask(req.params.projectId, req.params.taskId, req.params.attachmentId);
  res.json({ attachment });
});
