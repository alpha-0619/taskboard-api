import { Router, Response } from 'express';
import * as userService from '../services/userService';
import { requireAuth } from '../middleware/auth';
import { AuthedRequest } from '../types';

export const router = Router();

router.post('/register', (req, res: Response) => {
  const { user, apiKey } = userService.register(req.body);
  res.status(201).json({ user, apiKey });
});

router.post('/login', (req, res: Response) => {
  const { user, apiKey } = userService.login(req.body);
  res.status(200).json({ user, apiKey });
});

router.get('/me', requireAuth, (req: AuthedRequest, res: Response) => {
  res.json({ user: req.user });
});
