import { useState } from 'react';
import { Search, Eye, Filter, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useDonations } from '../../../hooks/useDonation';
import { useEvents } from '../../../hooks/useEvent';
import { Donation } from '../../../types/donation';

export default function DonationManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    donation: Donation | null;
  }>({
    open: false,
    donation: null,
  });

  const { data: donationsResponse, isLoading } = useDonations({
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter,
    eventId: eventFilter === 'all' ? undefined : eventFilter,
    from: fromDate || undefined,
    to: toDate || undefined,
  });
  const { data: eventsResponse } = useEvents({ status: 'OPEN' });

  const donations = donationsResponse?.data?.data || [];
  const events = eventsResponse?.data?.data || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      RECEIVED: 'bg-blue-100 text-blue-800',
      ALLOCATED: 'bg-purple-100 text-purple-800',
      DISPATCHED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-teal-100 text-teal-800',
    };
    const labels: Record<string, string> = {
      SUBMITTED: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      RECEIVED: 'Đã nhận',
      ALLOCATED: 'Đã phân bổ',
      DISPATCHED: 'Đang vận chuyển',
      DELIVERED: 'Đã giao',
    };
    return <Badge className={variants[status] || variants.SUBMITTED}>{labels[status] || status}</Badge>;
  };

  const handleClearFilters = () => {
    setEventFilter('all');
    setFromDate('');
    setToDate('');
  };

  const activeFiltersCount = [
    eventFilter !== 'all',
    fromDate,
    toDate,
  ].filter(Boolean).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Donation</h1>
          <p className="text-muted-foreground mt-1">
            Xem và theo dõi các donation từ người dùng
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo email, số điện thoại..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="SUBMITTED">Chờ duyệt</SelectItem>
                  <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                  <SelectItem value="REJECTED">Từ chối</SelectItem>
                  <SelectItem value="RECEIVED">Đã nhận</SelectItem>
                  <SelectItem value="ALLOCATED">Đã phân bổ</SelectItem>
                  <SelectItem value="DISPATCHED">Đang vận chuyển</SelectItem>
                  <SelectItem value="DELIVERED">Đã giao</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc nâng cao
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-primary">{activeFiltersCount}</Badge>
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Sự kiện</Label>
                    <Select value={eventFilter} onValueChange={setEventFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả sự kiện" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả sự kiện</SelectItem>
                        {events.map((event: any) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Từ ngày</Label>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Đến ngày</Label>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      min={fromDate || undefined}
                    />
                  </div>
                </div>
                {activeFiltersCount > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Xóa bộ lọc
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách donations ({donations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : donations.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email/SĐT</TableHead>
                    <TableHead>Sự kiện</TableHead>
                    <TableHead>Số vật phẩm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation: Donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div className="text-sm">
                          {donation.creator?.email && <div>{donation.creator.email}</div>}
                          {donation.creator?.phone && <div>{donation.creator.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{donation.title || '-'}</TableCell>
                      <TableCell>{donation.items?.length || 0} items</TableCell>
                      <TableCell>{getStatusBadge(donation.status)}</TableCell>
                      <TableCell>
                        {new Date(donation.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailDialog({ open: true, donation })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy donation nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => 
        !open && setDetailDialog({ open: false, donation: null })
      }>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết Donation</DialogTitle>
          </DialogHeader>
          {detailDialog.donation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Người donate</Label>
                  <p className="font-medium">
                    {detailDialog.donation.creator?.profile?.fullName || 
                     detailDialog.donation.creator?.email || 'Ẩn danh'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(detailDialog.donation.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {detailDialog.donation.creator?.email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{detailDialog.donation.creator.email}</p>
                  </div>
                )}
                {detailDialog.donation.creator?.phone && (
                  <div>
                    <Label className="text-muted-foreground">Số điện thoại</Label>
                    <p>{detailDialog.donation.creator.phone}</p>
                  </div>
                )}
              </div>
              {detailDialog.donation.creator?.profile?.address && (
                <div>
                  <Label className="text-muted-foreground">Địa chỉ</Label>
                  <p>{detailDialog.donation.creator.profile.address}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Danh sách vật phẩm</Label>
                <div className="mt-2 space-y-2">
                  {detailDialog.donation.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="font-medium">{item.name}</div>
                      {item.category && (
                        <div className="text-sm text-muted-foreground">
                          Danh mục: {item.category.name}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Số lượng: {item.quantity} {item.unit}
                      </div>
                      {item.condition && (
                        <div className="text-sm text-muted-foreground">
                          Tình trạng: {item.condition}
                        </div>
                      )}
                      {item.expirationDate && (
                        <div className="text-sm text-muted-foreground">
                          Hạn sử dụng: {new Date(item.expirationDate).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                      {item.note && (
                        <div className="text-sm text-muted-foreground">
                          Ghi chú: {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {detailDialog.donation.note && (
                <div>
                  <Label className="text-muted-foreground">Ghi chú phê duyệt</Label>
                  <p className="text-sm">{detailDialog.donation.note}</p>
                </div>
              )}
              {detailDialog.donation.reason && (
                <div>
                  <Label className="text-muted-foreground">Lý do từ chối</Label>
                  <p className="text-sm text-red-600">{detailDialog.donation.reason}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                  <p>{new Date(detailDialog.donation.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cập nhật</Label>
                  <p>{new Date(detailDialog.donation.updatedAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialog({ open: false, donation: null })}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
