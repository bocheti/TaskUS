import apiClient from './client';
import {
  Organisation,
  CreateOrganisationRequest,
  CreateOrganisationResponse,
  UpdateOrganisationRequest,
  UploadPicResponse,
} from '@/types';

export const organisationService = {

  // public routes
  
  getAllOrganisations: async (): Promise<Organisation[]> => {
    const response = await apiClient.get<Organisation[]>('/organisation/all');
    return response.data;
  },

  createOrganisation: async (data: CreateOrganisationRequest): Promise<CreateOrganisationResponse> => {
    const response = await apiClient.post<CreateOrganisationResponse>('/organisation', data);
    return response.data;
  },

  // authenticated routes
  
  getOrganisation: async (organisationId: string): Promise<Organisation> => {
    const response = await apiClient.get<Organisation>(`/organisation/${organisationId}`);
    return response.data;
  },

  updateOrganisation: async (data: UpdateOrganisationRequest): Promise<Organisation> => {
    const response = await apiClient.put<Organisation>('/organisation', data);
    return response.data;
  },

  uploadPic: async (file: File): Promise<UploadPicResponse> => {
    const formData = new FormData();
    formData.append('pic', file);
    
    const response = await apiClient.post<UploadPicResponse>(
      '/organisation/uploadPic',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};