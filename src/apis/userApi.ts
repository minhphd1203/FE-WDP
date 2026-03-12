import httpClient from "../lib/http";
import {
  ApiResponse,
  User,
  PaginatedResponse,
  PaginationParams,
} from "../types";

const ACCOUNT_ENDPOINTS = {
  ACCOUNTS: "/admin/accounts",
  ACCOUNT_BY_ID: (id: string) => `/admin/accounts/${id}`,
  ACCOUNT_STATUS: (id: string) => `/admin/accounts/${id}/status`,
  ACCOUNT_CONFIRM_CONTACT: (id: string) =>
    `/admin/accounts/${id}/confirm-contact`,
  ACCOUNT_VERIFY_CONTACT: (id: string) =>
    `/admin/accounts/${id}/verify-contact`,
};

export interface CreateAccountDto {
  email: string;
  phone: string;
  password: string;
  role: "STAFF" | "USER" | "RESCUE_TEAM";
  fullName: string;
  address?: string;
  avatarUrl?: string;
}

export interface UpdateAccountDto {
  email?: string;
  phone?: string;
  role?: "STAFF" | "USER" | "RESCUE_TEAM";
  fullName?: string;
  address?: string;
  avatarUrl?: string;
  avatar?: File;
}

export interface UserListParams extends Partial<PaginationParams> {
  role?: "STAFF" | "USER" | "RESCUE_TEAM";
  q?: string;
  isActive?: boolean;
  sortBy?: string;
  order?: "ASC" | "DESC";
}

export interface UpdateAccountStatusDto {
  isActive: boolean;
}

export interface VerifyContactDto {
  type: "email" | "phone";
  value: string;
}

export const userApi = {
  // Get all accounts with pagination and filters
  getUsers: async (
    params?: UserListParams,
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return httpClient.get<ApiResponse<PaginatedResponse<User>>>(
      ACCOUNT_ENDPOINTS.ACCOUNTS,
      { params },
    );
  },

  // Get account by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    return httpClient.get<ApiResponse<User>>(
      ACCOUNT_ENDPOINTS.ACCOUNT_BY_ID(id),
    );
  },

  // Create new account
  createUser: async (data: CreateAccountDto): Promise<ApiResponse<User>> => {
    return httpClient.post<ApiResponse<User>>(ACCOUNT_ENDPOINTS.ACCOUNTS, data);
  },

  // Update account
  updateUser: async (
    id: string,
    data: UpdateAccountDto | FormData,
  ): Promise<ApiResponse<User>> => {
    const isMultipart = data instanceof FormData;
    return httpClient.patch<ApiResponse<User>>(
      ACCOUNT_ENDPOINTS.ACCOUNT_BY_ID(id),
      data,
      isMultipart
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined,
    );
  },

  // Delete account
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    return httpClient.delete<ApiResponse<void>>(
      ACCOUNT_ENDPOINTS.ACCOUNT_BY_ID(id),
    );
  },

  // Update account status
  updateUserStatus: async (
    id: string,
    data: UpdateAccountStatusDto,
  ): Promise<ApiResponse<User>> => {
    return httpClient.patch<ApiResponse<User>>(
      ACCOUNT_ENDPOINTS.ACCOUNT_STATUS(id),
      data,
    );
  },

  // Confirm contact
  confirmContact: async (id: string): Promise<ApiResponse<void>> => {
    return httpClient.post<ApiResponse<void>>(
      ACCOUNT_ENDPOINTS.ACCOUNT_CONFIRM_CONTACT(id),
    );
  },

  // Verify contact
  verifyContact: async (
    id: string,
    data: VerifyContactDto,
  ): Promise<ApiResponse<void>> => {
    return httpClient.post<ApiResponse<void>>(
      ACCOUNT_ENDPOINTS.ACCOUNT_VERIFY_CONTACT(id),
      data,
    );
  },
};
