import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { donationService } from "../../../service/donation/api";
import { eventService } from "../../../service/event/api";
import {
  DonationData,
  DonationFilters,
  DonationStatus,
} from "../../../types/donation";
import { EventData } from "../../../types/event";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { toast } from "sonner";

export default function ProductManagement() {
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<DonationFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "status" | "createdAt" | "expirationDate"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

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
    try {
      await donationService.approveDonation(donationId);
      toast.success("Duyệt đơn quyên góp thành công!");
      fetchDonations();
    } catch (error) {
      toast.error("Lỗi khi duyệt đơn quyên góp");
    }
  };

  const handleRejectDonation = async (donationId: string) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    try {
      await donationService.rejectDonation(donationId, { reason });
      toast.success("Từ chối đơn quyên góp thành công!");
      fetchDonations();
    } catch (error) {
      toast.error("Lỗi khi từ chối đơn quyên góp");
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

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
          <ChevronDown className="h-4 w-4 mr-2" />
          Bộ lọc
        </Button>
        {selectedIds.size > 0 && (
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
                Sản phẩm
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
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : filteredAndSortedDonations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
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

                const itemsSummary = donation.items
                  .map((item) => `${item.category} (${item.quantity})`)
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
                        <p className="font-medium text-gray-900">
                          {itemsSummary || "(Không có vật phẩm)"}
                        </p>
                        <p className="text-sm text-gray-500">{donation.id}</p>
                      </div>
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
                      {donation.status === "SUBMITTED" ? (
                        <div className="flex gap-2">
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
                        </div>
                      ) : (
                        <span className="text-gray-500">Hoàn tất</span>
                      )}
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
    </div>
  );
}
