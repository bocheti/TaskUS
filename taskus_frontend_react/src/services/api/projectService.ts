import apiClient from './client';
import {
  Project,
  CreateProjectRequest,
  UploadPicResponse,
} from '@/types';

export const projectService = {
    
  // authenticated routes

  getProject: async (projectId: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/project/${projectId}`);
    return response.data;
  },

  getProjectsByUser: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/project/byUser');
    return response.data;
  },

  addUserToProject: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.post(`/project/${projectId}/member/${userId}`);
  },

  removeUserFromProject: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/project/${projectId}/member/${userId}`);
  },

  uploadPic: async (file: File): Promise<UploadPicResponse> => {
    const formData = new FormData();
    formData.append('pic', file);
    
    const response = await apiClient.post<UploadPicResponse>(
      '/project/uploadPic',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // admin routes
  
  getAllProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/project/all');
    return response.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await apiClient.post<Project>('/project', data);
    return response.data;
  },

  deleteProject: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/project/${projectId}`);
  },
};