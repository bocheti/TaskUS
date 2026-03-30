import apiClient from './client';
import {
  User,
  UserRequest,
  LoginCredentials,
  LoginResponse,
  CreateAccountRequest,
  CreateUserRequest,
  UpdateUserRoleRequest,
} from '@/types';

export const userService = {
  // public routes
  
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/user/login', credentials);
    return response.data;
  },

  requestAccount: async (data: CreateAccountRequest): Promise<void> => {
    await apiClient.post('/user/request', data);
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/user/resetPasswordRequest', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/user/resetPassword', { token, newPassword });
  },

  // authenticated routes
  
  getUserInfo: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/user/${userId}`);
    return response.data;
  },

  deleteUser: async (): Promise<void> => {
    await apiClient.delete('/user/self');
  },

  uploadPic: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('pic', file);
    
    const response = await apiClient.post<User>(
      '/user/uploadPic',
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
  
  createUser: async (data: CreateUserRequest): Promise<void> => {
    await apiClient.post('/user/create', data);
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/user/all');
    return response.data;
  },

  getAllUserRequests: async (): Promise<UserRequest[]> => {
    const response = await apiClient.get<UserRequest[]>('/user/requests');
    return response.data;
  },

  acceptUserRequest: async (userRequestId: string): Promise<void> => {
    await apiClient.post(`/user/${userRequestId}/accept`);
  },

  rejectUserRequest: async (userRequestId: string): Promise<void> => {
    await apiClient.post(`/user/${userRequestId}/reject`);
  },

  updateUserRole: async (userId: string, data: UpdateUserRoleRequest): Promise<void> => {
    await apiClient.put(`/user/${userId}/role`, data);
  },
};