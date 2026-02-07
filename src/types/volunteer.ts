export interface VolunteerProfile {
  id: string;
  accountId: string;
  fullName: string;
  address: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerAccount {
  id: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  profile: VolunteerProfile;
}

export interface VolunteerRegistration {
  id: string;
  accountId: string;
  eventId: string;
  account: VolunteerAccount;
  registeredAt: string;
}

export interface VolunteerPaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface VolunteerRegistrationsResponse {
  data: VolunteerRegistration[];
  meta: VolunteerPaginationMeta;
}

export interface ApproveVolunteerRequest {
  registrationId: string;
}

export interface RejectVolunteerRequest {
  registrationId: string;
  rejectionReason?: string;
}
