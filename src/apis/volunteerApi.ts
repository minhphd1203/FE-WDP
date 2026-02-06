import httpClient from "../lib/http";
import { VolunteerRegistrationsResponse } from "../types/volunteer";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

const VOLUNTEER_ENDPOINTS = {
  EVENT_VOLUNTEERS: (eventId: string) =>
    `/events/${eventId}/volunteer-registrations`,
} as const;

export const volunteerApi = {
  // Get volunteer registrations for an event
  getEventVolunteers: (eventId: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const query = params.toString();
    return httpClient.get<ApiResponse<VolunteerRegistrationsResponse>>(
      query
        ? `${VOLUNTEER_ENDPOINTS.EVENT_VOLUNTEERS(eventId)}?${query}`
        : VOLUNTEER_ENDPOINTS.EVENT_VOLUNTEERS(eventId),
    );
  },
};

export default volunteerApi;
