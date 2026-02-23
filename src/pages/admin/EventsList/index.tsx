import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users, Calendar, MapPin, RefreshCw, Filter } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useEvents, useDeleteEvent } from '../../../hooks/useEvent';
import { ROUTES } from '../../../constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

export default function EventsList() {
  const navigate = useNavigate();
  
  // Mặc định hiển thị sự kiện tình nguyện (Đội cứu trợ) đang mở
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [typeFilter, setTypeFilter] = useState<string>('VOLUNTEER');
  
  const { data: eventsResponse, isLoading, error, refetch } = useEvents({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });
  const deleteEventMutation = useDeleteEvent();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    eventId: string | null;
    eventTitle: string;
  }>({
    open: false,
    eventId: null,
    eventTitle: '',
  });

  // Debug: log response structure
  console.log('Events Response:', eventsResponse);
  console.log('Events Data:', eventsResponse?.data);
  console.log('Events Items:', eventsResponse?.data?.items);
  console.log('Loading:', isLoading);
  console.log('Error:', error);
  
  // Force refetch on mount
  useEffect(() => {
    console.log('EventsList mounted, refetching...');
    refetch();
  }, []);
  
  // Handle different possible response structures
  let events: any[] = [];
  
  if (eventsResponse?.data?.data) {
    // Correct API structure: response.data.data
    events = eventsResponse.data.data;
  } else if (Array.isArray(eventsResponse?.data)) {
    // Direct array in data
    events = eventsResponse.data;
  } else if (Array.isArray(eventsResponse)) {
    // Direct array response
    events = eventsResponse;
  }
  
  console.log('Parsed Events:', events);
  console.log('Events Count:', events.length);
  console.log('Meta info:', eventsResponse?.data?.meta);
  if (events.length > 0) {
    console.table(events.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      status: e.status,
      startDate: e.startDate
    })));
  }

  const handleDelete = async () => {
    if (!deleteDialog.eventId) return;
    
    try {
      await deleteEventMutation.mutateAsync(deleteDialog.eventId);
      setDeleteDialog({ open: false, eventId: null, eventTitle: '' });
    } catch (error) {
      // Error handled in hook
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'Nháp', className: 'bg-yellow-100 text-yellow-800' },
      OPEN: { label: 'Đang mở', className: 'bg-green-100 text-green-800' },
      CLOSED: { label: 'Đã đóng', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusMap[status] || statusMap.DRAFT;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; className: string }> = {
      DONATION: { label: 'Quyên góp', className: 'bg-blue-100 text-blue-800' },
      VOLUNTEER: { label: 'Tình nguyện', className: 'bg-purple-100 text-purple-800' },
    };
    
    const config = typeMap[type] || typeMap.DONATION;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Events List Error:', error);
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-2">Có lỗi xảy ra khi tải danh sách sự kiện</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Sự kiện</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các sự kiện Đội cứu trợ và sự kiện Quyên góp
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={() => navigate(ROUTES.ADMIN_CREATE_EVENT)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo sự kiện mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
                <SelectItem value="OPEN">Đang mở</SelectItem>
                <SelectItem value="CLOSED">Đã đóng</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại sự kiện" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="DONATION">Quyên góp</SelectItem>
                <SelectItem value="VOLUNTEER">Tình nguyện</SelectItem>
              </SelectContent>
            </Select>
            
            {(statusFilter !== 'OPEN' || typeFilter !== 'VOLUNTEER') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setStatusFilter('OPEN');
                  setTypeFilter('VOLUNTEER');
                }}
              >
                Đặt lại bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sự kiện ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {typeFilter === 'VOLUNTEER' && statusFilter === 'OPEN' 
                  ? 'Không có sự kiện Đội cứu trợ nào đang mở'
                  : 'Không tìm thấy sự kiện nào'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {typeFilter === 'VOLUNTEER' && statusFilter === 'OPEN'
                  ? 'Tạo sự kiện tuyển tình nguyện viên để bắt đầu'
                  : 'Thử điều chỉnh bộ lọc hoặc tạo sự kiện mới'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Làm mới
                </Button>
                <Button onClick={() => navigate(ROUTES.ADMIN_CREATE_EVENT)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo sự kiện đầu tiên
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event: any) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {event.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(event.type)}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.startDate)}
                          </div>
                          <div className="text-muted-foreground">
                            đến {formatDate(event.endDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.location ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {event.type === 'VOLUNTEER' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/events/${event.id}/registrations`)}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Đăng ký
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(ROUTES.ADMIN_EDIT_EVENT(event.id))}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                eventId: event.id,
                                eventTitle: event.title,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog({ ...deleteDialog, open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sự kiện</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sự kiện "{deleteDialog.eventTitle}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, eventId: null, eventTitle: '' })}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
