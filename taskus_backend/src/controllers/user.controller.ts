// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /user/:userId
export const getUserInfo = async (req: AuthRequest, res: Response) => {
    const { userId } = req.params as { userId: string };
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, role: true, pic: true }
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
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'username and password are required' });
        return;
    } 
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jwt.sign({ userId: user.id, organisationId: user.organisationId, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' }); //generates token
        res.json({
            authToken: token,
            userInfo: { userId: user.id, username: user.username, email: user.email, role: user.role, pic: user.pic }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /user/request
export const requestAccount = async (req: Request, res: Response) => {
    const { username, email, password, pic, organisationId } = req.body;
    if (!username || !email || !password || !organisationId) {
        res.status(400).json({ error: 'username, email, password and organisationId are required' });
        return;
    } 
    try {
        //avoid email repetition with existing requests and existing users
        const existingEmailRequest = await prisma.userRequest.findFirst({ where: { email } });
        if (existingEmailRequest) {
            res.status(409).json({ error: 'A request with this email already exists' });
            return;
        }
        const existingUsernameRequest = await prisma.userRequest.findFirst({ where: { username } });
        if (existingUsernameRequest) {
            res.status(409).json({ error: 'A request with this username already exists' });
            return;
        }
        const existingEmailUser = await prisma.user.findFirst({ where: { email } });
        if (existingEmailUser) {
            res.status(409).json({ error: 'A user with this email already exists' });
            return;
        }
        const existingUsernameUser = await prisma.user.findFirst({ where: { username } });
        if (existingUsernameUser) {
            res.status(409).json({ error: 'A user with this username already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRequest = await prisma.userRequest.create({
            data: { username, email, password: hashedPassword, pic, organisationId }
        });
        res.status(201).json({ message: 'Request submitted successfully', requestId: userRequest.id });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /user/updateInfo
export const editInformation = async (req: AuthRequest, res: Response) => {
    const { newUsername, newEmail, newPic } = req.body;
    if (!newUsername && !newEmail) {
        res.status(400).json({ error: 'newUsername and/or newEmail are required' });
        return;
    } 
    const userId = req.user!.userId;
    try {
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(newUsername && { username: newUsername }),
                ...(newEmail && { email: newEmail }),
                ...(newPic && { pic: newPic }),
            },
            select: { id: true, username: true, email: true, role: true, pic: true }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /user/self/:userId
export const removeUser = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    try {
        await prisma.user.delete({ where: { id: userId } });
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /user/passwordRequest
export const requestPasswordChange = async (req: AuthRequest, res: Response) => {
    // TODO: email service
    res.json({ message: 'Password reset email sent' });
};

// POST /user/create (admin)
export const createAccount = async (req: AuthRequest, res: Response) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
        res.status(400).json({ error: 'username, email, password and role are required' });
        return;
    }
    const organisationId = req.user!.organisationId;
    try {
        const existingEmailUser = await prisma.user.findFirst({ where: { email } });
        if (existingEmailUser) {
            res.status(409).json({ error: 'A user with this email already exists' });
            return;
        }
        const existingUsernameUser = await prisma.user.findFirst({ where: { username } });
        if (existingUsernameUser) {
            res.status(409).json({ error: 'A user with this username already exists' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, email, password: hashedPassword, role, organisationId, pic: null },
            select: { id: true, username: true, email: true, role: true, pic: true }
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
            select: { id: true, username: true, email: true, role: true, pic: true }
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
        await prisma.$transaction([
           prisma.user.create({
            data: {
                username: request.username,
                email: request.email,
                password: request.password,
                pic: request.pic,
                organisationId: request.organisationId,
                role: 'member'
            }
            }),
            prisma.userRequest.delete({ where: { id: userRequestId } }) 
        ]);
        
        res.json({ message: 'User accepted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /user/:userRequestId/reject (admin)
export const rejectUserRequest = async (req: AuthRequest, res: Response) => {
    const { userRequestId } = req.params as { userRequestId: string };
    try {
        await prisma.userRequest.delete({ where: { id: userRequestId } });
        res.json({ message: 'Request rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /user/:userId (admin)
export const removeUserFromOrganisation = async (req: AuthRequest, res: Response) => {
    const { userId } = req.params as { userId: string };
    try {
        await prisma.user.delete({ where: { id: userId } });
        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /user/:userId/role (admin)
export const updateRole = async (req: AuthRequest, res: Response) => {
    const { userId } = req.params as { userId: string };
    const { newRole } = req.body;
        if (!newRole) {
        res.status(400).json({ error: 'newRole is required' });
        return;
    }
    try {
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
            select: { id: true, username: true, email: true, role: true, pic: true }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};