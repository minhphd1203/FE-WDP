import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Eye,
  MapPin,
  Phone,
  RefreshCw,
  X,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  rescueOrderApi,
  RescueOrderDetail,
  RescueOrderListItem,
} from "../../../apis/rescueOrderApi";
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
import { Textarea } from "../../../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { formatDateTime } from "../../../lib/utils";

const LIMIT = 20;

const replenishmentStatusLabelMap: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const replenishmentStatusClassMap: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-800",
};

const priorityLabelMap: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Khẩn cấp",
};

const priorityClassMap: Record<string, string> = {
  LOW: "bg-sky-100 text-sky-700",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const itemTypeLabelMap: Record<string, string> = {
  WATER: "Nước uống",
  FOOD: "Thực phẩm",
  MEDICAL_KIT: "Bộ y tế",
};

const getReplenishmentStatusLabel = (status: string) => {
  return replenishmentStatusLabelMap[status] || status;
};

const getReplenishmentStatusClassName = (status: string) => {
  return replenishmentStatusClassMap[status] || "bg-slate-100 text-slate-700";
};

const getPriorityLabel = (priority: string) => {
  return priorityLabelMap[priority] || priority;
};

const getPriorityClassName = (priority: string) => {
  return priorityClassMap[priority] || "bg-slate-100 text-slate-700";
};

export default function ReplenishmentRequests() {
  const [orders, setOrders] = useState<RescueOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RescueOrderDetail | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await rescueOrderApi.listRescueOrders({
        page: 1,
        limit: LIMIT,
      });

      if (response.success) {
        const nextOrders = (response.data.data || []).filter(
          (order) => (order.replenishmentRequests || []).length > 0,
        );
        setOrders(nextOrders);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách yêu cầu bổ sung");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const handleOpenDetail = async (orderId: string) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDecisionNote("");
    try {
      const response = await rescueOrderApi.getRescueOrder(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết yêu cầu bổ sung");
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleReviewReplenishment = async (approved: boolean) => {
    if (!selectedOrder?.replenishmentRequests?.[0]) return;

    const requestId = selectedOrder.replenishmentRequests[0].id;
    setIsReviewing(true);

    try {
      const response = await rescueOrderApi.reviewReplenishmentRequest(
        requestId,
        {
          approved,
          decisionNote: decisionNote || undefined,
        },
      );

      if (response.success) {
        toast.success(
          approved
            ? "Đã duyệt yêu cầu bổ sung hàng"
            : "Đã từ chối yêu cầu bổ sung hàng",
        );
        setIsDetailOpen(false);
        await fetchOrders();
      }
    } catch (error) {
      toast.error(
        approved
          ? "Không thể duyệt yêu cầu bổ sung"
          : "Không thể từ chối yêu cầu bổ sung",
      );
    } finally {
      setIsReviewing(false);
    }
  };

  const stats = useMemo(() => {
    const pendingCount = orders.filter((order) =>
      order.replenishmentRequests?.some(
        (request) => request.status === "PENDING",
      ),
    ).length;

    const totalShortage = orders.reduce((sum, order) => {
      return (
        sum +
        (order.stockCheck?.items || []).reduce(
          (innerSum, item) => innerSum + (item.shortageQuantity || 0),
          0,
        )
      );
    }, 0);

    return {
      total: orders.length,
      pending: pendingCount,
      shortage: totalShortage,
    };
  }, [orders]);

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-red-50/30 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Yêu cầu bổ sung hàng
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Theo dõi các phiếu thiếu hàng mà staff đã gửi yêu cầu bổ sung.
          </p>
        </div>
        <Button
          onClick={() => void fetchOrders()}
          variant="outline"
          className="rounded-xl border-red-200 hover:text-white text-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Tổng yêu cầu</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.total}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Đang chờ duyệt</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {stats.pending}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">
              Tổng số lượng thiếu
            </p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {stats.shortage}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">
            Danh sách phiếu cần bổ sung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border-none">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-slate-50/80">
                  <TableHead className="text-slate-600">
                    Khu vực cứu hộ
                  </TableHead>
                  <TableHead className="text-slate-600">Ưu tiên</TableHead>
                  <TableHead className="text-slate-600">Số người</TableHead>
                  <TableHead className="text-slate-600">Thiếu hàng</TableHead>
                  <TableHead className="text-slate-600">
                    Yêu cầu mới nhất
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
                      Đang tải danh sách yêu cầu bổ sung...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-slate-600"
                    >
                      Chưa có yêu cầu bổ sung nào từ staff.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const latestRequest = order.replenishmentRequests?.[0];
                    const shortageItems = (
                      order.stockCheck?.items || []
                    ).filter((item) => item.shortageQuantity > 0);

                    return (
                      <TableRow key={order.id} className="hover:bg-slate-50/80">
                        <TableCell className="min-w-[260px] py-3 text-slate-700">
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                              <span className="block break-words">
                                {order.rescueRequest?.address ||
                                  "Không có địa chỉ"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span>
                                {order.rescueRequest?.guestPhone ||
                                  "Không có số điện thoại"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 whitespace-nowrap">
                          <div
                            className={`${getPriorityClassName(String(order.priority))} inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                          >
                            {getPriorityLabel(String(order.priority))}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 whitespace-nowrap text-slate-700">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-red-500" />
                            {order.affectedPeople ||
                              order.estimatedPeople ||
                              0}{" "}
                            người
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[150px] py-3 text-slate-700">
                          <div className="flex flex-wrap gap-1.5">
                            {shortageItems.map((item) => (
                              <div
                                key={item.orderItemId}
                                className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800"
                              >
                                {item.categoryName}: {item.shortageQuantity}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[260px] py-3 text-slate-700">
                          {latestRequest ? (
                            <div className="space-y-2">
                              <div
                                className={`${getReplenishmentStatusClassName(latestRequest.status)} inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                              >
                                {getReplenishmentStatusLabel(
                                  latestRequest.status,
                                )}
                              </div>
                              <p className="line-clamp-2 text-sm text-slate-600">
                                {latestRequest.note}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">
                              Không có dữ liệu
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-slate-600">
                          {formatDateTime(order.updatedAt)}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleOpenDetail(order.id)}
                            className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                          >
                            <Eye className="h-4 w-4" />
                            Chi tiết
                          </Button>
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden rounded-2xl border-red-100 p-0">
          <DialogHeader className="border-b border-slate-100 bg-gray-50 px-6 py-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Chi tiết yêu cầu bổ sung
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {isDetailLoading || !selectedOrder ? (
              <div className="py-12 text-center text-slate-600">
                Đang tải chi tiết yêu cầu bổ sung...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-slate-500">Trạng thái phiếu</p>
                      <div
                        className={`mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getReplenishmentStatusClassName(selectedOrder.replenishmentRequests?.[0]?.status || "PENDING")}`}
                      >
                        {getReplenishmentStatusLabel(
                          selectedOrder.replenishmentRequests?.[0]?.status ||
                            "PENDING",
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Địa chỉ cứu hộ</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {selectedOrder.rescueRequest?.address || "Không có"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        Tổng người hỗ trợ
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {selectedOrder.totalResponders ||
                          selectedOrder.totalRescuers ||
                          0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Cập nhật</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDateTime(selectedOrder.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="rounded-2xl border-red-100 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">
                      Danh sách hạng mục đang thiếu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                      {(selectedOrder.stockCheck?.items || []).map((item) => (
                        <div
                          key={item.orderItemId}
                          className="rounded-xl border border-amber-200 bg-amber-50 p-4"
                        >
                          <p className="font-semibold text-slate-900">
                            {item.categoryName}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {itemTypeLabelMap[item.itemType] || item.itemType}
                          </p>
                          <div className="mt-3 space-y-1 text-sm text-slate-700">
                            <p>Cần: {item.requiredQuantity}</p>
                            <p>Tồn khả dụng: {item.availableQuantity}</p>
                            <p className="font-semibold text-red-700">
                              Thiếu: {item.shortageQuantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-red-100 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">
                      Lịch sử yêu cầu bổ sung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(selectedOrder.replenishmentRequests || []).map(
                        (request) => (
                          <div
                            key={request.id}
                            className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                          >
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div
                                className={`${getReplenishmentStatusClassName(request.status)} inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                              >
                                {getReplenishmentStatusLabel(request.status)}
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-slate-700">
                              {request.note}
                            </p>
                            {request.decisionNote && (
                              <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-slate-700">
                                <p className="font-medium text-slate-900">
                                  Ghi chú duyệt
                                </p>
                                <p className="mt-1">{request.decisionNote}</p>
                              </div>
                            )}
                            {request.reviewedAt && (
                              <p className="mt-2 text-sm text-slate-500">
                                Duyệt lúc: {formatDateTime(request.reviewedAt)}
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-red-100 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">
                      Thông tin đội đang tham gia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(selectedOrder.teams || []).map((team) => (
                        <div
                          key={team.assignmentId}
                          className="rounded-xl border border-red-100 bg-red-50/60 p-4"
                        >
                          <p className="font-semibold text-slate-900">
                            {team.teamName}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Quy mô đội: {team.teamSize || 0} người
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Trạng thái: {team.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedOrder.replenishmentRequests?.some(
                  (request) => request.status === "PENDING",
                ) && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-900" />
                      <div className="flex-1">
                        <p className="font-semibold text-amber-900">
                          Yêu cầu đang chờ admin xử lý
                        </p>
                        <p className="mt-2 text-sm text-amber-900">
                          Vui lòng nhập ghi chú quyết định (nếu có) rồi chọn
                          Duyệt hoặc Từ chối.
                        </p>
                        <div className="mt-3">
                          <label className="text-sm font-medium text-amber-900">
                            Ghi chú duyệt/từ chối (tùy chọn)
                          </label>
                          <Textarea
                            value={decisionNote}
                            onChange={(e) => setDecisionNote(e.target.value)}
                            placeholder="Nhập ghi chú của bạn..."
                            className="mt-2 border-amber-200 bg-white/70 text-slate-900 focus:border-amber-400"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 bg-gray-50 px-6 py-4">
            {selectedOrder?.replenishmentRequests?.[0]?.status === "PENDING" ? (
              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  onClick={() => void handleReviewReplenishment(false)}
                  disabled={isReviewing}
                  className="flex-1 rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  Từ chối
                </Button>
                <Button
                  onClick={() => void handleReviewReplenishment(true)}
                  disabled={isReviewing}
                  className="flex-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" />
                  Duyệt
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
              >
                Đóng
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
