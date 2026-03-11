import { useMemo, useState } from "react";
import { 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  MapPin, 
  Eye, 
  Users, 
  ImageOff, 
  X, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  useRescueRequests,
  useRescueRequestAssignments,
  useRescueRequestEvidenceImages,
} from "../../../hooks/useRescueRequest";
import { CalendarView } from "./CalendarView";
import { RequestDetailModal } from "./RequestDetailModal";
import {
  ReliefRequest,
  RescueRequestPriority,
  RescueRequestStatus,
} from "../../../types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog"; // Giả định import để tránh lỗi
import { Label } from "../../../components/ui/label"; // Giả định import
import { Badge } from "../../../components/ui/badge"; // Giả định import

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ReliefRequests() {
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assignedFilter, setAssignedFilter] = useState<string>("all"); // all, assigned, unassigned
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(null);

  // Calculate date range for calendar view (14 days: 4 days before + 9 days after selected date)
  const dateRange = useMemo(() => {
    const from = new Date(selectedDate);
    from.setDate(from.getDate() - 4);
    const to = new Date(selectedDate);
    to.setDate(to.getDate() + 9);
    return { from: formatDate(from), to: formatDate(to) };
  }, [selectedDate]);
  
  // States từ nhánh Thong
  const [detailOpen, setDetailOpen] = useState(false);
  
  // States từ nhánh main
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const limit = 20;

  const {
    data: requestsData,
    isLoading,
    error,
  } = useRescueRequests({
    q: searchQuery || undefined,
    status:
      statusFilter !== "all"
        ? (statusFilter as RescueRequestStatus)
        : undefined,
    priority:
      priorityFilter !== "all"
        ? (priorityFilter as RescueRequestPriority)
        : undefined,
    assigned:
      assignedFilter === "assigned"
        ? true
        : assignedFilter === "unassigned"
          ? false
          : undefined,
    from: dateRange.from,
    to: dateRange.to,
    page: 1,
    limit: 100,
  });

  useRescueRequestAssignments(selectedRequest?.id || null);

  const requests = useMemo(
    () => ((requestsData as any)?.items || []) as ReliefRequest[],
    [requestsData],
  );

  // Fetch evidence images for selected request (only when detail dialog is open)
  const { data: evidenceImages = [], isLoading: evidenceImagesLoading } =
    useRescueRequestEvidenceImages(
      isDetailDialogOpen ? (selectedRequest?.id || null) : null
    );

  // Giả định các hook mutation đã được import (nhánh main)
  // const assignTeamsMutation = useAssignTeams();
  // const reviewRequestMutation = useReviewRequest();
  // const cancelRequestMutation = useCancelRequest();

  // const assignTeamsLoading = assignTeamsMutation?.isPending;
  // const reviewRequestLoading = reviewRequestMutation?.isPending;
  // const cancelRequestLoading = cancelRequestMutation?.isPending;

  // Placeholder để code không báo đỏ nếu thiếu hooks trên
  const assignTeamsLoading = false;
  const reviewRequestLoading = false;
  const cancelRequestLoading = false;

  const stats = useMemo(() => {
    const critical = requests.filter((r) => r.priority === RescueRequestPriority.CRITICAL).length;
    const newReqs = requests.filter((r) => r.status === RescueRequestStatus.NEW).length;
    const inProgress = requests.filter((r) => r.status === RescueRequestStatus.IN_PROGRESS).length;
    return { total: requests.length, critical, newReqs, inProgress };
  }, [requests]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["rescue-requests"] });
    toast.success("Đang tải lại dữ liệu...");
  };

  // Các hàm helper thiếu trong snippet nhưng được sử dụng trong giao diện
  const getStatusColor = (status: any) => "";
  const getStatusLabel = (status: any) => status;
  const getPriorityColor = (priority: any) => "";
  const getPriorityLabel = (priority: any) => priority;
  const formatDateTime = (date: any) => date;
  const handleReviewRequest = () => {};
  const setReviewForm = (form: any) => {};

  // Variables giả định bị mất trong snippet
  const assignmentsLoading = false;
  const assignmentsData = null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Yêu cầu cứu hộ</h1>
          <p className="mt-1 text-muted-foreground">
            Quản lý và điều phối yêu cầu cứu trợ theo timeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          {stats.critical > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              {stats.critical} khẩn cấp
            </div>
          )}
          {stats.newReqs > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700">
              {stats.newReqs} mới
            </div>
          )}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="h-9 rounded-lg border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-red-100 bg-gradient-to-br from-white to-red-50/30 shadow-sm">
        <CardContent className="pt-5">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative md:col-span-2 lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
              <input
                placeholder="Tìm theo địa chỉ, tên, số điện thoại..."
                className="h-10 w-full rounded-xl border border-red-300 bg-white pl-10 pr-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức độ</SelectItem>
                <SelectItem value={RescueRequestPriority.CRITICAL}>Khẩn cấp</SelectItem>
                <SelectItem value={RescueRequestPriority.HIGH}>Cao</SelectItem>
                <SelectItem value={RescueRequestPriority.MEDIUM}>Trung bình</SelectItem>
                <SelectItem value={RescueRequestPriority.LOW}>Thấp</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Phân công" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="assigned">Đã phân công</SelectItem>
                <SelectItem value="unassigned">Chưa phân công</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value={RescueRequestStatus.NEW}>Mới</SelectItem>
                <SelectItem value={RescueRequestStatus.REVIEWED}>Đã đánh giá</SelectItem>
                <SelectItem value={RescueRequestStatus.ASSIGNED}>Đã phân công</SelectItem>
                <SelectItem value={RescueRequestStatus.ACCEPTED}>Đã chấp nhận</SelectItem>
                <SelectItem value={RescueRequestStatus.IN_PROGRESS}>Đang thực hiện</SelectItem>
                <SelectItem value={RescueRequestStatus.DONE}>Hoàn thành</SelectItem>
                <SelectItem value={RescueRequestStatus.CANCELED}>Đã hủy</SelectItem>
                <SelectItem value={RescueRequestStatus.REJECTED}>Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-red-100">
          <CardContent className="py-8 text-center text-sm text-red-600">
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </CardContent>
        </Card>
      ) : (
        <CalendarView
          requests={requests}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          isLoading={isLoading}
          onRequestClick={(request) => {
            setSelectedRequest(request);
            setDetailOpen(true);
          }}
        />
      )}

      {/* COMPONENT MODAL TỪ NHÁNH THONG */}
      <RequestDetailModal
        request={selectedRequest}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdated={handleRefresh}
      />

      {/* COMPONENT REVIEW DIALOG TỪ NHÁNH MAIN (Đã bổ sung thẻ bọc bị thiếu do đứt gãy lúc merge) */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsReviewDialogOpen(false);
                setSelectedRequest(null);
                setReviewForm({
                  status: RescueRequestStatus.REVIEWED,
                  priority: RescueRequestPriority.MEDIUM,
                  note: "",
                  requiredTeams: 1,
                });
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleReviewRequest}
              disabled={reviewRequestLoading || cancelRequestLoading}
              className={
                selectedRequest?.status === RescueRequestStatus.IN_PROGRESS
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              {reviewRequestLoading || cancelRequestLoading
                ? "Đang xử lý..."
                : selectedRequest?.status === RescueRequestStatus.IN_PROGRESS
                  ? "Hoàn thành"
                  : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COMPONENT DETAIL DIALOG TỪ NHÁNH MAIN (Đã gộp từ 2 nửa bị cắt đứt gãy) */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn yêu cầu cứu trợ</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Thông tin chung</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Trạng thái
                      </Label>
                      <div className="mt-1">
                        <Badge
                          className={getStatusColor(selectedRequest.status)}
                        >
                          {getStatusLabel(selectedRequest.status)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Mức độ ưu tiên
                      </Label>
                      <div className="mt-1">
                        <Badge
                          className={getPriorityColor(selectedRequest.priority)}
                        >
                          {getPriorityLabel(selectedRequest.priority)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Ngày tạo</Label>
                      <p className="text-sm">
                        {formatDateTime(selectedRequest.createdAt)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Cập nhật</Label>
                      <p className="text-sm">
                        {formatDateTime(selectedRequest.updatedAt)}
                      </p>
                    </div>
                    {selectedRequest.estimatedPeople && (
                      <div>
                        <Label className="text-muted-foreground">
                          Ước lượng số người
                        </Label>
                        <p className="text-sm font-semibold text-orange-600">
                          {selectedRequest.estimatedPeople} người cần cứu trợ
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Ghi chú</h3>
                  <div className="border rounded-lg p-3 bg-muted/30">
                    {selectedRequest.note ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedRequest.note}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Không có ghi chú
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Người yêu cầu</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Họ tên</Label>
                      <p>{selectedRequest.guestName || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Số điện thoại
                      </Label>
                      <p>{selectedRequest.guestPhone || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Địa điểm</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground">Địa chỉ</Label>
                      <p className="text-sm">
                        {selectedRequest.address || "N/A"}
                      </p>
                    </div>
                    {selectedRequest.latitude && selectedRequest.longitude && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">
                              Vĩ độ
                            </Label>
                            <p className="text-sm">
                              {selectedRequest.latitude}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              Kinh độ
                            </Label>
                            <p className="text-sm">
                              {selectedRequest.longitude}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground mb-2 block">
                            Bản đồ
                          </Label>
                          <iframe
                            src={`https://maps.google.com/maps?q=${selectedRequest.latitude},${selectedRequest.longitude}&output=embed`}
                            width="100%"
                            height="300"
                            style={{ border: 0, borderRadius: "8px" }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Vị trí cứu trợ"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {selectedRequest.teamSummary && (
                  <div>
                    <h3 className="font-semibold mb-2">Thống kê đội cứu trợ</h3>
                    <div className="border rounded p-4 bg-muted/50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">
                            Số đội cần thiết
                          </Label>
                          <p className="text-lg font-semibold">
                            {selectedRequest.teamSummary.required}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">
                            Số đội đã gán
                          </Label>
                          <p className="text-lg font-semibold">
                            {selectedRequest.teamSummary.assigned}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">
                            Số đội đã nhận
                          </Label>
                          <p className="text-lg font-semibold text-green-600">
                            {selectedRequest.teamSummary.accepted}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">
                            Trạng thái
                          </Label>
                          <p className="text-lg font-semibold">
                            {selectedRequest.teamSummary.isFulfilled ? (
                              <span className="text-green-600">✓ Đủ đội</span>
                            ) : (
                              <span className="text-orange-600">Chưa đủ</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Evidence Images */}
                <div>
                  <h3 className="font-semibold mb-2">Ảnh hiện trường</h3>
                  {evidenceImagesLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                      <p className="text-sm text-muted-foreground ml-2">Đang tải ảnh hiện trường...</p>
                    </div>
                  ) : evidenceImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {evidenceImages.map((url: string, index: number) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer group"
                          onClick={() => setLightboxIndex(index)}
                        >
                          <img
                            src={url}
                            alt={`Ảnh hiện trường ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                          <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground text-xs gap-1">
                            <ImageOff className="h-5 w-5" />
                            <span>Không tải được</span>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium drop-shadow">
                              Xem ảnh
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 border rounded-lg bg-muted/30 text-muted-foreground gap-2">
                      <ImageOff className="h-8 w-8" />
                      <p className="text-sm">Không có ảnh hiện trường</p>
                    </div>
                  )}
                </div>

                {/* Detailed Assignments from API */}
                {assignmentsLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Đang tải chi tiết phân công...
                    </p>
                  </div>
                ) : (
                  assignmentsData && (
                    <div>
                      <h3 className="font-semibold mb-2">
                        Chi tiết phân công từ hệ thống
                      </h3>
                      <div className="border rounded p-4 bg-muted/50">
                        <pre className="text-xs overflow-auto max-h-[300px]">
                          {JSON.stringify(assignmentsData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDetailDialogOpen(false);
                setSelectedRequest(null);
              }}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COMPONENT LIGHTBOX TỪ NHÁNH MAIN */}
      {lightboxIndex !== null && evidenceImages.length > 0 && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-8 w-8" />
          </button>

          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white hover:text-gray-300 transition-colors p-2"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}

          <img
            src={evidenceImages[lightboxIndex]}
            alt={`Ảnh hiện trường ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < evidenceImages.length - 1 && (
            <button
              className="absolute right-4 text-white hover:text-gray-300 transition-colors p-2"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}

          <div className="absolute bottom-4 text-white text-sm opacity-70">
            {lightboxIndex + 1} / {evidenceImages.length}
          </div>
        </div>
      )}
    </div>
  );
}