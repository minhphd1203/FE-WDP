export interface VolunteerRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  status: "pending" | "approved" | "rejected";
  registeredAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface ApproveVolunteerRequest {
  registrationId: string;
}

export interface RejectVolunteerRequest {
  registrationId: string;
  rejectionReason?: string;
}

export interface VolunteersResponse {
  items: VolunteerRegistration[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
