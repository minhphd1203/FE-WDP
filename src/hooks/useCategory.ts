import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../apis/categoryApi';

const CATEGORY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORY_KEYS.all, 'list'] as const,
  list: (params?: any) => [...CATEGORY_KEYS.lists(), params] as const,
  details: () => [...CATEGORY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CATEGORY_KEYS.details(), id] as const,
};

// Get all categories
export const useCategories = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(params),
    queryFn: async () => {
      const response = await categoryApi.getCategories(params);
      if (response.success) {
        return response.data;
      }
      return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    },
  });
};

// Get category by ID
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id),
    queryFn: async () => {
      const response = await categoryApi.getCategory(id);
      return response.data;
    },
    enabled: !!id,
  });
};
