// Receipt types for warehouse operations
export interface CreateReceiptRequest {
  donationId: string;
}

export interface ReceiptCategory {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ReceiptItem {
  id: string;
  receiptId: string;
  categoryId: string;
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  quantity: number;
  createdAt: string;
  updatedAt: string;
  category?: ReceiptCategory;
}

export interface Receipt {
  id: string;
  donationId: string;
  createdById?: string;
  createdAt: string;
  updatedAt?: string;
  items?: ReceiptItem[];
}

export interface CreateReceiptResponse {
  data: Receipt;
  message: string;
  success: boolean;
  statusCode: number;
}

export interface ReceiptListResponse {
  data: {
    data: Receipt[];
    meta: {
      pages: number;
      page: number;
      limit: number;
      total: number;
    };
  };
  message: string;
  success: boolean;
  statusCode: number;
}

export interface StockCategory {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface StockItem {
  id: string;
  categoryId: string;
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  quantity: number;
  createdAt: string;
  updatedAt: string;
  category?: StockCategory;
}

export interface StockListResponse {
  data: {
    data: StockItem[];
    meta: {
      pages: number;
      page: number;
      limit: number;
      total: number;
    };
  };
  message: string;
  success: boolean;
  statusCode: number;
}
