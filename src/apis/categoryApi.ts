import { API_ENDPOINTS } from '../constants';
import httpClient from '../lib/http';
import { ApiResponse, Category, CreateCategoryDto, UpdateCategoryDto, PaginatedResponse } from '../types';

export const categoryApi = {
  // Get all categories
  getCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Category>>> => {
    return httpClient.get(API_ENDPOINTS.CATEGORIES, { params });
  },

  // Get category by ID
  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    return httpClient.get(API_ENDPOINTS.CATEGORY_BY_ID(id));
  },

  // Create category (admin only)
  createCategory: async (data: CreateCategoryDto): Promise<ApiResponse<Category>> => {
    return httpClient.post(API_ENDPOINTS.CATEGORIES, data);
  },

  // Update category (admin only)
  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<ApiResponse<Category>> => {
    return httpClient.put(API_ENDPOINTS.CATEGORY_BY_ID(id), data);
  },

  // Delete category (admin only)
  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    return httpClient.delete(API_ENDPOINTS.CATEGORY_BY_ID(id));
  },
};
