import { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  Eye,
  MapPin,
  Phone,
  Mail,
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
import { CustomSelect } from "../../../components/ui/CustomSelect";

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
  const [selectedItem, setSelectedItem] = useState<any>(null);

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
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedItem(item)}
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

  // Item Detail Modal Component
  const ItemDetailModal = () => {
    if (!selectedItem) return null;

    const conditionLabelMap: Record<string, string> = {
      EXCELLENT: "Xuất sắc",
      GOOD: "Tốt",
      FAIR: "Bình thường",
      POOR: "Kém",
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Chi tiết vật phẩm
            </h2>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Image */}
            {selectedItem.imageUrls && selectedItem.imageUrls.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Ảnh sản phẩm</p>
                <img
                  src={selectedItem.imageUrls[0]}
                  alt={selectedItem.name}
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tên sản phẩm</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedItem.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Danh mục</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedItem.category?.name || "Không xác định"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số lượng</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedItem.quantity} {selectedItem.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái sản phẩm</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                      selectedItem.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : selectedItem.status === "SUBMITTED"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedItem.status === "RECEIVED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedItem.status === "APPROVED"
                      ? "Đã duyệt"
                      : selectedItem.status === "SUBMITTED"
                        ? "Chờ duyệt"
                        : selectedItem.status === "RECEIVED"
                          ? "Đã nhận"
                          : selectedItem.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin chi tiết
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tình trạng</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {conditionLabelMap[selectedItem.condition] ||
                      selectedItem.condition}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạn sử dụng</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {new Date(selectedItem.expirationDate).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã sản phẩm</p>
                  <p className="font-mono text-sm text-gray-900 mt-1">
                    {selectedItem.id.substring(0, 12)}...
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày tạo</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {new Date(selectedItem.createdAt).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày cập nhật</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {new Date(selectedItem.updatedAt).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Note */}
            {selectedItem.note && (
              <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Ghi chú
                </h3>
                <p className="text-gray-700">{selectedItem.note}</p>
              </div>
            )}

            {/* Image Gallery */}
            {selectedItem.imageUrls && selectedItem.imageUrls.length > 1 && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Ảnh khác ({selectedItem.imageUrls.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedItem.imageUrls.map((url: string, index: number) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${selectedItem.name} ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-300 hover:opacity-75 transition"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
            <Button
              onClick={() => setSelectedItem(null)}
              variant="outline"
              className="rounded-lg"
            >
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
    <div className="p-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Quản lý sản phẩm
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Duyệt, phân phối và quản lý sản phẩm quyên góp
        </p>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Chọn sự kiện
        </label>
        <CustomSelect
          options={events.map((event) => ({
            value: event.id,
            label: `${event.title} - ${new Date(event.startDate).toLocaleDateString("vi-VN")} ${event.type === "DONATION" ? "(Quyên góp)" : "(Tình nguyện)"}`,
          }))}
          value={selectedEvent?.id || ""}
          onChange={(value) => {
            const event = events.find((ev) => ev.id === value);
            if (event) {
              setSelectedEvent(event);
              setFilters((prev) => ({ ...prev, eventId: event.id }));
              setPage(1);
            }
          }}
          placeholder="Chọn sự kiện..."
          className="max-w-2xl"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm mb-6 border-2 border-gray-100 overflow-hidden flex">
        <button
          onClick={() => {
            setActiveTab("pending");
            setPage(1);
            setSelectedIds(new Set());
          }}
          className={`flex-1 px-6 py-4 text-sm font-semibold border-b-4 transition-all duration-300 ${
            activeTab === "pending"
              ? "border-amber-500 text-amber-600 bg-amber-50"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
          className={`flex-1 px-6 py-4 text-sm font-semibold border-b-4 transition-all duration-300 ${
            activeTab === "approved"
              ? "border-emerald-500 text-emerald-600 bg-emerald-50"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Đã duyệt ({donations.filter((d) => d.status !== "SUBMITTED").length})
        </button>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 flex flex-wrap gap-3 border-2 border-gray-100">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="rounded-xl"
        >
          <ChevronDown className="h-4 w-4 mr-2" />
          Bộ lọc
        </Button>
        {selectedIds.size > 0 && activeTab === "pending" && (
          <>
            <Button
              onClick={handleBulkApprove}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-sm"
            >
              Duyệt ({selectedIds.size})
            </Button>
            <Button
              onClick={handleBulkReject}
              variant="outline"
              className="border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-xl"
            >
              Từ chối ({selectedIds.size})
            </Button>
            <Button
              onClick={() => setSelectedIds(new Set())}
              variant="outline"
              className="rounded-xl"
            >
              <X className="h-4 w-4 mr-2" />
              Xoá chọn
            </Button>
          </>
        )}
        {selectedIds.size > 0 && activeTab === "approved" && (
          <Button
            onClick={() => setSelectedIds(new Set())}
            variant="outline"
            className="rounded-xl"
          >
            <X className="h-4 w-4 mr-2" />
            Xoá chọn
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-gray-100 space-y-5">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              className="rounded-xl"
            />
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <CustomSelect
                options={[
                  { value: "createdAt", label: "Ngày gửi" },
                  { value: "expirationDate", label: "HSD" },
                ]}
                value={sortBy}
                onChange={(value) =>
                  setSortBy(value as "status" | "createdAt" | "expirationDate")
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thứ tự
              </label>
              <CustomSelect
                options={[
                  { value: "DESC", label: "Giảm dần" },
                  { value: "ASC", label: "Tăng dần" },
                ]}
                value={sortOrder}
                onChange={(value) => setSortOrder(value as "ASC" | "DESC")}
              />
            </div>
          </div>

          {/* Existing Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trạng thái
              </label>
              <CustomSelect
                options={[
                  { value: "", label: "Tất cả" },
                  { value: "SUBMITTED", label: "Chờ duyệt" },
                  { value: "APPROVED", label: "Đã duyệt" },
                  { value: "REJECTED", label: "Từ chối" },
                  { value: "RECEIVED", label: "Đã nhận" },
                  { value: "ALLOCATED", label: "Đã phân bổ" },
                  { value: "DISPATCHED", label: "Đã gửi" },
                  { value: "DELIVERED", label: "Đã giao" },
                ]}
                value={filters.status || ""}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    status: (value || undefined) as DonationStatus | undefined,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Từ ngày
              </label>
              <Input
                type="date"
                value={filters.from || ""}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đến ngày
              </label>
              <Input
                type="date"
                value={filters.to || ""}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilters((prev) => ({
                    eventId: prev.eventId || selectedEvent?.id,
                  }));
                  setSearchQuery("");
                  setSortBy("createdAt");
                  setSortOrder("DESC");
                }}
                variant="outline"
                className="w-full rounded-xl border-2 hover:bg-gray-50"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Donations Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto border-2 border-gray-100">
        <table className="w-full min-w-max">
          <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-100 sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === filteredAndSortedDonations.length &&
                    filteredAndSortedDonations.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                Người gửi
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                Số lượng
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                Ngày gửi
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                HSD
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                Ghi chú
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
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
                  SUBMITTED:
                    "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200",
                  APPROVED:
                    "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200",
                  REJECTED:
                    "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200",
                  RECEIVED:
                    "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200",
                  ALLOCATED:
                    "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border border-purple-200",
                  DISPATCHED:
                    "bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700 border border-cyan-200",
                  DELIVERED:
                    "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200",
                };

                return (
                  <tr
                    key={donation.id}
                    className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(donation.id)}
                        onChange={() => toggleSelect(donation.id)}
                        className="rounded"
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
                        className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
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
                    <td className="px-6 py-4 max-w-xs">
                      <div>
                        <p
                          className="font-medium text-gray-900 truncate"
                          title={donation.note || ""}
                        >
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
                          className="flex items-center gap-1 rounded-xl border-2"
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </Button>
                        {donation.status === "SUBMITTED" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveDonation(donation.id)}
                              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-sm"
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRejectDonation(donation.id)}
                              variant="outline"
                              className="border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-xl"
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
                              className="rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
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
        <div className="mt-6 flex justify-center items-center gap-3">
          <Button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            variant="outline"
            className="rounded-xl border-2"
          >
            Trước
          </Button>
          <span className="flex items-center px-4 py-2 bg-white rounded-xl border-2 border-gray-100 font-semibold text-gray-700">
            Trang {page} / {totalPages}
          </span>
          <Button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            variant="outline"
            className="rounded-xl border-2"
          >
            Sau
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <DonationDetailModal />
      <ItemDetailModal />

      {/* Approve/Reject Dialogs */}
      <ApproveDialog />
      <RejectDialog />
    </div>
  );
}
