import { API_ENDPOINTS } from "../constants";
import httpClient from "../lib/http";
import { ApiResponse } from "../types";

export interface StaffDashboardStats {
  pendingProducts: number;
  pendingVolunteerRegistrations: number;
  pendingRescueRequests: number;
  pendingReplenishmentRequests: number;
  totalStockItems: number;
}

export const staffDashboardApi = {
  getStats: async (): Promise<ApiResponse<StaffDashboardStats>> => {
    return httpClient.get<ApiResponse<StaffDashboardStats>>(
      API_ENDPOINTS.STAFF_DASHBOARD_STATS,
    );
  },
};
