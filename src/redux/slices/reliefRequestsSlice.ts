import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReliefRequest } from '../../types';

interface ReliefRequestsState {
  requests: ReliefRequest[];
  currentRequest: ReliefRequest | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    urgency?: string;
    searchQuery?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: ReliefRequestsState = {
  requests: [],
  currentRequest: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const reliefRequestsSlice = createSlice({
  name: 'reliefRequests',
  initialState,
  reducers: {
    setRequests: (state, action: PayloadAction<ReliefRequest[]>) => {
      state.requests = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentRequest: (state, action: PayloadAction<ReliefRequest | null>) => {
      state.currentRequest = action.payload;
    },
    addRequest: (state, action: PayloadAction<ReliefRequest>) => {
      state.requests.unshift(action.payload);
    },
    updateRequest: (state, action: PayloadAction<ReliefRequest>) => {
      const index = state.requests.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
      if (state.currentRequest?.id === action.payload.id) {
        state.currentRequest = action.payload;
      }
    },
    deleteRequest: (state, action: PayloadAction<string>) => {
      state.requests = state.requests.filter((r) => r.id !== action.payload);
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<ReliefRequestsState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<ReliefRequestsState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setRequests,
  setCurrentRequest,
  addRequest,
  updateRequest,
  deleteRequest,
  setFilters,
  clearFilters,
  setPagination,
  setLoading,
  setError,
} = reliefRequestsSlice.actions;

export default reliefRequestsSlice.reducer;
