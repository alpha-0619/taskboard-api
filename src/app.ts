import express, { Express } from 'express';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { router as usersRouter } from './routes/users';
import { router as projectsRouter } from './routes/projects';
import { router as tasksRouter } from './routes/tasks';
import { router as commentsRouter, permalinkRouter as commentPermalinkRouter } from './routes/comments';
import { router as attachmentsRouter } from './routes/attachments';

export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: '15mb' }));
  app.use(requestLogger);

  app.use('/users', usersRouter);
  app.use('/projects', projectsRouter);
  app.use('/projects/:projectId/tasks', tasksRouter);
  app.use('/projects/:projectId/tasks/:taskId/comments', commentsRouter);
  app.use('/projects/:projectId/tasks/:taskId/attachments', attachmentsRouter);
  app.use('/comments', commentPermalinkRouter);

  app.use(errorHandler);

  return app;
}
