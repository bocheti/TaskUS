import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { isProjectMember } from '../utils/checkTaskAuth';
import { uploadImage } from '../utils/blobStorage';

// GET /project/:projectId
export const getProject = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params as { projectId: string };
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const member = await isProjectMember(req.user!.userId, projectId);
    if (!member) {
      if (req.user!.role !== 'admin') {
        res.status(403).json({ error: 'Unauthorized: This user is not a member of this project nor an admin' });
        return;
      }
      // verify the project belongs to the admin's organisation
      if (!project || project.organisationId !== req.user!.organisationId) {
        res.status(403).json({ error: 'Unauthorized: This user is an admin, but not from this organisation' });
        return;
      }
    }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /project/byUser
export const getProjectsByUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: { project: true }
    });
    const projects = memberships.map(m => m.project);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /project/all (admin)
export const getAllProjects = async (req: AuthRequest, res: Response) => {
  const organisationId = req.user!.organisationId;
  try {
    const projects = await prisma.project.findMany({ where: { organisationId } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /project (admin)
export const createProject = async (req: AuthRequest, res: Response) => {
  const { title, description, pic } = req.body;
  const organisationId = req.user!.organisationId;
  const userId = req.user!.userId;
  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  try {
    const organisation = await prisma.organisation.findUnique({ where: { id: organisationId } });
    if (!organisation) {
      res.status(404).json({ error: 'Organisation not found' });
      return;
    }
    const project = await prisma.$transaction(async (tx) => { //transaction: project gets created, projectmember relation gets created (creator is now part of project)
      const newProject = await tx.project.create({
        data: { title, description, pic, organisationId }
      });

      await tx.projectMember.create({
        data: { userId, projectId: newProject.id }
      });

      return newProject;
    });
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /project/:projectId (admin)
export const deleteProject = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params as { projectId: string };
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.organisationId !== req.user!.organisationId) {
      res.status(403).json({ error: 'Unauthorized: This project does not belong to your organisation' });
      return;
    }
    await prisma.project.delete({ where: { id: projectId } });
    res.json({ message: 'Project deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /project/:projectId/member/:userId (admin)
export const addMember = async (req: AuthRequest, res: Response) => {
  const { projectId, userId } = req.params as { projectId: string; userId: string };
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.organisationId !== req.user!.organisationId) {
      res.status(403).json({ error: 'Unauthorized: This project does not belong to your organisation' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (user.organisationId !== req.user!.organisationId) {
      res.status(403).json({ error: 'Unauthorized: This user does not belong to your organisation' });
      return;
    }
    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });
    if (existing) {
      res.status(409).json({ error: 'User is already a member of this project' });
      return;
    }
    await prisma.projectMember.create({ data: { userId, projectId } });
    res.status(201).json({ message: 'Member added successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /project/:projectId/member/:userId (admin)
export const removeMember = async (req: AuthRequest, res: Response) => {
  const { projectId, userId } = req.params as { projectId: string; userId: string };
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.organisationId !== req.user!.organisationId) {
      res.status(403).json({ error: 'Unauthorized: This project does not belong to your organisation' });
      return;
    }
    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } }
    });
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /project/uploadPic/:projectId (admin)
export const uploadProjectPic = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }
  const { projectId } = req.params as { projectId: string };
  const fileName = `${projectId}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
  try {
    const url = await uploadImage('project-pics', fileName, req.file.buffer, req.file.mimetype);
    res.json({url});
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};