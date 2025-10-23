import { apiClient } from './api';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  TwoFactorRequest,
  User,
} from '@/types';

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  // Register user
  signup: async (data: SignupRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/signup', data);
  },

  // Verify 2FA
  verify2FA: async (data: TwoFactorRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/verify-2fa', data);
  },

  // Get user profile
  getProfile: async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>('/auth/profile');
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    return apiClient.put<{ user: User }>('/auth/profile', data);
  },

  // Health check
  healthCheck: async (): Promise<any> => {
    return apiClient.get('/health');
  },
};