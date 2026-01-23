import { API_ENDPOINTS } from '../constants';
import httpClient from '../lib/http';
import { ApiResponse, User } from '../types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  // Login
  login: async (data: LoginDto): Promise<ApiResponse<AuthResponse>> => {
    return httpClient.post(API_ENDPOINTS.LOGIN, data);
  },

  // Register
  register: async (data: RegisterDto): Promise<ApiResponse<AuthResponse>> => {
    return httpClient.post(API_ENDPOINTS.REGISTER, data);
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    return httpClient.post(API_ENDPOINTS.LOGOUT);
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return httpClient.get(API_ENDPOINTS.ME);
  },
};
