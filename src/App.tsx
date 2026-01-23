import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './redux/store';
import AppRouter from './routes';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
