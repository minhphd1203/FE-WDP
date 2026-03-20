import { API_ENDPOINTS } from "../constants";
import httpClient from "../lib/http";
import { ApiResponse } from "../types";

export interface AdminDashboardStats {
  openEvents: number;
  pendingRequests: number;
  pendingRequestBreakdown?: {
    rescue?: number;
    replenishment?: number;
  };
  totalStock: number;
  totalAccounts: number;
  activeAccounts?: number;
}

export const adminDashboardApi = {
  getStats: async (): Promise<ApiResponse<AdminDashboardStats>> => {
    return httpClient.get<ApiResponse<AdminDashboardStats>>(
      API_ENDPOINTS.ADMIN_DASHBOARD_STATS,
    );
  },
};
