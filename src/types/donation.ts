export type DonationStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "RECEIVED"
  | "ALLOCATED"
  | "DISPATCHED"
  | "DELIVERED";

export type ItemCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

export interface DonationItemData {
  id: string;
  donationId: string;
  category: string;
  quantity: number;
  condition: ItemCondition;
  imageUrls?: string[] | null;
  note?: string | null;
  expirationDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DonationCreatorProfile {
  id?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export interface DonationCreator {
  id: string;
  email?: string;
  phone?: string;
  profile?: DonationCreatorProfile;
}

export interface DonationEvent {
  id: string;
  title?: string;
  type?: "DONATION" | "VOLUNTEER";
  status?: "OPEN" | "CLOSED" | "COMPLETED" | "DRAFT" | "CANCELED";
  startDate?: string;
  endDate?: string;
}

export interface DonationData {
  id: string;
  creatorId: string;
  eventId: string;
  status: DonationStatus;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  items: DonationItemData[];
  creator?: DonationCreator;
  event?: DonationEvent;
}

export interface DonationsResponse {
  data: DonationData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface DonationFilters {
  status?: DonationStatus;
  eventId?: string;
  from?: string;
  to?: string;
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
