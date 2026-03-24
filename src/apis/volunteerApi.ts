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
  EVENT_VOLUNTEERS_EXPORT: (eventId: string) =>
    `/events/${eventId}/volunteer-registrations/export/excel`,
} as const;

const getFileNameFromDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return fileNameMatch?.[1] ?? null;
};

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

  exportEventVolunteersExcel: async (eventId: string) => {
    const response = await httpClient.getInstance().get(
      VOLUNTEER_ENDPOINTS.EVENT_VOLUNTEERS_EXPORT(eventId),
      {
        responseType: "blob",
      },
    );

    return {
      blob: response.data as Blob,
      fileName:
        getFileNameFromDisposition(response.headers["content-disposition"]) ||
        `volunteers-${eventId}.xlsx`,
    };
  },
};

export default volunteerApi;
