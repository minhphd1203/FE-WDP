import { API_ENDPOINTS } from '../constants';
import httpClient from '../lib/http';
import {
  ApiResponse,
  ReliefRequest,
  PaginatedResponse,
  PaginationParams,
} from '../types';

export interface CreateReliefRequestDto {
  title: string;
  description: string;
  requesterPhone: string;
  location: {
    address: string;
    district?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  images?: string[];
}

export interface AssignTeamDto {
  teamId: string;
  notes?: string;
}

export interface UpdateRequestStatusDto {
  status: 'approved' | 'in_progress' | 'completed' | 'rejected';
  notes?: string;
}

export const reliefRequestApi = {
  // Get all relief requests with pagination and filters
  getRequests: async (params?: Partial<PaginationParams> & {
    status?: string;
    urgency?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<ReliefRequest>>> => {
    return httpClient.get(API_ENDPOINTS.RELIEF_REQUESTS, { params });
  },

  // Get relief request by ID
  getRequestById: async (id: string): Promise<ApiResponse<ReliefRequest>> => {
    return httpClient.get(API_ENDPOINTS.RELIEF_REQUEST_BY_ID(id));
  },

  // Create new relief request
  createRequest: async (
    data: CreateReliefRequestDto
  ): Promise<ApiResponse<ReliefRequest>> => {
    return httpClient.post(API_ENDPOINTS.RELIEF_REQUESTS, data);
  },

  // Assign team to request (Admin)
  assignTeam: async (
    id: string,
    data: AssignTeamDto
  ): Promise<ApiResponse<ReliefRequest>> => {
    return httpClient.patch(API_ENDPOINTS.RELIEF_REQUEST_ASSIGN(id), data);
  },

  // Update request status
  updateRequestStatus: async (
    id: string,
    data: UpdateRequestStatusDto
  ): Promise<ApiResponse<ReliefRequest>> => {
    return httpClient.patch(API_ENDPOINTS.RELIEF_REQUEST_BY_ID(id), data);
  },

  // Delete request
  deleteRequest: async (id: string): Promise<ApiResponse<void>> => {
    return httpClient.delete(API_ENDPOINTS.RELIEF_REQUEST_BY_ID(id));
  },
};
