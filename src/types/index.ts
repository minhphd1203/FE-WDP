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

export enum RescueRequestStatus {
  NEW = "NEW",
  REVIEWED = "REVIEWED",
  ASSIGNED = "ASSIGNED",
  ACCEPTED = "ACCEPTED",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  CANCELED = "CANCELED",
  REJECTED = "REJECTED",
}

export enum RescueRequestPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
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
  name?: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  avatarUrl?: string;
  address?: string;
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
  status: "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED";
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
  eventId?: string;
  eventName?: string;
  location: {
    address: string;
    district?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  priority: RescueRequestPriority;
  status: RescueRequestStatus;
  assignedTeams?: Array<{
    teamId: string;
    teamName?: string;
    assignedAt?: string;
  }>;
  assignedBy?: string;
  assignedByName?: string;
  completedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignTeamsDto {
  teamIds: string[];
}

export interface ReviewRescueRequestDto {
  status: RescueRequestStatus;
  priority: RescueRequestPriority;
  note?: string;
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
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Warehouse Allocation Types
export enum AllocationStatus {
  PENDING = "PENDING",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum ItemCondition {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
}

export interface AllocationItem {
  category: string;
  condition: ItemCondition;
  quantity: number;
}

export interface Allocation {
  id: string;
  teamId: string;
  teamName?: string;
  items: AllocationItem[];
  status: AllocationStatus;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

// Warehouse Receipt Types
export interface Receipt {
  id: string;
  donationId: string;
  donorName?: string;
  items?: ReceiptItem[];
  receivedAt: string;
  createdAt: string;
  notes?: string;
}

export interface ReceiptItem {
  category: string;
  quantity: number;
  condition: ItemCondition;
  productName?: string;
}

// Warehouse Stock Types
export interface Stock {
  id: string;
  category: string;
  condition: ItemCondition;
  quantity: number;
  lastUpdated: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}
