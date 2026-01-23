import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import { ROUTES } from '../constants';

interface GuestGuardProps {
  children: React.ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  return <>{children}</>;
}
