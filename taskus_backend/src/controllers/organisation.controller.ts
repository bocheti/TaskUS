import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { uploadImage } from '../utils/blobStorage';


// POST /organisation/create
export const createOrganisation = async (req: Request, res: Response) => {
  const { organisationName, organisationDescription, username, email, password } = req.body;

  if (!organisationName || !username || !email || !password) {
    res.status(400).json({ error: 'organisationName, username, email and password are required' });
    return;
  }

  try {
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'A user with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          name: organisationName,
          description: organisationDescription ?? null,
          pic: null
        }
      });

      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'admin',
          organisationId: organisation.id,
          pic: null
        }
      });

      return { organisation, user };
    });

    const token = jwt.sign(
      { userId: result.user.id, organisationId: result.organisation.id, role: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      authToken: token,
      userInfo: {
        userId: result.user.id,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
        pic: result.user.pic
      }
    });
  } catch (error){
    res.status(500).json({ error: 'Internal server error' });
    console.log(error);
  }
};

// GET /organisation/:organisationId
export const getOrganisation = async (req: AuthRequest, res: Response) => {
  const { organisationId } = req.params as { organisationId: string };
  try {
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId }
    });
    if (!organisation) {
      res.status(404).json({ error: 'Organisation not found' });
      return;
    }
    res.json(organisation);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /organisation
export const updateOrganisation = async (req: AuthRequest, res: Response) => {
  const { newName, newDescription, newPic } = req.body;
  const organisationId = req.user!.organisationId;
  try {
    const updated = await prisma.organisation.update({
      where: { id: organisationId },
      data: {
        ...(newName && { name: newName }),
        ...(newDescription && { description: newDescription }),
        ...(newPic && { pic: newPic }),
      }
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /organisation/uploadPic (admin)
export const uploadOrganisationPic = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }
  const organisationId = req.user!.organisationId;
  const fileName = `${organisationId}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
  try {
    const url = await uploadImage('organisation-pics', fileName, req.file.buffer, req.file.mimetype);
    const updated = await prisma.organisation.update({
      where: { id: organisationId },
      data: { pic: url }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};