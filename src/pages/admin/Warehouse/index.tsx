import React, { useState } from "react";
import { Package, Download, Search, Filter } from "lucide-react";
import {
  mockWarehouseItems,
  mockWarehouseStats,
  mockEvents,
} from "../../../mocks/data";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { warehouseApi } from "../../../apis/warehouseApi";
import { formatDate } from "../../../lib/utils";
import { toast } from "sonner";

export default function Warehouse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Use mock data
  const stats = mockWarehouseStats;
  const activeEvents = mockEvents.filter((event) => event.status === "active");

  // Auto-select the latest event
  React.useEffect(() => {
    if (activeEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(activeEvents[0].id);
    }
  }, [activeEvents, selectedEventId]);

  const filteredItems = mockWarehouseItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesEvent = !selectedEventId || item.eventId === selectedEventId;
    return matchesSearch && matchesCategory && matchesEvent;
  });

  const itemsData = {
    data: {
      items: filteredItems,
      total: filteredItems.length,
    },
  };
  const isLoading = false;

  const handleExportExcel = async () => {
    toast.success("Xuất file Excel thành công! (Demo mode)");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Kho</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý vật phẩm cứu trợ và xuất báo cáo
          </p>
        </div>
        <Button onClick={handleExportExcel}>
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn sự kiện</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn sự kiện..." />
            </SelectTrigger>
            <SelectContent>
              {activeEvents.length > 0 ? (
                activeEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-events" disabled>
                  Không có sự kiện nào
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng mặt hàng</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Danh mục</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredItems.map((item) => item.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="Thực phẩm">Thực phẩm</SelectItem>
                <SelectItem value="Nước uống">Nước uống</SelectItem>
                <SelectItem value="Quần áo">Quần áo</SelectItem>
                <SelectItem value="Thuốc men">Thuốc men</SelectItem>
                <SelectItem value="Đồ dùng sinh hoạt">
                  Đồ dùng sinh hoạt
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách vật phẩm ({itemsData?.data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : itemsData?.data?.items && itemsData.data.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Tình trạng</TableHead>
                  <TableHead>Người quyên góp</TableHead>
                  <TableHead>Vị trí kho</TableHead>
                  <TableHead>Ngày nhận</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsData.data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.condition === "new" ? "success" : "default"
                        }
                      >
                        {item.condition === "new"
                          ? "Mới"
                          : item.condition === "used"
                            ? "Đã qua sử dụng"
                            : "Tân trang"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.donorName}</TableCell>
                    <TableCell>
                      {item.location && item.shelf
                        ? `${item.location} - ${item.shelf}`
                        : item.location || "-"}
                    </TableCell>
                    <TableCell>{formatDate(item.receivedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có vật phẩm nào trong kho
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
