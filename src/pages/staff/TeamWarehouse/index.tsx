import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Allocation } from "@/types";
import { warehouseApi as warehouseApiNew } from "@/apis/warehouseApi";
import { listTeams } from "@/apis/teamApi";
import { eventService } from "../../../service/event/api";
import { EventData } from "../../../types/event";
import { CustomSelect } from "../../../components/ui/CustomSelect";

const conditionLabelMap: Record<string, string> = {
  EXCELLENT: "Xuất sắc",
  GOOD: "Tốt",
  FAIR: "Bình thường",
  POOR: "Kém",
};

const conditionClassMap: Record<string, string> = {
  EXCELLENT: "bg-green-100 text-green-800",
  GOOD: "bg-blue-100 text-blue-800",
  FAIR: "bg-yellow-100 text-yellow-800",
  POOR: "bg-red-100 text-red-800",
};

interface Team {
  id: string;
  name: string;
  area?: string;
}

export default function TeamWarehouse() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAllocationDetail, setSelectedAllocationDetail] =
    useState<Allocation | null>(null);
  const [isAllocationDetailLoading, setIsAllocationDetailLoading] =
    useState(false);

  useEffect(() => {
    fetchTeams();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedTeamId && selectedEvent) {
      setPage(1);
      fetchAllocations();
    }
  }, [selectedTeamId, selectedEvent]);

  useEffect(() => {
    if (selectedTeamId && selectedEvent) {
      fetchAllocations();
    }
  }, [page]);

  const fetchTeams = async () => {
    try {
      const response = await listTeams({ isActive: true, limit: 100 });
      if (response.items) {
        setTeams(response.items);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đội");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventService.getEvents({
        type: "DONATION",
      });
      if (response.success) {
        const eventsList = response.data.data;
        setEvents(eventsList);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách sự kiện");
    }
  };

  const fetchAllocations = async () => {
    setIsLoading(true);
    try {
      const response = await warehouseApiNew.getAllocations({
        teamId: selectedTeamId,
        eventId: selectedEvent?.id,
        page,
        limit: 10,
      });
      if (response.success) {
        setAllocations(response.data.data);
        setTotalPages(response.data.meta.pages);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách phân phối");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAllocations = allocations.filter((allocation) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      allocation.teamName?.toLowerCase().includes(searchLower) ||
      allocation.id.toLowerCase().includes(searchLower) ||
      allocation.items?.some((item) =>
        item.category?.toLowerCase().includes(searchLower),
      )
    );
  });

  const handleOpenAllocationDetail = async (allocation: Allocation) => {
    setSelectedAllocationDetail(allocation);
    setIsAllocationDetailLoading(true);
    try {
      const response = await warehouseApiNew.getAllocation(allocation.id);
      if (response.success) {
        setSelectedAllocationDetail(response.data);
      } else {
        toast.error("Không thể tải chi tiết phân phối");
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết phân phối");
    } finally {
      setIsAllocationDetailLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Quản lý kho của team
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Xem danh sách phân phối sản phẩm cho team và sự kiện
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Select Team */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Chọn đội
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => {
              setSelectedTeamId(e.target.value);
              setSelectedEvent(null);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn một đội --</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} {team.area ? `(${team.area})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Select Event */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-gray-100">
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
                setPage(1);
              }
            }}
            placeholder="Chọn sự kiện..."
          />
        </div>
      </div>

      {selectedTeamId && selectedEvent && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border-2 border-gray-100">
            <Input
              type="text"
              placeholder="Tìm theo tên đội hoặc danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-gray-100">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Mã phân phối
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Tình trạng
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredAllocations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "Không tìm thấy kết quả"
                        : "Chưa có phân phối cho sự kiện này"}
                    </td>
                  </tr>
                ) : (
                  filteredAllocations.map((allocation) =>
                    allocation.items?.map((item, index) => (
                      <tr
                        key={`${allocation.id}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        {index === 0 && (
                          <td
                            rowSpan={allocation.items?.length || 1}
                            className="px-6 py-4 font-medium text-gray-900"
                          >
                            {allocation.id.substring(0, 8)}...
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900">
                          {item.category}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              conditionClassMap[item.condition] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {conditionLabelMap[item.condition] ||
                              item.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {item.quantity}
                        </td>
                        {index === 0 && (
                          <>
                            <td
                              rowSpan={allocation.items?.length || 1}
                              className="px-6 py-4 text-gray-600"
                            >
                              {new Date(
                                allocation.createdAt,
                              ).toLocaleDateString("vi-VN")}
                            </td>
                            <td
                              rowSpan={allocation.items?.length || 1}
                              className="px-6 py-4"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleOpenAllocationDetail(allocation)
                                }
                                className="rounded-lg"
                              >
                                Chi tiết
                              </Button>
                            </td>
                          </>
                        )}
                      </tr>
                    )),
                  )
                )}
              </tbody>
            </table>
          </div>

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
        </>
      )}

      {!selectedTeamId || !selectedEvent ? (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <p className="text-blue-800 font-medium">
            {!selectedTeamId
              ? "Chọn đội trước"
              : "Vui lòng chọn một sự kiện để xem danh sách phân phối"}
          </p>
        </div>
      ) : null}

      {selectedAllocationDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết phân phối
              </h2>
              <button
                onClick={() => setSelectedAllocationDetail(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {isAllocationDetailLoading && (
                <div className="text-sm text-gray-500">
                  Đang tải chi tiết phân phối...
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã phân phối</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 mt-1">
                      {selectedAllocationDetail.id.substring(0, 12)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {selectedAllocationDetail.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {new Date(
                        selectedAllocationDetail.createdAt,
                      ).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>

              {selectedAllocationDetail.team && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Thông tin đội
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tên đội</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {selectedAllocationDetail.team.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Khu vực</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {selectedAllocationDetail.team.area || "(Không có)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quy mô đội</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {selectedAllocationDetail.team.teamSize || "(Không có)"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedAllocationDetail.createdBy && (
                <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Người phân phối
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Họ tên</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {selectedAllocationDetail.createdBy.profile?.fullName ||
                          selectedAllocationDetail.createdBy.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {selectedAllocationDetail.createdBy.email}
                      </p>
                    </div>
                    {selectedAllocationDetail.createdBy.profile?.address && (
                      <div>
                        <p className="text-sm text-gray-600">Địa chỉ</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {selectedAllocationDetail.createdBy.profile.address}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Chức vụ</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {selectedAllocationDetail.createdBy.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vật phẩm đã phân phối (
                  {selectedAllocationDetail.items?.length || 0})
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">
                          Danh mục
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">
                          Tình trạng
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">
                          Số lượng
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">
                          Ngày tạo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedAllocationDetail.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.category}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                conditionClassMap[item.condition] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {conditionLabelMap[item.condition] ||
                                item.condition}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(item.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
              <Button
                onClick={() => setSelectedAllocationDetail(null)}
                variant="outline"
                className="rounded-lg"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
