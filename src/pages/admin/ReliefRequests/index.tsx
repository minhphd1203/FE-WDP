import { useState } from "react";
import {
  Search,
  MapPin,
  Eye,
  Users,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  useRescueRequests,
  useAssignTeams,
  useReviewRequest,
  useCancelRequest,
  useRescueRequestAssignments,
} from "../../../hooks/useRescueRequest";
import { useTeams } from "../../../hooks/useTeam";
import {
  ReliefRequest,
  RescueRequestStatus,
  RescueRequestPriority,
} from "../../../types";
import { formatDateTime } from "../../../lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function ReliefRequests() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assignedFilter, setAssignedFilter] = useState<string>("all"); // all, assigned, unassigned
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(
    null,
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  const limit = 20;

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    status: RescueRequestStatus.REVIEWED,
    priority: RescueRequestPriority.MEDIUM,
    note: "",
    requiredTeams: 1,
  });

  // Fetch data theo đúng API specification
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
    page,
    limit,
  });

  const { data: teamsData, isLoading: teamsLoading } = useTeams({ limit: 100 });
  const teams = teamsData?.items || [];

  // Fetch assignments for selected request
  const { 
    data: assignmentsData, 
    isLoading: assignmentsLoading 
  } = useRescueRequestAssignments(selectedRequest?.id || null);

  const assignTeamsMutation = useAssignTeams();
  const reviewRequestMutation = useReviewRequest();
  const cancelRequestMutation = useCancelRequest();

  const assignTeamsLoading = assignTeamsMutation.isPending;
  const reviewRequestLoading = reviewRequestMutation.isPending;
  const cancelRequestLoading = cancelRequestMutation.isPending;

  const requests = (requestsData as any)?.items || [];

  console.log("Requests data:", requestsData);
  console.log("Requests array:", requests);
  console.log("Is loading:", isLoading);
  console.log("Error:", error);

  // Debug: Log first request structure
  if (requests.length > 0) {
    console.log(
      "First request structure:",
      JSON.stringify(requests[0], null, 2),
    );
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["rescue-requests"] });
    toast.success("Đang tải lại dữ liệu...");
  };

  const handleAssignTeams = async () => {
    if (!selectedRequest || selectedTeamIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đội cứu trợ");
      return;
    }

    try {
      await assignTeamsMutation.mutateAsync({
        id: selectedRequest.id,
        data: { teamIds: selectedTeamIds },
      });
      setIsAssignDialogOpen(false);
      setSelectedRequest(null);
      setSelectedTeamIds([]);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleReviewRequest = async () => {
    if (!selectedRequest) return;

    try {
      // If status is CANCELED, use cancel endpoint
      if (reviewForm.status === RescueRequestStatus.CANCELED) {
        await cancelRequestMutation.mutateAsync({
          id: selectedRequest.id,
          data: { reason: reviewForm.note },
        });
      } else {
        // Otherwise use review endpoint
        await reviewRequestMutation.mutateAsync({
          id: selectedRequest.id,
          data: reviewForm,
        });
      }
      setIsReviewDialogOpen(false);
      setSelectedRequest(null);
      setReviewForm({
        status: RescueRequestStatus.REVIEWED,
        priority: RescueRequestPriority.MEDIUM,
        note: "",
        requiredTeams: 1,
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleToggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  const getStatusColor = (status: RescueRequestStatus) => {
    switch (status) {
      case RescueRequestStatus.NEW:
        return "bg-blue-100 text-blue-800";
      case RescueRequestStatus.REVIEWED:
        return "bg-purple-100 text-purple-800";
      case RescueRequestStatus.ASSIGNED:
        return "bg-yellow-100 text-yellow-800";
      case RescueRequestStatus.ACCEPTED:
        return "bg-cyan-100 text-cyan-800";
      case RescueRequestStatus.IN_PROGRESS:
        return "bg-orange-100 text-orange-800";
      case RescueRequestStatus.DONE:
        return "bg-green-100 text-green-800";
      case RescueRequestStatus.CANCELED:
        return "bg-gray-100 text-gray-800";
      case RescueRequestStatus.REJECTED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: RescueRequestPriority) => {
    switch (priority) {
      case RescueRequestPriority.LOW:
        return "bg-blue-100 text-blue-800";
      case RescueRequestPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case RescueRequestPriority.HIGH:
        return "bg-orange-100 text-orange-800";
      case RescueRequestPriority.CRITICAL:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: RescueRequestStatus) => {
    const labels: Record<RescueRequestStatus, string> = {
      [RescueRequestStatus.NEW]: "Mới",
      [RescueRequestStatus.REVIEWED]: "Đã đánh giá",
      [RescueRequestStatus.ASSIGNED]: "Đã phân công",
      [RescueRequestStatus.ACCEPTED]: "Đã chấp nhận",
      [RescueRequestStatus.IN_PROGRESS]: "Đang thực hiện",
      [RescueRequestStatus.DONE]: "Hoàn thành",
      [RescueRequestStatus.CANCELED]: "Đã hủy",
      [RescueRequestStatus.REJECTED]: "Từ chối",
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: RescueRequestPriority) => {
    const labels: Record<RescueRequestPriority, string> = {
      [RescueRequestPriority.LOW]: "Thấp",
      [RescueRequestPriority.MEDIUM]: "Trung bình",
      [RescueRequestPriority.HIGH]: "Cao",
      [RescueRequestPriority.CRITICAL]: "Khẩn cấp",
    };
    return labels[priority] || priority;
  };

  const getDefaultReviewStatus = (
    currentStatus: RescueRequestStatus,
  ): RescueRequestStatus => {
    switch (currentStatus) {
      case RescueRequestStatus.NEW:
      case RescueRequestStatus.REVIEWED:
        return RescueRequestStatus.REVIEWED;
      case RescueRequestStatus.ASSIGNED:
        return RescueRequestStatus.ACCEPTED;
      case RescueRequestStatus.ACCEPTED:
        return RescueRequestStatus.IN_PROGRESS;
      case RescueRequestStatus.IN_PROGRESS:
        return RescueRequestStatus.DONE;
      default:
        return RescueRequestStatus.REVIEWED;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đơn Yêu Cầu Cứu Trợ</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và xử lý các yêu cầu cứu trợ từ người dân
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo địa chỉ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Mức độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức độ</SelectItem>
                  <SelectItem value={RescueRequestPriority.CRITICAL}>
                    Khẩn cấp
                  </SelectItem>
                  <SelectItem value={RescueRequestPriority.HIGH}>
                    Cao
                  </SelectItem>
                  <SelectItem value={RescueRequestPriority.MEDIUM}>
                    Trung bình
                  </SelectItem>
                  <SelectItem value={RescueRequestPriority.LOW}>
                    Thấp
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Phân công" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="assigned">Đã phân công</SelectItem>
                  <SelectItem value="unassigned">Chưa phân công</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value={RescueRequestStatus.NEW}>Mới</SelectItem>
                  <SelectItem value={RescueRequestStatus.REVIEWED}>
                    Đã đánh giá
                  </SelectItem>
                  <SelectItem value={RescueRequestStatus.ASSIGNED}>
                    Đã phân công
                  </SelectItem>
                  <SelectItem value={RescueRequestStatus.ACCEPTED}>
                    Đã chấp nhận
                  </SelectItem>
                  <SelectItem value={RescueRequestStatus.IN_PROGRESS}>
                    Đang thực hiện
                  </SelectItem>
                  <SelectItem value={RescueRequestStatus.DONE}>
                    Hoàn thành
                  </SelectItem>
                  <SelectItem value={RescueRequestStatus.CANCELED}>
                    Đã hủy
                  </SelectItem>
                  <SelectItem value={RescueRequestStatus.REJECTED}>
                    Từ chối
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách đơn yêu cầu ({(requestsData as any)?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">Có lỗi xảy ra khi tải dữ liệu</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Thử lại
              </Button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-2"></div>
              <p>Đang tải danh sách đơn cứu trợ...</p>
            </div>
          ) : requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người yêu cầu</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Teams (Cần/Gán/Nhận)</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request: ReliefRequest) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {request.guestName || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.guestPhone || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm line-clamp-2">
                          {request.address || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(request.priority)}>
                        {getPriorityLabel(request.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.teamSummary ? (
                        <div className="text-sm">
                          <span className={request.teamSummary.isFulfilled ? "text-green-600 font-medium" : "text-muted-foreground"}>
                            {request.teamSummary.required} / {request.teamSummary.assigned} / {request.teamSummary.accepted}
                          </span>
                          {request.teamSummary.isFulfilled && (
                            <span className="ml-2 text-xs text-green-600">✓ Đủ</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Chưa đánh giá
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(request.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Nút Xem chi tiết - luôn hiển thị */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsDetailDialogOpen(true);
                          }}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* BƯỚC 1: Đơn MỚI - Hiện nút ĐÁNH GIÁ */}
                        {request.status === RescueRequestStatus.NEW && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewForm({
                                status: getDefaultReviewStatus(request.status),
                                priority: request.priority,
                                note: "",
                                requiredTeams: request.requiredTeams || 1,
                              });
                              setIsReviewDialogOpen(true);
                            }}
                            title="Đánh giá mức độ ưu tiên và số đội cần thiết"
                          >
                            Đánh giá
                          </Button>
                        )}

                        {/* BƯỚC 2: Sau khi đánh giá - Hiện nút PHÂN CÔNG */}
                        {request.status === RescueRequestStatus.REVIEWED && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsAssignDialogOpen(true);
                            }}
                            title="Phân công đội cứu trợ cho đơn này"
                          >
                            Phân công
                          </Button>
                        )}

                        {/* Đã phân công - Hiện popup với Hủy đơn hoặc Phân công thêm */}
                        {request.status === RescueRequestStatus.ASSIGNED && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsActionDialogOpen(true);
                            }}
                            title="Hủy đơn hoặc phân công thêm đội"
                          >
                            Cập nhật
                          </Button>
                        )}

                        {/* Đang thực hiện - Chỉ cập nhật trạng thái */}
                        {/* Chỉ hiện nút Cập nhật cho ACCEPTED và IN_PROGRESS, không hiện cho DONE/CANCELED/REJECTED */}
                        {(request.status === RescueRequestStatus.ACCEPTED ||
                          request.status === RescueRequestStatus.IN_PROGRESS) && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewForm({
                                status: getDefaultReviewStatus(request.status),
                                priority: request.priority,
                                note: "",
                                requiredTeams: request.requiredTeams || 1,
                              });
                              setIsReviewDialogOpen(true);
                            }}
                            title={request.status === RescueRequestStatus.IN_PROGRESS 
                              ? "Xác nhận hoàn thành cứu trợ" 
                              : "Cập nhật trạng thái đơn"}
                          >
                            Cập nhật
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Không có đơn yêu cầu nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {requestsData && (requestsData as any).total > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {(page - 1) * limit + 1} -{" "}
            {Math.min(page * limit, (requestsData as any).total)} trong số{" "}
            {(requestsData as any).total} đơn yêu cầu
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trang trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) =>
                  Math.min(Math.ceil((requestsData as any).total / limit), p + 1),
                )
              }
              disabled={page >= Math.ceil((requestsData as any).total / limit)}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}

      {/* Assign Teams Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Phân công đội cứu trợ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Yêu cầu từ:{" "}
                <strong>
                  {selectedRequest?.guestName || 'N/A'}
                </strong>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Địa điểm:{" "}
                {selectedRequest?.address || 'N/A'}
              </p>
              {selectedRequest?.teamSummary && (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Thống kê đội:</p>
                  <p className="text-xs text-muted-foreground">
                    Cần: <span className="font-semibold">{selectedRequest.teamSummary.required}</span> | 
                    Đã gán: <span className="font-semibold">{selectedRequest.teamSummary.assigned}</span> | 
                    Đã nhận: <span className="font-semibold text-green-600">{selectedRequest.teamSummary.accepted}</span>
                    {selectedRequest.teamSummary.isFulfilled && <span className="ml-2 text-green-600">✓ Đủ</span>}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Chọn các đội cứu trợ *</Label>
              <div className="border rounded-lg p-4 space-y-2 max-h-[300px] overflow-y-auto">
                {teamsLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Đang tải danh sách đội...
                  </div>
                ) : teams.length > 0 ? (
                  teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded"
                    >
                      <Checkbox
                        id={`team-${team.id}`}
                        checked={selectedTeamIds.includes(team.id)}
                        onCheckedChange={() => handleToggleTeam(team.id)}
                      />
                      <Label
                        htmlFor={`team-${team.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Khu vực: {team.area} - Quy mô: {team.teamSize} người
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Không có đội cứu trợ nào
                  </div>
                )}
              </div>
              {selectedTeamIds.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Đã chọn: {selectedTeamIds.length} đội
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setSelectedRequest(null);
                setSelectedTeamIds([]);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssignTeams}
              disabled={selectedTeamIds.length === 0 || assignTeamsLoading}
            >
              {assignTeamsLoading ? "Đang phân công..." : "Phân công"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog for ASSIGNED status */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật đơn cứu trợ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Đơn yêu cầu từ:{" "}
                <strong>
                  {selectedRequest?.guestName || 'N/A'}
                </strong>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Địa chỉ: {selectedRequest?.address || 'N/A'}
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Đơn đã được phân công đội cứu trợ
              </p>
              <p className="text-sm text-blue-700">
                Bạn có thể hoàn thành đơn hoặc phân công thêm đội cứu trợ.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsActionDialogOpen(false);
                setSelectedRequest(null);
              }}
            >
              Đóng
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsActionDialogOpen(false);
                  setIsAssignDialogOpen(true);
                }}
              >
                Phân công thêm
              </Button>
              <Button
                onClick={async () => {
                  // Hoàn thành đơn - chuyển qua các trạng thái trung gian theo đúng workflow
                  if (selectedRequest) {
                    try {
                      // Bước 1: ASSIGNED → ACCEPTED
                      await reviewRequestMutation.mutateAsync({
                        id: selectedRequest.id,
                        data: {
                          status: RescueRequestStatus.ACCEPTED,
                          priority: selectedRequest.priority,
                          note: "Đội cứu trợ đã chấp nhận",
                          requiredTeams: selectedRequest.requiredTeams || 1,
                        },
                      });
                      
                      // Bước 2: ACCEPTED → IN_PROGRESS
                      await reviewRequestMutation.mutateAsync({
                        id: selectedRequest.id,
                        data: {
                          status: RescueRequestStatus.IN_PROGRESS,
                          priority: selectedRequest.priority,
                          note: "Đang thực hiện cứu trợ",
                          requiredTeams: selectedRequest.requiredTeams || 1,
                        },
                      });
                      
                      // Bước 3: IN_PROGRESS → DONE
                      await reviewRequestMutation.mutateAsync({
                        id: selectedRequest.id,
                        data: {
                          status: RescueRequestStatus.DONE,
                          priority: selectedRequest.priority,
                          note: "Admin đánh dấu hoàn thành",
                          requiredTeams: selectedRequest.requiredTeams || 1,
                        },
                      });
                      
                      setIsActionDialogOpen(false);
                      setSelectedRequest(null);
                      toast.success("Đã hoàn thành đơn cứu trợ");
                    } catch (error) {
                      // Error handled in hook
                    }
                  }
                }}
                disabled={reviewRequestLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {reviewRequestLoading ? "Đang xử lý..." : "Hoàn thành"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === RescueRequestStatus.NEW
                ? "Đánh giá đơn yêu cầu"
                : selectedRequest?.status === RescueRequestStatus.IN_PROGRESS
                ? "Xác nhận hoàn thành cứu trợ"
                : "Cập nhật trạng thái"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Yêu cầu từ:{" "}
                <strong>
                  {selectedRequest?.guestName || 'N/A'}
                </strong>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Người yêu cầu:{" "}
                {selectedRequest?.guestName || 'N/A'}
              </p>
            </div>

            {/* Đặc biệt: Khi IN_PROGRESS, chỉ hiện xác nhận hoàn thành */}
            {selectedRequest?.status === RescueRequestStatus.IN_PROGRESS ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-900 mb-2">
                  Cứu trợ đã thành công?
                </p>
                <p className="text-sm text-green-700">
                  Nhấn "Hoàn thành" để xác nhận đơn yêu cầu này đã được cứu trợ thành công.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Trạng thái *</Label>
                <Select
                  value={reviewForm.status}
                  onValueChange={(value) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      status: value as RescueRequestStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedRequest?.status === RescueRequestStatus.NEW && (
                      <>
                        <SelectItem value={RescueRequestStatus.REVIEWED}>
                          Đã đánh giá - Chấp nhận
                        </SelectItem>
                        <SelectItem value={RescueRequestStatus.REJECTED}>
                          Từ chối
                        </SelectItem>
                      </>
                    )}
                    {selectedRequest?.status === RescueRequestStatus.REVIEWED && (
                      <>
                        <SelectItem value={RescueRequestStatus.REVIEWED}>
                          Đã đánh giá - Chấp nhận
                        </SelectItem>
                        <SelectItem value={RescueRequestStatus.REJECTED}>
                          Từ chối
                        </SelectItem>
                      </>
                    )}
                    {selectedRequest?.status === RescueRequestStatus.ACCEPTED && (
                      <>
                        <SelectItem value={RescueRequestStatus.IN_PROGRESS}>
                          Đang thực hiện
                        </SelectItem>
                        <SelectItem value={RescueRequestStatus.DONE}>
                          Hoàn thành
                        </SelectItem>
                        <SelectItem value={RescueRequestStatus.CANCELED}>
                          Hủy
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Chỉ hiện priority khi không phải IN_PROGRESS và không phải CANCELED */}
            {selectedRequest?.status !== RescueRequestStatus.IN_PROGRESS &&
             reviewForm.status !== RescueRequestStatus.CANCELED && (
              <div className="space-y-2">
                <Label>Mức độ ưu tiên *</Label>
                <Select
                  value={reviewForm.priority}
                  onValueChange={(value) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      priority: value as RescueRequestPriority,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RescueRequestPriority.CRITICAL}>
                      Khẩn cấp
                    </SelectItem>
                    <SelectItem value={RescueRequestPriority.HIGH}>
                      Cao
                    </SelectItem>
                    <SelectItem value={RescueRequestPriority.MEDIUM}>
                      Trung bình
                    </SelectItem>
                    <SelectItem value={RescueRequestPriority.LOW}>
                      Thấp
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Chỉ hiện required teams khi đang đánh giá lần đầu */}
            {selectedRequest?.status === RescueRequestStatus.NEW && 
             reviewForm.status === RescueRequestStatus.REVIEWED && (
              <div className="space-y-2">
                <Label>Số đội cần thiết *</Label>
                <Input
                  type="number"
                  min="1"
                  value={reviewForm.requiredTeams}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      requiredTeams: parseInt(e.target.value) || 1,
                    }))
                  }
                  placeholder="Nhập số đội cần thiết"
                />
                <p className="text-xs text-muted-foreground">
                  Ước lượng số người cần cứu: {selectedRequest.estimatedPeople || 'Chưa rõ'}
                </p>
              </div>
            )}

            {/* Ghi chú: Không hiện khi IN_PROGRESS */}
            {selectedRequest?.status !== RescueRequestStatus.IN_PROGRESS && (
              <div className="space-y-2">
                <Label>
                  {reviewForm.status === RescueRequestStatus.CANCELED
                    ? "Lý do hủy"
                    : "Ghi chú đánh giá"}
                </Label>
                <Textarea
                  placeholder={
                    reviewForm.status === RescueRequestStatus.CANCELED
                      ? "Nhập lý do hủy đơn cứu trợ..."
                      : "Nhập ghi chú về đánh giá của bạn..."
                  }
                  value={reviewForm.note}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  rows={4}
                />
              </div>
            )}
          </div>
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
              className={selectedRequest?.status === RescueRequestStatus.IN_PROGRESS ? "bg-green-600 hover:bg-green-700" : ""}
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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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
                      <p className="text-sm">{formatDateTime(selectedRequest.createdAt)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Cập nhật</Label>
                      <p className="text-sm">{formatDateTime(selectedRequest.updatedAt)}</p>
                    </div>
                    {selectedRequest.estimatedPeople && (
                      <div>
                        <Label className="text-muted-foreground">Ước lượng số người</Label>
                        <p className="text-sm font-semibold text-orange-600">
                          {selectedRequest.estimatedPeople} người cần cứu trợ
                        </p>
                      </div>
                    )}
                    {selectedRequest.creatorId && (
                      <div>
                        <Label className="text-muted-foreground">ID người tạo</Label>
                        <p className="text-sm font-mono">{selectedRequest.creatorId}</p>
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
                      <p>
                        {selectedRequest.guestName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Số điện thoại
                      </Label>
                      <p>
                        {selectedRequest.guestPhone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Địa điểm</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground">Địa chỉ</Label>
                      <p className="text-sm">
                        {selectedRequest.address || 'N/A'}
                      </p>
                    </div>
                    {selectedRequest.latitude && selectedRequest.longitude && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Vĩ độ</Label>
                            <p className="text-sm">{selectedRequest.latitude}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              Kinh độ
                            </Label>
                            <p className="text-sm">{selectedRequest.longitude}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground mb-2 block">Bản đồ</Label>
                          <iframe
                            src={`https://maps.google.com/maps?q=${selectedRequest.latitude},${selectedRequest.longitude}&output=embed`}
                            width="100%"
                            height="300"
                            style={{ border: 0, borderRadius: '8px' }}
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
                          <Label className="text-muted-foreground">Số đội cần thiết</Label>
                          <p className="text-lg font-semibold">{selectedRequest.teamSummary.required}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Số đội đã gán</Label>
                          <p className="text-lg font-semibold">{selectedRequest.teamSummary.assigned}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Số đội đã nhận</Label>
                          <p className="text-lg font-semibold text-green-600">{selectedRequest.teamSummary.accepted}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Trạng thái</Label>
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

                {selectedRequest.assignedTeams &&
                  selectedRequest.assignedTeams.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">
                        Đội cứu trợ được phân công
                      </h3>
                      <div className="space-y-2">
                        {selectedRequest.assignedTeams.map((team) => (
                          <div
                            key={team.teamId}
                            className="border rounded p-3 flex items-center gap-3"
                          >
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium">
                                {team.teamName || team.teamId}
                              </p>
                              {team.status && (
                                <p className="text-xs text-muted-foreground">
                                  Trạng thái: {team.status}
                                </p>
                              )}
                              {team.respondedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Phản hồi lúc: {formatDateTime(team.respondedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Detailed Assignments from API */}
                {assignmentsLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="text-sm text-muted-foreground mt-2">Đang tải chi tiết phân công...</p>
                  </div>
                ) : assignmentsData && (
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
    </div>
  );
}
