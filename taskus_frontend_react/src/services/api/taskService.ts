import apiClient from './client';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskStatusRequest,
  UpdateTaskResponsibleRequest,
} from '@/types';

export const taskService = {

  // authenticated routes

  getTask: async (taskId: string): Promise<Task> => {
    const response = await apiClient.get<Task>(`/task/${taskId}`);
    return response.data;
  },

  updateTaskStatus: async (taskId: string, data: UpdateTaskStatusRequest): Promise<Task> => {
    const response = await apiClient.put<Task>(`/task/status/${taskId}`, data);
    return response.data;
  },

  getTasksByUser: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/task/byUser');
    return response.data;
  },

  getTasksByTaskGroup: async (taskGroupId: string): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/task/byTaskGroup/${taskGroupId}`);
    return response.data;
  },

  getTasksByUserAndProject: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/task/byUserAndProject/${projectId}`);
    return response.data;
  },

  // admin routes
  
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post<Task>('/task', data);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/task/${taskId}`);
  },

  updateTaskResponsible: async (taskId: string, data: UpdateTaskResponsibleRequest): Promise<Task> => {
    const response = await apiClient.put<Task>(`/task/${taskId}`, data);
    return response.data;
  },

  getTasksByProject: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/task/byProject/${projectId}`);
    return response.data;
  },
};