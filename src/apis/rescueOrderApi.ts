import { API_ENDPOINTS } from "../constants";
import httpClient from "../lib/http";
import {
  ApiResponse,
  PaginatedResponse,
  ReliefRequest,
  RescueRequestPriority,
} from "../types";

export type RescueOrderStatus =
  | "PLANNED"
  | "READY"
  | "INSUFFICIENT"
  | "DISPATCHED"
  | "COMPLETED";

export type RescueOrderItemType = "WATER" | "FOOD" | "MEDICAL_KIT";

export interface RescueOrderFilters {
  page?: number;
  limit?: number;
  rescueRequestId?: string;
  status?: RescueOrderStatus;
}

export interface CreateRescueOrderDto {
  rescueRequestId: string;
  estimatedPeople: number;
  note?: string;
}

export interface CompleteRescueOrderItemDto {
  orderItemId: string;
  returnedQuantity: number;
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
}

export interface CompleteRescueOrderDto {
  note?: string;
  items?: CompleteRescueOrderItemDto[];
}

export interface CreateReplenishmentRequestDto {
  note: string;
}

export interface ReviewReplenishmentRequestDto {
  approved: boolean;
  decisionNote?: string;
  items?: Array<{
    itemId: string;
    approvedQuantity: number;
    condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  }>;
}

export interface WarehouseTransactionFilters {
  page?: number;
  limit?: number;
  source?:
    | "RESCUE_DISPATCH"
    | "RESCUE_RETURN"
    | "MANUAL_REPLENISHMENT"
    | "DONATION_RECEIPT"
    | "ALLOCATION_DISPATCH";
  type?: "IN" | "OUT";
  categoryId?: string;
  from?: string;
  to?: string;
}

export interface WarehouseTransaction {
  id: string;
  categoryId: string;
  type: "IN" | "OUT";
  source: string;
  referenceId: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    description?: string | null;
  };
}

export interface RescueOrderListItem {
  id: string;
  rescueRequestId: string;
  estimatedPeople: number;
  priority: RescueRequestPriority | string;
  status: RescueOrderStatus | string;
  createdAt: string;
  updatedAt: string;
  note?: string | null;
  affectedPeople?: number;
  damageLevel?: string;
  totalResponders?: number;
  items?: RescueOrderItem[];
  replenishmentRequests?: RescueOrderReplenishmentRequest[];
  rescueRequest?: RescueOrderDetail["rescueRequest"];
  teams?: RescueOrderTeam[];
  stockCheck?: RescueOrderDetail["stockCheck"];
}

export interface RescueOrderItem {
  id: string;
  orderId: string;
  categoryId: string;
  itemType: RescueOrderItemType | string;
  requestedQuantity: number;
  dispatchedQuantity: number;
  returnedQuantity: number;
  lastShortageQuantity: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    description?: string | null;
  };
}

export interface RescueOrderTeam {
  assignmentId: string;
  teamId: string;
  teamName: string;
  teamSize?: number;
  status: string;
  respondedAt: string | null;
}

export interface RescueOrderReplenishmentRequest {
  id: string;
  orderId: string;
  createdById: string;
  reviewedById: string | null;
  status: string;
  note: string;
  decisionNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items?: Array<{
    id: string;
    requestId: string;
    categoryId: string;
    itemType: RescueOrderItemType | string;
    requestedQuantity: number;
    approvedQuantity: number;
    condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | string;
    category?: {
      id: string;
      name: string;
      description?: string | null;
    };
  }>;
}

export interface RescueOrderStockCheckItem {
  orderItemId: string;
  categoryId: string;
  categoryName: string;
  itemType: RescueOrderItemType | string;
  requiredQuantity: number;
  dispatchedQuantity: number;
  availableQuantity: number;
  shortageQuantity: number;
  isEnough: boolean;
}

export interface RescueOrderDetail extends RescueOrderListItem {
  createdById: string;
  totalRescuers?: number;
  lastStockCheckAt: string | null;
  dispatchedAt: string | null;
  completedAt: string | null;
  items: RescueOrderItem[];
  rescueRequest?: ReliefRequest & {
    evidenceImages?: string[] | null;
    assignments?: Array<{
      id: string;
      rescueRequestId: string;
      teamId: string;
      status: string;
      respondedAt: string | null;
      progressNote?: string | null;
      createdAt: string;
      updatedAt: string;
      team?: {
        id: string;
        name: string;
        area?: string;
        teamSize?: number;
        isActive?: boolean;
      };
    }>;
  };
  replenishmentRequests?: RescueOrderReplenishmentRequest[];
  teams?: RescueOrderTeam[];
  stockCheck?: {
    allSufficient: boolean;
    items: RescueOrderStockCheckItem[];
  };
}

export const rescueOrderApi = {
  listRescueOrders: async (
    params?: RescueOrderFilters,
  ): Promise<ApiResponse<PaginatedResponse<RescueOrderListItem>>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE_RESCUE_ORDERS, { params });
  },

  getRescueOrder: async (
    id: string,
  ): Promise<ApiResponse<RescueOrderDetail>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE_RESCUE_ORDER_BY_ID(id));
  },

  createRescueOrder: async (
    data: CreateRescueOrderDto,
  ): Promise<ApiResponse<RescueOrderDetail>> => {
    return httpClient.post(API_ENDPOINTS.WAREHOUSE_RESCUE_ORDERS, data);
  },

  checkStock: async (id: string): Promise<ApiResponse<RescueOrderDetail>> => {
    return httpClient.post(
      API_ENDPOINTS.WAREHOUSE_RESCUE_ORDER_CHECK_STOCK(id),
    );
  },

  dispatchRescueOrder: async (
    id: string,
  ): Promise<ApiResponse<RescueOrderDetail>> => {
    return httpClient.post(API_ENDPOINTS.WAREHOUSE_RESCUE_ORDER_DISPATCH(id));
  },

  createReplenishmentRequest: async (
    id: string,
    data: CreateReplenishmentRequestDto,
  ): Promise<
    ApiResponse<{ order?: RescueOrderDetail } & Record<string, any>>
  > => {
    return httpClient.post(
      API_ENDPOINTS.WAREHOUSE_RESCUE_ORDER_REPLENISHMENT_REQUESTS(id),
      data,
    );
  },

  completeRescueOrder: async (
    id: string,
    data: CompleteRescueOrderDto,
  ): Promise<ApiResponse<RescueOrderDetail>> => {
    return httpClient.post(
      API_ENDPOINTS.WAREHOUSE_RESCUE_ORDER_COMPLETE(id),
      data,
    );
  },

  reviewReplenishmentRequest: async (
    id: string,
    data: ReviewReplenishmentRequestDto,
  ): Promise<ApiResponse<RescueOrderDetail>> => {
    return httpClient.patch(
      API_ENDPOINTS.WAREHOUSE_REPLENISHMENT_REQUEST_REVIEW(id),
      data,
    );
  },

  listWarehouseTransactions: async (
    params?: WarehouseTransactionFilters,
  ): Promise<ApiResponse<PaginatedResponse<WarehouseTransaction>>> => {
    return httpClient.get(API_ENDPOINTS.WAREHOUSE_TRANSACTIONS, { params });
  },
};
