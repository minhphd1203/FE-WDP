export enum UserRole {
  ADMIN = "admin",
  STAFF = "staff",
  USER = "user",
}

export enum EventType {
  RELIEF_TEAM = "relief_team",
  PRODUCT_DONATION = "product_donation",
}

export enum RequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  REJECTED = "rejected",
}

export enum ProductStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  DISTRIBUTED = "distributed",
  REJECTED = "rejected",
}

export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ReliefTeam {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  members: TeamMember[];
  capacity: number;
  currentMembers: number;
  status: "active" | "inactive";
  createdAt: string;
  eventId?: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  joinedAt: string;
  role: "leader" | "member";
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  location?: string;
  createdBy: string;
  createdByName: string;
  status: "active" | "completed" | "cancelled";
  teamId?: string;
  team?: ReliefTeam;
  registrations?: EventRegistration[];
  totalRegistrations: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  status: "pending" | "approved" | "rejected";
  registeredAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  condition: "new" | "used" | "refurbished";
  description?: string;
  images?: string[];
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  eventId?: string; // ID của sự kiện quyên góp
  status: ProductStatus;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  distributedTo?: string;
  distributedToName?: string;
  distributedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReliefRequest {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  eventId?: string; // ID của sự kiện liên quan
  eventName?: string; // Tên sự kiện liên quan
  location: {
    address: string;
    district?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  urgency: "low" | "medium" | "high" | "critical";
  status: RequestStatus;
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedBy?: string;
  assignedByName?: string;
  assignedAt?: string;
  completedAt?: string;
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  condition: "new" | "used" | "refurbished";
  location?: string;
  shelf?: string;
  donorName: string;
  eventId?: string;
  receivedAt: string;
  expiryDate?: string;
  notes?: string;
}

export interface WarehouseStats {
  totalItems: number;
  totalCategories: number;
  totalValue: number;
  recentDonations: number;
  distributedThisMonth: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
