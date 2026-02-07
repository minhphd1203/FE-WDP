import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { volunteerApi } from "../../../apis/volunteerApi";
import { eventService } from "../../../service/event/api";
import { VolunteerRegistration } from "../../../types/volunteer";
import { EventData } from "../../../types/event";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { toast } from "sonner";

export default function VolunteerList() {
  const [volunteers, setVolunteers] = useState<VolunteerRegistration[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Danh sách tình nguyện viên
        </h1>
        <p className="text-gray-500">
          Quản lý người đăng ký tham gia hoạt động cứu trợ
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
              setPage(1);
            }
          }}
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} -{" "}
              {new Date(event.startDate).toLocaleDateString("vi-VN")}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <Input
          type="text"
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Volunteers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Tình nguyện viên
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Thông tin liên hệ
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Địa chỉ
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Ngày đăng ký
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : filteredVolunteers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  {searchQuery
                    ? "Không tìm thấy kết quả"
                    : "Chưa có tình nguyện viên đăng ký"}
                </td>
              </tr>
            ) : (
              filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {volunteer.account?.profile?.avatarUrl ? (
                        <img
                          src={volunteer.account.profile.avatarUrl}
                          alt={volunteer.account.profile.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {volunteer.account?.profile?.fullName ||
                            "Chưa cập nhật"}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {volunteer.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {volunteer.account?.email || "N/A"}
                      </p>
                      {volunteer.account?.phone && (
                        <p className="text-sm flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {volunteer.account.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {volunteer.account?.profile?.address || "Chưa cập nhật"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(volunteer.registeredAt).toLocaleDateString(
                        "vi-VN",
                      )}{" "}
                      {new Date(volunteer.registeredAt).toLocaleTimeString(
                        "vi-VN",
                      )}
                    </p>
                  </td>
                </tr>
              ))
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
