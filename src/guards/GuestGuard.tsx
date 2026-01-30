import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../redux/slices/authSlice";
import { ROUTES } from "../constants";
import { UserRole } from "../types";

interface GuestGuardProps {
  children: React.ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  if (isAuthenticated && user) {
    if (user.role === UserRole.ADMIN) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }

    if (user.role === UserRole.STAFF) {
      return <Navigate to={ROUTES.STAFF_DASHBOARD} replace />;
    }

    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
