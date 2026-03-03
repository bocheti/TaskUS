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
    resetPassword,
    uploadUserPic
} from '../controllers/user.controller';
import upload from '../middleware/upload.middleware';
import { sensitiveLimiter, uploadLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/login', sensitiveLimiter, login);
router.post('/request', sensitiveLimiter, requestAccount);
router.post('/resetPasswordRequest', sensitiveLimiter, requestPasswordChange);
router.post('/resetPassword', sensitiveLimiter, resetPassword);

router.get('/all', authenticate, isAdmin, getAllUsers); //(this one is from admin too, needed to put it here to have static routes before dynamic ones)
router.get('/requests', authenticate, isAdmin, getAllRequests); //and this one too
router.get('/:userId', authenticate, getUserInfo);
router.put('/updateInfo', authenticate, editInformation);
router.delete('/self/:userId', authenticate, removeUser);
router.post('/uploadPic', authenticate, uploadLimiter, upload.single('pic'), uploadUserPic);

router.post('/create', authenticate, isAdmin, createAccount);
router.post('/:userRequestId/accept', authenticate, isAdmin, acceptUserRequest);
router.post('/:userRequestId/reject', authenticate, isAdmin, rejectUserRequest);
router.delete('/:userId', authenticate, isAdmin, removeUserFromOrganisation);
router.put('/:userId/role', authenticate, isAdmin, updateRole);



export default router;