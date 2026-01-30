import httpClient from '../lib/http';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../types';

const DONATION_ENDPOINTS = {
  DONATIONS: '/admin/donations',
  DONATION_BY_ID: (id: string) => `/admin/donations/${id}`,
  DONATION_APPROVE: (id: string) => `/admin/donations/${id}/approve`,
  DONATION_REJECT: (id: string) => `/admin/donations/${id}/reject`,
  DONATIONS_BULK_APPROVE: '/admin/donations/bulk-approve',
  DONATIONS_BULK_REJECT: '/admin/donations/bulk-reject',
};

export interface Donation {
  id: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  eventId?: string;
  eventTitle?: string;
  items: DonationItem[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  condition?: string;
  description?: string;
}

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
  getDonations: async (params?: Partial<PaginationParams> & {
    status?: string;
    search?: string;
    eventId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Donation>>> => {
    return httpClient.get(DONATION_ENDPOINTS.DONATIONS, { params });
  },

  // Get donation by ID
  getDonationById: async (id: string): Promise<ApiResponse<Donation>> => {
    return httpClient.get(DONATION_ENDPOINTS.DONATION_BY_ID(id));
  },

  // Approve donation
  approveDonation: async (id: string, data: ApproveDonationDto): Promise<ApiResponse<Donation>> => {
    return httpClient.patch(DONATION_ENDPOINTS.DONATION_APPROVE(id), data);
  },

  // Reject donation
  rejectDonation: async (id: string, data: RejectDonationDto): Promise<ApiResponse<Donation>> => {
    return httpClient.patch(DONATION_ENDPOINTS.DONATION_REJECT(id), data);
  },

  // Bulk approve donations
  bulkApproveDonations: async (data: BulkApproveDonationsDto): Promise<ApiResponse<{ count: number }>> => {
    return httpClient.patch(DONATION_ENDPOINTS.DONATIONS_BULK_APPROVE, data);
  },

  // Bulk reject donations
  bulkRejectDonations: async (data: BulkRejectDonationsDto): Promise<ApiResponse<{ count: number }>> => {
    return httpClient.patch(DONATION_ENDPOINTS.DONATIONS_BULK_REJECT, data);
  },
};
