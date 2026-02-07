import httpClient from "../../lib/http";
import {
  VolunteerRegistration,
  ApproveVolunteerRequest,
  RejectVolunteerRequest,
} from "../../types/volunteer";
import { ApiResponse } from "../../types";

const VOLUNTEER_ENDPOINTS = {
  REGISTRATIONS: "/volunteer-registrations",
  APPROVE: (id: string) => `/volunteer-registrations/${id}/approve`,
  REJECT: (id: string) => `/volunteer-registrations/${id}/reject`,
} as const;

export const volunteerService = {
  getRegistrations: (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status) params.append("status", status);

    return httpClient.get<ApiResponse<VolunteerRegistration>>(
      `${VOLUNTEER_ENDPOINTS.REGISTRATIONS}?${params.toString()}`,
    );
  },

  getRegistrationById: (id: string) =>
    httpClient.get<ApiResponse<VolunteerRegistration>>(
      `${VOLUNTEER_ENDPOINTS.REGISTRATIONS}/${id}`,
    ),

  approveRegistration: (data: ApproveVolunteerRequest) =>
    httpClient.post<ApiResponse<VolunteerRegistration>>(
      VOLUNTEER_ENDPOINTS.APPROVE(data.registrationId),
      {},
    ),

  rejectRegistration: (data: RejectVolunteerRequest) =>
    httpClient.post<ApiResponse<VolunteerRegistration>>(
      VOLUNTEER_ENDPOINTS.REJECT(data.registrationId),
      { rejectionReason: data.rejectionReason },
    ),
};

export default volunteerService;
