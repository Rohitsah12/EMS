import api from './axios';
import { LoginCredentials, AuthResponse, Employee } from '@/types';

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Get current user profile
  getProfile: async (): Promise<Employee> => {
    const response = await api.get('/auth/me');
    return response.data.data.employee;
  },

  // Refresh token
  refreshToken: async (): Promise<void> => {
    await api.post('/auth/refresh');
  },
};