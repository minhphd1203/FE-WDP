import { API_ENDPOINTS } from '../constants';
import httpClient from '../lib/http';
import {
  ApiResponse,
  Event,
  EventRegistration,
  PaginatedResponse,
  PaginationParams,
} from '../types';

export interface CreateEventDto {
  title: string;
  description: string;
  type: 'DONATION' | 'VOLUNTEER';
  startDate: string;
  endDate: string;
  location?: string;
  teamId?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface UpdateEventStatusDto {
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
}

export interface ApproveRegistrationDto {
  registrationId: string;
  status: 'approved' | 'rejected';
}

export const eventApi = {
  // Get all events with pagination and filters
  getEvents: async (params?: Partial<PaginationParams> & {
    type?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Event>>> => {
    return httpClient.get(API_ENDPOINTS.EVENTS, { params });
  },

  // Get event by ID
  getEventById: async (id: string): Promise<ApiResponse<Event>> => {
    return httpClient.get(API_ENDPOINTS.EVENT_BY_ID(id));
  },

  // Create new event
  createEvent: async (data: CreateEventDto): Promise<ApiResponse<Event>> => {
    return httpClient.post(API_ENDPOINTS.EVENTS, data);
  },

  // Update event
  updateEvent: async (
    id: string,
    data: UpdateEventDto
  ): Promise<ApiResponse<Event>> => {
    return httpClient.put(API_ENDPOINTS.EVENT_BY_ID(id), data);
  },

  // Delete event
  deleteEvent: async (id: string): Promise<ApiResponse<void>> => {
    return httpClient.delete(API_ENDPOINTS.EVENT_BY_ID(id));
  },

  // Update event status
  updateEventStatus: async (
    id: string,
    data: UpdateEventStatusDto
  ): Promise<ApiResponse<Event>> => {
    return httpClient.patch(`${API_ENDPOINTS.EVENT_BY_ID(id)}/status`, data);
  },

  // Register for event
  registerForEvent: async (eventId: string): Promise<ApiResponse<EventRegistration>> => {
    return httpClient.post(API_ENDPOINTS.EVENT_REGISTER(eventId));
  },

  // Get event registrations
  getEventRegistrations: async (
    eventId: string
  ): Promise<ApiResponse<EventRegistration[]>> => {
    return httpClient.get(API_ENDPOINTS.EVENT_REGISTRATIONS(eventId));
  },

  // Approve/Reject registration
  updateRegistrationStatus: async (
    eventId: string,
    data: ApproveRegistrationDto
  ): Promise<ApiResponse<EventRegistration>> => {
    return httpClient.patch(API_ENDPOINTS.EVENT_REGISTRATIONS(eventId), data);
  },
};
