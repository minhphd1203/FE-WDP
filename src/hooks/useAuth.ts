import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoginRequest, RegisterFormInput } from "../types/auth";
import { authService } from "../service/auth/api";
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
  setError,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from "../redux/slices/authSlice";
import { ROUTES } from "../constants";
import { toast } from "sonner";
import { UserRole } from "../types";

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const [isPending, setIsPending] = useState(false);

  const normalizeRole = (role?: string): UserRole => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return UserRole.ADMIN;
      case "STAFF":
        return UserRole.STAFF;
      default:
        return UserRole.USER;
    }
  };

  const redirectByRole = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      navigate(ROUTES.ADMIN_DASHBOARD);
      return;
    }

    if (role === UserRole.STAFF) {
      navigate(ROUTES.STAFF_DASHBOARD);
      return;
    }

    toast.error("Tài khoản không có quyền truy cập hệ thống quản trị");
    dispatch(logoutAction());
    navigate(ROUTES.LOGIN);
  };

  const login = async (data: LoginRequest) => {
    dispatch(setLoading(true));
    setIsPending(true);

    try {
      const response = await authService.login(data);

      if (!response.success) {
        throw new Error(response.message || "Đăng nhập thất bại");
      }

      const { accessToken, refreshToken, account } = response.data;
      const role = normalizeRole(account.role);
      const now = new Date().toISOString();

      dispatch(
        setCredentials({
          user: {
            id: account.id,
            email: account.email ?? "",
            name: account.email?.split("@")[0] ?? "User",
            role,
            createdAt: response.timestamp || now,
            updatedAt: response.timestamp || now,
            isActive: true,
          },
          token: accessToken,
        }),
      );

      localStorage.setItem("refreshToken", refreshToken);

      toast.success("Đăng nhập thành công!");
      redirectByRole(role);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
      setIsPending(false);
    }
  };

  const register = (data: RegisterFormInput) => {
    dispatch(setLoading(true));
    setIsPending(true);

    authService
      .register({
        email: data.email,
        password: data.password,
        fullName: data.name,
        phone: data.phone,
      })
      .then((response) => {
        if (!response.success) {
          throw new Error(response.message || "Đăng ký thất bại");
        }

        toast.success("Đăng ký thành công!");
        navigate(ROUTES.LOGIN);
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Đăng ký thất bại";
        dispatch(setError(message));
        toast.error(message);
      })
      .finally(() => {
        dispatch(setLoading(false));
        setIsPending(false);
      });
  };

  const logout = async () => {
    dispatch(setLoading(true));
    setIsPending(true);

    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await authService.logout({ refreshToken });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đăng xuất thất bại";
      dispatch(setError(message));
      toast.error(message);
    } finally {
      localStorage.removeItem("refreshToken");
      dispatch(logoutAction());
      dispatch(setLoading(false));
      setIsPending(false);
      toast.success("Đăng xuất thành công!");
      navigate(ROUTES.LOGIN);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isPending,
    error,
    login,
    register,
    logout,
  };
}
