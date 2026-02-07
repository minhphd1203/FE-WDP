import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  rescueRequestApi,
  RescueRequestFilters,
} from '../apis/rescueRequestApi';
import { AssignTeamsDto, ReviewRescueRequestDto } from '../types';

const RESCUE_REQUEST_KEYS = {
  all: ['rescue-requests'] as const,
  lists: () => [...RESCUE_REQUEST_KEYS.all, 'list'] as const,
  list: (filters?: RescueRequestFilters) =>
    [...RESCUE_REQUEST_KEYS.lists(), filters] as const,
  details: () => [...RESCUE_REQUEST_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...RESCUE_REQUEST_KEYS.details(), id] as const,
};

// Get all rescue requests
export const useRescueRequests = (filters?: RescueRequestFilters) => {
  return useQuery({
    queryKey: RESCUE_REQUEST_KEYS.list(filters),
    queryFn: async () => {
      const response = await rescueRequestApi.getRescueRequests(filters);
      if (response.success) {
        return response.data;
      }
      return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    },
  });
};

// Get rescue request by ID
export const useRescueRequest = (id: string) => {
  return useQuery({
    queryKey: RESCUE_REQUEST_KEYS.detail(id),
    queryFn: async () => {
      const response = await rescueRequestApi.getRescueRequest(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Assign teams to rescue request
export const useAssignTeams = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignTeamsDto }) =>
      rescueRequestApi.assignTeams(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RESCUE_REQUEST_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: RESCUE_REQUEST_KEYS.detail(variables.id),
      });
      toast.success('Phân công đội cứu trợ thành công');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Phân công đội cứu trợ thất bại'
      );
    },
  });
};

// Review rescue request
export const useReviewRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewRescueRequestDto }) =>
      rescueRequestApi.reviewRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RESCUE_REQUEST_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: RESCUE_REQUEST_KEYS.detail(variables.id),
      });
      toast.success('Đánh giá đơn cứu trợ thành công');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Đánh giá đơn cứu trợ thất bại'
      );
    },
  });
};
