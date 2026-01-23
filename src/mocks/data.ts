import { 
  User, 
  Event, 
  Product, 
  ReliefRequest, 
  WarehouseItem, 
  UserRole,
  EventType,
  ProductStatus,
  RequestStatus,
} from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Nguyễn Văn Admin',
    phone: '0912345678',
    role: UserRole.ADMIN,
    avatar: undefined,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    isActive: true,
  },
  {
    id: '2',
    email: 'staff@example.com',
    name: 'Trần Thị Staff',
    phone: '0923456789',
    role: UserRole.STAFF,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    isActive: true,
  },
  {
    id: '3',
    email: 'user1@example.com',
    name: 'Lê Văn User',
    phone: '0934567890',
    role: UserRole.USER,
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
    isActive: true,
  },
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Đội cứu trợ miền Bắc - Tháng 1/2026',
    description: 'Tuyển tình nguyện viên tham gia đội cứu trợ lũ lụt tại các tỉnh miền Bắc',
    type: EventType.RELIEF_TEAM,
    startDate: '2026-01-15T08:00:00Z',
    endDate: '2026-01-20T18:00:00Z',
    location: 'Hà Nội',
    createdBy: '1',
    createdByName: 'Nguyễn Văn Admin',
    status: 'active',
    totalRegistrations: 25,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: '2',
    title: 'Quyên góp vật phẩm cứu trợ Quảng Ninh',
    description: 'Chiến dịch quyên góp thực phẩm, nước uống, quần áo cho người dân vùng lũ',
    type: EventType.PRODUCT_DONATION,
    startDate: '2026-01-12T00:00:00Z',
    endDate: '2026-01-25T23:59:59Z',
    createdBy: '1',
    createdByName: 'Nguyễn Văn Admin',
    status: 'active',
    totalRegistrations: 0,
    createdAt: '2026-01-11T00:00:00Z',
    updatedAt: '2026-01-11T00:00:00Z',
  },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Gạo ST25',
    category: 'Thực phẩm',
    quantity: 50,
    unit: 'kg',
    condition: 'new',
    description: 'Gạo ST25 chất lượng cao',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
    ],
    donorId: '3',
    donorName: 'Lê Văn User',
    donorEmail: 'user1@example.com',
    donorPhone: '0934567890',
    eventId: '2', // Sự kiện quyên góp Quảng Ninh
    status: ProductStatus.PENDING,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: '2',
    name: 'Nước suối Lavie',
    category: 'Nước uống',
    quantity: 100,
    unit: 'chai',
    condition: 'new',
    description: 'Nước suối đóng chai 500ml',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop',
    ],
    donorId: '3',
    donorName: 'Lê Văn User',
    donorEmail: 'user1@example.com',
    eventId: '2', // Sự kiện quyên góp Quảng Ninh
    status: ProductStatus.VERIFIED,
    verifiedBy: '2',
    verifiedByName: 'Trần Thị Staff',
    verifiedAt: '2026-01-12T11:00:00Z',
    createdAt: '2026-01-12T09:30:00Z',
    updatedAt: '2026-01-12T11:00:00Z',
  },
  {
    id: '3',
    name: 'Quần áo cũ',
    category: 'Quần áo',
    quantity: 20,
    unit: 'bộ',
    condition: 'used',
    description: 'Quần áo đã qua sử dụng nhưng còn tốt',
    images: [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=300&fit=crop',
    ],
    donorId: '3',
    donorName: 'Lê Văn User',
    donorEmail: 'user1@example.com',
    eventId: '2', // Sự kiện quyên góp Quảng Ninh
    status: ProductStatus.PENDING,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
];

// Mock Relief Requests
export const mockReliefRequests: ReliefRequest[] = [
  {
    id: '1',
    title: 'Cần hỗ trợ khẩn cấp - Gia đình bị ngập nước',
    description: 'Gia đình 5 người bị ngập lụt, cần hỗ trợ lương thực và nước uống gấp',
    requesterId: '3',
    requesterName: 'Nguyễn Văn Bình',
    requesterEmail: 'binh@example.com',
    requesterPhone: '0945678901',
    eventId: '1',
    eventName: 'Đội cứu trợ miền Bắc - Tháng 1/2026',
    location: {
      address: 'Số 123, Đường Lê Lợi, Thị trấn Cẩm Giàng, Huyện Cẩm Giàng, Hải Dương',
      district: 'Cẩm Giàng',
      city: 'Hải Dương',
    },
    urgency: 'critical',
    status: RequestStatus.PENDING,
    createdAt: '2026-01-12T07:00:00Z',
    updatedAt: '2026-01-12T07:00:00Z',
  },
  {
    id: '2',
    title: 'Xin hỗ trợ thuốc men',
    description: 'Có người già bị ốm, cần thuốc cảm cúm và hạ sốt',
    requesterId: '3',
    requesterName: 'Trần Thị Mai',
    requesterEmail: 'mai@example.com',
    requesterPhone: '0956789012',
    eventId: '1',
    eventName: 'Đội cứu trợ miền Bắc - Tháng 1/2026',
    location: {
      address: 'Xã Hồng Thái, Huyện An Dương, Hải Phòng',
      district: 'An Dương',
      city: 'Hải Phòng',
    },
    urgency: 'high',
    status: RequestStatus.APPROVED,
    assignedTeamId: 'team2',
    assignedTeamName: 'Đội cứu trợ 2 - Hải Phòng',
    assignedBy: '1',
    assignedByName: 'Nguyễn Văn Admin',
    assignedAt: '2026-01-12T08:30:00Z',
    createdAt: '2026-01-12T06:00:00Z',
    updatedAt: '2026-01-12T08:30:00Z',
  },
  {
    id: '3',
    title: 'Nhà bị sập, cần hỗ trợ chỗ ở tạm',
    description: 'Nhà bị lũ cuốn sập, gia đình đang tá túc nhà hàng xóm',
    requesterId: '3',
    requesterName: 'Phạm Văn Cường',
    requesterEmail: 'cuong@example.com',
    requesterPhone: '0967890123',
    eventId: '1',
    eventName: 'Đội cứu trợ miền Bắc - Tháng 1/2026',
    location: {
      address: 'Thôn 3, Xã Quảng La, Huyện Đông Triều, Quảng Ninh',
      district: 'Đông Triều',
      city: 'Quảng Ninh',
    },
    urgency: 'medium',
    status: RequestStatus.IN_PROGRESS,
    assignedTeamId: 'team3',
    assignedTeamName: 'Đội cứu trợ 3 - Quảng Ninh',
    assignedBy: '1',
    assignedByName: 'Nguyễn Văn Admin',
    assignedAt: '2026-01-11T15:00:00Z',
    createdAt: '2026-01-11T14:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },
];

// Mock Warehouse Items
export const mockWarehouseItems: WarehouseItem[] = [
  {
    id: '1',
    productId: '2',
    productName: 'Nước suối Lavie',
    category: 'Nước uống',
    quantity: 100,
    unit: 'chai',
    condition: 'new',
    location: 'Khu A',
    shelf: 'Kệ 1',
    donorName: 'Lê Văn User',
    eventId: '2',
    receivedAt: '2026-01-12T11:00:00Z',
  },
  {
    id: '2',
    productId: '4',
    productName: 'Mì tôm',
    category: 'Thực phẩm',
    quantity: 200,
    unit: 'gói',
    condition: 'new',
    location: 'Khu A',
    shelf: 'Kệ 2',
    donorName: 'Nguyễn Văn A',
    eventId: '2',
    receivedAt: '2026-01-11T10:00:00Z',
  },
];

// Mock Stats
export const mockWarehouseStats = {
  totalItems: 15,
  totalCategories: 6,
  totalValue: 0,
  recentDonations: 8,
  distributedThisMonth: 12,
};

// Mock current user - Đổi role ở đây để test
export const mockCurrentUser: User = mockUsers[0]; // Admin user

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));
