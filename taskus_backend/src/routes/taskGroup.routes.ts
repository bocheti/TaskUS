import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { getTaskGroup, getTaskGroupsByProject, createTaskGroup, editTaskGroup, deleteTaskGroup } from '../controllers/taskGroup.controller';

const router = Router();

router.get('/:taskGroupId', authenticate, getTaskGroup);
router.get('/byProject/:projectId', authenticate, getTaskGroupsByProject);

router.post('/', authenticate, isAdmin, createTaskGroup);
router.put('/:taskGroupId', authenticate, isAdmin, editTaskGroup);
router.delete('/:taskGroupId', authenticate, isAdmin, deleteTaskGroup);

export default router;