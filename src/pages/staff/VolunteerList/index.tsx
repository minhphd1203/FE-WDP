import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Download } from "lucide-react";
import { volunteerApi } from "../../../apis/volunteerApi";
import { eventService } from "../../../service/event/api";
import { VolunteerRegistration } from "../../../types/volunteer";
import { EventData } from "../../../types/event";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { CustomSelect } from "../../../components/ui/CustomSelect";
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

export default function VolunteerList() {
  const [volunteers, setVolunteers] = useState<VolunteerRegistration[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchVolunteers();
    }
  }, [page, selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getEvents({
        status: "OPEN",
        type: "VOLUNTEER",
      });
      if (response.success) {
        const eventsList = response.data.data;
        setEvents(eventsList);
        if (eventsList.length > 0) {
          setSelectedEvent(eventsList[0]);
        }
      }
    } catch (error) {
      toast.error("Không thể tải danh sách sự kiện");
    }
  };

  const fetchVolunteers = async () => {
    if (!selectedEvent) return;

    setIsLoading(true);
    try {
      const response = await volunteerApi.getEventVolunteers(
        selectedEvent.id,
        page,
        10,
      );
      if (response.success) {
        setVolunteers(response.data.data);
        setTotalPages(response.data.meta.pages);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách tình nguyện viên");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const fullName = volunteer.account?.profile?.fullName || "";
    const email = volunteer.account?.email || "";
    const phone = volunteer.account?.phone || "";
    const searchLower = searchQuery.toLowerCase();

    return (
      fullName.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      phone.toLowerCase().includes(searchLower)
    );
  });

  const handleExportExcel = async () => {
    if (!selectedEvent) {
      toast.error("Vui lòng chọn sự kiện trước khi xuất Excel");
      return;
    }

    setIsExporting(true);

    try {
      const { blob, fileName } =
        await volunteerApi.exportEventVolunteersExcel(selectedEvent.id);
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = downloadUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Xuất file Excel thành công");
    } catch (error) {
      toast.error("Không thể xuất file Excel tình nguyện viên");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-red-50/30 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Danh sách tình nguyện viên
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Quản lý người đăng ký tham gia hoạt động cứu trợ
          </p>
        </div>
        <Button
          onClick={() => void handleExportExcel()}
          disabled={!selectedEvent || isExporting}
          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Đang xuất Excel..." : "Export Excel"}
        </Button>
      </div>

      {/* Event Selector */}
      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">Chọn sự kiện</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomSelect
            options={events.map((event) => ({
              value: event.id,
              label: `${event.title} - ${new Date(event.startDate).toLocaleDateString("vi-VN")}`,
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

      {/* Search */}
      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md rounded-xl border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
          />
        </CardContent>
      </Card>

      {/* Volunteers Table */}
      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">
            Danh sách tình nguyện viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border-none">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-slate-50/80">
                  <TableHead className="text-slate-600">
                    Tình nguyện viên
                  </TableHead>
                  <TableHead className="text-slate-600 text-center">
                    Thông tin liên hệ
                  </TableHead>
                  <TableHead className="text-slate-600 text-center">
                    Địa chỉ
                  </TableHead>
                  <TableHead className="text-slate-600 text-center">
                    Ngày đăng ký
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredVolunteers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-slate-600"
                    >
                      {searchQuery
                        ? "Không tìm thấy kết quả"
                        : "Chưa có tình nguyện viên đăng ký"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVolunteers.map((volunteer) => (
                    <TableRow
                      key={volunteer.id}
                      className="transition-all duration-200 hover:bg-slate-50/80"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {volunteer.account?.profile?.avatarUrl ? (
                            <img
                              src={volunteer.account.profile.avatarUrl}
                              alt={volunteer.account.profile.fullName}
                              className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-slate-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">
                              {volunteer.account?.profile?.fullName ||
                                "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-500" />
                            {volunteer.account?.email || "N/A"}
                          </p>
                          {volunteer.account?.phone && (
                            <p className="text-sm flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-500" />
                              {volunteer.account.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        <p className="text-sm flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          {volunteer.account?.profile?.address ||
                            "Chưa cập nhật"}
                        </p>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        <p className="text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          {new Date(volunteer.registeredAt).toLocaleDateString(
                            "vi-VN",
                          )}{" "}
                          {new Date(volunteer.registeredAt).toLocaleTimeString(
                            "vi-VN",
                          )}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
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
    </div>
  );
}
