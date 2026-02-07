export type ProductStatus = "PENDING" | "VERIFIED" | "DISTRIBUTED" | "REJECTED";

export interface ProductData {
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

export interface VerifyProductRequest {
  productId: string;
  status: "VERIFIED" | "REJECTED";
  rejectionReason?: string;
}

export interface DistributeProductRequest {
  productId: string;
  distributedTo: string;
}

export interface ImportProductRequest {
  products: Omit<ProductData, "id" | "createdAt" | "updatedAt" | "status">[];
}

export interface ProductFilters {
  donorName?: string;
  category?: string;
  productName?: string;
  status?: ProductStatus;
  fromDate?: string;
  toDate?: string;
  eventId?: string;
}

export interface ProductsResponse {
  items: ProductData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
