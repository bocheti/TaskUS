import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { getOrganisation, updateOrganisation, createOrganisation } from '../controllers/organisation.controller';
import upload from '../middleware/upload.middleware';
import { uploadUserPic } from '../controllers/user.controller';

const router = Router();

router.post('/', createOrganisation);
router.get('/:organisationId', authenticate, getOrganisation);
router.put('/', authenticate, isAdmin, updateOrganisation);
router.post('/uploadPic', authenticate, isAdmin, upload.single('pic'), uploadUserPic);
    

export default router;