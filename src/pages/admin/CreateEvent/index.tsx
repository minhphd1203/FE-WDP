import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import OSMLocationPicker from '../../../components/ui/osm-location-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { createEventSchema, CreateEventFormData } from '../../../schema/eventSchema';
import { useCreateEvent } from '../../../hooks/useEvent';
import { ROUTES } from '../../../constants';

export default function CreateEvent() {
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
  });

  // Get current datetime in local timezone for min attribute
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const startDate = watch('startDate');

  const onSubmit = async (data: CreateEventFormData) => {
    console.log('Form data before submit:', data);
    
    // Convert datetime-local to ISO 8601
    const formattedData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };
    
    console.log('Formatted data:', formattedData);
    
    try {
      await createEventMutation.mutateAsync(formattedData);
      console.log('Mutation completed, waiting before navigate...');
      
      // Wait a bit for cache to update
      setTimeout(() => {
        console.log('Navigating to events list...');
        navigate(ROUTES.ADMIN_EVENTS);
      }, 500);
    } catch (error) {
      console.error('Submit error:', error);
      // Error is handled in the hook
    }
  };

  const eventType = watch('type');

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
        <h1 className="text-3xl font-bold">Tạo Sự Kiện Mới</h1>
        <p className="text-muted-foreground mt-1">
          Tạo đội cứu trợ hoặc chiến dịch quyên góp vật phẩm
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin sự kiện</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Loại sự kiện *</Label>
              <Select
                onValueChange={(value) => setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại sự kiện" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VOLUNTEER">
                    Đội cứu trợ - Tuyển tình nguyện viên
                  </SelectItem>
                  <SelectItem value="DONATION">
                    Quyên góp vật phẩm
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

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
                  min={getCurrentDateTimeLocal()}
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
                  min={startDate || getCurrentDateTimeLocal()}
                  {...register('endDate')}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Location (optional for relief teams) */}
            {eventType === 'VOLUNTEER' && (
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm tập trung</Label>
                <OSMLocationPicker
                  value={watch('location') || ''}
                  onChange={(value) => setValue('location', value)}
                  placeholder="Nhập địa điểm tập trung của đội hoặc click trên bản đồ"
                  error={errors.location?.message}
                  showMap={true}
                />
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.ADMIN_EVENTS)}
                disabled={createEventMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={createEventMutation.isPending}>
                {createEventMutation.isPending ? 'Đang tạo...' : 'Tạo sự kiện'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đội cứu trợ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tạo sự kiện tuyển tình nguyện viên tham gia đội cứu trợ. Người dùng
              có thể đăng ký tham gia và bạn sẽ phê duyệt các đăng ký phù hợp.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quyên góp vật phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tạo chiến dịch kêu gọi quyên góp vật phẩm cứu trợ. Người dùng có thể
              điền form gửi thông tin vật phẩm muốn quyên góp.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
