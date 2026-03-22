import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
  getTask,
  toggleStatus,
  getTasksByUser,
  getTasksByTaskGroup,
  getTasksByProject,
  createTask,
  deleteTask,
  editTask
} from '../controllers/task.controller';

const router = Router();

// Protected
router.get('/byUser', authenticate, getTasksByUser);
router.get('/byTaskGroup/:taskGroupId', authenticate, getTasksByTaskGroup);
router.get('/:taskId', authenticate, getTask);
router.put('/status/:taskId', authenticate, toggleStatus);

// Admin
router.post('/', authenticate, isAdmin, createTask);
router.delete('/:taskId', authenticate, isAdmin, deleteTask);
router.put('/:taskId', authenticate, isAdmin, editTask);
router.get('/byProject/:projectId', authenticate, isAdmin, getTasksByProject);

export default router;