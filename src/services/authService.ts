import { apiClient } from './apiClient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'CUSTOMER';
}

export const authService = {
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    return apiClient('/auth/me', {
      method: 'GET'
    });
  },
  
  createProfile: async (data: { name: string, email: string }): Promise<UserProfile> => {
    return apiClient('/auth/profile', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
