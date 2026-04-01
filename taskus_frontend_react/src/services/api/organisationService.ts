import apiClient from './client';
import {
  Organisation,
  OrganisationListItem,
  CreateOrganisationRequest,
  CreateOrganisationResponse,
  UpdateOrganisationRequest,
} from '@/types';

export const organisationService = {

  // public routes
  
  getAllOrganisations: async (): Promise<OrganisationListItem[]> => {  // Changed return type
    const response = await apiClient.get<OrganisationListItem[]>('/organisation/all');
    return response.data;
  },

  createOrganisation: async (data: CreateOrganisationRequest): Promise<CreateOrganisationResponse> => {
    const response = await apiClient.post<CreateOrganisationResponse>('/organisation', data);
    return response.data;
  },

  // authenticated routes
  
  getOrganisation: async (): Promise<Organisation> => {
    const response = await apiClient.get<Organisation>('/organisation');
    return response.data;
  },

  updateOrganisation: async (data: UpdateOrganisationRequest): Promise<Organisation> => {
    const response = await apiClient.put<Organisation>('/organisation', data);
    return response.data;
  },

  uploadPic: async (file: File): Promise<Organisation> => {
    const formData = new FormData();
    formData.append('pic', file);
    
    const response = await apiClient.post<Organisation>(
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