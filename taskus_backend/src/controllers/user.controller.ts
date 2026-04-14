import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendAcceptanceEmail, sendRejectionEmail, sendPasswordResetEmail } from '../utils/email';
import { uploadImage } from '../utils/blobStorage';

// GET /user/:userId
export const getUserInfo = async (req: AuthRequest, res: Response) => {
    const { userId } = req.params as { userId: string };
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, firstName: true, lastName: true, email: true, role: true, pic: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /user/login
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    } 
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jwt.sign({ id: user.id, organisationId: user.organisationId, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1d' });
        res.json({
            authToken: token,
            userInfo: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                organisationId: user.organisationId,
                role: user.role,
                pic: user.pic
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /user/request
export const requestAccount = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, organisationId } = req.body;
    if (!firstName || !lastName || !email || !password || !organisationId) {
        res.status(400).json({ error: 'firstName, lastName, email, password and organisationId are required' });
        return;
    } 
    if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
    }
    try {
        const existingEmailRequest = await prisma.userRequest.findFirst({ where: { email } });
        if (existingEmailRequest) {
            res.status(409).json({ error: 'A request with this email already exists' });
            return;
        }
        const existingEmailUser = await prisma.user.findFirst({ where: { email } });
        if (existingEmailUser) {
            res.status(409).json({ error: 'A user with this email already exists' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRequest = await prisma.userRequest.create({
            data: { firstName, lastName, email, password: hashedPassword, organisationId }
        });
        res.status(201).json({ message: 'Request submitted successfully', requestId: userRequest.id });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /user/:userId
export const removeUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params as { userId: string };
  try {
    const userToBeRemoved = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToBeRemoved) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const isSelf = req.user!.id === userId;
    const isAdminOfSameOrg = req.user!.role === 'admin' && userToBeRemoved.organisationId === req.user!.organisationId;
    if (!isSelf && !isAdminOfSameOrg) {
      res.status(403).json({ error: 'Unauthorized: You can only delete your own account or users in your organisation as an admin' });
      return;
    }
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { responsibleId: userId } }),
      prisma.projectMember.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /user/passwordRequest
export const requestPasswordChange = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'email is required' });
        return;
    }
    try {
        const user = await prisma.user.findFirst({ where: { email } });
        res.json({ message: 'If that email exists, a reset link will be sent to it shortly.' });
        if (!user) {
            return;
        }
        const resetToken = jwt.sign({ id: user.id, purpose: 'password-reset' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
        const resetLink = `https://taskus.app/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail(email, resetLink);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /user/resetPassword
export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        res.status(400).json({ error: 'token and newPassword are required' });
        return;
    }
    if (newPassword.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, purpose: string };
        if (decoded.purpose !== 'password-reset') {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// POST /user/uploadPic
export const uploadUserPic = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }
  const userId = req.user!.id;
  const fileName = `${userId}.jpg`;
  try {
    const url = await uploadImage('user-pics', fileName, req.file.buffer);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { pic: url },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        pic: true
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /user/create (admin)
export const createAccount = async (req: AuthRequest, res: Response) => {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
        res.status(400).json({ error: 'firstName, lastName, email, password and role are required' });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
    }
    const organisationId = req.user!.organisationId;
    try {
        const existingEmailUser = await prisma.user.findFirst({ where: { email } });
        if (existingEmailUser) {
            res.status(409).json({ error: 'A user with this email already exists' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { firstName, lastName, email, password: hashedPassword, role, organisationId, pic: null },
            select: { id: true, firstName: true, lastName: true, email: true, role: true, pic: true }
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /user/all (admin)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    const organisationId = req.user!.organisationId;
    try {
        const users = await prisma.user.findMany({
            where: { organisationId },
            select: { id: true, firstName: true, lastName: true, email: true, role: true, pic: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /user/requests (admin)
export const getAllRequests = async (req: AuthRequest, res: Response) => {
    const organisationId = req.user!.organisationId;
    try {
        const requests = await prisma.userRequest.findMany({ where: { organisationId } });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /user/:userRequestId/accept (admin)
export const acceptUserRequest = async (req: AuthRequest, res: Response) => {
    const { userRequestId } = req.params as { userRequestId: string };
    try {
        const request = await prisma.userRequest.findUnique({ where: { id: userRequestId } });
        if (!request) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }
        const organisation = await prisma.organisation.findUnique({ where: { id: request.organisationId } });
        if (!organisation) {
            res.status(404).json({ error: 'Organisation not found' });
            return;
        }
        await prisma.$transaction([
            prisma.user.create({
                data: {
                    firstName: request.firstName,
                    lastName: request.lastName,
                    email: request.email,
                    password: request.password,
                    pic: request.pic,
                    organisationId: request.organisationId,
                    role: 'member'
                }
            }),
            prisma.userRequest.delete({ where: { id: userRequestId } })
        ]);
        await sendAcceptanceEmail(request.email, request.firstName, organisation.name);
        res.json({ message: 'User accepted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /user/:userRequestId/reject (admin)
export const rejectUserRequest = async (req: AuthRequest, res: Response) => {
    const { userRequestId } = req.params as { userRequestId: string };    
    try {
        const request = await prisma.userRequest.findUnique({ where: { id: userRequestId } });
        if (!request) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }
        const organisation = await prisma.organisation.findUnique({ where: { id: request.organisationId } });
        if (!organisation) {
            res.status(404).json({ error: 'Organisation not found' });
            return;
        }
        await prisma.userRequest.delete({ where: { id: userRequestId } });
        await sendRejectionEmail(request.email, request.firstName, organisation.name);
        res.json({ message: 'Request rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /user/:userId (admin)
export const updateRole = async (req: AuthRequest, res: Response) => {
    const { userId } = req.params as { userId: string };
    try {
        const userToBeUpdated = await prisma.user.findUnique({ where: { id: userId } });
        if (!userToBeUpdated) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (userToBeUpdated.organisationId !== req.user!.organisationId) {
            res.status(403).json({ error: 'Unauthorized: This user does not belong to your organisation' });
            return;
        }
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role: userToBeUpdated.role === 'admin' ? 'member' : 'admin' },
            select: { id: true, firstName: true, lastName: true, email: true, role: true, pic: true }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};