import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

interface ProductsState {
  products: Product[];
  pendingProducts: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    category?: string;
    searchQuery?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: ProductsState = {
  products: [],
  pendingProducts: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setPendingProducts: (state, action: PayloadAction<Product[]>) => {
      state.pendingProducts = action.payload;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.unshift(action.payload);
      if (action.payload.status === 'pending') {
        state.pendingProducts.unshift(action.payload);
      }
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      const pendingIndex = state.pendingProducts.findIndex(
        (p) => p.id === action.payload.id
      );
      if (pendingIndex !== -1) {
        if (action.payload.status === 'pending') {
          state.pendingProducts[pendingIndex] = action.payload;
        } else {
          state.pendingProducts.splice(pendingIndex, 1);
        }
      }
      if (state.currentProduct?.id === action.payload.id) {
        state.currentProduct = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
      state.pendingProducts = state.pendingProducts.filter(
        (p) => p.id !== action.payload
      );
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<ProductsState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<ProductsState['pagination']>>
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
  setProducts,
  setPendingProducts,
  setCurrentProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  setFilters,
  clearFilters,
  setPagination,
  setLoading,
  setError,
} = productsSlice.actions;

export default productsSlice.reducer;
