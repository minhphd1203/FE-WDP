import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, CheckCircle, XCircle, Eye, Filter, X } from 'lucide-react';
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
  DialogDescription,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { 
  useDonations, 
  useApproveDonation, 
  useRejectDonation,
  useBulkApproveDonations,
  useBulkRejectDonations
} from '../../../hooks/useDonation';
import { useEvents } from '../../../hooks/useEvent';
import { 
  rejectDonationSchema, 
  bulkRejectDonationsSchema,
  RejectDonationFormData,
  BulkRejectDonationsFormData
} from '../../../schema/donationSchema';
import { Donation } from '../../../types/donation';

export default function DonationManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedDonations, setSelectedDonations] = useState<string[]>([]);
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    donationId: string | null;
    isBulk: boolean;
  }>({
    open: false,
    donationId: null,
    isBulk: false,
  });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    donationId: string | null;
    isBulk: boolean;
  }>({
    open: false,
    donationId: null,
    isBulk: false,
  });
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    donation: Donation | null;
  }>({
    open: false,
    donation: null,
  });
  const [approveNote, setApproveNote] = useState('');

  const { data: donationsResponse, isLoading } = useDonations({
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter,
    eventId: eventFilter === 'all' ? undefined : eventFilter,
    from: fromDate || undefined,
    to: toDate || undefined,
  });
  const { data: eventsResponse } = useEvents({ status: 'OPEN' });
  const approveMutation = useApproveDonation();
  const rejectMutation = useRejectDonation();
  const bulkApproveMutation = useBulkApproveDonations();
  const bulkRejectMutation = useBulkRejectDonations();

  const donations = donationsResponse?.data?.data || [];
  const events = eventsResponse?.data?.data || [];

  // Form for reject
  const {
    register: registerReject,
    handleSubmit: handleSubmitReject,
    formState: { errors: errorsReject },
    reset: resetReject,
  } = useForm<RejectDonationFormData>({
    resolver: zodResolver(rejectDonationSchema),
  });

  // Form for bulk reject
  const {
    register: registerBulkReject,
    handleSubmit: handleSubmitBulkReject,
    formState: { errors: errorsBulkReject },
    reset: resetBulkReject,
  } = useForm<BulkRejectDonationsFormData>({
    resolver: zodResolver(bulkRejectDonationsSchema),
  });

  const handleApprove = async () => {
    if (approveDialog.isBulk) {
      try {
        await bulkApproveMutation.mutateAsync({
          ids: selectedDonations,
          note: approveNote || undefined,
        });
        setApproveDialog({ open: false, donationId: null, isBulk: false });
        setApproveNote('');
        setSelectedDonations([]);
      } catch (error) {
        // Error handled in hook
      }
    } else if (approveDialog.donationId) {
      try {
        await approveMutation.mutateAsync({
          id: approveDialog.donationId,
          data: { note: approveNote || undefined },
        });
        setApproveDialog({ open: false, donationId: null, isBulk: false });
        setApproveNote('');
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const onSubmitReject = async (data: RejectDonationFormData) => {
    if (rejectDialog.donationId) {
      try {
        await rejectMutation.mutateAsync({
          id: rejectDialog.donationId,
          data,
        });
        setRejectDialog({ open: false, donationId: null, isBulk: false });
        resetReject();
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const onSubmitBulkReject = async (data: BulkRejectDonationsFormData) => {
    try {
      await bulkRejectMutation.mutateAsync({
        ...data,
        ids: selectedDonations,
      });
      setRejectDialog({ open: false, donationId: null, isBulk: false });
      resetBulkReject();
      setSelectedDonations([]);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDonations(donations.filter((d: Donation) => d.status === 'PENDING').map((d: Donation) => d.id));
    } else {
      setSelectedDonations([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDonations([...selectedDonations, id]);
    } else {
      setSelectedDonations(selectedDonations.filter((sid) => sid !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
    };
    return <Badge className={variants[status] || variants.PENDING}>{labels[status] || status}</Badge>;
  };

  const pendingDonations = donations.filter((d: Donation) => d.status === 'PENDING');

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
            Phê duyệt và quản lý các donation từ người dùng
          </p>
        </div>
        {selectedDonations.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => setApproveDialog({ open: true, donationId: null, isBulk: true })}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Phê duyệt {selectedDonations.length} donation
            </Button>
            <Button
              variant="destructive"
              onClick={() => setRejectDialog({ open: true, donationId: null, isBulk: true })}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Từ chối {selectedDonations.length} donation
            </Button>
          </div>
        )}
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
                    placeholder="Tìm kiếm theo tên người donate, email..."
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
                  <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                  <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                  <SelectItem value="REJECTED">Từ chối</SelectItem>
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
            {pendingDonations.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pendingDonations.length} chờ duyệt)
              </span>
            )}
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
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedDonations.length === pendingDonations.length && pendingDonations.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Người donate</TableHead>
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
                        {donation.status === 'PENDING' && (
                          <Checkbox
                            checked={selectedDonations.includes(donation.id)}
                            onCheckedChange={(checked) => handleSelectOne(donation.id, checked as boolean)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{donation.donorName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {donation.donorEmail && <div>{donation.donorEmail}</div>}
                          {donation.donorPhone && <div>{donation.donorPhone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{donation.eventTitle || '-'}</TableCell>
                      <TableCell>{donation.items?.length || 0} items</TableCell>
                      <TableCell>{getStatusBadge(donation.status)}</TableCell>
                      <TableCell>
                        {new Date(donation.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailDialog({ open: true, donation })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {donation.status === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setApproveDialog({ open: true, donationId: donation.id, isBulk: false })}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRejectDialog({ open: true, donationId: donation.id, isBulk: false })}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
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

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => 
        !open && setApproveDialog({ open: false, donationId: null, isBulk: false })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approveDialog.isBulk ? `Phê duyệt ${selectedDonations.length} donations` : 'Phê duyệt donation'}
            </DialogTitle>
            <DialogDescription>
              Xác nhận phê duyệt donation này. Bạn có thể thêm ghi chú (không bắt buộc).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approve-note">Ghi chú</Label>
              <Textarea
                id="approve-note"
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="Ví dụ: Approved - all items received in good condition"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialog({ open: false, donationId: null, isBulk: false });
                setApproveNote('');
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending || bulkApproveMutation.isPending}
            >
              {approveMutation.isPending || bulkApproveMutation.isPending ? 'Đang xử lý...' : 'Phê duyệt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => 
        !open && setRejectDialog({ open: false, donationId: null, isBulk: false })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {rejectDialog.isBulk ? `Từ chối ${selectedDonations.length} donations` : 'Từ chối donation'}
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối donation này.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={rejectDialog.isBulk ? handleSubmitBulkReject(onSubmitBulkReject) : handleSubmitReject(onSubmitReject)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Lý do từ chối *</Label>
              <Textarea
                id="reject-reason"
                {...(rejectDialog.isBulk ? registerBulkReject('reason') : registerReject('reason'))}
                placeholder="Ví dụ: Some items are damaged or expired"
                rows={4}
              />
              {(rejectDialog.isBulk ? errorsBulkReject.reason : errorsReject.reason) && (
                <p className="text-sm text-red-500">
                  {(rejectDialog.isBulk ? errorsBulkReject.reason : errorsReject.reason)?.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRejectDialog({ open: false, donationId: null, isBulk: false });
                  resetReject();
                  resetBulkReject();
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={rejectMutation.isPending || bulkRejectMutation.isPending}
              >
                {rejectMutation.isPending || bulkRejectMutation.isPending ? 'Đang xử lý...' : 'Từ chối'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                  <p className="font-medium">{detailDialog.donation.donorName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(detailDialog.donation.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {detailDialog.donation.donorEmail && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{detailDialog.donation.donorEmail}</p>
                  </div>
                )}
                {detailDialog.donation.donorPhone && (
                  <div>
                    <Label className="text-muted-foreground">Số điện thoại</Label>
                    <p>{detailDialog.donation.donorPhone}</p>
                  </div>
                )}
              </div>
              {detailDialog.donation.eventTitle && (
                <div>
                  <Label className="text-muted-foreground">Sự kiện</Label>
                  <p>{detailDialog.donation.eventTitle}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Danh sách vật phẩm</Label>
                <div className="mt-2 space-y-2">
                  {detailDialog.donation.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Số lượng: {item.quantity} {item.unit}
                      </div>
                      {item.condition && (
                        <div className="text-sm text-muted-foreground">
                          Tình trạng: {item.condition}
                        </div>
                      )}
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          Mô tả: {item.description}
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
