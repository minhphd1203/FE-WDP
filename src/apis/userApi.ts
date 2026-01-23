import { API_ENDPOINTS } from '../constants';
import httpClient from '../lib/http';
import {
  ApiResponse,
  User,
  PaginatedResponse,
  PaginationParams,
} from '../types';

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'admin' | 'staff' | 'user';
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  role?: 'admin' | 'staff' | 'user';
  isActive?: boolean;
}

export const userApi = {
  // Get all users with pagination and filters
  getUsers: async (params?: Partial<PaginationParams> & {
    role?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return httpClient.get(API_ENDPOINTS.USERS, { params });
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    return httpClient.get(API_ENDPOINTS.USER_BY_ID(id));
  },

  // Create new user
  createUser: async (data: CreateUserDto): Promise<ApiResponse<User>> => {
    return httpClient.post(API_ENDPOINTS.USERS, data);
  },

  // Update user
  updateUser: async (
    id: string,
    data: UpdateUserDto
  ): Promise<ApiResponse<User>> => {
    return httpClient.put(API_ENDPOINTS.USER_BY_ID(id), data);
  },

  // Delete user
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    return httpClient.delete(API_ENDPOINTS.USER_BY_ID(id));
  },

  // Toggle user active status
  toggleUserStatus: async (id: string): Promise<ApiResponse<User>> => {
    return httpClient.patch(API_ENDPOINTS.USER_BY_ID(id), {
      isActive: 'toggle',
    });
  },
};
