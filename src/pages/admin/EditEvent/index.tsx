import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { updateEventSchema, UpdateEventFormData, updateEventStatusSchema, UpdateEventStatusFormData } from '../../../schema/eventSchema';
import { useEvent, useUpdateEvent, useUpdateEventStatus } from '../../../hooks/useEvent';
import { ROUTES } from '../../../constants';

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: eventResponse, isLoading: isLoadingEvent } = useEvent(id!);
  const updateEventMutation = useUpdateEvent();
  const updateStatusMutation = useUpdateEventStatus();

  const event = eventResponse?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateEventFormData>({
    resolver: zodResolver(updateEventSchema),
  });

  const {
    setValue: setStatusValue,
    handleSubmit: handleStatusSubmit,
    formState: { errors: statusErrors },
  } = useForm<UpdateEventStatusFormData>({
    resolver: zodResolver(updateEventStatusSchema),
  });

  // Load event data into form
  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        startDate: event.startDate.slice(0, 16), // Format for datetime-local
        endDate: event.endDate.slice(0, 16),
        location: event.location || '',
      });
      setStatusValue('status', event.status);
    }
  }, [event, reset, setStatusValue]);

  const onSubmit = async (data: UpdateEventFormData) => {
    if (!id) return;

    try {
      await updateEventMutation.mutateAsync({ id, data });
      navigate(ROUTES.ADMIN_EVENTS);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const onStatusSubmit = async (data: UpdateEventStatusFormData) => {
    if (!id) return;

    try {
      await updateStatusMutation.mutateAsync({ id, data });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (isLoadingEvent) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-red-500">Không tìm thấy sự kiện</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.ADMIN_EVENTS)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold">Chỉnh sửa Sự Kiện</h1>
        <p className="text-muted-foreground mt-1">
          Cập nhật thông tin sự kiện
        </p>
      </div>

      <div className="space-y-6">
        {/* Status Update Card */}
        <Card>
          <CardHeader>
            <CardTitle>Cập nhật trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStatusSubmit(onStatusSubmit)} className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="status">Trạng thái sự kiện</Label>
                  <Select
                    defaultValue={event.status}
                    onValueChange={(value) => setStatusValue('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Nháp</SelectItem>
                      <SelectItem value="OPEN">Đang mở</SelectItem>
                      <SelectItem value="CLOSED">Đã đóng</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  {statusErrors.status && (
                    <p className="text-sm text-red-500">{statusErrors.status.message}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={updateStatusMutation.isPending}
                  className="mb-0.5"
                >
                  {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Event Info Update Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sự kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề sự kiện"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả *</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về sự kiện"
                  rows={5}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...register('startDate')}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Ngày kết thúc *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register('endDate')}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm</Label>
                <Input
                  id="location"
                  placeholder="Nhập địa điểm tập trung"
                  {...register('location')}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.ADMIN_EVENTS)}
                  disabled={updateEventMutation.isPending}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={updateEventMutation.isPending}>
                  {updateEventMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật sự kiện'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
