import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { getOrganisation, getAllOrganisations, updateOrganisation, createOrganisation } from '../controllers/organisation.controller';
import upload from '../middleware/upload.middleware';
import { uploadUserPic } from '../controllers/user.controller';
import { sensitiveLimiter, uploadLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/', sensitiveLimiter, createOrganisation);
router.get('/all', getAllOrganisations);
router.get('/:organisationId', authenticate, getOrganisation);
router.put('/', authenticate, isAdmin, updateOrganisation);
router.post('/uploadPic', authenticate, isAdmin, uploadLimiter, upload.single('pic'), uploadUserPic);
    

export default router;