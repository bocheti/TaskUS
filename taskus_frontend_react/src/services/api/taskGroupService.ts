import apiClient from './client';
import {
  TaskGroup,
  CreateTaskGroupRequest,
  UpdateTaskGroupRequest,
} from '@/types';

export const taskGroupService = {
  getTaskGroup: async (taskGroupId: string): Promise<TaskGroup> => {
    const response = await apiClient.get<TaskGroup>(`/taskGroup/${taskGroupId}`);
    return response.data;
  },

  getTaskGroupsByProject: async (projectId: string): Promise<TaskGroup[]> => {
    const response = await apiClient.get<TaskGroup[]>(`/taskGroup/byProject/${projectId}`);
    return response.data;
  },

  // admin routes
  
  createTaskGroup: async (data: CreateTaskGroupRequest): Promise<TaskGroup> => {
    const response = await apiClient.post<TaskGroup>('/taskGroup', data);
    return response.data;
  },

  updateTaskGroup: async (taskGroupId: string, data: UpdateTaskGroupRequest): Promise<TaskGroup> => {
    const response = await apiClient.put(`/taskGroup/${taskGroupId}`, data);
    return response.data;
  },

  deleteTaskGroup: async (taskGroupId: string): Promise<void> => {
    await apiClient.delete(`/taskGroup/${taskGroupId}`);
  },
};