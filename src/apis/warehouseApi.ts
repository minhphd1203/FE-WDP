import { API_ENDPOINTS } from '../constants';
import httpClient from '../lib/http';
import {
  ApiResponse,
  WarehouseItem,
  WarehouseStats,
  PaginatedResponse,
  PaginationParams,
  Stock,
  Allocation,
  Receipt,
  AllocationStatus,
  AllocationItem,
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

  // Get warehouse stocks
  getStocks: async (): Promise<ApiResponse<Stock[]>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE_STOCKS);
  },

  // Get allocations with pagination and filters
  getAllocations: async (params?: {
    page?: number;
    limit?: number;
    teamId?: string;
    status?: AllocationStatus;
  }): Promise<ApiResponse<PaginatedResponse<Allocation>>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE_ALLOCATIONS, { params });
  },

  // Get single allocation by ID
  getAllocation: async (id: string): Promise<ApiResponse<Allocation>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE_ALLOCATION_BY_ID(id));
  },

  // Create new allocation
  createAllocation: async (data: {
    items: AllocationItem[];
  }): Promise<ApiResponse<Allocation>> => {
    return httpClient.post(API_ENDPOINTS.WAREHOUSE_ALLOCATIONS, data);
  },

  // Update allocation status
  updateAllocationStatus: async (
    id: string,
    status: AllocationStatus
  ): Promise<ApiResponse<Allocation>> => {
    return httpClient.patch(API_ENDPOINTS.WAREHOUSE_ALLOCATION_STATUS(id), {
      status,
    });
  },

  // Get receipts with pagination
  getReceipts: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Receipt>>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE_RECEIPTS, { params });
  },

  // Get single receipt by ID
  getReceipt: async (id: string): Promise<ApiResponse<Receipt>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE_RECEIPT_BY_ID(id));
  },

  // Create warehouse receipt from approved donation
  createReceipt: async (data: {
    donationId: string;
  }): Promise<ApiResponse<Receipt>> => {
    return httpClient.post(API_ENDPOINTS.WAREHOUSE_RECEIPTS, data);
  },
};
