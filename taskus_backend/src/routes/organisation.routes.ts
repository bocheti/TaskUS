import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { getOrganisation, updateOrganisation, createOrganisation } from '../controllers/organisation.controller';

const router = Router();

router.post('/', createOrganisation);
router.get('/:organisationId', authenticate, getOrganisation);
router.put('/', authenticate, isAdmin, updateOrganisation);

export default router;