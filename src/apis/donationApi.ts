import httpClient from "../lib/http";
import {
  Donation,
  DonationFilters,
  DonationsResponse,
} from "../types/donation";

const DONATION_ENDPOINTS = {
  DONATIONS: "/donations",
  DONATION_BY_ID: (id: string) => `/donations/${id}`,
  DONATION_APPROVE: (id: string) => `/donations/${id}/approve`,
  DONATION_REJECT: (id: string) => `/donations/${id}/reject`,
};

export interface ApproveDonationDto {
  note?: string;
}

export interface RejectDonationDto {
  reason: string;
}

export const donationApi = {
  // Get all donations with pagination and filters
  getDonations: async (
    filters?: DonationFilters,
  ): Promise<DonationsResponse> => {
    return httpClient.get(DONATION_ENDPOINTS.DONATIONS, { params: filters });
  },

  // Get donation by ID
  getDonationById: async (id: string): Promise<Donation> => {
    return httpClient.get(DONATION_ENDPOINTS.DONATION_BY_ID(id));
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
};
