import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { eventApi, CreateEventDto, UpdateEventDto, UpdateEventStatusDto } from '../apis/eventApi';
import { PaginationParams } from '../types';

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: any) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  registrations: (id: string) => [...eventKeys.all, 'registrations', id] as const,
};

// Hook to get events list
export const useEvents = (params?: Partial<PaginationParams> & {
  type?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      console.log('Fetching events with params:', params);
      const response = await eventApi.getEvents(params);
      console.log('Events API response:', response);
      return response;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
  });
};

// Hook to get event by ID
export const useEvent = (id: string) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const response = await eventApi.getEventById(id);
      return response;
    },
    enabled: !!id,
  });
};

// Hook to create event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventDto) => {
      console.log('Creating event with data:', data);
      const response = await eventApi.createEvent(data);
      console.log('Create event response:', response);
      return response;
    },
    onSuccess: async () => {
      console.log('Event created successfully, invalidating and refetching queries...');
      
      // Invalidate all event queries
      await queryClient.invalidateQueries({ queryKey: eventKeys.all });
      
      // Force refetch immediately
      await queryClient.refetchQueries({ queryKey: eventKeys.lists() });
      
      console.log('Queries invalidated and refetched');
      toast.success('Tạo sự kiện thành công!');
    },
    onError: (error: any) => {
      console.error('Create event error:', error);
      const message = error?.response?.data?.message || error.message || 'Tạo sự kiện thất bại';
      toast.error(message);
    },
  });
};

// Hook to update event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEventDto }) => {
      const response = await eventApi.updateEvent(id, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      toast.success('Cập nhật sự kiện thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Cập nhật sự kiện thất bại';
      toast.error(message);
    },
  });
};

// Hook to delete event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await eventApi.deleteEvent(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success('Xóa sự kiện thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Xóa sự kiện thất bại';
      toast.error(message);
    },
  });
};

// Hook to update event status
export const useUpdateEventStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEventStatusDto }) => {
      const response = await eventApi.updateEventStatus(id, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      toast.success('Cập nhật trạng thái sự kiện thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Cập nhật trạng thái thất bại';
      toast.error(message);
    },
  });
};

// Hook to register for event
export const useRegisterEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await eventApi.registerForEvent(eventId);
      return response;
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrations(eventId) });
      toast.success('Đăng ký tham gia sự kiện thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Đăng ký thất bại';
      toast.error(message);
    },
  });
};

// Hook to get event registrations
export const useEventRegistrations = (eventId: string) => {
  return useQuery({
    queryKey: eventKeys.registrations(eventId),
    queryFn: async () => {
      const response = await eventApi.getEventRegistrations(eventId);
      return response;
    },
    enabled: !!eventId,
  });
};
