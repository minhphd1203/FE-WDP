import httpClient from "../lib/http";
import {
  Donation,
  DonationFilters,
  DonationsResponse,
} from "../types/donation";

const DONATION_ENDPOINTS = {
  DONATIONS: "/admin/donations",
  DONATION_BY_ID: (eventId: string, donationId: string) => `/events/${eventId}/donations/${donationId}`,
  DONATION_APPROVE: (id: string) => `/admin/donations/${id}/approve`,
  DONATION_REJECT: (id: string) => `/admin/donations/${id}/reject`,
  BULK_APPROVE: "/admin/donations/bulk-approve",
  BULK_REJECT: "/admin/donations/bulk-reject",
};

export interface ApproveDonationDto {
  note?: string;
}

export interface RejectDonationDto {
  reason: string;
}

export interface BulkApproveDonationsDto {
  ids: string[];
  note?: string;
}

export interface BulkRejectDonationsDto {
  ids: string[];
  reason: string;
}

export const donationApi = {
  // Get all donations with pagination and filters
  getDonations: async (
    filters?: DonationFilters,
  ): Promise<DonationsResponse> => {
    // Set default values for required params
    const params = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      order: 'DESC' as 'DESC' | 'ASC',
      ...filters,
    };
    return httpClient.get(DONATION_ENDPOINTS.DONATIONS, { params });
  },

  // Get donation by ID
  getDonationById: async (eventId: string, donationId: string): Promise<Donation> => {
    return httpClient.get(DONATION_ENDPOINTS.DONATION_BY_ID(eventId, donationId));
  },

  // Approve donation
  approveDonation: async (
    id: string,
    data: ApproveDonationDto,
  ): Promise<Donation> => {
    return httpClient.patch(DONATION_ENDPOINTS.DONATION_APPROVE(id), data);
  },

  // Reject donation
  rejectDonation: async (
    id: string,
    data: RejectDonationDto,
  ): Promise<Donation> => {
    return httpClient.patch(DONATION_ENDPOINTS.DONATION_REJECT(id), data);
  },

  // Bulk approve donations
  bulkApproveDonations: async (
    data: BulkApproveDonationsDto,
  ): Promise<any> => {
    return httpClient.patch(DONATION_ENDPOINTS.BULK_APPROVE, data);
  },

  // Bulk reject donations
  bulkRejectDonations: async (
    data: BulkRejectDonationsDto,
  ): Promise<any> => {
    return httpClient.patch(DONATION_ENDPOINTS.BULK_REJECT, data);
  },
};
