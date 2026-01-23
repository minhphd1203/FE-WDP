import React, { useState } from "react";
import { Search, MapPin, AlertTriangle } from "lucide-react";
import { mockReliefRequests, mockEvents } from "../../../mocks/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { reliefRequestApi } from "../../../apis/reliefRequestApi";
import { ReliefRequest } from "../../../types";
import { URGENCY_COLORS, STATUS_COLORS } from "../../../constants";
import { getStatusLabel, getUrgencyLabel } from "../../../lib/utils";
import { toast } from "sonner";

export default function ReliefRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(
    null,
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignTeamId, setAssignTeamId] = useState("");
  const [requests, setRequests] = useState<ReliefRequest[]>(mockReliefRequests);

  // Lọc các sự kiện đang hoạt động (active)
  const activeEvents = mockEvents.filter((event) => event.status === "active");

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location.address
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesUrgency =
      urgencyFilter === "all" || request.urgency === urgencyFilter;
    const matchesEvent =
      eventFilter === "all" || request.eventId === eventFilter;
    return matchesSearch && matchesStatus && matchesUrgency && matchesEvent;
  });

  const requestsData = {
    data: {
      items: filteredRequests,
      total: filteredRequests.length,
    },
  };
  const isLoading = false;

  const handleAssignTeam = () => {
    if (!selectedRequest || !assignTeamId) return;

    setRequests(
      requests.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,
              assignedTeamId: assignTeamId,
              assignedTeamName: `Đội cứu trợ ${assignTeamId.replace("team", "")}`,
              status: "approved" as any,
              assignedAt: new Date().toISOString(),
            }
          : req,
      ),
    );

    toast.success("Phân công đội cứu trợ thành công!");
    setIsAssignDialogOpen(false);
    setSelectedRequest(null);
    setAssignTeamId("");
  };

  const handleUpdateStatus = (id: string, status: string) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: status as any } : req,
      ),
    );
    toast.success("Cập nhật trạng thái thành công!");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đơn Yêu Cầu Cứu Hộ</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và xử lý các yêu cầu cứu hộ từ người dân
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề, địa chỉ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Chọn sự kiện" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả sự kiện</SelectItem>
                {activeEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Mức độ khẩn cấp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="critical">Khẩn cấp</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="low">Thấp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách đơn yêu cầu ({requestsData?.data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : requestsData?.data?.items &&
            requestsData.data.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Người yêu cầu</TableHead>
                  <TableHead>Sự kiện</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đội cứu trợ</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestsData.data.items.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 mt-1 ${
                            request.urgency === "critical"
                              ? "text-red-600"
                              : request.urgency === "high"
                                ? "text-orange-600"
                                : "text-yellow-600"
                          }`}
                        />
                        <span className="line-clamp-2">{request.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.requesterName}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.requesterPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      {request.eventName ? (
                        <span className="text-sm line-clamp-2">
                          {request.eventName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Không thuộc sự kiện
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm line-clamp-2">
                          {request.location.address}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={URGENCY_COLORS[request.urgency]}>
                        {getUrgencyLabel(request.urgency)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[request.status]}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.assignedTeamName || (
                        <span className="text-muted-foreground text-sm">
                          Chưa phân công
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!request.assignedTeamId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            Phân công
                          </Button>
                        )}
                        {request.status === "pending" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(request.id, "approved")
                            }
                          >
                            Duyệt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có đơn yêu cầu nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Team Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phân công đội cứu trợ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Đơn yêu cầu: <strong>{selectedRequest?.title}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Địa điểm: {selectedRequest?.location.address}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamId">Chọn đội cứu trợ *</Label>
              <Select value={assignTeamId} onValueChange={setAssignTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đội" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1">Đội cứu trợ 1 - Hà Nội</SelectItem>
                  <SelectItem value="team2">
                    Đội cứu trợ 2 - Hải Phòng
                  </SelectItem>
                  <SelectItem value="team3">
                    Đội cứu trợ 3 - Quảng Ninh
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setSelectedRequest(null);
                setAssignTeamId("");
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleAssignTeam} disabled={!assignTeamId}>
              Phân công
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
