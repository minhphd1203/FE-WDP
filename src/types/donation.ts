export type DonationStatus =
  | "SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "RECEIVED"
  | "ALLOCATED"
  | "DISPATCHED"
  | "DELIVERED";

export type ItemCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
export type ItemStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "RECEIVED"
  | "ALLOCATED"
  | "DISPATCHED"
  | "DELIVERED";

// Category interface
export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Donation Item interface
export interface DonationItem {
  id: string;
  donationId: string;
  categoryId: string;
  name: string;
  unit: string;
  expirationDate: string;
  status: ItemStatus;
  quantity: number;
  condition: ItemCondition;
  imageUrls: string[];
  note: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

// Creator Profile interface
export interface CreatorProfile {
  id: string;
  accountId: string;
  fullName: string | null;
  avatarUrl: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

// Creator interface
export interface Creator {
  id: string;
  email: string;
  phone: string | null;
  passwordHash?: string; // Not returned in list endpoints for security
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  profile: CreatorProfile;
}

// Main Donation interface
export interface Donation {
  id: string;
  creatorId: string;
  eventId: string;
  title: string;
  status: DonationStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  items: DonationItem[];
  creator: Creator;
}

// Pagination meta interface
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Donations data response (nested data structure)
export interface DonationsData {
  data: Donation[];
  meta: PaginationMeta;
}

// Donations response interface (full API response)
export interface DonationsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: DonationsData;
  timestamp: string;
}

export interface DonationFilters {
  status?: string;
  eventId?: string;
  creatorId?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "ASC" | "DESC";
}

export interface CreateDonationItemRequest {
  category: string;
  quantity: number;
  condition?: ItemCondition;
  imageUrls?: string[];
  note?: string;
}

export interface CreateDonationRequest {
  items: CreateDonationItemRequest[];
  note?: string;
}

export interface ApproveDonationRequest {
  note?: string;
}

export interface RejectDonationRequest {
  reason: string;
}
