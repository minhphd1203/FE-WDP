import { API_ENDPOINTS } from "../constants";
import httpClient from "../lib/http";
import {
  ApiResponse,
  WarehouseItem,
  WarehouseStats,
  PaginatedResponse,
  PaginationParams,
} from "../types";
import {
  CreateReceiptRequest,
  CreateReceiptResponse,
  ReceiptListResponse,
  StockListResponse,
} from "../types/warehouse";

export const warehouseApi = {
  // Get all warehouse items with pagination and filters
  getWarehouseItems: async (
    params?: Partial<PaginationParams> & {
      category?: string;
      search?: string;
    },
  ): Promise<ApiResponse<PaginatedResponse<WarehouseItem>>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE, { params });
  },

  // Get warehouse statistics
  getWarehouseStats: async (): Promise<ApiResponse<WarehouseStats>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE_STATS);
  },

  // Export warehouse data to Excel
  exportWarehouse: async (): Promise<Blob> => {
    const response = await httpClient
      .getInstance()
      .get(API_ENDPOINTS.WAREHOUSE_EXPORT, {
        responseType: "blob",
      });
    return response.data;
  },

  // Create receipt from approved donation (nhập hàng vào kho)
  createReceipt: async (
    data: CreateReceiptRequest,
  ): Promise<CreateReceiptResponse> => {
    return httpClient.post("/warehouse/receipts", data);
  },

  // Get receipts list
  getReceipts: async (page = 1, limit = 10): Promise<ReceiptListResponse> => {
    return httpClient.get(`/warehouse/receipts?page=${page}&limit=${limit}`);
  },

  // Get stocks list
  getStocks: async (page = 1, limit = 10): Promise<StockListResponse> => {
    return httpClient.get(`/warehouse/stocks?page=${page}&limit=${limit}`);
  },

  // Get receipt by ID
  getReceiptById: async (receiptId: string): Promise<CreateReceiptResponse> => {
    return httpClient.get(`/warehouse/receipts/${receiptId}`);
  },
};
