import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  userApi, 
  CreateAccountDto, 
  UpdateAccountDto, 
  UpdateAccountStatusDto,
  VerifyContactDto 
} from '../apis/userApi';
import { PaginationParams } from '../types';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: any) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Hook to get users list
export const useUsers = (params?: Partial<PaginationParams> & {
  role?: string;
  search?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await userApi.getUsers(params);
      return response;
    },
  });
};

// Hook to get user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await userApi.getUserById(id);
      return response;
    },
    enabled: !!id,
  });
};

// Hook to create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAccountDto) => {
      const response = await userApi.createUser(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('Tạo tài khoản thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Tạo tài khoản thất bại';
      toast.error(message);
    },
  });
};

// Hook to update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAccountDto }) => {
      const response = await userApi.updateUser(id, data);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      toast.success('Cập nhật tài khoản thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Cập nhật tài khoản thất bại';
      toast.error(message);
    },
  });
};

// Hook to delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await userApi.deleteUser(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('Xóa tài khoản thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Xóa tài khoản thất bại';
      toast.error(message);
    },
  });
};

// Hook to update user status
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAccountStatusDto }) => {
      const response = await userApi.updateUserStatus(id, data);
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      toast.success('Cập nhật trạng thái thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Cập nhật trạng thái thất bại';
      toast.error(message);
    },
  });
};

// Hook to confirm contact
export const useConfirmContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await userApi.confirmContact(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('Xác nhận liên lạc thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Xác nhận liên lạc thất bại';
      toast.error(message);
    },
  });
};

// Hook to verify contact
export const useVerifyContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VerifyContactDto }) => {
      const response = await userApi.verifyContact(id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('Xác minh liên lạc thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Xác minh liên lạc thất bại';
      toast.error(message);
    },
  });
};
