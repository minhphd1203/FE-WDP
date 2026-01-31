import httpClient from "../../lib/http";
import { EventData, EventsResponse, EventFilters } from "../../types/event";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

const EVENT_ENDPOINTS = {
  EVENTS: "/events",
  EVENT_BY_ID: (id: string) => `/events/${id}`,
} as const;

export const eventService = {
  getEvents: (filters?: EventFilters) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    return httpClient.get<ApiResponse<EventsResponse>>(
      `${EVENT_ENDPOINTS.EVENTS}?${params.toString()}`,
    );
  },

  getEventById: (id: string) =>
    httpClient.get<ApiResponse<EventData>>(EVENT_ENDPOINTS.EVENT_BY_ID(id)),
};

export default eventService;
