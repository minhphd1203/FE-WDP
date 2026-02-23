import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  donationApi, 
  ApproveDonationDto, 
  RejectDonationDto,
  BulkApproveDonationsDto,
  BulkRejectDonationsDto
} from '../apis/donationApi';
import { PaginationParams } from '../types';

// Query keys
export const donationKeys = {
  all: ['donations'] as const,
  lists: () => [...donationKeys.all, 'list'] as const,
  list: (filters?: any) => [...donationKeys.lists(), filters] as const,
  details: () => [...donationKeys.all, 'detail'] as const,
  detail: (id: string) => [...donationKeys.details(), id] as const,
};

// Hook to get donations list
export const useDonations = (params?: {
  status?: string;
  search?: string;
  eventId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}) => {
  return useQuery({
    queryKey: donationKeys.list(params),
    queryFn: async () => {
      const response = await donationApi.getDonations(params);
      return response;
    },
  });
};

// Hook to get donation by ID
export const useDonation = (id: string) => {
  return useQuery({
    queryKey: donationKeys.detail(id),
    queryFn: async () => {
      const response = await donationApi.getDonationById(id);
      return response;
    },
    enabled: !!id,
  });
};

// Hook to approve donation
export const useApproveDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ApproveDonationDto }) => {
      const response = await donationApi.approveDonation(id, data);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: donationKeys.detail(variables.id) });
      toast.success('Phê duyệt donation thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Phê duyệt donation thất bại';
      toast.error(message);
    },
  });
};

// Hook to reject donation
export const useRejectDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RejectDonationDto }) => {
      const response = await donationApi.rejectDonation(id, data);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: donationKeys.detail(variables.id) });
      toast.success('Từ chối donation thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Từ chối donation thất bại';
      toast.error(message);
    },
  });
};

// Hook to bulk approve donations
export const useBulkApproveDonations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkApproveDonationsDto) => {
      const response = await donationApi.bulkApproveDonations(data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
      toast.success(`Đã phê duyệt ${response.data?.count || 0} donations!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Phê duyệt hàng loạt thất bại';
      toast.error(message);
    },
  });
};

// Hook to bulk reject donations
export const useBulkRejectDonations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkRejectDonationsDto) => {
      const response = await donationApi.bulkRejectDonations(data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
      toast.success(`Đã từ chối ${response.data?.count || 0} donations!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Từ chối hàng loạt thất bại';
      toast.error(message);
    },
  });
};
