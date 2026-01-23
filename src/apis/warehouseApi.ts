import { API_ENDPOINTS } from '../constants';
import httpClient from '../lib/http';
import {
  ApiResponse,
  WarehouseItem,
  WarehouseStats,
  PaginatedResponse,
  PaginationParams,
} from '../types';

export const warehouseApi = {
  // Get all warehouse items with pagination and filters
  getWarehouseItems: async (params?: Partial<PaginationParams> & {
    category?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<WarehouseItem>>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE, { params });
  },

  // Get warehouse statistics
  getWarehouseStats: async (): Promise<ApiResponse<WarehouseStats>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE_STATS);
  },

  // Export warehouse data to Excel
  exportWarehouse: async (): Promise<Blob> => {
    const response = await httpClient.getInstance().get(
      API_ENDPOINTS.WAREHOUSE_EXPORT,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};
