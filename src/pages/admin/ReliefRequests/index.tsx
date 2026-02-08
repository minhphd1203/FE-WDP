import { useState } from "react";
import {
  Search,
  MapPin,
  AlertTriangle,
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
} from "../../../hooks/useRescueRequest";
import { useTeams } from "../../../hooks/useTeam";
import {
  ReliefRequest,
  RescueRequestStatus,
  RescueRequestPriority,
} from "../../../types";
import { formatDate } from "../../../lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function ReliefRequests() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(
    null,
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  const limit = 20;

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    status: RescueRequestStatus.REVIEWED,
    priority: RescueRequestPriority.MEDIUM,
    note: "",
  });

  // Fetch data
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
    page,
    limit,
    sortBy: "createdAt",
    order: "DESC",
  });

  const { data: teamsData, isLoading: teamsLoading } = useTeams({ limit: 100 });
  const teams = teamsData?.items || [];

  const assignTeamsMutation = useAssignTeams();
  const reviewRequestMutation = useReviewRequest();
  const cancelRequestMutation = useCancelRequest();

  const assignTeamsLoading = assignTeamsMutation.isPending;
  const reviewRequestLoading = reviewRequestMutation.isPending;
  const cancelRequestLoading = cancelRequestMutation.isPending;

  const requests = requestsData?.items || [];

  console.log("Requests data:", requestsData);
  console.log("Requests array:", requests);
  console.log("Is loading:", isLoading);
  console.log("Error:", error);
  
  // Debug: Log first request structure
  if (requests.length > 0) {
    console.log("First request structure:", JSON.stringify(requests[0], null, 2));
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
          {/* Debug info - Remove in production */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>Loading: {isLoading ? "Yes" : "No"}</p>
              <p>Total: {requestsData?.total || 0}</p>
              <p>Items: {requests?.length || 0}</p>
              <p>Error: {error ? "Yes" : "No"}</p>
            </div>
          )}
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
                <SelectItem value={RescueRequestPriority.HIGH}>Cao</SelectItem>
                <SelectItem value={RescueRequestPriority.MEDIUM}>
                  Trung bình
                </SelectItem>
                <SelectItem value={RescueRequestPriority.LOW}>Thấp</SelectItem>
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
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách đơn yêu cầu ({requestsData?.total || 0})
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
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Người yêu cầu</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đội cứu trợ</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 mt-1 ${
                            request.priority === RescueRequestPriority.CRITICAL
                              ? "text-red-600"
                              : request.priority === RescueRequestPriority.HIGH
                                ? "text-orange-600"
                                : "text-yellow-600"
                          }`}
                        />
                        <span className="line-clamp-2">
                          {(request as any).title || (request as any).description?.substring(0, 50) || "Không có tiêu đề"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {(request as any).requesterName || 
                           (request as any).requester?.name || 
                           (request as any).user?.name || 
                           "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(request as any).requesterPhone || 
                           (request as any).requester?.phone || 
                           (request as any).user?.phone || 
                           "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm line-clamp-2">
                          {(request as any).location?.address || 
                           (request as any).address || 
                           "N/A"}
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
                      {request.assignedTeams &&
                      request.assignedTeams.length > 0 ? (
                        <div className="text-sm">
                          {request.assignedTeams.map((team) => (
                            <div key={team.teamId}>
                              {team.teamName || team.teamId}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Chưa phân công
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                              });
                              setIsReviewDialogOpen(true);
                            }}
                          >
                            Đánh giá
                          </Button>
                        )}
                        {(request.status === RescueRequestStatus.ASSIGNED ||
                          request.status === RescueRequestStatus.ACCEPTED ||
                          request.status ===
                            RescueRequestStatus.IN_PROGRESS) && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewForm({
                                status: getDefaultReviewStatus(request.status),
                                priority: request.priority,
                                note: "",
                              });
                              setIsReviewDialogOpen(true);
                            }}
                          >
                            Cập nhật
                          </Button>
                        )}
                        {(request.status === RescueRequestStatus.REVIEWED ||
                          request.status === RescueRequestStatus.ASSIGNED) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            Phân công
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
              Không có đơn yêu cầu nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {requestsData && requestsData.total > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {(page - 1) * limit + 1} -{" "}
            {Math.min(page * limit, requestsData.total)} trong số{" "}
            {requestsData.total} đơn yêu cầu
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
                  Math.min(Math.ceil(requestsData.total / limit), p + 1),
                )
              }
              disabled={page >= Math.ceil(requestsData.total / limit)}
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
                Đơn yêu cầu: <strong>{(selectedRequest as any)?.title || (selectedRequest as any)?.description?.substring(0, 50) || "Không có tiêu đề"}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Địa điểm: {(selectedRequest as any)?.location?.address || (selectedRequest as any)?.address || "N/A"}
              </p>
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

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === RescueRequestStatus.NEW
                ? "Đánh giá đơn yêu cầu"
                : "Cập nhật trạng thái"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Đơn yêu cầu: <strong>{(selectedRequest as any)?.title || (selectedRequest as any)?.description?.substring(0, 50) || "Không có tiêu đề"}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Người yêu cầu: {(selectedRequest as any)?.requesterName || (selectedRequest as any)?.requester?.name || (selectedRequest as any)?.user?.name || "N/A"}
              </p>
            </div>

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
                  {selectedRequest?.status === RescueRequestStatus.ASSIGNED && (
                    <>
                      <SelectItem value={RescueRequestStatus.ACCEPTED}>
                        Chấp nhận
                      </SelectItem>
                      <SelectItem value={RescueRequestStatus.IN_PROGRESS}>
                        Đang thực hiện
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
                  {selectedRequest?.status ===
                    RescueRequestStatus.IN_PROGRESS && (
                    <>
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

            {reviewForm.status !== RescueRequestStatus.CANCELED && (
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
                });
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleReviewRequest}
              disabled={reviewRequestLoading || cancelRequestLoading}
            >
              {reviewRequestLoading || cancelRequestLoading
                ? "Đang xử lý..."
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
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Thông tin chung</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Tiêu đề</Label>
                      <p className="font-medium">{(selectedRequest as any).title || (selectedRequest as any).description?.substring(0, 50) || "Không có tiêu đề"}</p>
                    </div>
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
                      <p>{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Người yêu cầu</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Họ tên</Label>
                      <p>{(selectedRequest as any).requesterName || (selectedRequest as any).requester?.name || (selectedRequest as any).user?.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Số điện thoại
                      </Label>
                      <p>{(selectedRequest as any).requesterPhone || (selectedRequest as any).requester?.phone || (selectedRequest as any).user?.phone || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Địa điểm</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-muted-foreground">Địa chỉ</Label>
                      <p>{(selectedRequest as any).location?.address || (selectedRequest as any).address || "N/A"}</p>
                    </div>
                    {(selectedRequest as any).location?.district && (
                      <div>
                        <Label className="text-muted-foreground">
                          Quận/Huyện
                        </Label>
                        <p>{(selectedRequest as any).location?.district}</p>
                      </div>
                    )}
                    {(selectedRequest as any).location?.city && (
                      <div>
                        <Label className="text-muted-foreground">
                          Tỉnh/Thành phố
                        </Label>
                        <p>{(selectedRequest as any).location?.city}</p>
                      </div>
                    )}
                    {(selectedRequest as any).location?.coordinates && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Vĩ độ</Label>
                          <p>{(selectedRequest as any).location?.coordinates?.lat}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">
                            Kinh độ
                          </Label>
                          <p>{(selectedRequest as any).location?.coordinates?.lng}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Mô tả</h3>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                </div>

                {selectedRequest.images &&
                  selectedRequest.images.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Hình ảnh đính kèm</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedRequest.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-32 object-cover rounded border"
                          />
                        ))}
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
                              {team.assignedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Phân công lúc: {formatDate(team.assignedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedRequest.reviewedBy && (
                  <div>
                    <h3 className="font-semibold mb-2">Thông tin đánh giá</h3>
                    <div className="border rounded p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-muted-foreground">
                          Người đánh giá
                        </Label>
                        <p>{selectedRequest.reviewedBy}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-muted-foreground">
                          Thời gian
                        </Label>
                        <p>{formatDate(selectedRequest.reviewedAt!)}</p>
                      </div>
                      {selectedRequest.reviewNote && (
                        <div>
                          <Label className="text-muted-foreground">
                            Ghi chú
                          </Label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">
                            {selectedRequest.reviewNote}
                          </p>
                        </div>
                      )}
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
