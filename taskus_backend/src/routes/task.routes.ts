import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
  getTask,
  toggleStatus,
  getTasksByUser,
  getTasksByTaskGroup,
  getTasksByProject,
  getTasksByUserAndProject,
  createTask,
  deleteTask,
  editTask,
  getAllTasks
} from '../controllers/task.controller';

const router = Router();

// Protected
router.get('/byUser/:userId', authenticate, getTasksByUser);
router.get('/byTaskGroup/:taskGroupId', authenticate, getTasksByTaskGroup);
router.get('/all', authenticate, isAdmin, getAllTasks); //(this one is from admin too, needed to put it here to have static routes before dynamic ones)
router.get('/:taskId', authenticate, getTask);
router.put('/status/:taskId', authenticate, toggleStatus);
router.get('/byUserAndProject/:projectId', authenticate, getTasksByUserAndProject);

// Admin
router.post('/', authenticate, isAdmin, createTask);
router.delete('/:taskId', authenticate, isAdmin, deleteTask);
router.put('/:taskId', authenticate, isAdmin, editTask);
router.get('/byProject/:projectId', authenticate, isAdmin, getTasksByProject);

export default router;