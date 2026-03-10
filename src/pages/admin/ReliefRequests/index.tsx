import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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
} from "../../../hooks/useRescueRequest";
import { CalendarView } from "./CalendarView";
import { RequestDetailModal } from "./RequestDetailModal";
import {
  ReliefRequest,
  RescueRequestPriority,
  RescueRequestStatus,
} from "../../../types";
import { toast } from "sonner";

export default function ReliefRequests() {
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assignedFilter, setAssignedFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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
    page: 1,
    limit: 100,
  });

  useRescueRequestAssignments(selectedRequest?.id || null);

  const requests = useMemo(
    () => ((requestsData as any)?.items || []) as ReliefRequest[],
    [requestsData],
  );

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

      <RequestDetailModal
        request={selectedRequest}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdated={handleRefresh}
      />
    </div>
  );
}
