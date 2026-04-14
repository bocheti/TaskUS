import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { isProjectMember } from '../utils/checkTaskAuth';

const parseDeadline = (deadline: string): Date => {
  const [day, month, year] = deadline.split('/').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
};

// GET /task/:taskId
export const getTask = async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params as { taskId: string };
    try {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        if (task.responsibleId !== req.user!.id && req.user!.role !== 'admin') {
            res.status(403).json({ error: 'Unauthorized to access this task: This user is not responsible for it nor an admin' });
            return;
        }
        const responsible = await prisma.user.findUnique({ where: { id: task.responsibleId } });
        if (responsible?.organisationId !== req.user!.organisationId) {
            res.status(403).json({ error: 'Unauthorized to access this task: This user is not from the same organisation as the responsible person' });
            return;
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /task/status/:taskId
export const toggleStatus = async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params as { taskId: string };
    const { newStatus } = req.body;
    const validStatuses = ['Pending', 'InProgress', 'Done'];
    if (!newStatus) {
        res.status(400).json({ error: 'newStatus is required' });
        return;
    }

    if (!validStatuses.includes(newStatus)) {
        res.status(400).json({ error: 'newStatus must be Pending, InProgress or Done' });
        return;
    }
    try {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        if (task.responsibleId !== req.user!.id && req.user!.role !== 'admin') {
            res.status(403).json({ error: `Unauthorized to toggle this task's status: This user is not responsible for it nor an admin` });
            return;
        }
        const updated = await prisma.task.update({
            where: { id: taskId },
            data: {
                status: newStatus,
                completedAt: newStatus === 'Done' ? new Date() : null
            } 
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /task/byUser/:userId
export const getTasksByUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params as { userId: string };
  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (req.user!.id === userId) {
      const tasks = await prisma.task.findMany({
        where: { responsibleId: userId }
      });
      res.json(tasks);
      return;
    }
    if (
      req.user!.role === 'admin' &&
      targetUser.organisationId === req.user!.organisationId
    ) {
      const tasks = await prisma.task.findMany({
        where: { responsibleId: userId }
      });
      res.json(tasks);
      return;
    }
    res.status(403).json({
      error: 'Unauthorized: You can only access your own tasks or users in your organisation as an admin'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /task/byTaskGroup/:taskGroupId
export const getTasksByTaskGroup = async (req: AuthRequest, res: Response) => {
  const { taskGroupId } = req.params as { taskGroupId: string };
  try {
    const taskGroup = await prisma.taskGroup.findUnique({ where: { id: taskGroupId } }); //fetch task group first to get projectId
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
    const tasks = await prisma.task.findMany({ where: { taskGroupId } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /task/byUserAndProject/:projectId
export const getTasksByUserAndProject = async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params as { projectId: string };
    const userId = req.user!.id;
    try {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const isMember = await isProjectMember(userId, projectId);
        if (!isMember) {
            if (req.user!.role !== 'admin') {
                res.status(403).json({ error: 'Unauthorized: You are not a member of this project' });
                return;
            }
            if (project.organisationId !== req.user!.organisationId) {
                res.status(403).json({ error: 'Unauthorized: This project does not belong to your organisation' });
                return;
            }
        }
        const tasks = await prisma.task.findMany({
            where: {
                responsibleId: userId,
                taskGroup: { projectId }
            }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /task/byProject/:projectId (admin)
export const getTasksByProject = async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params as { projectId: string };
    try {
        const member = await isProjectMember(req.user!.id, projectId);//then check if user belongs to the project that contains the task group
        if (!member) {
            if (req.user!.role !== 'admin') {
                res.status(403).json({ error: 'Unauthorized: This user is not a member of this project nor an admin' });
                return;
            }
            // verify the project belongs to the admin's organisation
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project || project.organisationId !== req.user!.organisationId) {
                res.status(403).json({ error: 'Unauthorized: This user is an admin, but not from this organisation' });
                return;
            }
        }
        const taskGroups = await prisma.taskGroup.findMany({
            where: { projectId },
            include: { tasks: true }
        });
        const tasks = taskGroups.flatMap(tg => tg.tasks);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /task (admin)
export const createTask = async (req: AuthRequest, res: Response) => {
    const { title, description, responsibleId, taskGroupId, deadline } = req.body;
    if (!title || !responsibleId || !taskGroupId) {
        res.status(400).json({ error: 'title, responsibleId and taskGroupId are required' });
        return;
    }
    if (deadline && !/^\d{2}\/\d{2}\/\d{4}$/.test(deadline)) {
        res.status(400).json({ error: 'deadline must be in dd/mm/yyyy format' });
        return;
    }
    try {
        const responsible = await prisma.user.findUnique({ where: { id: responsibleId } });
        if (!responsible) {
            res.status(404).json({ error: 'Responsible user not found' });
            return;
        }
        if (responsible.organisationId !== req.user!.organisationId) {
            res.status(403).json({ error: 'Unauthorized to create this task: This user is not from the same organisation as the responsible person' });
            return;
        }
        const taskGroup = await prisma.taskGroup.findUnique({ where: { id: taskGroupId } });
        if (!taskGroup) {
            res.status(404).json({ error: 'Task group for the task to be created in not found' });
            return;
        }
        const task = await prisma.task.create({
            data: {
                title,
                description,
                responsibleId,
                taskGroupId,
                status: 'Pending',
                deadline: deadline ? parseDeadline(deadline) : null,
            }
        });
    res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /task/:taskId (admin)
export const deleteTask = async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params as { taskId: string };
    try {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        const responsible = await prisma.user.findUnique({ where: { id: task.responsibleId } });
        if (responsible?.organisationId !== req.user!.organisationId) {
            res.status(403).json({ error: 'Unauthorized to access this task: This user is not from the same organisation as the responsible person' });
            return;
        }
        await prisma.task.delete({ where: { id: taskId } });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /task/:taskId (admin)
export const editTask = async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params as { taskId: string };
    const { newResponsibleId, newDeadline } = req.body;
    if (!newResponsibleId && newDeadline === undefined) {
        res.status(400).json({ error: 'At least one field is required' });
        return;
    }
    if (newDeadline && !/^\d{2}\/\d{2}\/\d{4}$/.test(newDeadline)) {
    res.status(400).json({ error: 'deadline must be in dd/mm/yyyy format' });
    return;
    }
    try {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        if (newResponsibleId) {
            const newResponsible = await prisma.user.findUnique({ where: { id: newResponsibleId } });
            if (!newResponsible) {
                res.status(404).json({ error: 'New responsible user not found' });
                return;
            }
            if (newResponsible.organisationId !== req.user!.organisationId) {
                res.status(403).json({ error: 'Unauthorized to change responsible: This user is not from the same organisation as the new responsible person' });
                return;
            }
        }
        const updated = await prisma.task.update({
            where: { id: taskId },
           data: {
            ...(newResponsibleId && { responsibleId: newResponsibleId }),
            ...(newDeadline !== undefined && { deadline: newDeadline ? parseDeadline(newDeadline) : null }),
            }
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /task/all (admin)
export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const organisationId = req.user!.organisationId;

    const tasks = await prisma.task.findMany({
      where: {
        taskGroup: {
          project: {
            organisationId,
          },
        },
      },
      include: {
        taskGroup: {
          include: {
            project: true,
          },
        },
        responsible: true,
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};