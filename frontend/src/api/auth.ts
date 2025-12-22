import { apiPost, apiGet } from './client';
import type { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

export const authApi = {
  // Register a new user
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiPost<ApiResponse<AuthResponse>>('/register', data);
  },

  // Login user
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiPost<ApiResponse<AuthResponse>>('/login', data);
  },

  // Logout user
  logout: async (): Promise<ApiResponse<void>> => {
    return apiPost<ApiResponse<void>>('/login/logout');
  },

  // Get current user session
  getCurrentSession: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiGet<ApiResponse<{ user: User }>>('/sessions/me');
  },
};
