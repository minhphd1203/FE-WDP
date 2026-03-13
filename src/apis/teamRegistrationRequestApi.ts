import { API_ENDPOINTS } from "../constants";
import httpClient from "../lib/http";
import { ApiResponse } from "../types";

export type TeamRegistrationRequestStatus = "pending" | "approved" | "rejected";

export interface TeamRegistrationEquipment {
  equipmentName: string;
  quantity: number;
  status: string;
}

export interface TeamRegistrationVehicle {
  vehicleTypeCode: string;
  plateNumber: string;
  capacity: number;
  status: string;
}

export interface TeamRegistrationRequester {
  id: string;
  email: string;
  phone: string;
  fullName: string;
}

export interface TeamRegistrationReviewer {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
}

export interface TeamRegistrationRequest {
  id: string;
  name: string;
  area: string;
  teamSize: number;
  baseLocation: string;
  latitude: string;
  longitude: string;
  description: string;
  specialties: string[];
  equipmentList: TeamRegistrationEquipment[];
  vehicles: TeamRegistrationVehicle[];
  status: TeamRegistrationRequestStatus | string;
  reviewNote: string | null;
  approvedTeamId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requestedBy: TeamRegistrationRequester;
  reviewedBy: TeamRegistrationReviewer | null;
}

export interface ReviewTeamRegistrationRequestDto {
  status: "approved" | "rejected";
  reviewNote?: string;
}

export const teamRegistrationRequestApi = {
  getAdminTeamRegistrationRequests: async (): Promise<
    ApiResponse<TeamRegistrationRequest[]>
  > => {
    return httpClient.get<ApiResponse<TeamRegistrationRequest[]>>(
      API_ENDPOINTS.TEAM_REGISTRATION_REQUESTS_ADMIN,
    );
  },

  getAdminTeamRegistrationRequestById: async (
    id: string,
  ): Promise<ApiResponse<TeamRegistrationRequest>> => {
    return httpClient.get<ApiResponse<TeamRegistrationRequest>>(
      API_ENDPOINTS.TEAM_REGISTRATION_REQUEST_BY_ID_ADMIN(id),
    );
  },

  reviewAdminTeamRegistrationRequest: async (
    id: string,
    data: ReviewTeamRegistrationRequestDto,
  ): Promise<ApiResponse<TeamRegistrationRequest>> => {
    return httpClient.patch<ApiResponse<TeamRegistrationRequest>>(
      API_ENDPOINTS.TEAM_REGISTRATION_REQUEST_REVIEW_ADMIN(id),
      data,
    );
  },
};
