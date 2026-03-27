import { useEffect, useState } from "react";
import {
  Eye,
  FilePlus2,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { rescueRequestApi } from "../../../apis/rescueRequestApi";
import {
  CreateReplenishmentRequestDto,
  CreateTeamHandoffDto,
  CompleteRescueOrderItemDto,
  rescueOrderApi,
  RescueOrderDetail,
  RescueOrderListItem,
  RescueOrderStatus,
} from "../../../apis/rescueOrderApi";
import {
  RescueRequestPriority,
  RescueRequestStatus,
  ReliefRequest,
} from "../../../types";
import { formatDateTime } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";

const LIMIT = 20;
const MAX_VISIBLE_TEAMS = 3;

const priorityLabelMap: Record<RescueRequestPriority, string> = {
  [RescueRequestPriority.LOW]: "Thấp",
  [RescueRequestPriority.MEDIUM]: "Trung bình",
  [RescueRequestPriority.HIGH]: "Cao",
  [RescueRequestPriority.CRITICAL]: "Khẩn cấp",
};

const priorityClassMap: Record<RescueRequestPriority, string> = {
  [RescueRequestPriority.LOW]: "bg-sky-100 text-sky-700",
  [RescueRequestPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
  [RescueRequestPriority.HIGH]: "bg-orange-100 text-orange-800",
  [RescueRequestPriority.CRITICAL]: "bg-red-100 text-red-800",
};

const orderStatusLabelMap: Record<RescueOrderStatus, string> = {
  PLANNED: "Đã tạo phiếu",
  READY: "Sẵn sàng xuất kho",
  INSUFFICIENT: "Thiếu hàng",
  DISPATCHED: "Đã cấp phát",
  COMPLETED: "Hoàn tất",
};

const orderStatusClassMap: Record<RescueOrderStatus, string> = {
  PLANNED: "bg-slate-100 text-slate-800",
  READY: "bg-emerald-100 text-emerald-700",
  INSUFFICIENT: "bg-amber-100 text-amber-800",
  DISPATCHED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

const itemTypeLabelMap: Record<string, string> = {
  WATER: "Nước uống",
  FOOD: "Thực phẩm",
  MEDICAL_KIT: "Bộ y tế",
};

const replenishmentStatusClassMap: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-800",
  PENDING: "bg-amber-100 text-amber-800",
};

const requestStatusLabelMap: Partial<Record<RescueRequestStatus, string>> = {
  [RescueRequestStatus.ACCEPTED]: "Đã chấp nhận",
  [RescueRequestStatus.DONE]: "Hoàn tất",
};

const requestStatusClassMap: Partial<Record<RescueRequestStatus, string>> = {
  [RescueRequestStatus.ACCEPTED]: "bg-blue-100 text-blue-700",
  [RescueRequestStatus.DONE]: "bg-emerald-100 text-emerald-700",
};

const getActiveAssignedTeams = (request: ReliefRequest) =>
  (request.assignedTeams || []).filter(
    (team) => team.status !== "CANCELED" && team.status !== "REJECTED",
  );

const getEstimatedPeopleFromTeams = (request: ReliefRequest) => {
  const activeTeams = getActiveAssignedTeams(request);
  const totalTeamSize = activeTeams.reduce(
    (sum, team) => sum + Math.max(0, Number(team.teamSize || 0)),
    0,
  );

  if (totalTeamSize > 0) return totalTeamSize;
  return request.estimatedPeople || 1;
};

type TeamHandoffAssignmentOption = {
  assignmentId: string;
  teamName: string;
  status: string;
  teamSize?: number;
};

type TeamHandoffSummary = {
  totalAssignments: number;
  receivedAssignments: number;
  pendingAssignments: number;
  canceledAssignments: number;
};

type TeamHandoffComputedState = {
  summary: TeamHandoffSummary;
  lockedAssignmentIds: string[];
};

const computeHandoffStateFromList = (
  handoffs: Array<{ assignmentId: string; status: string }>,
): TeamHandoffComputedState => {
  const statusByAssignmentId = handoffs.reduce<Record<string, string>>(
    (accumulator, handoff) => {
      const currentStatus = accumulator[handoff.assignmentId];

      // Priority: RECEIVED > PENDING_RECEIPT > CANCELED
      if (handoff.status === "RECEIVED") {
        accumulator[handoff.assignmentId] = "RECEIVED";
        return accumulator;
      }

      if (
        handoff.status === "PENDING_RECEIPT" &&
        currentStatus !== "RECEIVED"
      ) {
        accumulator[handoff.assignmentId] = "PENDING_RECEIPT";
        return accumulator;
      }

      if (!currentStatus) {
        accumulator[handoff.assignmentId] = handoff.status;
      }

      return accumulator;
    },
    {},
  );

  const statusEntries = Object.entries(statusByAssignmentId);
  const statusList = statusEntries.map(([, status]) => status);

  return {
    summary: {
      totalAssignments: statusList.length,
      receivedAssignments: statusList.filter((status) => status === "RECEIVED")
        .length,
      pendingAssignments: statusList.filter(
        (status) => status === "PENDING_RECEIPT",
      ).length,
      canceledAssignments: statusList.filter((status) => status === "CANCELED")
        .length,
    },
    // Assignments already in handoff flow should not be handoff again.
    lockedAssignmentIds: statusEntries
      .filter(([, status]) => status === "PENDING_RECEIPT" || status === "RECEIVED")
      .map(([assignmentId]) => assignmentId),
  };
};

const getHandoffAssignmentsFromOrder = (
  order: RescueOrderDetail | null,
): TeamHandoffAssignmentOption[] => {
  if (!order) {
    return [];
  }

  const assignmentFromRequest = (order.rescueRequest?.assignments || []).map(
    (assignment) => ({
      assignmentId: assignment.id,
      teamName: assignment.team?.name || assignment.teamId,
      status: assignment.status,
      teamSize: assignment.team?.teamSize,
    }),
  );

  if (assignmentFromRequest.length > 0) {
    return assignmentFromRequest;
  }

  return (order.teams || []).map((team) => ({
    assignmentId: team.assignmentId,
    teamName: team.teamName,
    status: team.status,
    teamSize: team.teamSize,
  }));
};

export default function RescueRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RescueRequestStatus>(
    RescueRequestStatus.ACCEPTED,
  );
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState<ReliefRequest[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersByRequestId, setOrdersByRequestId] = useState<
    Record<string, RescueOrderListItem>
  >({});
  const [handoffSummaryByOrderId, setHandoffSummaryByOrderId] = useState<
    Record<string, TeamHandoffSummary>
  >({});
  const [handoffLockedAssignmentIdsByOrderId, setHandoffLockedAssignmentIdsByOrderId] =
    useState<Record<string, string[]>>({});
  const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(
    null,
  );
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<RescueOrderDetail | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isReplenishmentDialogOpen, setIsReplenishmentDialogOpen] =
    useState(false);
  const [isHandoffDialogOpen, setIsHandoffDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isCreatingReplenishment, setIsCreatingReplenishment] = useState(false);
  const [isCreatingHandoff, setIsCreatingHandoff] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [formData, setFormData] = useState({
    estimatedPeople: 1,
    note: "",
  });
  const [completeNote, setCompleteNote] = useState("");
  const [replenishmentNote, setReplenishmentNote] = useState("");
  const [handoffAssignmentId, setHandoffAssignmentId] = useState("");
  const [handoffNote, setHandoffNote] = useState("");
  const [handoffItems, setHandoffItems] = useState<
    Array<{ orderItemId: string; quantity: number }>
  >([]);
  const [completeItems, setCompleteItems] = useState<
    CompleteRescueOrderItemDto[]
  >([]);

  useEffect(() => {
    void fetchAssignedRequests();
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    void fetchExistingOrders(requests);
  }, [requests]);

  const fetchAssignedRequests = async () => {
    setIsLoading(true);
    try {
      const response = await rescueRequestApi.getRescueRequests({
        status: statusFilter,
        q: searchQuery.trim() || undefined,
        page,
        limit: LIMIT,
      });

      if (response.success) {
        setRequests(response.data.data || []);
        setTotalPages(response.data.meta?.pages || 1);
        setTotalRequests(response.data.meta?.total || 0);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đơn cứu hộ");
      setRequests([]);
      setTotalPages(1);
      setTotalRequests(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingOrders = async (requestList: ReliefRequest[]) => {
    if (requestList.length === 0) {
      setOrdersByRequestId({});
      setHandoffSummaryByOrderId({});
      setHandoffLockedAssignmentIdsByOrderId({});
      return;
    }

    setIsOrdersLoading(true);
    try {
      const results = await Promise.all(
        requestList.map(async (request) => {
          try {
            const response = await rescueOrderApi.listRescueOrders({
              rescueRequestId: request.id,
              page: 1,
              limit: 1,
            });
            return [request.id, response.data.data?.[0] || null] as const;
          } catch (error) {
            return [request.id, null] as const;
          }
        }),
      );

      const nextOrders = results.reduce<Record<string, RescueOrderListItem>>(
        (accumulator, [requestId, order]) => {
          if (order) {
            accumulator[requestId] = order;
          }
          return accumulator;
        },
        {},
      );

      setOrdersByRequestId(nextOrders);

      const ordersNeedHandoffSummary = Object.values(nextOrders).filter(
        (order) =>
          order.status === "DISPATCHED" || order.status === "COMPLETED",
      );

      if (ordersNeedHandoffSummary.length === 0) {
        setHandoffSummaryByOrderId({});
        setHandoffLockedAssignmentIdsByOrderId({});
        return;
      }

      const handoffSummaries = await Promise.all(
        ordersNeedHandoffSummary.map(async (order) => {
          try {
            const response = await rescueOrderApi.listTeamHandoffs(order.id);
            const handoffs = response.data?.data || [];
            const computedState = computeHandoffStateFromList(handoffs);
            return [
              order.id,
              computedState,
            ] as const;
          } catch (error) {
            return [
              order.id,
              {
                summary: {
                  totalAssignments: 0,
                  receivedAssignments: 0,
                  pendingAssignments: 0,
                  canceledAssignments: 0,
                },
                lockedAssignmentIds: [],
              } satisfies TeamHandoffComputedState,
            ] as const;
          }
        }),
      );

      setHandoffSummaryByOrderId(
        handoffSummaries.reduce<Record<string, TeamHandoffSummary>>(
          (accumulator, [orderId, computedState]) => {
            accumulator[orderId] = computedState.summary;
            return accumulator;
          },
          {},
        ),
      );

      setHandoffLockedAssignmentIdsByOrderId(
        handoffSummaries.reduce<Record<string, string[]>>(
          (accumulator, [orderId, computedState]) => {
            accumulator[orderId] = computedState.lockedAssignmentIds;
            return accumulator;
          },
          {},
        ),
      );
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const refreshHandoffSummary = async (orderId: string) => {
    try {
      const response = await rescueOrderApi.listTeamHandoffs(orderId);
      const handoffs = response.data?.data || [];
      const computedState = computeHandoffStateFromList(handoffs);

      setHandoffSummaryByOrderId((current) => ({
        ...current,
        [orderId]: computedState.summary,
      }));

      setHandoffLockedAssignmentIdsByOrderId((current) => ({
        ...current,
        [orderId]: computedState.lockedAssignmentIds,
      }));
    } catch {
      // Keep current badge state when handoff summary cannot be refreshed.
    }
  };

  const handleRefresh = async () => {
    await fetchAssignedRequests();
    toast.success("Đã làm mới danh sách đơn cứu hộ");
  };

  const handleOpenCreateDialog = (request: ReliefRequest) => {
    const estimatedPeopleFromTeams = getEstimatedPeopleFromTeams(request);
    setSelectedRequest(request);
    setFormData({
      estimatedPeople: estimatedPeopleFromTeams,
      note: `Phiếu cấp phát cho đợt cứu trợ tại ${request.address}`,
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreateOrder = async () => {
    if (!selectedRequest) {
      return;
    }

    if (!formData.estimatedPeople || formData.estimatedPeople < 1) {
      toast.error("Số người dự kiến phải lớn hơn 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await rescueOrderApi.createRescueOrder({
        rescueRequestId: selectedRequest.id,
        estimatedPeople: formData.estimatedPeople,
        note: formData.note.trim(),
      });

      if (response.success) {
        setOrdersByRequestId((current) => ({
          ...current,
          [selectedRequest.id]: response.data,
        }));
        setSelectedOrderDetail(response.data);
        setIsCreateDialogOpen(false);
        setIsDetailDialogOpen(true);
        toast.success("Tạo phiếu cứu trợ thành công");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể tạo phiếu cứu trợ",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenOrderDetail = async (orderId: string) => {
    setIsDetailDialogOpen(true);
    setIsDetailLoading(true);
    try {
      const response = await rescueOrderApi.getRescueOrder(orderId);
      if (response.success) {
        setSelectedOrderDetail(response.data);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Không thể tải chi tiết phiếu cứu trợ",
      );
      setIsDetailDialogOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const syncOrderInState = (order: RescueOrderDetail) => {
    setSelectedOrderDetail(order);
    setOrdersByRequestId((current) => ({
      ...current,
      [order.rescueRequestId]: order,
    }));
  };

  const handleCheckStock = async () => {
    if (!selectedOrderDetail) {
      return;
    }

    setIsCheckingStock(true);
    try {
      const response = await rescueOrderApi.checkStock(selectedOrderDetail.id);
      if (response.success) {
        syncOrderInState(response.data);

        const refreshedDetail = await rescueOrderApi.getRescueOrder(
          selectedOrderDetail.id,
        );
        if (refreshedDetail.success) {
          syncOrderInState(refreshedDetail.data);
        }

        toast.success("Kiểm tra kho thành công");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể kiểm tra kho");
    } finally {
      setIsCheckingStock(false);
    }
  };

  const handleOpenCompleteDialog = () => {
    if (!selectedOrderDetail) {
      return;
    }

    const initialItems = selectedOrderDetail.items
      .filter((item) => item.dispatchedQuantity - item.returnedQuantity > 0)
      .map((item) => ({
        orderItemId: item.id,
        returnedQuantity: 0,
        condition: "GOOD" as const,
      }));

    setCompleteNote("Hoàn tất cứu trợ");
    setCompleteItems(initialItems);
    setIsCompleteDialogOpen(true);
  };

  const handleOpenReplenishmentDialog = () => {
    if (!selectedOrderDetail) {
      return;
    }

    const shortageItems = (selectedOrderDetail.stockCheck?.items || [])
      .filter((item) => item.shortageQuantity > 0)
      .map(
        (item) =>
          `${itemTypeLabelMap[item.itemType] || item.itemType}: thiếu ${item.shortageQuantity}`,
      );

    setReplenishmentNote(
      shortageItems.length > 0
        ? `Kho đang thiếu ${shortageItems.join(", ")}, đề nghị bổ sung gấp.`
        : "Đề nghị bổ sung hàng cho phiếu cứu trợ này.",
    );
    setIsReplenishmentDialogOpen(true);
  };

  const handleOpenHandoffDialog = () => {
    if (!selectedOrderDetail) {
      return;
    }

    const assignmentOptions = getHandoffAssignmentsFromOrder(
      selectedOrderDetail,
    ).filter(
      (assignment) =>
        assignment.status !== "CANCELED" && assignment.status !== "REJECTED",
    );

    if (assignmentOptions.length === 0) {
      toast.error("Không có đội hợp lệ để bàn giao");
      return;
    }

    const initialItems = selectedOrderDetail.items
      .map((item) => ({
        orderItemId: item.id,
        quantity: Math.max(0, item.dispatchedQuantity - item.returnedQuantity),
      }))
      .filter((item) => item.quantity > 0);

    if (initialItems.length === 0) {
      toast.error("Không có vật phẩm khả dụng để bàn giao");
      return;
    }

    const defaultAssignment = assignmentOptions[0];
    setHandoffAssignmentId(defaultAssignment.assignmentId);
    setHandoffNote(`Bàn giao vật phẩm cho đội ${defaultAssignment.teamName}`);
    setHandoffItems(initialItems);
    setIsHandoffDialogOpen(true);
  };

  const handleChangeHandoffItemQuantity = (
    orderItemId: string,
    quantity: number,
  ) => {
    setHandoffItems((current) =>
      current.map((item) =>
        item.orderItemId === orderItemId
          ? { ...item, quantity: Number.isNaN(quantity) ? 0 : quantity }
          : item,
      ),
    );
  };

  const handleCreateTeamHandoff = async () => {
    if (!selectedOrderDetail) {
      return;
    }

    if (!handoffAssignmentId) {
      toast.error("Vui lòng chọn đội nhận bàn giao");
      return;
    }

    const validItems = handoffItems
      .filter((item) => item.quantity > 0)
      .map((item) => {
        const detailItem = selectedOrderDetail.items.find(
          (sourceItem) => sourceItem.id === item.orderItemId,
        );
        const maxHandoff =
          (detailItem?.dispatchedQuantity || 0) -
          (detailItem?.returnedQuantity || 0);
        return {
          orderItemId: item.orderItemId,
          quantity: Math.min(item.quantity, Math.max(0, maxHandoff)),
        };
      })
      .filter((item) => item.quantity > 0);

    if (validItems.length === 0) {
      toast.error("Vui lòng nhập ít nhất một vật phẩm để bàn giao");
      return;
    }

    const payload: CreateTeamHandoffDto = {
      assignmentId: handoffAssignmentId,
      note: handoffNote.trim() || undefined,
      items: validItems,
    };

    setIsCreatingHandoff(true);
    try {
      const response = await rescueOrderApi.createTeamHandoff(
        selectedOrderDetail.id,
        payload,
      );

      if (response.success) {
        const refreshedDetail = await rescueOrderApi.getRescueOrder(
          selectedOrderDetail.id,
        );
        if (refreshedDetail.success) {
          syncOrderInState(refreshedDetail.data);
        }

        await refreshHandoffSummary(selectedOrderDetail.id);

        setIsHandoffDialogOpen(false);
        toast.success("Bàn giao cho đội thành công");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể bàn giao cho đội");
    } finally {
      setIsCreatingHandoff(false);
    }
  };

  const handleChangeCompleteItemQuantity = (
    orderItemId: string,
    quantity: number,
  ) => {
    setCompleteItems((current) =>
      current.map((item) =>
        item.orderItemId === orderItemId
          ? { ...item, returnedQuantity: Number.isNaN(quantity) ? 0 : quantity }
          : item,
      ),
    );
  };

  const handleChangeCompleteItemCondition = (
    orderItemId: string,
    condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR",
  ) => {
    setCompleteItems((current) =>
      current.map((item) =>
        item.orderItemId === orderItemId ? { ...item, condition } : item,
      ),
    );
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrderDetail) {
      return;
    }

    const validItems = completeItems
      .filter((item) => item.returnedQuantity > 0)
      .map((item) => {
        const detailItem = selectedOrderDetail.items.find(
          (sourceItem) => sourceItem.id === item.orderItemId,
        );
        const maxReturnable =
          (detailItem?.dispatchedQuantity || 0) -
          (detailItem?.returnedQuantity || 0);
        return {
          ...item,
          returnedQuantity: Math.min(
            item.returnedQuantity,
            Math.max(0, maxReturnable),
          ),
        };
      })
      .filter((item) => item.returnedQuantity > 0);

    setIsCompleting(true);
    try {
      const response = await rescueOrderApi.completeRescueOrder(
        selectedOrderDetail.id,
        {
          note: completeNote.trim() || undefined,
          items: validItems,
        },
      );

      if (response.success) {
        syncOrderInState(response.data);
        setIsCompleteDialogOpen(false);
        toast.success("Hoàn tất phiếu cứu trợ thành công");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể hoàn tất phiếu cứu trợ",
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDispatchOrder = async () => {
    if (!selectedOrderDetail) {
      return;
    }

    setIsDispatching(true);
    try {
      const response = await rescueOrderApi.dispatchRescueOrder(
        selectedOrderDetail.id,
      );

      if (response.success) {
        syncOrderInState(response.data);

        const refreshedDetail = await rescueOrderApi.getRescueOrder(
          selectedOrderDetail.id,
        );
        if (refreshedDetail.success) {
          syncOrderInState(refreshedDetail.data);
        }

        toast.success("Xuất kho thành công");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể xuất kho");
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCreateReplenishmentRequest = async () => {
    if (!selectedOrderDetail) {
      return;
    }

    const payload: CreateReplenishmentRequestDto = {
      note: replenishmentNote.trim(),
    };

    if (!payload.note) {
      toast.error("Vui lòng nhập ghi chú yêu cầu bổ sung");
      return;
    }

    setIsCreatingReplenishment(true);
    try {
      const response = await rescueOrderApi.createReplenishmentRequest(
        selectedOrderDetail.id,
        payload,
      );

      if (response.success) {
        const detailResponse = await rescueOrderApi.getRescueOrder(
          selectedOrderDetail.id,
        );
        if (detailResponse.success) {
          syncOrderInState(detailResponse.data);
        }

        setIsReplenishmentDialogOpen(false);
        toast.success("Đã gửi yêu cầu bổ sung hàng");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể tạo yêu cầu bổ sung",
      );
    } finally {
      setIsCreatingReplenishment(false);
    }
  };

  const getPriorityLabel = (priority: RescueRequestPriority | string) => {
    return priorityLabelMap[priority as RescueRequestPriority] || priority;
  };

  const getPriorityClassName = (priority: RescueRequestPriority | string) => {
    return (
      priorityClassMap[priority as RescueRequestPriority] ||
      "bg-slate-100 text-slate-700"
    );
  };

  const getOrderStatusLabel = (status: RescueOrderStatus | string) => {
    return orderStatusLabelMap[status as RescueOrderStatus] || status;
  };

  const getOrderStatusClassName = (status: RescueOrderStatus | string) => {
    return (
      orderStatusClassMap[status as RescueOrderStatus] ||
      "bg-slate-100 text-slate-700"
    );
  };

  const getReplenishmentStatusClassName = (status: string) => {
    return replenishmentStatusClassMap[status] || "bg-slate-100 text-slate-700";
  };

  const hasStockShortage =
    selectedOrderDetail?.stockCheck?.items?.some(
      (item) => item.shortageQuantity > 0,
    ) || false;

  const canCheckStock =
    selectedOrderDetail?.status === "PLANNED" ||
    selectedOrderDetail?.status === "READY" ||
    selectedOrderDetail?.status === "INSUFFICIENT";

  const canDispatch =
    selectedOrderDetail?.status === "READY" && !hasStockShortage;

  const canRequestReplenishment =
    selectedOrderDetail?.status === "INSUFFICIENT" || hasStockShortage;

  const availableHandoffAssignments = getHandoffAssignmentsFromOrder(
    selectedOrderDetail,
  ).filter(
    (assignment) =>
      assignment.status !== "CANCELED" &&
      assignment.status !== "REJECTED" &&
      !(
        selectedOrderDetail &&
        (handoffLockedAssignmentIdsByOrderId[selectedOrderDetail.id] || []).includes(
          assignment.assignmentId,
        )
      ),
  );

  const canCreateHandoff =
    selectedOrderDetail?.status === "DISPATCHED" &&
    availableHandoffAssignments.length > 0 &&
    selectedOrderDetail.items.some(
      (item) => item.dispatchedQuantity - item.returnedQuantity > 0,
    );

  const rescueLatitude = Number(selectedOrderDetail?.rescueRequest?.latitude);
  const rescueLongitude = Number(selectedOrderDetail?.rescueRequest?.longitude);
  const hasValidRescueCoordinates =
    Number.isFinite(rescueLatitude) &&
    Number.isFinite(rescueLongitude) &&
    Math.abs(rescueLatitude) <= 90 &&
    Math.abs(rescueLongitude) <= 180;

  const mapBounds = hasValidRescueCoordinates
    ? {
        minLng: rescueLongitude - 0.01,
        minLat: rescueLatitude - 0.01,
        maxLng: rescueLongitude + 0.01,
        maxLat: rescueLatitude + 0.01,
      }
    : null;

  const rescueMapEmbedUrl = mapBounds
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds.minLng}%2C${mapBounds.minLat}%2C${mapBounds.maxLng}%2C${mapBounds.maxLat}&layer=mapnik&marker=${rescueLatitude}%2C${rescueLongitude}`
    : "";

  const rescueMapExternalUrl = hasValidRescueCoordinates
    ? `https://www.openstreetmap.org/?mlat=${rescueLatitude}&mlon=${rescueLongitude}#map=16/${rescueLatitude}/${rescueLongitude}`
    : "";

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-red-50/30 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Danh sách đơn cứu hộ
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Theo dõi các đơn đã phân công và tạo phiếu cứu trợ tương ứng.
          </p>
        </div>
        <Button
          onClick={() => void handleRefresh()}
          variant="outline"
          className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">
              Đơn đã phân công
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalRequests}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">
              Phiếu đã tạo trên trang
            </p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {Object.keys(ordersByRequestId).length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Trang hiện tại</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{page}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">Tìm kiếm & Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            {(
              [RescueRequestStatus.ACCEPTED, RescueRequestStatus.DONE] as const
            ).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(s);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? requestStatusClassMap[s] +
                      " ring-2 ring-offset-1 " +
                      (s === RescueRequestStatus.ACCEPTED
                        ? "ring-blue-400"
                        : "ring-emerald-400")
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {requestStatusLabelMap[s]}
              </button>
            ))}
          </div>
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => {
                setPage(1);
                setSearchQuery(event.target.value);
              }}
              placeholder="Tìm theo địa chỉ đơn cứu hộ..."
              className="rounded-xl border-red-300 pl-11 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">Đơn đã phân công</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border-none">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-slate-50/80">
                  <TableHead className="min-w-[110px] whitespace-nowrap text-slate-600">
                    Trạng thái
                  </TableHead>
                  <TableHead className="w-[280px] text-slate-600">
                    Địa chỉ
                  </TableHead>
                  <TableHead className="min-w-[110px] whitespace-nowrap text-slate-600">
                    Ưu tiên
                  </TableHead>
                  <TableHead className="min-w-[130px] whitespace-nowrap text-slate-600">
                    Người cần hỗ trợ
                  </TableHead>
                  <TableHead className="text-slate-600">
                    Đội được phân
                  </TableHead>
                  <TableHead className="text-slate-600">Cập nhật</TableHead>
                  <TableHead className="min-w-[170px] text-right text-slate-600">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-slate-600"
                    >
                      Đang tải danh sách đơn cứu hộ...
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-slate-600"
                    >
                      Không có đơn cứu hộ nào ở trạng thái{" "}
                      {requestStatusLabelMap[statusFilter]}.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => {
                    const existingOrder = ordersByRequestId[request.id];
                    const handoffSummary = existingOrder
                      ? handoffSummaryByOrderId[existingOrder.id]
                      : null;
                    const activeTeams = getActiveAssignedTeams(request);
                    const visibleTeams = activeTeams.slice(
                      0,
                      MAX_VISIBLE_TEAMS,
                    );
                    const remainingTeamsCount = Math.max(
                      activeTeams.length - MAX_VISIBLE_TEAMS,
                      0,
                    );
                    const totalTeamResponders =
                      getEstimatedPeopleFromTeams(request);

                    return (
                      <TableRow
                        key={request.id}
                        className="transition-all duration-200 hover:bg-slate-50/80"
                      >
                        <TableCell className="py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              requestStatusClassMap[
                                request.status as RescueRequestStatus
                              ] ?? "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {requestStatusLabelMap[
                              request.status as RescueRequestStatus
                            ] ?? request.status}
                          </span>
                        </TableCell>
                        <TableCell className="w-[280px] max-w-[280px] py-3 text-slate-700">
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                              <span className="block break-words">
                                {request.address}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span>
                                {request.guestPhone || "Không có số điện thoại"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 whitespace-nowrap">
                          <div
                            className={
                              getPriorityClassName(request.priority) +
                              " inline-flex rounded-full px-2 py-1 text-xs font-medium"
                            }
                          >
                            {getPriorityLabel(request.priority)}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 whitespace-nowrap text-slate-700">
                          {request.estimatedPeople || 0} người
                        </TableCell>
                        <TableCell className="min-w-[220px] py-3 text-slate-700">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                              <Users className="h-4 w-4 text-red-500" />
                              {request.teamSummary.accepted || 0}/
                              {request.teamSummary.required} đội (đã nhận)
                            </div>
                            <p className="text-xs text-slate-500">
                              Đã phân: {request.teamSummary.assigned || 0} •
                              Tổng quân số: {totalTeamResponders}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {activeTeams.length > 0 ? (
                                <>
                                  {visibleTeams.map((team) => (
                                    <div
                                      key={team.assignmentId}
                                      className="inline-flex w-fit items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
                                    >
                                      {team.teamName}
                                      {team.teamSize
                                        ? ` (${team.teamSize} người)`
                                        : ""}
                                    </div>
                                  ))}
                                  {remainingTeamsCount > 0 && (
                                    <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                      +{remainingTeamsCount} đội
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm text-slate-500">
                                  Chưa có đội
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-slate-600">
                          {formatDateTime(request.updatedAt)}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          {existingOrder ? (
                            <div className="flex flex-col items-end gap-2">
                              <div
                                className={`${getOrderStatusClassName(existingOrder.status)} inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                              >
                                {getOrderStatusLabel(existingOrder.status)}
                              </div>
                              {(existingOrder.status === "DISPATCHED" ||
                                existingOrder.status === "COMPLETED") && (
                                <div
                                  className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    !handoffSummary ||
                                    handoffSummary.totalAssignments === 0
                                      ? "bg-slate-100 text-slate-700"
                                      : handoffSummary.pendingAssignments > 0
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  {!handoffSummary ||
                                  handoffSummary.totalAssignments === 0
                                    ? "Chưa bàn giao"
                                    : handoffSummary.pendingAssignments > 0
                                      ? `Đang chờ nhận (${handoffSummary.pendingAssignments}/${handoffSummary.totalAssignments})`
                                      : `Đã bàn giao (${handoffSummary.receivedAssignments}/${handoffSummary.totalAssignments})`}
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  void handleOpenOrderDetail(existingOrder.id)
                                }
                                className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                              >
                                <Eye className="h-4 w-4" />
                                Chi tiết phiếu
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleOpenCreateDialog(request)}
                                disabled={isOrdersLoading}
                                className="rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800"
                              >
                                <FilePlus2 className="h-4 w-4" />
                                Tạo phiếu cứu trợ
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            variant="outline"
            className="rounded-lg border-red-200 text-red-700  hover:text-red-700"
          >
            Trước
          </Button>
          <span className="text-sm text-slate-600">
            Trang {page} / {totalPages}
          </span>
          <Button
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page === totalPages}
            variant="outline"
            className="rounded-lg border-red-200 text-red-700  hover:text-red-700"
          >
            Sau
          </Button>
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-red-100 p-0">
          <DialogHeader className="border-b border-slate-100 bg-gray-50 px-6 py-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Tạo phiếu cứu trợ
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 px-6 py-5">
            {selectedRequest && (
              <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4">
                {(() => {
                  const estimatedPeopleFromTeams =
                    getEstimatedPeopleFromTeams(selectedRequest);
                  return (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">Đơn cứu hộ</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedRequest.id.substring(0, 12)}...
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Địa chỉ</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedRequest.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Ưu tiên</p>
                        <div
                          className={`mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClassName(selectedRequest.priority)}`}
                        >
                          {getPriorityLabel(selectedRequest.priority)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Đội đã phân</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedRequest.teamSummary.accepted || 0}/
                          {selectedRequest.teamSummary.required} đội (đã nhận)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">
                          Đội đã phân công
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedRequest.teamSummary.assigned || 0} đội
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">
                          Tổng quân số đội
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {estimatedPeopleFromTeams} người
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="estimated-people">Số người dự kiến hỗ trợ</Label>
              <Input
                id="estimated-people"
                type="number"
                min={1}
                value={formData.estimatedPeople}
                readOnly
                className="rounded-xl border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
              />
              <p className="text-xs text-slate-500">
                Tự động tính theo tổng teamSize của các đội đã phân công (không
                tính đội đã hủy/từ chối).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-note">Ghi chú</Label>
              <Textarea
                id="order-note"
                value={formData.note}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Nhập ghi chú cho phiếu cứu trợ..."
                className="rounded-xl border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 bg-gray-50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="rounded-lg border-red-200 text-red-700  hover:text-red-700"
            >
              Hủy
            </Button>
            <Button
              onClick={() => void handleCreateOrder()}
              disabled={isSubmitting}
              className="rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo phiếu cứu trợ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden rounded-2xl border-red-100 p-0">
          <DialogHeader className="border-b border-slate-100 bg-gray-50 px-6 py-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Chi tiết phiếu cứu trợ
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {isDetailLoading || !selectedOrderDetail ? (
              <div className="py-12 text-center text-slate-600">
                Đang tải chi tiết phiếu cứu trợ...
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-slate-500">Mã phiếu</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                        {selectedOrderDetail.id.substring(0, 12)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Trạng thái</p>
                      <div
                        className={`mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getOrderStatusClassName(selectedOrderDetail.status)}`}
                      >
                        {getOrderStatusLabel(selectedOrderDetail.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Số người hỗ trợ</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {selectedOrderDetail.affectedPeople ||
                          selectedOrderDetail.estimatedPeople}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Tạo lúc</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDateTime(selectedOrderDetail.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="rounded-2xl border-red-100 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">
                      Mốc thời gian xử lý
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="text-sm text-slate-500">
                          Kiểm tra kho gần nhất
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedOrderDetail.lastStockCheckAt
                            ? formatDateTime(
                                selectedOrderDetail.lastStockCheckAt,
                              )
                            : "Chưa kiểm tra"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="text-sm text-slate-500">
                          Thời điểm cấp phát
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedOrderDetail.dispatchedAt
                            ? formatDateTime(selectedOrderDetail.dispatchedAt)
                            : "Chưa cấp phát"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="text-sm text-slate-500">Hoàn tất</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedOrderDetail.completedAt
                            ? formatDateTime(selectedOrderDetail.completedAt)
                            : "Chưa hoàn tất"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedOrderDetail.note && (
                  <Card className="rounded-2xl border-red-100 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900">
                        Ghi chú phiếu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700">
                        {selectedOrderDetail.note}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {selectedOrderDetail.rescueRequest && (
                  <Card className="rounded-2xl border-red-100 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900">
                        Thông tin đơn cứu hộ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-slate-500">Mã đơn</p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {selectedOrderDetail.rescueRequest.id.substring(
                              0,
                              12,
                            )}
                            ...
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Địa chỉ</p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {selectedOrderDetail.rescueRequest.address}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Ưu tiên</p>
                          <div
                            className={`mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClassName(selectedOrderDetail.rescueRequest.priority)}`}
                          >
                            {getPriorityLabel(
                              selectedOrderDetail.rescueRequest.priority,
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            Số người dự kiến
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {selectedOrderDetail.rescueRequest
                              .estimatedPeople || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            Số điện thoại
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {selectedOrderDetail.rescueRequest.guestPhone ||
                              "Không có"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            Người cần cứu hộ
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {selectedOrderDetail.rescueRequest.guestName ||
                              "Khách ẩn danh"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            Số đội yêu cầu
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {selectedOrderDetail.rescueRequest.requiredTeams ||
                              0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Vĩ độ</p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {selectedOrderDetail.rescueRequest.latitude ||
                              "Không có"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Kinh độ</p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {selectedOrderDetail.rescueRequest.longitude ||
                              "Không có"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            Thời gian tạo
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {formatDateTime(
                              selectedOrderDetail.rescueRequest.createdAt,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            Cập nhật gần nhất
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {formatDateTime(
                              selectedOrderDetail.rescueRequest.updatedAt,
                            )}
                          </p>
                        </div>
                      </div>

                      {hasValidRescueCoordinates && (
                        <div className="mt-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">
                              Bản đồ vị trí cứu hộ
                            </p>
                            <a
                              href={rescueMapExternalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-red-700 hover:text-red-800"
                            >
                              Mở bản đồ lớn
                            </a>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <iframe
                              title="Rescue location map"
                              src={rescueMapEmbedUrl}
                              className="h-72 w-full"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}

                      {selectedOrderDetail.rescueRequest.note && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-sm font-medium text-slate-700">
                            Ghi chú từ đơn cứu hộ
                          </p>
                          <p className="mt-1 text-slate-800">
                            {selectedOrderDetail.rescueRequest.note}
                          </p>
                        </div>
                      )}

                      {!!selectedOrderDetail.rescueRequest.evidenceImages
                        ?.length && (
                        <div className="mt-4">
                          <p className="mb-3 text-sm font-medium text-slate-700">
                            Ảnh bằng chứng
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {selectedOrderDetail.rescueRequest.evidenceImages.map(
                              (imageUrl, index) => (
                                <a
                                  key={`${imageUrl}-${index}`}
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Evidence ${index + 1}`}
                                    className="h-40 w-full object-cover"
                                  />
                                </a>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="rounded-2xl border-red-100 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">
                      Các đội được phân công
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(selectedOrderDetail.rescueRequest?.assignments || [])
                        .length > 0
                        ? selectedOrderDetail.rescueRequest?.assignments?.map(
                            (assignment) => (
                              <div
                                key={assignment.id}
                                className="rounded-xl border border-red-100 bg-red-50/60 p-4"
                              >
                                <p className="font-semibold text-slate-900">
                                  {assignment.team?.name || assignment.teamId}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                  Khu vực: {assignment.team?.area || "Không có"}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                  Quy mô: {assignment.team?.teamSize || 0} người
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                  Trạng thái: {assignment.status}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                  Phản hồi:{" "}
                                  {assignment.respondedAt
                                    ? formatDateTime(assignment.respondedAt)
                                    : "Chưa phản hồi"}
                                </p>
                              </div>
                            ),
                          )
                        : (selectedOrderDetail.teams || []).map((team) => (
                            <div
                              key={team.assignmentId}
                              className="rounded-xl border border-red-100 bg-red-50/60 p-4"
                            >
                              <p className="font-semibold text-slate-900">
                                {team.teamName}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                Quy mô: {team.teamSize || 0} người
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                Trạng thái: {team.status}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                Phản hồi:{" "}
                                {team.respondedAt
                                  ? formatDateTime(team.respondedAt)
                                  : "Chưa phản hồi"}
                              </p>
                            </div>
                          ))}
                      {(selectedOrderDetail.teams || []).length === 0 &&
                        !(selectedOrderDetail.rescueRequest?.assignments || [])
                          .length && (
                          <p className="text-slate-600">
                            Chưa có thông tin đội.
                          </p>
                        )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-red-100 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">
                      Vật phẩm cứu trợ ({selectedOrderDetail.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <Table>
                        <TableHeader className="bg-slate-50/80">
                          <TableRow className="hover:bg-slate-50/80">
                            <TableHead>Loại vật phẩm</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead>Số lượng yêu cầu</TableHead>
                            <TableHead>Đã cấp phát</TableHead>
                            <TableHead>Hoàn kho</TableHead>
                            <TableHead>Thiếu gần nhất</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrderDetail.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-semibold text-slate-900">
                                {itemTypeLabelMap[item.itemType] ||
                                  item.itemType}
                              </TableCell>
                              <TableCell className="text-slate-700">
                                {item.category?.name || item.categoryId}
                              </TableCell>
                              <TableCell className="text-slate-700">
                                {item.requestedQuantity}
                              </TableCell>
                              <TableCell className="text-slate-700">
                                {item.dispatchedQuantity}
                              </TableCell>
                              <TableCell className="text-slate-700">
                                {item.returnedQuantity}
                              </TableCell>
                              <TableCell className="text-slate-700">
                                {item.lastShortageQuantity}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {selectedOrderDetail.stockCheck && (
                  <Card className="rounded-2xl border-red-100 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900">
                        Kiểm tra tồn kho
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div
                          className={`${
                            selectedOrderDetail.stockCheck.allSufficient
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-800"
                          } inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                        >
                          {selectedOrderDetail.stockCheck.allSufficient
                            ? "Kho hiện đủ hàng"
                            : "Kho còn thiếu hàng"}
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {selectedOrderDetail.stockCheck.items.map((item) => (
                          <div
                            key={item.orderItemId}
                            className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                          >
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {item.categoryName}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {itemTypeLabelMap[item.itemType] ||
                                    item.itemType}
                                </p>
                              </div>
                              <div
                                className={`${
                                  item.isEnough
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-800"
                                } inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                              >
                                {item.isEnough ? "Đủ hàng" : "Thiếu hàng"}
                              </div>
                            </div>
                            <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
                              <p>Cần thêm: {item.requiredQuantity}</p>
                              <p>Đã xuất: {item.dispatchedQuantity}</p>
                              <p>Tồn khả dụng: {item.availableQuantity}</p>
                              <p>Thiếu: {item.shortageQuantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(selectedOrderDetail.replenishmentRequests || []).length >
                  0 && (
                  <Card className="rounded-2xl border-red-100 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900">
                        Yêu cầu bổ sung hàng
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedOrderDetail.replenishmentRequests?.map(
                          (request) => (
                            <div
                              key={request.id}
                              className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                            >
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {request.id.substring(0, 12)}...
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {formatDateTime(request.createdAt)}
                                  </p>
                                </div>
                                <div
                                  className={`${getReplenishmentStatusClassName(request.status)} inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                                >
                                  {request.status}
                                </div>
                              </div>
                              <p className="mt-3 text-sm text-slate-700">
                                {request.note}
                              </p>
                              {request.items && request.items.length > 0 && (
                                <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 md:grid-cols-3">
                                  {request.items.map((item) => (
                                    <div key={item.id}>
                                      <p className="font-medium text-slate-900">
                                        {item.category?.name ||
                                          itemTypeLabelMap[item.itemType] ||
                                          item.itemType}
                                      </p>
                                      <p>Yêu cầu: {item.requestedQuantity}</p>
                                      <p>Duyệt: {item.approvedQuantity}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {request.reviewedAt && (
                                <p className="mt-2 text-sm text-slate-500">
                                  Thời điểm duyệt:{" "}
                                  {formatDateTime(request.reviewedAt)}
                                </p>
                              )}
                              {request.decisionNote && (
                                <p className="mt-2 text-sm text-slate-500">
                                  Ghi chú duyệt: {request.decisionNote}
                                </p>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 bg-gray-50 px-6 py-4">
            {selectedOrderDetail && canCheckStock && (
              <Button
                onClick={() => void handleCheckStock()}
                disabled={isCheckingStock}
                className="rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isCheckingStock ? "animate-spin" : ""}`}
                />
                {isCheckingStock ? "Đang kiểm tra kho..." : "Check kho"}
              </Button>
            )}

            {selectedOrderDetail &&
              selectedOrderDetail.status === "DISPATCHED" && (
                <Button
                  onClick={handleOpenCompleteDialog}
                  variant="outline"
                  className="rounded-lg border-red-200 text-red-700  hover:text-red-700"
                >
                  Hoàn tất phiếu
                </Button>
              )}

            {selectedOrderDetail && canCreateHandoff && (
              <Button
                onClick={handleOpenHandoffDialog}
                variant="outline"
                className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
              >
                Bàn giao cho đội
              </Button>
            )}

            {selectedOrderDetail && canDispatch && (
              <Button
                onClick={() => void handleDispatchOrder()}
                disabled={isDispatching}
                className="rounded-lg  bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800"
              >
                {isDispatching ? "Đang xuất kho..." : "Xuất kho"}
              </Button>
            )}

            {selectedOrderDetail && canRequestReplenishment && (
              <Button
                onClick={handleOpenReplenishmentDialog}
                variant="outline"
                className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
              >
                Yêu cầu bổ sung
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
              className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl border-red-100 p-0">
          <DialogHeader className="border-b border-slate-100 bg-gray-50 px-6 py-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Hoàn tất phiếu cứu trợ
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4">
              <p className="text-sm text-slate-500">Lưu ý</p>
              <p className="mt-1 text-sm text-slate-800">
                Bạn có thể nhập số lượng vật phẩm hoàn kho theo từng dòng. Nếu
                không có vật phẩm hoàn kho, để số lượng bằng 0 và vẫn có thể
                hoàn tất phiếu.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complete-note">Ghi chú hoàn tất</Label>
              <Textarea
                id="complete-note"
                rows={3}
                value={completeNote}
                onChange={(event) => setCompleteNote(event.target.value)}
                className="rounded-xl border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-slate-50/80">
                    <TableHead>Vật phẩm</TableHead>
                    <TableHead>Đã cấp phát</TableHead>
                    <TableHead>Đã hoàn</TableHead>
                    <TableHead>Tối đa còn lại</TableHead>
                    <TableHead>Số lượng hoàn kho</TableHead>
                    <TableHead>Tình trạng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrderDetail?.items.map((item) => {
                    const rowData = completeItems.find(
                      (sourceItem) => sourceItem.orderItemId === item.id,
                    );
                    const maxReturnable =
                      item.dispatchedQuantity - item.returnedQuantity;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {itemTypeLabelMap[item.itemType] || item.itemType}
                          <p className="mt-1 text-xs text-slate-500">
                            {item.category?.name || item.categoryId}
                          </p>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.dispatchedQuantity}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.returnedQuantity}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {Math.max(0, maxReturnable)}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={Math.max(0, maxReturnable)}
                            disabled={maxReturnable <= 0}
                            value={rowData?.returnedQuantity ?? 0}
                            onChange={(event) =>
                              handleChangeCompleteItemQuantity(
                                item.id,
                                Number(event.target.value),
                              )
                            }
                            className="w-28 rounded-lg border-red-200 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
                          />
                        </TableCell>
                        <TableCell>
                          <select
                            value={rowData?.condition || "GOOD"}
                            onChange={(event) =>
                              handleChangeCompleteItemCondition(
                                item.id,
                                event.target.value as
                                  | "EXCELLENT"
                                  | "GOOD"
                                  | "FAIR"
                                  | "POOR",
                              )
                            }
                            disabled={maxReturnable <= 0}
                            className="h-10 rounded-lg border border-red-200 bg-white px-3 text-sm text-slate-700 focus:border-red-500 focus:outline-none"
                          >
                            <option value="EXCELLENT">Xuất sắc</option>
                            <option value="GOOD">Tốt</option>
                            <option value="FAIR">Bình thường</option>
                            <option value="POOR">Kém</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 bg-gray-50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
              className="rounded-lg border-red-200 text-red-700  hover:text-red-700"
            >
              Hủy
            </Button>
            <Button
              onClick={() => void handleCompleteOrder()}
              disabled={isCompleting}
              className="rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800"
            >
              {isCompleting ? "Đang hoàn tất..." : "Xác nhận hoàn tất"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHandoffDialogOpen} onOpenChange={setIsHandoffDialogOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden rounded-2xl border-red-100 p-0">
          <DialogHeader className="border-b border-slate-100 bg-gray-50 px-6 py-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Bàn giao cho đội
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 text-sm text-slate-700">
              Chọn đội nhận vật phẩm và nhập số lượng bàn giao cho từng loại.
            </div>

            <div className="space-y-2">
              <Label htmlFor="handoff-assignment">Đội nhận bàn giao</Label>
              <select
                id="handoff-assignment"
                value={handoffAssignmentId}
                onChange={(event) => {
                  const nextAssignmentId = event.target.value;
                  setHandoffAssignmentId(nextAssignmentId);
                  const selectedAssignment = availableHandoffAssignments.find(
                    (assignment) => assignment.assignmentId === nextAssignmentId,
                  );
                  if (selectedAssignment) {
                    setHandoffNote(
                      `Bàn giao vật phẩm cho đội ${selectedAssignment.teamName}`,
                    );
                  }
                }}
                className="h-10 w-full rounded-lg border border-red-300 bg-white px-3 text-sm text-slate-700 focus:border-red-500 focus:outline-none"
              >
                <option value="">Chọn đội</option>
                {availableHandoffAssignments.map((assignment) => (
                  <option
                    key={assignment.assignmentId}
                    value={assignment.assignmentId}
                  >
                    {assignment.teamName}
                    {assignment.teamSize ? ` (${assignment.teamSize} người)` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="handoff-note">Ghi chú bàn giao</Label>
              <Textarea
                id="handoff-note"
                rows={3}
                value={handoffNote}
                onChange={(event) => setHandoffNote(event.target.value)}
                className="rounded-xl border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-slate-50/80">
                    <TableHead>Vật phẩm</TableHead>
                    <TableHead>Đã cấp phát</TableHead>
                    <TableHead>Đã hoàn</TableHead>
                    <TableHead>Tối đa bàn giao</TableHead>
                    <TableHead>Số lượng bàn giao</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrderDetail?.items.map((item) => {
                    const rowData = handoffItems.find(
                      (sourceItem) => sourceItem.orderItemId === item.id,
                    );
                    const maxHandoff =
                      item.dispatchedQuantity - item.returnedQuantity;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {itemTypeLabelMap[item.itemType] || item.itemType}
                          <p className="mt-1 text-xs text-slate-500">
                            {item.category?.name || item.categoryId}
                          </p>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.dispatchedQuantity}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {item.returnedQuantity}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {Math.max(0, maxHandoff)}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={Math.max(0, maxHandoff)}
                            disabled={maxHandoff <= 0}
                            value={rowData?.quantity ?? 0}
                            onChange={(event) =>
                              handleChangeHandoffItemQuantity(
                                item.id,
                                Number(event.target.value),
                              )
                            }
                            className="w-28 rounded-lg border-red-200 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 bg-gray-50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setIsHandoffDialogOpen(false)}
              className="rounded-lg border-red-200 text-red-700 hover:text-red-700"
            >
              Hủy
            </Button>
            <Button
              onClick={() => void handleCreateTeamHandoff()}
              disabled={isCreatingHandoff}
              className="rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800"
            >
              {isCreatingHandoff ? "Đang bàn giao..." : "Xác nhận bàn giao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isReplenishmentDialogOpen}
        onOpenChange={setIsReplenishmentDialogOpen}
      >
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-2xl border-red-100 p-0">
          <DialogHeader className="border-b border-slate-100 bg-gray-50 px-6 py-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Yêu cầu bổ sung hàng
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Tạo yêu cầu bổ sung để admin duyệt cấp thêm hàng cho phiếu cứu trợ
              đang thiếu.
            </div>

            {selectedOrderDetail?.stockCheck && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Danh sách thiếu hiện tại
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {selectedOrderDetail.stockCheck.items
                    .filter((item) => item.shortageQuantity > 0)
                    .map((item) => (
                      <p
                        key={item.orderItemId}
                        className="text-sm text-slate-700"
                      >
                        {item.categoryName}: thiếu {item.shortageQuantity}
                      </p>
                    ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="replenishment-note">Ghi chú yêu cầu</Label>
              <Textarea
                id="replenishment-note"
                rows={4}
                value={replenishmentNote}
                onChange={(event) => setReplenishmentNote(event.target.value)}
                className="rounded-xl border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 bg-gray-50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setIsReplenishmentDialogOpen(false)}
              className="rounded-lg border-red-200 text-red-700  hover:text-red-700"
            >
              Hủy
            </Button>
            <Button
              onClick={() => void handleCreateReplenishmentRequest()}
              disabled={isCreatingReplenishment}
              className="rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800"
            >
              {isCreatingReplenishment
                ? "Đang gửi yêu cầu..."
                : "Gửi yêu cầu bổ sung"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
