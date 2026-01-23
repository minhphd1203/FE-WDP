import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventsReducer from './slices/eventsSlice';
import productsReducer from './slices/productsSlice';
import reliefRequestsReducer from './slices/reliefRequestsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    products: productsReducer,
    reliefRequests: reliefRequestsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
