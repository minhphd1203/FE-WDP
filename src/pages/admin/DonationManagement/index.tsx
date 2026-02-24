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
import { useDonations, useDonation } from '../../../hooks/useDonation';
import { useEvents } from '../../../hooks/useEvent';
import { Donation } from '../../../types/donation';
import { formatDateTime, formatDate } from '../../../lib/utils';

export default function DonationManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    eventId: string | null;
    donationId: string | null;
  }>({
    open: false,
    eventId: null,
    donationId: null,
  });

  const { data: donationsResponse, isLoading } = useDonations({
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter,
    eventId: eventFilter === 'all' ? undefined : eventFilter,
    from: fromDate || undefined,
    to: toDate || undefined,
  });
  const { data: eventsResponse } = useEvents({ status: 'OPEN' });

  // Fetch detail donation when dialog is open
  const { data: donationDetailResponse, isLoading: isLoadingDetail } = useDonation(
    detailDialog.eventId || undefined,
    detailDialog.donationId || undefined
  );

  const donationDetail = donationDetailResponse?.data;

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
                      <TableCell>{donation.title}</TableCell>
                      <TableCell>{donation.items?.length || 0} items</TableCell>
                      <TableCell>{getStatusBadge(donation.status)}</TableCell>
                      <TableCell>
                        {formatDateTime(donation.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailDialog({ 
                            open: true, 
                            eventId: donation.eventId,
                            donationId: donation.id 
                          })}
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
        !open && setDetailDialog({ open: false, eventId: null, donationId: null })
      }>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết Donation</DialogTitle>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : donationDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Người donate</Label>
                  <p className="font-medium">
                    {donationDetail.creator?.profile?.fullName || 
                     donationDetail.creator?.email || 'Ẩn danh'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(donationDetail.status)}</div>
                </div>
              </div>
              {donationDetail.title && (
                <div>
                  <Label className="text-muted-foreground">Sự kiện</Label>
                  <p className="font-medium">{donationDetail.title}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {donationDetail.creator?.email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{donationDetail.creator.email}</p>
                  </div>
                )}
                {donationDetail.creator?.phone && (
                  <div>
                    <Label className="text-muted-foreground">Số điện thoại</Label>
                    <p>{donationDetail.creator.phone}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Danh sách vật phẩm</Label>
                <div className="mt-2 space-y-2">
                  {donationDetail.items.map((item, index) => (
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
                          Hạn sử dụng: {formatDate(item.expirationDate)}
                        </div>
                      )}
                      {item.imageUrls && item.imageUrls.length > 0 && (
                        <div className="text-sm">
                          <div className="text-muted-foreground mb-1">Hình ảnh:</div>
                          <div className="flex gap-2 flex-wrap">
                            {item.imageUrls.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`${item.name} ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded border"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image';
                                }}
                              />
                            ))}
                          </div>
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
              {donationDetail.note && (
                <div>
                  <Label className="text-muted-foreground">Ghi chú phê duyệt</Label>
                  <p className="text-sm">{donationDetail.note}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                  <p>{formatDateTime(donationDetail.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cập nhật</Label>
                  <p>{formatDateTime(donationDetail.updatedAt)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy thông tin donation
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialog({ open: false, eventId: null, donationId: null })}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
