# Hệ thống Cứu trợ Lũ lụt - Admin & Staff Panel

Hệ thống quản lý cứu trợ lũ lụt với giao diện dành cho Admin và Staff.

## 🚀 Demo Mode - Chạy ngay không cần API

Ứng dụng hiện đang chạy ở **demo mode** với mock data:
- ✅ Không cần backend API
- ✅ Đăng nhập với bất kỳ email/password nào
- ✅ Tất cả CRUD operations hoạt động với mock data
- ✅ Dữ liệu demo có sẵn trong `src/mocks/data.ts`

## Tính năng

### Admin
- **Dashboard**: Tổng quan thống kê và hoạt động
- **Tạo sự kiện**: 
  - Đội cứu trợ - Tuyển tình nguyện viên
  - Quyên góp vật phẩm
- **Quản lý người dùng**: Quản lý 3 loại user (Admin, Staff, User)
- **Đơn yêu cầu cứu hộ**: Nhận và xử lý yêu cầu từ người dân
- **Quản lý kho**: Xem và xuất báo cáo Excel

### Staff
- **Xác minh sản phẩm**: Duyệt sản phẩm quyên góp từ người dân
- **Phân phối sản phẩm**: Phân chia vật phẩm cho các đội cứu trợ

## Tech Stack

### Frontend
- **React 19.1.0** với **TypeScript 5.8.3**
- **React Router 7** - Routing
- **Vite 6.3.5** - Build tool
- **Tailwind CSS 4.1.13** - Styling
- **Radix UI** - Headless components
- **shadcn/ui** - Component architecture
- **Lucide React** - Icons

### State Management
- **Redux Toolkit 2.9.0** - Global state
- **TanStack Query 5.90.2** - Server state & caching

### Forms & Validation
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### API & Data
- **Axios 1.12.2** - HTTP client
- **Firebase 12.3.0** - Backend services

## Cấu trúc dự án

```
src/
├── apis/              # API service layers
│   ├── authApi.ts
│   ├── eventApi.ts
│   ├── productApi.ts
│   ├── reliefRequestApi.ts
│   ├── userApi.ts
│   └── warehouseApi.ts
├── components/        # Reusable components
│   └── ui/           # shadcn/ui components
├── constants/        # App constants
├── guards/           # Route guards
│   ├── AuthGuard.tsx
│   ├── RoleGuard.tsx
│   └── GuestGuard.tsx
├── hooks/            # Custom React hooks
│   ├── useAuth.ts
│   ├── useExportExcel.ts
│   └── useFileUpload.ts
├── layouts/          # Page layouts
│   ├── AdminLayout.tsx
│   ├── StaffLayout.tsx
│   └── AuthLayout.tsx
├── lib/              # Utilities
│   ├── http.ts
│   └── utils.ts
├── pages/            # Page components
│   ├── admin/
│   │   ├── Dashboard/
│   │   ├── CreateEvent/
│   │   ├── UserManagement/
│   │   ├── ReliefRequests/
│   │   └── Warehouse/
│   ├── staff/
│   │   ├── VerifyProducts/
│   │   └── DistributeProducts/
│   └── auth/
│       ├── Login/
│       └── Register/
├── redux/            # Redux slices & store
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── eventsSlice.ts
│   │   ├── productsSlice.ts
│   │   └── reliefRequestsSlice.ts
│   └── store.ts
├── routes/           # Routing configuration
│   └── index.tsx
├── schema/           # Validation schemas
│   ├── eventSchema.ts
│   ├── productSchema.ts
│   ├── reliefRequestSchema.ts
│   └── userSchema.ts
├── types/            # TypeScript types
│   └── index.ts
└── App.tsx
```

## 📦 Installation

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Cấu hình Environment Variables
```bash
# Copy file .env.example thành .env
cp .env.example .env
```

Chỉnh sửa file `.env` với các thông tin cần thiết:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
```

#### Cấu hình Google Maps API (Tùy chọn)

Để sử dụng tính năng chọn địa điểm trên bản đồ khi tạo sự kiện:

1. **Tạo Google Cloud Project**:
   - Truy cập [Google Cloud Console](https://console.cloud.google.com)
   - Tạo project mới hoặc chọn project có sẵn

2. **Enable các API cần thiết**:
   - Maps JavaScript API
   - Places API
   - Geocoding API

3. **Tạo API Key**:
   - Vào [Credentials](https://console.cloud.google.com/apis/credentials)
   - Tạo API key mới
   - Giới hạn key để bảo mật (HTTP referrers, IP addresses)

4. **Cập nhật `.env`**:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyC...your_actual_key
   ```

**Lưu ý**: Nếu không cấu hình Google Maps API, bạn vẫn có thể nhập địa chỉ bằng text thông thường, chỉ không có autocomplete và map interactive.

#### Kiểm tra cấu hình

Để kiểm tra xem Google Maps API đã được cấu hình đúng chưa:

```bash
npm run check:maps
```

Script sẽ hiển thị:
- ✅ Đã cấu hình: Hiển thị thông tin API key và các tính năng có sẵn
- ❌ Chưa cấu hình: Hiển thị hướng dẫn cài đặt

### Bước 3: Chạy development server
```bash
npm run dev
```

### Bước 4: Mở trình duyệt
```
http://localhost:3000
```

## 🔐 Tài khoản Demo

Đăng nhập với bất kỳ email/password nào (demo mode):

### Admin
- Email: `admin@example.com`
- Quyền: Toàn quyền quản trị

### Staff
- Email: `staff@example.com`
- Quyền: Xác minh & phân phối sản phẩm

### User
- Email: `user1@example.com`
- Quyền: Người dùng thông thường

## Development

```bash
# Chạy dev server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Kiểm tra cấu hình Google Maps API
npm run check:maps
```

## 📊 Dữ liệu Demo

### Users (3)
- Admin - Full access
- Staff - Xác minh & phân phối
- User - Người dùng thường

### Events (2)
- Đội cứu trợ miền Bắc (active, 25 đăng ký)
- Quyên góp vật phẩm Quảng Ninh (active)

### Products (3)
- Gạo ST25 (50kg, pending)
- Nước suối Lavie (100 chai, verified)
- Quần áo cũ (20 bộ, pending)

### Relief Requests (3)
- Gia đình bị lũ cuốn (critical, pending)
- Cần thuốc men (high, approved)
- Nhà sập (medium, in_progress)

### Warehouse (2)
- Nước suối (100 units)
- Mì tôm (200 units)

## 🔄 Chuyển sang API thật

Khi backend sẵn sàng:

1. **Cập nhật API URL** trong `src/lib/http.ts`:
```typescript
const API_BASE_URL = 'https://your-api-url.com';
```

2. **Bỏ comment API calls** trong:
   - `src/pages/admin/*`
   - `src/pages/staff/*`
   - `src/hooks/useAuth.ts`

3. **Xóa mock imports**:
```typescript
// Remove: import { mockData } from '../mocks/data';
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server at :3000

# Build
npm run build        # Production build
npm run preview      # Preview production build

# Type checking
npm run type-check   # Check TypeScript errors
```
- Redux Toolkit for auth & UI state
- React Query for server data & caching
- Local state for component-specific data

### Code Quality
- TypeScript strict mode
- ESLint & Prettier
- Conventional commits
- Git hooks with Husky

## License

MIT
"# FE-WDP" 
