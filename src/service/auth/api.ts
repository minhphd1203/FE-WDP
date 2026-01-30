import httpClient from "../../lib/http";
import {
  AuthApiResponse,
  CurrentUserData,
  LoginRequest,
  LoginResponseData,
  LogoutRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "../../types/auth";

const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  ME: "/me",
} as const;

export const authService = {
  login: (data: LoginRequest) =>
    httpClient.post<AuthApiResponse<LoginResponseData>>(
      AUTH_ENDPOINTS.LOGIN,
      data,
    ),

  register: (data: RegisterRequest) =>
    httpClient.post<AuthApiResponse<void>>(AUTH_ENDPOINTS.REGISTER, data),

  logout: (data: LogoutRequest) =>
    httpClient.post<AuthApiResponse<void>>(AUTH_ENDPOINTS.LOGOUT, data),

  getCurrentUser: () =>
    httpClient.get<AuthApiResponse<CurrentUserData>>(AUTH_ENDPOINTS.ME),

  updateProfile: (data: UpdateProfileRequest) =>
    httpClient.put<AuthApiResponse<CurrentUserData>>(AUTH_ENDPOINTS.ME, data),
};

export default authService;
