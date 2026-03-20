import { useEffect, useMemo, useState } from "react";
import { Check, Eye, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  teamRegistrationRequestApi,
  TeamRegistrationRequest,
  TeamRegistrationRequestStatus,
} from "../../../apis/teamRegistrationRequestApi";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Textarea } from "../../../components/ui/textarea";
import { formatDateTime } from "../../../lib/utils";

type StatusFilter = "all" | TeamRegistrationRequestStatus;

const statusLabelMap: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

const statusClassMap: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-800",
};

const specialtyLabelMap: Record<string, string> = {
  first_aid: "Sơ cứu",
  water_rescue: "Cứu hộ đường thủy",
};

const vehicleTypeLabelMap: Record<string, string> = {
  xe_ban_tai: "Xe bán tải",
  xe_cuu_thuong: "Xe cứu thương",
  xuong_cuu_ho: "Xuồng cứu hộ",
};

const getStatusLabel = (status: string) => {
  return statusLabelMap[status] || status;
};

const getStatusClassName = (status: string) => {
  return statusClassMap[status] || "bg-slate-100 text-slate-700";
};

const normalizeListData = (payload: unknown): TeamRegistrationRequest[] => {
  if (Array.isArray(payload)) return payload as TeamRegistrationRequest[];

  if (payload && typeof payload === "object") {
    const maybeRecord = payload as Record<string, unknown>;

    if (Array.isArray(maybeRecord.data)) {
      return maybeRecord.data as TeamRegistrationRequest[];
    }
  }

  return [];
};

const normalizeDetailData = (
  payload: unknown,
): TeamRegistrationRequest | null => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const maybeRecord = payload as Record<string, unknown>;

    if (typeof maybeRecord.id === "string") {
      return payload as TeamRegistrationRequest;
    }

    if (maybeRecord.data && typeof maybeRecord.data === "object") {
      return maybeRecord.data as TeamRegistrationRequest;
    }
  }

  return null;
};

export default function TeamRegistrationRequests() {
  const [requests, setRequests] = useState<TeamRegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [selectedRequest, setSelectedRequest] =
    useState<TeamRegistrationRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response =
        await teamRegistrationRequestApi.getAdminTeamRegistrationRequests();
      if (response.success) {
        const nextRequests = normalizeListData(response.data);
        setRequests(nextRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách yêu cầu đăng ký đội cứu hộ");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return requests.filter((request) => {
      const matchStatus =
        statusFilter === "all" || request.status === statusFilter;

      const matchSearch =
        !search ||
        request.name.toLowerCase().includes(search) ||
        request.area.toLowerCase().includes(search) ||
        request.requestedBy?.fullName?.toLowerCase().includes(search) ||
        request.requestedBy?.email?.toLowerCase().includes(search);

      return matchStatus && matchSearch;
    });
  }, [requests, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const pending = requests.filter((item) => item.status === "pending").length;
    const approved = requests.filter(
      (item) => item.status === "approved",
    ).length;
    const rejected = requests.filter(
      (item) => item.status === "rejected",
    ).length;

    return {
      total: requests.length,
      pending,
      approved,
      rejected,
    };
  }, [requests]);

  const handleOpenDetail = async (requestId: string) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setSelectedRequest(null);
    setReviewNote("");

    try {
      const response =
        await teamRegistrationRequestApi.getAdminTeamRegistrationRequestById(
          requestId,
        );

      if (response.success) {
        const detail = normalizeDetailData(response.data);
        if (detail) {
          setSelectedRequest(detail);
        }
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết yêu cầu đăng ký");
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedRequest) return;

    setIsReviewing(true);

    try {
      const response =
        await teamRegistrationRequestApi.reviewAdminTeamRegistrationRequest(
          selectedRequest.id,
          {
            status,
            reviewNote: reviewNote.trim() || undefined,
          },
        );

      if (response.success) {
        toast.success(
          status === "approved"
            ? "Đã duyệt yêu cầu đăng ký đội cứu hộ"
            : "Đã từ chối yêu cầu đăng ký đội cứu hộ",
        );
        setIsDetailOpen(false);
        await fetchRequests();
      }
    } catch (error) {
      toast.error("Không thể xử lý yêu cầu. Vui lòng thử lại");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-red-50/30 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Yêu cầu đăng ký đội cứu hộ
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Duyệt hồ sơ đăng ký trở thành đội cứu hộ trong hệ thống.
          </p>
        </div>
        <Button
          onClick={() => void fetchRequests()}
          variant="outline"
          className="rounded-xl border-red-200 text-red-700  hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Tổng hồ sơ</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.total}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Chờ duyệt</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {stats.pending}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Đã duyệt</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {stats.approved}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Từ chối</p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {stats.rejected}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9 border-slate-200 focus-visible:border-red-300 focus-visible:ring-red-200"
                placeholder="Tìm theo tên đội, khu vực, người đăng ký..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">
            Danh sách yêu cầu đăng ký
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-slate-50/80">
                  <TableHead>Tên đội</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Người đăng ký</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-slate-600"
                    >
                      Đang tải danh sách yêu cầu đăng ký...
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-slate-600"
                    >
                      Không có yêu cầu phù hợp với bộ lọc hiện tại.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-slate-50/70">
                      <TableCell className="min-w-[220px] font-medium text-slate-900">
                        {request.name}
                      </TableCell>
                      <TableCell className="min-w-[200px] text-slate-700">
                        {request.area}
                      </TableCell>
                      <TableCell className="min-w-[220px] text-slate-700">
                        <p className="font-medium text-slate-900">
                          {request.requestedBy?.fullName || "Không xác định"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {request.requestedBy?.email || "(Không có email)"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClassName(request.status)}`}
                        >
                          {getStatusLabel(request.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDateTime(request.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                          onClick={() => void handleOpenDetail(request.id)}
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          if (!isReviewing) {
            setIsDetailOpen(open);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu đăng ký đội cứu hộ</DialogTitle>
          </DialogHeader>

          {isDetailLoading || !selectedRequest ? (
            <div className="py-10 text-center text-sm text-slate-600">
              Đang tải chi tiết yêu cầu...
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-500">Tên đội</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedRequest.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Khu vực</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedRequest.area}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Quy mô đội</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedRequest.teamSize} người
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Vị trí tập kết
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedRequest.baseLocation}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">Mô tả</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {selectedRequest.description}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">Chuyên môn</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selectedRequest.specialties || []).map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700"
                    >
                      {specialtyLabelMap[specialty] || specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">Thiết bị</p>
                <div className="mt-2 space-y-2">
                  {(selectedRequest.equipmentList || []).map((item, index) => (
                    <div
                      key={`${item.equipmentName}-${index}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-slate-900">
                        {item.equipmentName}
                      </p>
                      <p className="text-slate-600">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">Phương tiện</p>
                <div className="mt-2 space-y-2">
                  {(selectedRequest.vehicles || []).map((vehicle, index) => (
                    <div
                      key={`${vehicle.plateNumber}-${index}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-slate-900">
                        {vehicleTypeLabelMap[vehicle.vehicleTypeCode] ||
                          vehicle.vehicleTypeCode}
                      </p>
                      <p className="text-slate-600">
                        Biển số: {vehicle.plateNumber} - Sức chứa:{" "}
                        {vehicle.capacity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Người đăng ký
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {selectedRequest.requestedBy?.fullName || "Không xác định"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedRequest.requestedBy?.email || "(Không có email)"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedRequest.requestedBy?.phone ||
                      "(Không có số điện thoại)"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Trạng thái</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClassName(selectedRequest.status)}`}
                  >
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                  <p className="mt-2 text-sm text-slate-600">
                    Tạo lúc: {formatDateTime(selectedRequest.createdAt)}
                  </p>
                </div>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="space-y-3 rounded-xl border border-red-100 bg-red-50/40 p-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="review-note">Ghi chú phản hồi</Label>
                    <Textarea
                      id="review-note"
                      value={reviewNote}
                      onChange={(event) => setReviewNote(event.target.value)}
                      placeholder="Nhập ghi chú cho đội đăng ký..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isReviewing}
              onClick={() => setIsDetailOpen(false)}
            >
              <X className="h-4 w-4" />
              Đóng
            </Button>
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isReviewing || isDetailLoading}
                  onClick={() => void handleReview("rejected")}
                  className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  {isReviewing ? "Đang xử lý..." : "Từ chối hồ sơ"}
                </Button>
                <Button
                  type="button"
                  disabled={isReviewing || isDetailLoading}
                  onClick={() => void handleReview("approved")}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" />
                  {isReviewing ? "Đang xử lý..." : "Duyệt hồ sơ"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
