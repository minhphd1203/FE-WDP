import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  EXCELLENT: "bg-emerald-100 text-emerald-700",
  GOOD: "bg-red-100 text-red-800",
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
    useState<any>(null);
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
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-red-50/30 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Quản lý kho của team
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Xem danh sách phân phối sản phẩm cho team và sự kiện
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Select Team */}
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Chọn đội</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomSelect
              options={teams.map((team) => ({
                value: team.id,
                label: `${team.name}${team.area ? ` (${team.area})` : ""}`,
              }))}
              value={selectedTeamId}
              onChange={(value) => {
                setSelectedTeamId(value);
                setSelectedEvent(null);
                setPage(1);
              }}
              placeholder="Chọn một đội..."
            />
          </CardContent>
        </Card>

        {/* Select Event */}
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Chọn sự kiện</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {selectedTeamId && selectedEvent && (
        <>
          <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-900">Tìm kiếm</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Tìm theo tên đội hoặc danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md rounded-xl border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-900">
                Phân phối sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border-none">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-slate-50/80">
                      <TableHead className="text-slate-600">
                        Mã phân phối
                      </TableHead>
                      <TableHead className="text-slate-600">Danh mục</TableHead>
                      <TableHead className="text-slate-600">
                        Tình trạng
                      </TableHead>
                      <TableHead className="text-slate-600">Số lượng</TableHead>
                      <TableHead className="text-slate-600">Ngày tạo</TableHead>
                      <TableHead className="text-slate-600">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : filteredAllocations.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-slate-600"
                        >
                          {searchQuery
                            ? "Không tìm thấy kết quả"
                            : "Chưa có phân phối cho sự kiện này"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAllocations.map((allocation) =>
                        allocation.items?.map((item, index) => (
                          <TableRow
                            key={`${allocation.id}-${index}`}
                            className="transition-all duration-200 hover:bg-slate-50/80"
                          >
                            {index === 0 && (
                              <TableCell
                                rowSpan={allocation.items?.length || 1}
                                className="font-semibold text-slate-900"
                              >
                                {allocation.id.substring(0, 8)}...
                              </TableCell>
                            )}
                            <TableCell className="text-slate-700">
                              {item.category}
                            </TableCell>
                            <TableCell>
                              <div
                                className={`${conditionClassMap[item.condition] || "bg-slate-100 text-slate-700"} inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                              >
                                {conditionLabelMap[item.condition] ||
                                  item.condition}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-700">
                              {item.quantity}
                            </TableCell>
                            {index === 0 && (
                              <>
                                <TableCell
                                  rowSpan={allocation.items?.length || 1}
                                  className="text-slate-600"
                                >
                                  {new Date(
                                    allocation.createdAt,
                                  ).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell
                                  rowSpan={allocation.items?.length || 1}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleOpenAllocationDetail(allocation)
                                    }
                                    className="rounded-lg hover:bg-red-50 hover:text-red-700"
                                  >
                                    Chi tiết
                                  </Button>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        )),
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
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
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                variant="outline"
                className="rounded-lg border-red-200 text-red-700  hover:text-red-700"
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}

      {!selectedTeamId || !selectedEvent ? (
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6 text-center text-slate-600">
            {!selectedTeamId
              ? "Chọn đội trước"
              : "Vui lòng chọn một sự kiện để xem danh sách phân phối"}
          </CardContent>
        </Card>
      ) : null}

      {selectedAllocationDetail &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center overflow-y-auto bg-black/50 px-4 pt-0 pb-4">
            <div className="flex w-full max-w-2xl max-h-screen flex-col rounded-b-lg bg-white shadow-xl sm:rounded-lg">
              <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
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

              <div className="p-6 space-y-6 h-[550px] overflow-y-auto">
                {isAllocationDetailLoading && (
                  <div className="text-sm text-gray-500">
                    Đang tải chi tiết phân phối...
                  </div>
                )}

                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
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
                          {selectedAllocationDetail.team.teamSize ||
                            "(Không có)"}
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
                          {selectedAllocationDetail.createdBy.profile
                            ?.fullName ||
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
                        {selectedAllocationDetail.items?.map((item: any) => (
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

              <div className="shrink-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <Button
                  onClick={() => setSelectedAllocationDetail(null)}
                  variant="outline"
                  className="rounded-lg"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
