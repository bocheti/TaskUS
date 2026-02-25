import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
  getProject,
  getProjectsByUser,
  getAllProjects,
  createProject,
  deleteProject,
  addMember,
  removeMember
} from '../controllers/project.controller';

const router = Router();

router.get('/byUser', authenticate, getProjectsByUser);
router.get('/all', authenticate, isAdmin, getAllProjects); //(this one is from admin too, needed to put it here to have static routes before dynamic ones)
router.get('/:projectId', authenticate, getProject);

router.post('/', authenticate, isAdmin, createProject);
router.delete('/:projectId', authenticate, isAdmin, deleteProject);
router.post('/:projectId/member/:userId', authenticate, isAdmin, addMember);
router.delete('/:projectId/member/:userId', authenticate, isAdmin, removeMember);

export default router;