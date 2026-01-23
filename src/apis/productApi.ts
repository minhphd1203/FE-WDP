import { API_ENDPOINTS } from '../constants';
import httpClient from '../lib/http';
import {
  ApiResponse,
  Product,
  PaginatedResponse,
  PaginationParams,
} from '../types';

export interface CreateProductDto {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  condition: 'new' | 'used' | 'refurbished';
  description?: string;
  images?: string[];
  donorPhone?: string;
}

export interface VerifyProductDto {
  status: 'verified' | 'rejected';
  rejectionReason?: string;
}

export interface DistributeProductDto {
  teamId: string;
  quantity?: number;
}

export const productApi = {
  // Get all products with pagination and filters
  getProducts: async (params?: Partial<PaginationParams> & {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    return httpClient.get(API_ENDPOINTS.PRODUCTS, { params });
  },

  // Get pending products (for staff verification)
  getPendingProducts: async (): Promise<ApiResponse<Product[]>> => {
    return httpClient.get(API_ENDPOINTS.PRODUCTS, {
      params: { status: 'pending' },
    });
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    return httpClient.get(API_ENDPOINTS.PRODUCT_BY_ID(id));
  },

  // Create new product donation
  createProduct: async (data: CreateProductDto): Promise<ApiResponse<Product>> => {
    return httpClient.post(API_ENDPOINTS.PRODUCTS, data);
  },

  // Verify product (Staff/Admin)
  verifyProduct: async (
    id: string,
    data: VerifyProductDto
  ): Promise<ApiResponse<Product>> => {
    return httpClient.patch(API_ENDPOINTS.PRODUCT_VERIFY(id), data);
  },

  // Distribute product to team (Staff/Admin)
  distributeProduct: async (
    id: string,
    data: DistributeProductDto
  ): Promise<ApiResponse<Product>> => {
    return httpClient.patch(API_ENDPOINTS.PRODUCT_DISTRIBUTE(id), data);
  },

  // Delete product
  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    return httpClient.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
  },
};
