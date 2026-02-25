import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
    login,
    requestAccount,
    getUserInfo,
    editInformation,
    removeUser,
    requestPasswordChange,
    createAccount,
    getAllUsers,
    getAllRequests,
    acceptUserRequest,
    rejectUserRequest,
    removeUserFromOrganisation,
    updateRole,
} from '../controllers/user.controller';

const router = Router();

router.post('/login', login);
router.post('/request', requestAccount);

router.get('/all', authenticate, isAdmin, getAllUsers); //(this one is from admin too, needed to put it here to have static routes before dynamic ones)
router.get('/:userId', authenticate, getUserInfo);
router.put('/updateInfo', authenticate, editInformation);
router.delete('/self/:userId', authenticate, removeUser);
router.post('/passwordRequest', authenticate, requestPasswordChange);

router.post('/create', authenticate, isAdmin, createAccount);
router.get('/requests', authenticate, isAdmin, getAllRequests);
router.post('/:userRequestId/accept', authenticate, isAdmin, acceptUserRequest);
router.post('/:userRequestId/reject', authenticate, isAdmin, rejectUserRequest);
router.delete('/:userId', authenticate, isAdmin, removeUserFromOrganisation);
router.put('/:userId/role', authenticate, isAdmin, updateRole);



export default router;