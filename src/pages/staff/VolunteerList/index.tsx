import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { volunteerService } from "../../../service/volunteer/api";
import { VolunteerRegistration } from "../../../types/volunteer";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";

export default function VolunteerList() {
  const [volunteers, setVolunteers] = useState<VolunteerRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  useEffect(() => {
    fetchVolunteers();
  }, [page, statusFilter]);

  const fetchVolunteers = async () => {
    setIsLoading(true);
    try {
      const response = await volunteerService.getRegistrations(
        page,
        20,
        statusFilter,
      );
      if (response.success) {
        setVolunteers(response.data.items);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách tình nguyện viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    try {
      await volunteerService.approveRegistration({ registrationId });
      toast.success("Phê duyệt tình nguyện viên thành công!");
      fetchVolunteers();
    } catch (error) {
      toast.error("Lỗi khi phê duyệt");
    }
  };

  const handleReject = async (registrationId: string) => {
    const reason = prompt("Nhập lý do từ chối (nếu có):");
    try {
      await volunteerService.rejectRegistration({
        registrationId,
        rejectionReason: reason || undefined,
      });
      toast.success("Từ chối tình nguyện viên thành công!");
      fetchVolunteers();
    } catch (error) {
      toast.error("Lỗi khi từ chối");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            Đã phê duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
            Đã từ chối
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            Chờ phê duyệt
          </span>
        );
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Danh sách tình nguyện viên
        </h1>
        <p className="text-gray-500">
          Quản lý các đơn đăng kí tham gia cứu trợ
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6 flex border-b">
        {["pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              statusFilter === status
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {status === "pending"
              ? "Chờ phê duyệt"
              : status === "approved"
                ? "Đã phê duyệt"
                : "Đã từ chối"}
          </button>
        ))}
      </div>

      {/* Volunteers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Số điện thoại
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Ngày đăng kí
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : volunteers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Không có tình nguyện viên
                </td>
              </tr>
            ) : (
              volunteers.map((volunteer) => (
                <tr key={volunteer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {volunteer.userName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {volunteer.userEmail}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {volunteer.userPhone || "---"}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(volunteer.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(volunteer.registeredAt).toLocaleDateString(
                      "vi-VN",
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {volunteer.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(volunteer.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Phê duyệt
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(volunteer.id)}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Từ chối
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">---</span>
                    )}
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
