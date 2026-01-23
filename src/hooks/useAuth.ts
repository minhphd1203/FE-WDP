import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LoginDto, RegisterDto } from '../apis/authApi';
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
  setError,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../redux/slices/authSlice';
import { ROUTES } from '../constants';
import { toast } from 'sonner';
import { mockUsers } from '../mocks/data';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const [isPending, setIsPending] = useState(false);

  const login = (data: LoginDto) => {
    dispatch(setLoading(true));
    setIsPending(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock login - find user by email or use first user as fallback
      const mockUser = mockUsers.find(u => u.email === data.email) || mockUsers[0];
      
      const token = 'mock-jwt-token-' + Date.now();
      dispatch(setCredentials({
        user: mockUser,
        token,
      }));
      
      toast.success('Đăng nhập thành công!');
      
      // Redirect based on role
      if (mockUser.role === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (mockUser.role === 'staff') {
        navigate(ROUTES.STAFF_DASHBOARD);
      } else {
        navigate('/');
      }
      
      setIsPending(false);
    }, 500);
  };

  const register = (data: RegisterDto) => {
    dispatch(setLoading(true));
    setIsPending(true);
    
    // Simulate API call
    setTimeout(() => {
      const token = 'mock-jwt-token-' + Date.now();
      dispatch(setCredentials({
        user: {
          ...mockUsers[2], // Default to regular user
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
        token,
      }));
      
      toast.success('Đăng ký thành công!');
      navigate('/');
      setIsPending(false);
    }, 500);
  };

  const logout = () => {
    dispatch(logoutAction());
    toast.success('Đăng xuất thành công!');
    navigate(ROUTES.LOGIN);
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
