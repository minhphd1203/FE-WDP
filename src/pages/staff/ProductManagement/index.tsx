import { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  Eye,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  User,
} from "lucide-react";
import { donationService } from "../../../service/donation/api";
import { eventService } from "../../../service/event/api";
import { warehouseApi } from "../../../apis/warehouseApi";
import {
  Donation,
  DonationFilters,
  DonationStatus,
} from "../../../types/donation";
import { EventData } from "../../../types/event";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { toast } from "sonner";

export default function ProductManagement() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<DonationFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  // const [sortBy, setSortBy] = useState<
  //   "status" | "createdAt" | "expirationDate"
  // >("createdAt");
  // const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  // const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
  //   null,
  // );

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [currentDonationId, setCurrentDonationId] = useState<string | null>(
    null,
  );
  const [dialogNote, setDialogNote] = useState("");
  const [dialogReason, setDialogReason] = useState("");
  const [sortBy, setSortBy] = useState<
    "status" | "createdAt" | "expirationDate"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null,
  );

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchDonations();
    }
  }, [filters, page, selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getEvents({
        status: "OPEN",
        type: "DONATION",
      });
      if (response.success) {
        const eventsList = response.data.data;
        setEvents(eventsList);
        // Auto-select newest event (first one)
        if (eventsList.length > 0) {
          setSelectedEvent(eventsList[0]);
          setFilters((prev) => ({ ...prev, eventId: eventsList[0].id }));
        }
      }
    } catch (error) {
      toast.error("Không thể tải danh sách sự kiện");
    }
  };

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const response = await donationService.listDonations({
        ...filters,
        eventId: selectedEvent?.id || filters.eventId,
        page,
      });
      if (response.success) {
        setDonations(response.data.data);
        setTotalPages(response.data.meta.pages);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đơn quyên góp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDonation = async (donationId: string) => {
    setCurrentDonationId(donationId);
    setDialogNote("");
    setShowApproveDialog(true);
  };

  const confirmApproveDonation = async () => {
    if (!currentDonationId) return;

    try {
      // Step 1: Approve donation (SUBMITTED → APPROVED)
      await donationService.approveDonation(currentDonationId, {
        note: dialogNote || undefined,
      });
      toast.success("Duyệt đơn quyên góp thành công!");

      // Step 2: Create receipt to warehouse (APPROVED → RECEIVED)
      try {
        await warehouseApi.createReceipt({
          donationId: currentDonationId,
        });
        toast.success("Nhập kho thành công!");
      } catch (warehouseError) {
        // If warehouse fails, still allow the donation approval
        console.error("Warehouse receipt failed:", warehouseError);
        toast.warning(
          "Duyệt thành công nhưng nhập kho thất bại. Vui lòng thử lại sau.",
        );
      }

      setShowApproveDialog(false);
      setCurrentDonationId(null);
      setDialogNote("");
      fetchDonations();
    } catch (error) {
      toast.error("Lỗi khi duyệt đơn quyên góp");
    }
  };

  const handleRejectDonation = async (donationId: string) => {
    setCurrentDonationId(donationId);
    setDialogReason("");
    setShowRejectDialog(true);
  };

  const handleReceiveDonation = async (donationId: string) => {
    try {
      await warehouseApi.createReceipt({ donationId });
      toast.success("Nhập kho thành công!");
      fetchDonations();
    } catch (error) {
      toast.error("Nhập kho thất bại, vui lòng thử lại");
    }
  };

  const confirmRejectDonation = async () => {
    if (!currentDonationId || !dialogReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      await donationService.rejectDonation(currentDonationId, {
        reason: dialogReason,
      });
      toast.success("Từ chối đơn quyên góp thành công!");
      setShowRejectDialog(false);
      setCurrentDonationId(null);
      setDialogReason("");
      fetchDonations();
    } catch (error) {
      toast.error("Lỗi khi từ chối đơn quyên góp");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn quyên góp");
      return;
    }
    setDialogNote("");
    setShowBulkApproveDialog(true);
  };

  const confirmBulkApprove = async () => {
    try {
      const ids = Array.from(selectedIds);
      await donationService.bulkApproveDonations(ids, dialogNote || undefined);
      toast.success(`Đã duyệt ${ids.length} đơn quyên góp thành công!`);

      let successCount = 0;
      for (const donationId of ids) {
        try {
          await warehouseApi.createReceipt({ donationId });
          successCount += 1;
        } catch (warehouseError) {
          console.error(
            `Nhập kho thất bại cho donation ${donationId}:`,
            warehouseError,
          );
        }
      }

      if (successCount > 0) {
        toast.success(`Nhập kho ${successCount}/${ids.length} đơn thành công!`);
      }
      setShowBulkApproveDialog(false);
      setDialogNote("");
      setSelectedIds(new Set());
      fetchDonations();
    } catch (error) {
      toast.error("Lỗi khi duyệt hàng loạt");
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn quyên góp");
      return;
    }
    setDialogReason("");
    setShowBulkRejectDialog(true);
  };

  const confirmBulkReject = async () => {
    if (!dialogReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      const ids = Array.from(selectedIds);
      await donationService.bulkRejectDonations(ids, dialogReason);
      toast.success(`Đã từ chối ${ids.length} đơn quyên góp thành công!`);
      setShowBulkRejectDialog(false);
      setDialogReason("");
      fetchDonations();
    } catch (error) {
      toast.error("Lỗi khi từ chối hàng loạt");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedDonations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedDonations.map((d) => d.id)));
    }
  };

  const toggleSelect = (donationId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(donationId)) {
      newSelected.delete(donationId);
    } else {
      newSelected.add(donationId);
    }
    setSelectedIds(newSelected);
  };

  const filteredAndSortedDonations = donations
    .filter((donation) => {
      // Tab filter
      if (activeTab === "pending" && donation.status !== "SUBMITTED") {
        return false;
      }
      if (activeTab === "approved" && donation.status === "SUBMITTED") {
        return false;
      }

      // Search filter
      const donorName =
        donation.creator?.profile?.fullName ||
        donation.creator?.email ||
        donation.creator?.phone ||
        "Ẩn danh";
      const itemsSummary = donation.items
        .map((item) => item.category)
        .join(", ");
      const searchLower = searchQuery.toLowerCase();
      return (
        donorName.toLowerCase().includes(searchLower) ||
        itemsSummary.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "createdAt") {
        compareValue =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "status") {
        compareValue = a.status.localeCompare(b.status);
      } else if (sortBy === "expirationDate") {
        const aDate = a.items[0]?.expirationDate
          ? new Date(a.items[0].expirationDate).getTime()
          : 0;
        const bDate = b.items[0]?.expirationDate
          ? new Date(b.items[0].expirationDate).getTime()
          : 0;
        compareValue = aDate - bDate;
      }
      return sortOrder === "DESC" ? -compareValue : compareValue;
    });

  // Detail Modal Component
  const DonationDetailModal = () => {
    if (!selectedDonation) return null;

    const statusLabelMap: Record<DonationStatus, string> = {
      SUBMITTED: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Từ chối",
      RECEIVED: "Đã nhận",
      ALLOCATED: "Đã phân bổ",
      DISPATCHED: "Đã gửi",
      DELIVERED: "Đã giao",
    };

    const statusClassMap: Record<DonationStatus, string> = {
      SUBMITTED: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      RECEIVED: "bg-blue-100 text-blue-800",
      ALLOCATED: "bg-blue-100 text-blue-800",
      DISPATCHED: "bg-blue-100 text-blue-800",
      DELIVERED: "bg-blue-100 text-blue-800",
    };

    const conditionLabelMap: Record<string, string> = {
      EXCELLENT: "Xuất sắc",
      GOOD: "Tốt",
      FAIR: "Bình thường",
      POOR: "Kém",
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Chi tiết đơn quyên góp
            </h2>
            <button
              onClick={() => setSelectedDonation(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Donation Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                      statusClassMap[selectedDonation.status]
                    }`}
                  >
                    {statusLabelMap[selectedDonation.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày gửi</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {new Date(selectedDonation.createdAt).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày cập nhật</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {new Date(selectedDonation.updatedAt).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng số vật phẩm</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedDonation.items.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Donor Info */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-600" />
                Thông tin người quyên góp
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Họ tên</p>
                  <p className="font-semibold text-gray-900">
                    {selectedDonation.creator?.profile?.fullName ||
                      selectedDonation.creator?.email ||
                      "Ẩn danh"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    {selectedDonation.creator?.email || "Không có"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {selectedDonation.creator?.profile?.address || "Không có"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    {selectedDonation.creator?.phone || "Không có"}
                  </p>
                </div>
              </div>
            </div>

            {/* Donation Note */}
            {selectedDonation.note && (
              <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Ghi chú của người gửi
                </h3>
                <p className="text-gray-700">{selectedDonation.note}</p>
              </div>
            )}

            {/* Items List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-indigo-600" />
                Các vật phẩm ({selectedDonation.items.length})
              </h3>
              <div className="space-y-4">
                {selectedDonation.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50">
                      {/* Image */}
                      <div className="md:col-span-1">
                        {item.imageUrls && item.imageUrls.length > 0 ? (
                          <img
                            src={item.imageUrls[0]}
                            alt={item.name}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                            Không có ảnh
                          </div>
                        )}
                      </div>

                      {/* Main Info */}
                      <div className="md:col-span-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-500">
                              #{index + 1} - {item.id.substring(0, 8)}
                            </p>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Danh mục:{" "}
                              <span className="font-medium text-indigo-600">
                                {item.category?.name || "Không xác định"}
                              </span>
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : item.status === "SUBMITTED"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : item.status === "RECEIVED"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.status === "APPROVED"
                              ? "Đã duyệt"
                              : item.status === "SUBMITTED"
                                ? "Chờ duyệt"
                                : item.status === "RECEIVED"
                                  ? "Đã nhận"
                                  : item.status}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-600">Số lượng</p>
                            <p className="font-semibold text-gray-900">
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Tình trạng</p>
                            <p className="font-semibold text-gray-900">
                              {conditionLabelMap[item.condition] ||
                                item.condition}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">HSD</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(item.expirationDate).toLocaleDateString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">
                              Ngày cập nhật
                            </p>
                            <p className="font-semibold text-gray-900">
                              {new Date(item.updatedAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Note */}
                        {item.note && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-xs text-gray-600 mb-1">
                              Ghi chú:
                            </p>
                            <p className="text-sm text-gray-800">{item.note}</p>
                          </div>
                        )}

                        {/* Images Gallery */}
                        {item.imageUrls && item.imageUrls.length > 1 && (
                          <div>
                            <p className="text-xs text-gray-600 mb-2">
                              Ảnh khác ({item.imageUrls.length})
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {item.imageUrls.map((url, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={url}
                                  alt={`${item.name} ${imgIndex + 1}`}
                                  className="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
            {selectedDonation.status === "SUBMITTED" && (
              <>
                <Button
                  onClick={() => {
                    handleApproveDonation(selectedDonation.id);
                    setSelectedDonation(null);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Duyệt đơn
                </Button>
                <Button
                  onClick={() => {
                    handleRejectDonation(selectedDonation.id);
                    setSelectedDonation(null);
                  }}
                  variant="outline"
                >
                  Từ chối
                </Button>
              </>
            )}
            <Button onClick={() => setSelectedDonation(null)} variant="outline">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Approve Dialog Component
  const ApproveDialog = () => {
    if (!showApproveDialog && !showBulkApproveDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showBulkApproveDialog
                ? `Duyệt ${selectedIds.size} đơn quyên góp`
                : "Duyệt đơn quyên góp"}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập ghi chú (tùy chọn):
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={3}
                value={dialogNote}
                onChange={(e) => setDialogNote(e.target.value)}
                placeholder="Nhập ghi chú..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowApproveDialog(false);
                  setShowBulkApproveDialog(false);
                  setDialogNote("");
                }}
                variant="outline"
              >
                Hủy
              </Button>
              <Button
                onClick={
                  showBulkApproveDialog
                    ? confirmBulkApprove
                    : confirmApproveDonation
                }
                className="bg-green-600 hover:bg-green-700"
              >
                Xác nhận duyệt
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Reject Dialog Component
  const RejectDialog = () => {
    if (!showRejectDialog && !showBulkRejectDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showBulkRejectDialog
                ? `Từ chối ${selectedIds.size} đơn quyên góp`
                : "Từ chối đơn quyên góp"}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập lý do từ chối <span className="text-red-500">*</span>:
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                value={dialogReason}
                onChange={(e) => setDialogReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowRejectDialog(false);
                  setShowBulkRejectDialog(false);
                  setDialogReason("");
                }}
                variant="outline"
              >
                Hủy
              </Button>
              <Button
                onClick={
                  showBulkRejectDialog
                    ? confirmBulkReject
                    : confirmRejectDonation
                }
                className="bg-red-600 hover:bg-red-700"
                disabled={!dialogReason.trim()}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản lý sản phẩm
        </h1>
        <p className="text-gray-500">
          Duyệt, phân phối và quản lý sản phẩm quyên góp
        </p>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn sự kiện
        </label>
        <select
          className="w-full md:w-96 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          value={selectedEvent?.id || ""}
          onChange={(e) => {
            const event = events.find((ev) => ev.id === e.target.value);
            if (event) {
              setSelectedEvent(event);
              setFilters((prev) => ({ ...prev, eventId: event.id }));
              setPage(1);
            }
          }}
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} -{" "}
              {new Date(event.startDate).toLocaleDateString("vi-VN")}
              {event.type === "DONATION" ? " (Quyên góp)" : " (Tình nguyện)"}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6 border-b flex">
        <button
          onClick={() => {
            setActiveTab("pending");
            setPage(1);
            setSelectedIds(new Set());
          }}
          className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "pending"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Chờ duyệt ({donations.filter((d) => d.status === "SUBMITTED").length})
        </button>
        <button
          onClick={() => {
            setActiveTab("approved");
            setPage(1);
            setSelectedIds(new Set());
          }}
          className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "approved"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Đã duyệt ({donations.filter((d) => d.status !== "SUBMITTED").length})
        </button>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
          <ChevronDown className="h-4 w-4 mr-2" />
          Bộ lọc
        </Button>
        {selectedIds.size > 0 && activeTab === "pending" && (
          <>
            <Button
              onClick={handleBulkApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              Duyệt ({selectedIds.size})
            </Button>
            <Button
              onClick={handleBulkReject}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              Từ chối ({selectedIds.size})
            </Button>
            <Button onClick={() => setSelectedIds(new Set())} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Xoá chọn
            </Button>
          </>
        )}
        {selectedIds.size > 0 && activeTab === "approved" && (
          <Button onClick={() => setSelectedIds(new Set())} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Xoá chọn
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm, người gửi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "status" | "createdAt" | "expirationDate",
                  )
                }
              >
                <option value="createdAt">Ngày gửi</option>
                <option value="expirationDate">HSD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thứ tự
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "ASC" | "DESC")}
              >
                <option value="DESC">Giảm dần</option>
                <option value="ASC">Tăng dần</option>
              </select>
            </div>
          </div>

          {/* Existing Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                className="px-3 py-2 border rounded-md w-full"
                value={filters.status || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: (e.target.value || undefined) as
                      | DonationStatus
                      | undefined,
                  })
                }
              >
                <option value="">Tất cả</option>
                <option value="SUBMITTED">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
                <option value="RECEIVED">Đã nhận</option>
                <option value="ALLOCATED">Đã phân bổ</option>
                <option value="DISPATCHED">Đã gửi</option>
                <option value="DELIVERED">Đã giao</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày
              </label>
              <Input
                type="date"
                value={filters.from || ""}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày
              </label>
              <Input
                type="date"
                value={filters.to || ""}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>
            <Button
              onClick={() => {
                setFilters((prev) => ({
                  eventId: prev.eventId || selectedEvent?.id,
                }));
                setSearchQuery("");
                setSortBy("createdAt");
                setSortOrder("DESC");
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === filteredAndSortedDonations.length &&
                    filteredAndSortedDonations.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>

              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Người gửi
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Số lượng
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Ngày gửi
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                HSD
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Ghi chú
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : filteredAndSortedDonations.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  {searchQuery
                    ? "Không tìm thấy kết quả"
                    : "Không có đơn quyên góp"}
                </td>
              </tr>
            ) : (
              filteredAndSortedDonations.map((donation) => {
                const donorName =
                  donation.creator?.profile?.fullName ||
                  donation.creator?.email ||
                  donation.creator?.phone ||
                  "Ẩn danh";

                const itemsNames = donation.items
                  .map((item) => item.name)
                  .join(", ");

                const totalQuantity = donation.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0,
                );

                const statusLabelMap: Record<DonationStatus, string> = {
                  SUBMITTED: "Chờ duyệt",
                  APPROVED: "Đã duyệt",
                  REJECTED: "Từ chối",
                  RECEIVED: "Đã nhận",
                  ALLOCATED: "Đã phân bổ",
                  DISPATCHED: "Đã gửi",
                  DELIVERED: "Đã giao",
                };

                const statusClassMap: Record<DonationStatus, string> = {
                  SUBMITTED: "bg-yellow-100 text-yellow-800",
                  APPROVED: "bg-green-100 text-green-800",
                  REJECTED: "bg-red-100 text-red-800",
                  RECEIVED: "bg-blue-100 text-blue-800",
                  ALLOCATED: "bg-blue-100 text-blue-800",
                  DISPATCHED: "bg-blue-100 text-blue-800",
                  DELIVERED: "bg-blue-100 text-blue-800",
                };

                return (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(donation.id)}
                        onChange={() => toggleSelect(donation.id)}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{donorName}</p>
                        <p className="text-sm text-gray-500">
                          {donation.creator?.phone || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{totalQuantity}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusClassMap[donation.status]
                        }`}
                      >
                        {statusLabelMap[donation.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(donation.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {donation.items[0]?.expirationDate
                        ? new Date(
                            donation.items[0].expirationDate,
                          ).toLocaleDateString("vi-VN")
                        : "Không có"}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {donation.note || "(Không có ghi chú)"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedDonation(donation)}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </Button>
                        {donation.status === "SUBMITTED" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveDonation(donation.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRejectDonation(donation.id)}
                              variant="outline"
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        {donation.status === "APPROVED" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReceiveDonation(donation.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Nhập kho
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                toast.info(
                                  "Chức năng phân phối đang phát triển",
                                );
                              }}
                              variant="outline"
                            >
                              Phân phối
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            variant="outline"
          >
            Trước
          </Button>
          <span className="flex items-center px-4">
            Trang {page} / {totalPages}
          </span>
          <Button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            variant="outline"
          >
            Sau
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <DonationDetailModal />

      {/* Approve/Reject Dialogs */}
      <ApproveDialog />
      <RejectDialog />
    </div>
  );
}
