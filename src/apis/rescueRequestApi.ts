import { API_ENDPOINTS } from '../constants';
import httpClient from '../lib/http';
import {
  ApiResponse,
  ReliefRequest,
  PaginatedResponse,
  RescueRequestStatus,
  RescueRequestPriority,
  AssignTeamsDto,
  ReviewRescueRequestDto,
  CancelRescueRequestDto,
} from '../types';

export interface RescueRequestFilters {
  status?: RescueRequestStatus;
  priority?: RescueRequestPriority;
  assigned?: boolean; // Filter by assigned status: true = đã phân công, false = chưa phân công
  q?: string; // Search by address
  from?: string; // From date (YYYY-MM-DD)
  to?: string; // To date (YYYY-MM-DD)
  page?: number;
  limit?: number;
}

export const rescueRequestApi = {
  // Get all rescue requests with filters
  getRescueRequests: async (
    filters?: RescueRequestFilters
  ): Promise<ApiResponse<PaginatedResponse<ReliefRequest>>> => {
    return httpClient.get(API_ENDPOINTS.RESCUE_REQUESTS, { params: filters });
  },

  // Get rescue request by ID
  getRescueRequest: async (id: string): Promise<ApiResponse<ReliefRequest>> => {
    return httpClient.get(API_ENDPOINTS.RESCUE_REQUEST_BY_ID(id));
  },

  // Assign teams to rescue request (Admin only)
  assignTeams: async (
    id: string,
    data: AssignTeamsDto
  ): Promise<ApiResponse<ReliefRequest>> => {
    return httpClient.post(API_ENDPOINTS.RESCUE_REQUEST_ASSIGN(id), data);
  },

  // Get assignments for a rescue request (Admin only)
  getAssignments: async (id: string): Promise<ApiResponse<any>> => {
    return httpClient.get(API_ENDPOINTS.RESCUE_REQUEST_ASSIGN(id));
  },

  // Review rescue request (Admin only)
  reviewRequest: async (
    id: string,
    data: ReviewRescueRequestDto
  ): Promise<ApiResponse<ReliefRequest>> => {
    return httpClient.patch(API_ENDPOINTS.RESCUE_REQUEST_REVIEW(id), data);
  },

  // Cancel rescue request
  cancelRequest: async (
    id: string,
    data?: CancelRescueRequestDto
  ): Promise<ApiResponse<ReliefRequest>> => {
    return httpClient.patch(API_ENDPOINTS.RESCUE_REQUEST_CANCEL(id), data);
  },
};
