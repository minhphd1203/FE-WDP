import httpClient from "../../lib/http";
import {
  ProductData,
  VerifyProductRequest,
  DistributeProductRequest,
  ImportProductRequest,
  ProductFilters,
  ProductsResponse,
} from "../../types/product";
import { ApiResponse } from "../../types";

const PRODUCT_ENDPOINTS = {
  PRODUCTS: "/products",
  VERIFY: (id: string) => `/products/${id}/verify`,
  DISTRIBUTE: (id: string) => `/products/${id}/distribute`,
  IMPORT: "/products/import",
  VERIFY_ALL: "/products/verify-all",
} as const;

export const productService = {
  getProducts: (filters?: ProductFilters, page = 1, limit = 20) => {
    const params = new URLSearchParams();
    if (filters?.donorName) params.append("donorName", filters.donorName);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.productName) params.append("productName", filters.productName);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.fromDate) params.append("fromDate", filters.fromDate);
    if (filters?.toDate) params.append("toDate", filters.toDate);
    if (filters?.eventId) params.append("eventId", filters.eventId);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    return httpClient.get<ApiResponse<ProductsResponse>>(
      `${PRODUCT_ENDPOINTS.PRODUCTS}?${params.toString()}`,
    );
  },

  getProductById: (id: string) =>
    httpClient.get<ApiResponse<ProductData>>(
      `${PRODUCT_ENDPOINTS.PRODUCTS}/${id}`,
    ),

  verifyProduct: (data: VerifyProductRequest) =>
    httpClient.put<ApiResponse<ProductData>>(
      PRODUCT_ENDPOINTS.VERIFY(data.productId),
      {
        status: data.status,
        rejectionReason: data.rejectionReason,
      },
    ),

  verifyAll: (productIds: string[]) =>
    httpClient.post<ApiResponse<{ verifiedCount: number }>>(
      PRODUCT_ENDPOINTS.VERIFY_ALL,
      { productIds },
    ),

  distributeProduct: (data: DistributeProductRequest) =>
    httpClient.put<ApiResponse<ProductData>>(
      PRODUCT_ENDPOINTS.DISTRIBUTE(data.productId),
      { distributedTo: data.distributedTo },
    ),

  importProducts: (data: ImportProductRequest) =>
    httpClient.post<ApiResponse<{ importedCount: number }>>(
      PRODUCT_ENDPOINTS.IMPORT,
      data,
    ),

  exportToExcel: () => httpClient.get<Blob>("/products/export/excel"),
};

export default productService;
