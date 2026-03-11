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
import { Badge } from "../../../components/ui/badge";
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

export default function RescueRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState<ReliefRequest[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersByRequestId, setOrdersByRequestId] = useState<
    Record<string, RescueOrderListItem>
  >({});
  const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(
    null,
  );
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<RescueOrderDetail | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [formData, setFormData] = useState({
    estimatedPeople: 1,
    note: "",
  });
  const [completeNote, setCompleteNote] = useState("");
  const [completeItems, setCompleteItems] = useState<
    CompleteRescueOrderItemDto[]
  >([]);

  useEffect(() => {
    void fetchAssignedRequests();
  }, [page, searchQuery]);

  useEffect(() => {
    void fetchExistingOrders(requests);
  }, [requests]);

  const fetchAssignedRequests = async () => {
    setIsLoading(true);
    try {
      const response = await rescueRequestApi.getRescueRequests({
        status: RescueRequestStatus.ASSIGNED,
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
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAssignedRequests();
    toast.success("Đã làm mới danh sách đơn cứu hộ");
  };

  const handleOpenCreateDialog = (request: ReliefRequest) => {
    setSelectedRequest(request);
    setFormData({
      estimatedPeople: request.estimatedPeople || 1,
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
          <CardTitle className="text-slate-900">Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableHead className="text-slate-600">Mã đơn</TableHead>
                  <TableHead className="text-slate-600">Địa chỉ</TableHead>
                  <TableHead className="text-slate-600">Ưu tiên</TableHead>
                  <TableHead className="text-slate-600">
                    Người cần hỗ trợ
                  </TableHead>
                  <TableHead className="text-slate-600">
                    Đội được phân
                  </TableHead>
                  <TableHead className="text-slate-600">Cập nhật</TableHead>
                  <TableHead className="text-right text-slate-600">
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
                      Không có đơn cứu hộ nào ở trạng thái đã phân công.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => {
                    const existingOrder = ordersByRequestId[request.id];

                    return (
                      <TableRow
                        key={request.id}
                        className="transition-all duration-200 hover:bg-slate-50/80"
                      >
                        <TableCell className="font-semibold text-slate-900">
                          {request.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="min-w-[280px] text-slate-700">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                              <span>{request.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span>
                                {request.guestPhone || "Không có số điện thoại"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPriorityClassName(request.priority)}
                          >
                            {getPriorityLabel(request.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {request.estimatedPeople || 0} người
                        </TableCell>
                        <TableCell className="min-w-[220px] text-slate-700">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                              <Users className="h-4 w-4 text-red-500" />
                              {request.teamSummary.assigned}/
                              {request.teamSummary.required} đội
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {request.assignedTeams.length > 0 ? (
                                request.assignedTeams.map((team) => (
                                  <Badge
                                    key={team.assignmentId}
                                    variant="outline"
                                    className="border-red-200 bg-red-50 text-red-700"
                                  >
                                    {team.teamName}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-slate-500">
                                  Chưa có đội
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatDateTime(request.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {existingOrder ? (
                            <div className="flex justify-end gap-2">
                              <Badge
                                className={getOrderStatusClassName(
                                  existingOrder.status,
                                )}
                              >
                                {getOrderStatusLabel(existingOrder.status)}
                              </Badge>
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
                            <Button
                              size="sm"
                              onClick={() => handleOpenCreateDialog(request)}
                              disabled={isOrdersLoading}
                              className="rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800"
                            >
                              <FilePlus2 className="h-4 w-4" />
                              Tạo phiếu cứu trợ
                            </Button>
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
            className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
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
            className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
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
                    <Badge
                      className={`mt-2 ${getPriorityClassName(selectedRequest.priority)}`}
                    >
                      {getPriorityLabel(selectedRequest.priority)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Đội đã phân</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedRequest.teamSummary.assigned}/
                      {selectedRequest.teamSummary.required}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="estimated-people">Số người dự kiến hỗ trợ</Label>
              <Input
                id="estimated-people"
                type="number"
                min={1}
                value={formData.estimatedPeople}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    estimatedPeople: Number(event.target.value),
                  }))
                }
                className="rounded-xl border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
              />
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
              className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
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
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl border-red-100 p-0">
          <DialogHeader className="border-b border-slate-100 bg-gray-50 px-6 py-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Chi tiết phiếu cứu trợ
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto px-6 py-5">
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
                      <Badge
                        className={`mt-2 ${getOrderStatusClassName(selectedOrderDetail.status)}`}
                      >
                        {getOrderStatusLabel(selectedOrderDetail.status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Số người hỗ trợ</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {selectedOrderDetail.affectedPeople ||
                          selectedOrderDetail.estimatedPeople}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Tổng responder</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {selectedOrderDetail.totalResponders ||
                          selectedOrderDetail.totalRescuers ||
                          0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Mức độ thiệt hại</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {getPriorityLabel(
                          selectedOrderDetail.damageLevel ||
                            selectedOrderDetail.priority,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Mã đơn cứu hộ</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                        {selectedOrderDetail.rescueRequestId.substring(0, 12)}
                        ...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Người tạo phiếu</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                        {selectedOrderDetail.createdById.substring(0, 12)}...
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
                          <Badge
                            className={`mt-2 ${getPriorityClassName(selectedOrderDetail.rescueRequest.priority)}`}
                          >
                            {getPriorityLabel(
                              selectedOrderDetail.rescueRequest.priority,
                            )}
                          </Badge>
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
                        <Badge
                          className={
                            selectedOrderDetail.stockCheck.allSufficient
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {selectedOrderDetail.stockCheck.allSufficient
                            ? "Kho hiện đủ hàng"
                            : "Kho còn thiếu hàng"}
                        </Badge>
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
                              <Badge
                                className={
                                  item.isEnough
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-800"
                                }
                              >
                                {item.isEnough ? "Đủ hàng" : "Thiếu hàng"}
                              </Badge>
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
                                <Badge
                                  className={getReplenishmentStatusClassName(
                                    request.status,
                                  )}
                                >
                                  {request.status}
                                </Badge>
                              </div>
                              <p className="mt-3 text-sm text-slate-700">
                                {request.note}
                              </p>
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
            {selectedOrderDetail &&
              (selectedOrderDetail.status === "PLANNED" ||
                selectedOrderDetail.status === "READY" ||
                selectedOrderDetail.status === "INSUFFICIENT") && (
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
                  className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                >
                  Hoàn tất phiếu
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
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border-red-100 p-0">
          <DialogHeader className="border-b border-slate-100 bg-gray-50 px-6 py-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Hoàn tất phiếu cứu trợ
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto px-6 py-5">
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
              className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
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
    </div>
  );
}
