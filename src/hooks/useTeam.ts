import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  ListTeamsParams,
  CreateTeamDto,
  UpdateTeamDto,
} from '../apis/teamApi';

const TEAM_KEYS = {
  all: ['teams'] as const,
  lists: () => [...TEAM_KEYS.all, 'list'] as const,
  list: (params?: ListTeamsParams) => [...TEAM_KEYS.lists(), params] as const,
  details: () => [...TEAM_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TEAM_KEYS.details(), id] as const,
};

// List teams
export const useTeams = (params?: ListTeamsParams) => {
  return useQuery({
    queryKey: TEAM_KEYS.list(params),
    queryFn: () => listTeams(params),
  });
};

// Get team by ID
export const useTeam = (id: string) => {
  return useQuery({
    queryKey: TEAM_KEYS.detail(id),
    queryFn: () => getTeamById(id),
    enabled: !!id,
  });
};

// Create team
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamDto) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
      toast.success('Tạo đội cứu hộ thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Tạo đội cứu hộ thất bại');
    },
  });
};

// Update team
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamDto }) => updateTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.detail(variables.id) });
      toast.success('Cập nhật đội cứu hộ thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Cập nhật đội cứu hộ thất bại');
    },
  });
};

// Delete team
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.lists() });
      toast.success('Xóa đội cứu hộ thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Xóa đội cứu hộ thất bại');
    },
  });
};
