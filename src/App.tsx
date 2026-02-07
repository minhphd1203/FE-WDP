import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './redux/store';
import AppRouter from './routes';
import { authService } from './service/auth/api';
import { setUser, logout, selectAuthToken } from './redux/slices/authSlice';
import { UserRole } from './types';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setIsInitialized(true);
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        
        if (response.success && response.data) {
          const account = response.data;
          const normalizeRole = (role?: string): UserRole => {
            switch (role?.toUpperCase()) {
              case 'ADMIN':
                return UserRole.ADMIN;
              case 'STAFF':
                return UserRole.STAFF;
              default:
                return UserRole.USER;
            }
          };

          const role = normalizeRole(account.role);
          const now = new Date().toISOString();

          dispatch(
            setUser({
              id: account.id,
              email: account.email ?? '',
              fullName: account.fullName ?? account.name ?? 'User',
              name: account.fullName ?? account.name ?? account.email?.split('@')[0] ?? 'User',
              phone: account.phone ?? '',
              role,
              createdAt: now,
              updatedAt: now,
              isActive: account.isActive ?? true,
            })
          );
        } else {
          // Token invalid, logout
          dispatch(logout());
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Token invalid, logout
        dispatch(logout());
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [dispatch, token]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </AuthInitializer>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
