export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  USER: 'user',
} as const;

export const EVENT_TYPES = {
  RELIEF_TEAM: 'relief_team',
  PRODUCT_DONATION: 'product_donation',
} as const;

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export const PRODUCT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  DISTRIBUTED: 'distributed',
  REJECTED: 'rejected',
} as const;

export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const PRODUCT_CONDITIONS = {
  NEW: 'new',
  USED: 'used',
  REFURBISHED: 'refurbished',
} as const;

export const PRODUCT_CATEGORIES = [
  'Thực phẩm',
  'Nước uống',
  'Quần áo',
  'Thuốc men',
  'Đồ dùng sinh hoạt',
  'Đồ dùng học tập',
  'Thiết bị y tế',
  'Khác',
] as const;

export const URGENCY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
} as const;

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
  verified: 'bg-green-100 text-green-800',
  distributed: 'bg-purple-100 text-purple-800',
} as const;

export const ROUTES = {
  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_CREATE_EVENT: '/admin/events/create',
  ADMIN_USERS: '/admin/users',
  ADMIN_RELIEF_REQUESTS: '/admin/relief-requests',
  ADMIN_WAREHOUSE: '/admin/warehouse',
  
  // Staff routes
  STAFF: '/staff',
  STAFF_DASHBOARD: '/staff/dashboard',
  STAFF_VERIFY_PRODUCTS: '/staff/verify-products',
  STAFF_DISTRIBUTE: '/staff/distribute',
  
  // Auth routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  
  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  
  // Events
  EVENTS: '/api/events',
  EVENT_BY_ID: (id: string) => `/api/events/${id}`,
  EVENT_REGISTER: (id: string) => `/api/events/${id}/register`,
  EVENT_REGISTRATIONS: (id: string) => `/api/events/${id}/registrations`,
  
  // Relief Teams
  RELIEF_TEAMS: '/api/relief-teams',
  RELIEF_TEAM_BY_ID: (id: string) => `/api/relief-teams/${id}`,
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  PRODUCT_VERIFY: (id: string) => `/api/products/${id}/verify`,
  PRODUCT_DISTRIBUTE: (id: string) => `/api/products/${id}/distribute`,
  
  // Relief Requests
  RELIEF_REQUESTS: '/api/relief-requests',
  RELIEF_REQUEST_BY_ID: (id: string) => `/api/relief-requests/${id}`,
  RELIEF_REQUEST_ASSIGN: (id: string) => `/api/relief-requests/${id}/assign`,
  
  // Warehouse
  WAREHOUSE: '/api/warehouse',
  WAREHOUSE_STATS: '/api/warehouse/stats',
  WAREHOUSE_EXPORT: '/api/warehouse/export',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
