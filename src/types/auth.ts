export type AuthRole = "ADMIN" | "STAFF" | "USER" | "RESCUE_TEAM";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  address?: string;
  avatarUrl?: string;
}

export interface RegisterFormInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthAccount {
  id: string;
  email?: string;
  phone?: string;
  role: AuthRole;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  account: AuthAccount;
}

export interface CurrentUserData {
  id: string;
  email?: string;
  fullName: string;
  name?: string;
  phone?: string;
  address?: string;
  role: AuthRole;
  isActive: boolean;
  profile?: {
    id?: string;
    accountId?: string;
    fullName?: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
  };
  accountId: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export interface AuthApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
