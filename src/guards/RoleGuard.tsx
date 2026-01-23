import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/slices/authSlice';
import { UserRole } from '../types';
import { ROUTES } from '../constants';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const user = useSelector(selectCurrentUser);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === UserRole.ADMIN) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    } else if (user.role === UserRole.STAFF) {
      return <Navigate to={ROUTES.STAFF_DASHBOARD} replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
