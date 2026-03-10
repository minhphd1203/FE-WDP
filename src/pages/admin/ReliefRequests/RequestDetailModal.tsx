import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, MapPin, Phone, User, X } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import {
  useAssignTeams,
  useCancelRequest,
  useReviewRequest,
} from "../../../hooks/useRescueRequest";
import { useTeams } from "../../../hooks/useTeam";
import { cn, formatDateTime } from "../../../lib/utils";
import {
  ReliefRequest,
  RescueRequestPriority,
  RescueRequestStatus,
} from "../../../types";
import { toast } from "sonner";

interface RequestDetailModalProps {
  request: ReliefRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

type ActionMode = "evaluate" | "assign" | "update";

const STATUS_LABELS: Record<RescueRequestStatus, string> = {
  [RescueRequestStatus.NEW]: "Mới",
  [RescueRequestStatus.REVIEWED]: "Đã đánh giá",
  [RescueRequestStatus.ASSIGNED]: "Đã phân công",
  [RescueRequestStatus.ACCEPTED]: "Đã chấp nhận",
  [RescueRequestStatus.IN_PROGRESS]: "Đang thực hiện",
  [RescueRequestStatus.DONE]: "Hoàn thành",
  [RescueRequestStatus.CANCELED]: "Đã hủy",
  [RescueRequestStatus.REJECTED]: "Từ chối",
};

const PRIORITY_LABELS: Record<RescueRequestPriority, string> = {
  [RescueRequestPriority.LOW]: "Thấp",
  [RescueRequestPriority.MEDIUM]: "Trung bình",
  [RescueRequestPriority.HIGH]: "Cao",
  [RescueRequestPriority.CRITICAL]: "Khẩn cấp",
};

const STATUS_STYLES: Record<RescueRequestStatus, string> = {
  [RescueRequestStatus.NEW]: "bg-blue-100 text-blue-700 border-blue-200",
  [RescueRequestStatus.REVIEWED]: "bg-indigo-100 text-indigo-700 border-indigo-200",
  [RescueRequestStatus.ASSIGNED]: "bg-amber-100 text-amber-700 border-amber-200",
  [RescueRequestStatus.ACCEPTED]: "bg-cyan-100 text-cyan-700 border-cyan-200",
  [RescueRequestStatus.IN_PROGRESS]: "bg-orange-100 text-orange-700 border-orange-200",
  [RescueRequestStatus.DONE]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [RescueRequestStatus.CANCELED]: "bg-slate-100 text-slate-700 border-slate-200",
  [RescueRequestStatus.REJECTED]: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_STYLES: Record<RescueRequestPriority, string> = {
  [RescueRequestPriority.LOW]: "bg-sky-100 text-sky-700 border-sky-200",
  [RescueRequestPriority.MEDIUM]: "bg-yellow-100 text-yellow-700 border-yellow-200",
  [RescueRequestPriority.HIGH]: "bg-orange-100 text-orange-700 border-orange-200",
  [RescueRequestPriority.CRITICAL]: "bg-red-100 text-red-700 border-red-200",
};

export const RequestDetailModal = ({
  request,
  open,
  onOpenChange,
  onUpdated,
}: RequestDetailModalProps) => {
  const [activeMode, setActiveMode] = useState<ActionMode | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [evaluateForm, setEvaluateForm] = useState({
    priority: RescueRequestPriority.MEDIUM,
    requiredTeams: 1,
    note: "",
  });
  const [updateForm, setUpdateForm] = useState({
    status: RescueRequestStatus.REVIEWED,
    note: "",
    priority: RescueRequestPriority.MEDIUM,
    requiredTeams: 1,
  });

  const { data: teamsData, isLoading: loadingTeams } = useTeams({ limit: 100 });
  const teams = teamsData?.items || [];

  const assignTeamsMutation = useAssignTeams();
  const reviewRequestMutation = useReviewRequest();
  const cancelRequestMutation = useCancelRequest();

  useEffect(() => {
    if (!request) return;

    setSelectedTeamIds(request.assignedTeams?.map((team) => team.teamId) || []);
    setEvaluateForm({
      priority: request.priority,
      requiredTeams: request.requiredTeams || 1,
      note: request.note || "",
    });
    setUpdateForm({
      status: request.status,
      priority: request.priority,
      requiredTeams: request.requiredTeams || 1,
      note: "",
    });
  }, [request]);

  useEffect(() => {
    if (!open) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onOpenChange]);

  const teamSummary = useMemo(
    () => ({
      required: request?.teamSummary?.required ?? request?.requiredTeams ?? 0,
      assigned: request?.teamSummary?.assigned ?? request?.assignedTeams?.length ?? 0,
      accepted: request?.teamSummary?.accepted ?? 0,
    }),
    [request],
  );

  if (!open || !request) return null;

  const handleToggleTeam = (teamId: string) => {
    setSelectedTeamIds((current) =>
      current.includes(teamId)
        ? current.filter((id) => id !== teamId)
        : [...current, teamId],
    );
  };

  const handleEvaluate = async () => {
    try {
      await reviewRequestMutation.mutateAsync({
        id: request.id,
        data: {
          status: RescueRequestStatus.REVIEWED,
          priority: evaluateForm.priority,
          requiredTeams: evaluateForm.requiredTeams,
          note: evaluateForm.note,
        },
      });
      toast.success("Đánh giá yêu cầu thành công");
      onUpdated?.();
      setActiveMode(null);
    } catch {
      // Error toast handled in hook
    }
  };

  const handleAssign = async () => {
    if (selectedTeamIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đội");
      return;
    }

    try {
      await assignTeamsMutation.mutateAsync({
        id: request.id,
        data: { teamIds: selectedTeamIds },
      });
      onUpdated?.();
      setActiveMode(null);
    } catch {
      // Error toast handled in hook
    }
  };

  const handleUpdate = async () => {
    try {
      if (updateForm.status === RescueRequestStatus.CANCELED) {
        await cancelRequestMutation.mutateAsync({
          id: request.id,
          data: { reason: updateForm.note },
        });
      } else {
        await reviewRequestMutation.mutateAsync({
          id: request.id,
          data: {
            status: updateForm.status,
            priority: updateForm.priority,
            requiredTeams: updateForm.requiredTeams,
            note: updateForm.note,
          },
        });
      }
      onUpdated?.();
      setActiveMode(null);
    } catch {
      // Error toast handled in hook
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/35"
        onClick={() => onOpenChange(false)}
      />

      <aside className="absolute inset-y-0 right-0 w-full border-l border-border bg-background shadow-2xl sm:max-w-2xl lg:max-w-5xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">Chi tiết yêu cầu cứu trợ</h2>
              <p className="text-xs text-muted-foreground">
                Mã đơn: {request.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <Button type="button" variant="outline" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Thông tin chính</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">Người yêu cầu</p>
                        <p className="mt-1 flex items-center gap-2 font-medium">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {request.guestName || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">Số điện thoại</p>
                        <p className="mt-1 flex items-center gap-2 font-medium">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {request.guestPhone || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Địa chỉ</p>
                      <p className="mt-1 flex items-start gap-2 font-medium">
                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        {request.address || "N/A"}
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Badge className={cn("w-fit border", PRIORITY_STYLES[request.priority])}>
                        Mức độ: {PRIORITY_LABELS[request.priority]}
                      </Badge>
                      <Badge className={cn("w-fit border", STATUS_STYLES[request.status])}>
                        Trạng thái: {STATUS_LABELS[request.status]}
                      </Badge>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">Thời gian tạo</p>
                        <p className="mt-1 flex items-center gap-2 text-sm">
                          <Clock3 className="h-4 w-4 text-muted-foreground" />
                          {formatDateTime(request.createdAt)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">Cập nhật gần nhất</p>
                        <p className="mt-1 text-sm">{formatDateTime(request.updatedAt)}</p>
                      </div>
                    </div>

                    {request.note && (
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">Ghi chú</p>
                        <p className="mt-1 text-sm">{request.note}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Teams (Cần/Gán/Nhận)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-orange-800">
                        <p className="text-xs">Cần</p>
                        <p className="text-lg font-semibold">{teamSummary.required}</p>
                      </div>
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800">
                        <p className="text-xs">Gán</p>
                        <p className="text-lg font-semibold">{teamSummary.assigned}</p>
                      </div>
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
                        <p className="text-xs">Nhận</p>
                        <p className="text-lg font-semibold">{teamSummary.accepted}</p>
                      </div>
                    </div>

                    {request.assignedTeams?.length > 0 ? (
                      <div className="space-y-2">
                        {request.assignedTeams.map((team) => (
                          <div
                            key={team.assignmentId}
                            className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                          >
                            <div>
                              <p className="font-medium">{team.teamName}</p>
                              <p className="text-xs text-muted-foreground">
                                {team.respondedAt
                                  ? `Phản hồi: ${formatDateTime(team.respondedAt)}`
                                  : "Chưa phản hồi"}
                              </p>
                            </div>
                            <Badge className="border bg-muted text-muted-foreground">
                              {team.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                        Chưa có đội nào được gán cho yêu cầu này.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="sticky top-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Hành động xử lý</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={activeMode === "evaluate" ? "default" : "outline"}
                        onClick={() => setActiveMode(activeMode === "evaluate" ? null : "evaluate")}
                      >
                        Đánh giá
                      </Button>
                      <Button
                        type="button"
                        variant={activeMode === "assign" ? "default" : "outline"}
                        onClick={() => setActiveMode(activeMode === "assign" ? null : "assign")}
                      >
                        Phân công
                      </Button>
                      <Button
                        type="button"
                        variant={activeMode === "update" ? "default" : "outline"}
                        onClick={() => setActiveMode(activeMode === "update" ? null : "update")}
                      >
                        Cập nhật
                      </Button>
                    </div>

                    {activeMode === "evaluate" && (
                      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                        <div>
                          <Label>Mức độ</Label>
                          <Select
                            value={evaluateForm.priority}
                            onValueChange={(value) =>
                              setEvaluateForm((prev) => ({
                                ...prev,
                                priority: value as RescueRequestPriority,
                              }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={RescueRequestPriority.LOW}>Thấp</SelectItem>
                              <SelectItem value={RescueRequestPriority.MEDIUM}>Trung bình</SelectItem>
                              <SelectItem value={RescueRequestPriority.HIGH}>Cao</SelectItem>
                              <SelectItem value={RescueRequestPriority.CRITICAL}>Khẩn cấp</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Số đội cần thiết</Label>
                          <Select
                            value={String(evaluateForm.requiredTeams)}
                            onValueChange={(value) =>
                              setEvaluateForm((prev) => ({
                                ...prev,
                                requiredTeams: Number(value),
                              }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((count) => (
                                <SelectItem key={count} value={String(count)}>
                                  {count} đội
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Ghi chú đánh giá</Label>
                          <Textarea
                            className="mt-1"
                            value={evaluateForm.note}
                            onChange={(event) =>
                              setEvaluateForm((prev) => ({
                                ...prev,
                                note: event.target.value,
                              }))
                            }
                            rows={3}
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={handleEvaluate}
                          disabled={reviewRequestMutation.isPending}
                          className="w-full"
                        >
                          {reviewRequestMutation.isPending ? "Đang xử lý..." : "Xác nhận đánh giá"}
                        </Button>
                      </div>
                    )}

                    {activeMode === "assign" && (
                      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground">
                          Chọn đội cần gán. Bạn vẫn giữ nguyên phần chi tiết bên trái để đối chiếu.
                        </p>

                        <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                          {loadingTeams ? (
                            <p className="text-sm text-muted-foreground">Đang tải danh sách đội...</p>
                          ) : (
                            teams.map((team: any) => {
                              const selected = selectedTeamIds.includes(team.id);
                              return (
                                <button
                                  key={team.id}
                                  type="button"
                                  onClick={() => handleToggleTeam(team.id)}
                                  className={cn(
                                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left",
                                    selected
                                      ? "border-primary bg-secondary/60"
                                      : "border-border bg-background",
                                  )}
                                >
                                  <div>
                                    <p className="text-sm font-medium">{team.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {team.memberCount || 0} thành viên
                                    </p>
                                  </div>
                                  {selected && <Check className="h-4 w-4 text-primary" />}
                                </button>
                              );
                            })
                          )}
                        </div>

                        <Button
                          type="button"
                          onClick={handleAssign}
                          disabled={assignTeamsMutation.isPending}
                          className="w-full"
                        >
                          {assignTeamsMutation.isPending
                            ? "Đang phân công..."
                            : `Phân công (${selectedTeamIds.length}) đội`}
                        </Button>
                      </div>
                    )}

                    {activeMode === "update" && (
                      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                        <div>
                          <Label>Trạng thái mới</Label>
                          <Select
                            value={updateForm.status}
                            onValueChange={(value) =>
                              setUpdateForm((prev) => ({
                                ...prev,
                                status: value as RescueRequestStatus,
                              }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(RescueRequestStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {STATUS_LABELS[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Mức độ</Label>
                          <Select
                            value={updateForm.priority}
                            onValueChange={(value) =>
                              setUpdateForm((prev) => ({
                                ...prev,
                                priority: value as RescueRequestPriority,
                              }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={RescueRequestPriority.LOW}>Thấp</SelectItem>
                              <SelectItem value={RescueRequestPriority.MEDIUM}>Trung bình</SelectItem>
                              <SelectItem value={RescueRequestPriority.HIGH}>Cao</SelectItem>
                              <SelectItem value={RescueRequestPriority.CRITICAL}>Khẩn cấp</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Ghi chú cập nhật</Label>
                          <Textarea
                            className="mt-1"
                            value={updateForm.note}
                            onChange={(event) =>
                              setUpdateForm((prev) => ({
                                ...prev,
                                note: event.target.value,
                              }))
                            }
                            rows={3}
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={handleUpdate}
                          disabled={reviewRequestMutation.isPending || cancelRequestMutation.isPending}
                          className="w-full"
                        >
                          {reviewRequestMutation.isPending || cancelRequestMutation.isPending
                            ? "Đang cập nhật..."
                            : "Xác nhận cập nhật"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Gợi ý thao tác</p>
                  <p className="mt-1">
                    Chọn một hành động ở trên, biểu mẫu sẽ mở ngay trong cột phải để bạn xử lý
                    trong khi vẫn nhìn thấy toàn bộ thông tin yêu cầu ở cột trái.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default RequestDetailModal;
