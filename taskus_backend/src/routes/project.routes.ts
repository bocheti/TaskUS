import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
  getProject,
  getProjectsByUser,
  getAllProjects,
  getProjectMembers,
  createProject,
  deleteProject,
  updateProject,
  addMember,
  removeMember,
  uploadProjectPic
} from '../controllers/project.controller';
import upload from '../middleware/upload.middleware';
import { uploadLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.get('/byUser', authenticate, getProjectsByUser);
router.get('/all', authenticate, isAdmin, getAllProjects); //(this one is from admin too, needed to put it here to have static routes before dynamic ones)
router.get('/:projectId', authenticate, getProject);
router.get('/:projectId/members', authenticate, getProjectMembers);
router.post('/:projectId/uploadPic', authenticate, isAdmin, uploadLimiter, upload.single('pic'), uploadProjectPic);

router.post('/', authenticate, isAdmin, createProject);
router.delete('/:projectId', authenticate, isAdmin, deleteProject);
router.put('/:projectId', authenticate, isAdmin, updateProject);
router.post('/:projectId/member/:userId', authenticate, isAdmin, addMember);
router.delete('/:projectId/member/:userId', authenticate, isAdmin, removeMember);

export default router;