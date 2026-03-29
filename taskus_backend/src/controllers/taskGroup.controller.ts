import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { isProjectMember } from '../utils/checkTaskAuth';

// GET /taskGroup/:taskGroupId
export const getTaskGroup = async (req: AuthRequest, res: Response) => {
    const { taskGroupId } = req.params as { taskGroupId: string };
    try {
        const taskGroup = await prisma.taskGroup.findUnique({ where: { id: taskGroupId } });
        if (!taskGroup) {
            res.status(404).json({ error: 'Task group not found' });
            return;
        }
        
        const member = await isProjectMember(req.user!.id, taskGroup.projectId);//then check if user belongs to the project that contains the task group
        if (!member) {
            if (req.user!.role !== 'admin') {
                res.status(403).json({ error: 'Unauthorized: This user is not a member of this project nor an admin' });
                return;
            }
            // verify the project belongs to the admin's organisation
            const project = await prisma.project.findUnique({ where: { id: taskGroup.projectId } });
            if (!project || project.organisationId !== req.user!.organisationId) {
                res.status(403).json({ error: 'Unauthorized: This user is an admin, but not from this organisation' });
                return;
            }
        }
      
    res.json(taskGroup);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /taskGroup/byProject/:projectId
export const getTaskGroupsByProject = async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params as { projectId: string };
    try {
        const member = await isProjectMember(req.user!.id, projectId);//check if user belongs to the project that contains the task group
        if (!member) {
            if (req.user!.role !== 'admin') {
                res.status(403).json({ error: 'Unauthorized: This user is not a member of this project nor an admin' });
                return;
            }
            // verify the project belongs to admin's organisation
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project || project.organisationId !== req.user!.organisationId) {
                res.status(403).json({ error: 'Unauthorized: This user is an admin, but not from this organisation' });
                return;
            }
        }
        const taskGroups = await prisma.taskGroup.findMany({ where: { projectId } });
        res.json(taskGroups);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /taskGroup (admin)
export const createTaskGroup = async (req: AuthRequest, res: Response) => {
    const { title, description, projectId } = req.body;
    if (!title || !projectId) {
        res.status(400).json({ error: 'title and projectId are required' });
        return;
    }
    try {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        if (project.organisationId !== req.user!.organisationId) {
            res.status(403).json({ error: 'Unauthorized: This project does not belong to the same organisation as the user' });
            return;
        }
        const taskGroup = await prisma.taskGroup.create({
        data: { title, description, projectId }
        });
        res.status(201).json(taskGroup);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /taskGroup/:taskGroupId (admin)
export const editTaskGroup = async (req: AuthRequest, res: Response) => {
    const { taskGroupId } = req.params as { taskGroupId: string };
    const { newTitle, newDescription } = req.body;
    if (!newTitle && !newDescription) {
        res.status(400).json({ error: 'At least one field is required' });
        return;
    }
    try {
        const taskGroup = await prisma.taskGroup.findUnique({ where: { id: taskGroupId } });
         if (!taskGroup) {
            res.status(404).json({ error: 'Task group not found' });
            return;
        }
        const project = await prisma.project.findUnique({ where: { id: taskGroup.projectId } });
        if (!project || project.organisationId !== req.user!.organisationId) {
            res.status(403).json({ error: 'Unauthorized: This task group does not belong to the same organisation as the user' });
            return;
        }
        const updated = await prisma.taskGroup.update({
            where: { id: taskGroupId },
            data: {
                ...(newTitle && { title: newTitle }),
                ...(newDescription && { description: newDescription }),
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /taskGroup/:taskGroupId (admin)
export const deleteTaskGroup = async (req: AuthRequest, res: Response) => {
    const { taskGroupId } = req.params as { taskGroupId: string };
    try {
        const taskGroup = await prisma.taskGroup.findUnique({ where: { id: taskGroupId } });
        if (!taskGroup) {
            res.status(404).json({ error: 'Task group not found' });
            return;
        }
        const project = await prisma.project.findUnique({ where: { id: taskGroup.projectId } });
        if (!project || project.organisationId !== req.user!.organisationId) {
            res.status(403).json({ error: 'Unauthorized: This task group does not belong to the same organisation as the user' });
            return;
        }
        await prisma.$transaction([
            prisma.task.deleteMany({ where: { taskGroupId } }),
            prisma.taskGroup.delete({ where: { id: taskGroupId } })
        ]);
        res.json({ message: 'Task group deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};