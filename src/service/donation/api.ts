import httpClient from "../../lib/http";
import {
  ApproveDonationRequest,
  CreateDonationRequest,
  DonationData,
  DonationFilters,
  DonationsResponse,
  RejectDonationRequest,
} from "../../types/donation";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

const DONATION_ENDPOINTS = {
  ADMIN_DONATIONS: "/admin/donations",
  ADMIN_DONATION_BY_ID: (id: string) => `/admin/donations/${id}`,
  APPROVE: (id: string) => `/admin/donations/${id}/approve`,
  REJECT: (id: string) => `/admin/donations/${id}/reject`,
  EVENT_DONATIONS: (eventId: string) => `/events/${eventId}/donations`,
  EVENT_DONATION_BY_ID: (eventId: string, donationId: string) =>
    `/events/${eventId}/donations/${donationId}`,
  MY_DONATIONS: (eventId: string) => `/events/${eventId}/donations/mine`,
} as const;

export const donationService = {
  listDonations: (filters?: DonationFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.eventId) params.append("eventId", filters.eventId);
    if (filters?.from) params.append("from", filters.from);
    if (filters?.to) params.append("to", filters.to);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.order) params.append("order", filters.order);

    const query = params.toString();
    return httpClient.get<ApiResponse<DonationsResponse>>(
      query
        ? `${DONATION_ENDPOINTS.ADMIN_DONATIONS}?${query}`
        : DONATION_ENDPOINTS.ADMIN_DONATIONS,
    );
  },

  getDonation: (id: string) =>
    httpClient.get<ApiResponse<DonationData>>(
      DONATION_ENDPOINTS.ADMIN_DONATION_BY_ID(id),
    ),

  approveDonation: (id: string, data?: ApproveDonationRequest) =>
    httpClient.patch<ApiResponse<DonationData>>(
      DONATION_ENDPOINTS.APPROVE(id),
      data || {},
    ),

  rejectDonation: (id: string, data: RejectDonationRequest) =>
    httpClient.patch<ApiResponse<DonationData>>(
      DONATION_ENDPOINTS.REJECT(id),
      data,
    ),

  createDonation: (eventId: string, data: CreateDonationRequest) =>
    httpClient.post<ApiResponse<DonationData>>(
      DONATION_ENDPOINTS.EVENT_DONATIONS(eventId),
      data,
    ),

  getDonationByEvent: (eventId: string, donationId: string) =>
    httpClient.get<ApiResponse<DonationData>>(
      DONATION_ENDPOINTS.EVENT_DONATION_BY_ID(eventId, donationId),
    ),

  getMyDonations: (eventId: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const query = params.toString();
    return httpClient.get<ApiResponse<DonationsResponse>>(
      query
        ? `${DONATION_ENDPOINTS.MY_DONATIONS(eventId)}?${query}`
        : DONATION_ENDPOINTS.MY_DONATIONS(eventId),
    );
  },
};

export default donationService;
