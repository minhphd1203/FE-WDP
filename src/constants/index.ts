export const USER_ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  USER: "user",
} as const;

export const EVENT_TYPES = {
  RELIEF_TEAM: "relief_team",
  PRODUCT_DONATION: "product_donation",
} as const;

export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REJECTED: "rejected",
} as const;

export const PRODUCT_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  DISTRIBUTED: "distributed",
  REJECTED: "rejected",
} as const;

export const URGENCY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export const PRODUCT_CONDITIONS = {
  NEW: "new",
  USED: "used",
  REFURBISHED: "refurbished",
} as const;

// @deprecated Use API endpoint /categories instead for dynamic categories
export const PRODUCT_CATEGORIES = [
  "Thực phẩm",
  "Nước uống",
  "Quần áo",
  "Thuốc men",
  "Đồ dùng sinh hoạt",
  "Đồ dùng học tập",
  "Thiết bị y tế",
  "Khác",
] as const;

export const URGENCY_COLORS = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
} as const;

export const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
  verified: "bg-green-100 text-green-800",
  distributed: "bg-purple-100 text-purple-800",
} as const;

export const ROUTES = {
  // Admin routes
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_EVENTS: "/admin/events",
  ADMIN_CREATE_EVENT: "/admin/events/create",
  ADMIN_EDIT_EVENT: (id: string) => `/admin/events/${id}/edit`,
  ADMIN_USERS: "/admin/users",
  ADMIN_DONATIONS: "/admin/donations",
  ADMIN_TEAMS: "/admin/teams",
  ADMIN_RELIEF_REQUESTS: "/admin/relief-requests",
  ADMIN_WAREHOUSE: "/admin/warehouse",

  // Staff routes
  STAFF: "/staff",
  STAFF_DASHBOARD: "/staff/dashboard",
  STAFF_PRODUCTS: "/staff/products",
  STAFF_DISTRIBUTE: "/staff/distribute",
  STAFF_VOLUNTEERS: "/staff/volunteers",
  STAFF_WAREHOUSE: "/staff/warehouse",
  STAFF_UPDATE_PROFILE: "/staff/update-profile",

  // Auth routes
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",

  // Users
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,

  // Events
  EVENTS: "/events",
  EVENT_BY_ID: (id: string) => `/events/${id}`,
  EVENT_REGISTER: (id: string) => `/events/${id}/volunteer-registrations`,
  EVENT_REGISTRATIONS: (id: string) => `/events/${id}/volunteer-registrations`,

  // Relief Teams
  RELIEF_TEAMS: "/relief-teams",
  RELIEF_TEAM_BY_ID: (id: string) => `/relief-teams/${id}`,

  // Products
  PRODUCTS: "/products",
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCT_VERIFY: (id: string) => `/products/${id}/verify`,
  PRODUCT_DISTRIBUTE: (id: string) => `/products/${id}/distribute`,

  // Relief Requests / Rescue Requests
  RELIEF_REQUESTS: "/relief-requests",
  RELIEF_REQUEST_BY_ID: (id: string) => `/relief-requests/${id}`,
  RELIEF_REQUEST_ASSIGN: (id: string) => `/relief-requests/${id}/assign`,
  RESCUE_REQUESTS: "/rescue-requests",
  RESCUE_REQUEST_BY_ID: (id: string) => `/rescue-requests/${id}`,
  RESCUE_REQUEST_ASSIGN: (id: string) => `/rescue-requests/admin/${id}/assignments`,
  RESCUE_REQUEST_REVIEW: (id: string) => `/rescue-requests/admin/${id}/review`,

  // Warehouse
  WAREHOUSE: "/warehouse",
  WAREHOUSE_STATS: "/warehouse/stats",
  WAREHOUSE_EXPORT: "/warehouse/export",
  WAREHOUSE_STOCKS: "/warehouse/stocks",
  WAREHOUSE_ALLOCATIONS: "/warehouse/allocations",
  WAREHOUSE_ALLOCATION_BY_ID: (id: string) => `/warehouse/allocations/${id}`,
  WAREHOUSE_ALLOCATION_STATUS: (id: string) => `/warehouse/allocations/${id}/status`,
  WAREHOUSE_RECEIPTS: "/warehouse/receipts",
  WAREHOUSE_RECEIPT_BY_ID: (id: string) => `/warehouse/receipts/${id}`,

  // Categories
  CATEGORIES: "/categories",
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
