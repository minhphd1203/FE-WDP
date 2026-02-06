import { useState, useEffect } from "react";
import { Plus, Truck, FileText, Box } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { CategorySelect } from "../../../components/ui/category-select";
import { useWarehouse } from "../../../hooks/useWarehouse";
import { formatDate } from "../../../lib/utils";
import { toast } from "sonner";
import { AllocationStatus, ItemCondition, AllocationItem } from "../../../types";

type Tab = "stocks" | "allocations" | "receipts";

export default function Warehouse() {
  const [activeTab, setActiveTab] = useState<Tab>("stocks");
  const [isCreateAllocationOpen, setIsCreateAllocationOpen] = useState(false);
  const [isCreateReceiptOpen, setIsCreateReceiptOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    stocks,
    allocations,
    receipts,
    isLoading,
    fetchStocks,
    fetchAllocations,
    fetchReceipts,
    createAllocation,
    updateAllocationStatus,
    createReceipt,
  } = useWarehouse();

  // Allocation form state
  const [allocationForm, setAllocationForm] = useState<{
    items: AllocationItem[];
  }>({
    items: [],
  });

  // Receipt form state
  const [receiptForm, setReceiptForm] = useState({
    donationId: "",
  });

  // Temporary item form for allocation
  const [tempItem, setTempItem] = useState<AllocationItem>({
    category: "",
    condition: ItemCondition.GOOD,
    quantity: 0,
  });

  useEffect(() => {
    fetchStocks();
    fetchAllocations();
    fetchReceipts();
  }, []);

  const handleAddItem = () => {
    if (!tempItem.category || tempItem.quantity <= 0) {
      toast.error("Vui lòng điền đầy đủ thông tin mặt hàng");
      return;
    }
    setAllocationForm({
      ...allocationForm,
      items: [...allocationForm.items, tempItem],
    });
    setTempItem({
      category: "",
      condition: ItemCondition.GOOD,
      quantity: 0,
    });
    toast.success("Đã thêm mặt hàng");
  };

  const handleRemoveItem = (index: number) => {
    setAllocationForm({
      ...allocationForm,
      items: allocationForm.items.filter((_, i) => i !== index),
    });
  };

  const handleCreateAllocation = async () => {
    if ((allocationForm.items?.length || 0) === 0) {
      toast.error("Vui lòng thêm ít nhất một mặt hàng");
      return;
    }

    try {
      await createAllocation(allocationForm);
      setIsCreateAllocationOpen(false);
      setAllocationForm({ items: [] });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCreateReceipt = async () => {
    if (!receiptForm.donationId) {
      toast.error("Vui lòng nhập ID quyên góp");
      return;
    }

    try {
      await createReceipt(receiptForm.donationId);
      setIsCreateReceiptOpen(false);
      setReceiptForm({ donationId: "" });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateStatus = async (id: string, status: AllocationStatus) => {
    try {
      await updateAllocationStatus(id, status);
    } catch (error) {
      // Error handled in hook
    }
  };

  const getStatusColor = (status: AllocationStatus) => {
    switch (status) {
      case AllocationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case AllocationStatus.IN_TRANSIT:
        return "bg-blue-100 text-blue-800";
      case AllocationStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case AllocationStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionBadge = (condition: ItemCondition) => {
    switch (condition) {
      case ItemCondition.EXCELLENT:
        return <Badge className="bg-green-100 text-green-800">Tuyệt vời</Badge>;
      case ItemCondition.GOOD:
        return <Badge className="bg-blue-100 text-blue-800">Tốt</Badge>;
      case ItemCondition.FAIR:
        return <Badge className="bg-yellow-100 text-yellow-800">Khá</Badge>;
      default:
        return <Badge>-</Badge>;
    }
  };

  const filteredAllocations =
    statusFilter === "all"
      ? (allocations || [])
      : (allocations || []).filter((a) => a.status === statusFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Kho</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tồn kho, phân bổ và biên lai nhập kho
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab("stocks")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "stocks"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Box className="inline h-4 w-4 mr-2" />
          Tồn kho
        </button>
        <button
          onClick={() => setActiveTab("allocations")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "allocations"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck className="inline h-4 w-4 mr-2" />
          Phân bổ
        </button>
        <button
          onClick={() => setActiveTab("receipts")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "receipts"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="inline h-4 w-4 mr-2" />
          Biên lai nhập kho
        </button>
      </div>

      {/* Stocks Tab */}
      {activeTab === "stocks" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tồn kho ({stocks?.length || 0})</CardTitle>
            <Button onClick={fetchStocks} variant="outline" size="sm">
              Làm mới
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : (stocks?.length || 0) > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Tình trạng</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Cập nhật lần cuối</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stocks || []).map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">
                        {stock.category}
                      </TableCell>
                      <TableCell>{getConditionBadge(stock.condition)}</TableCell>
                      <TableCell>
                        <span className="font-semibold">{stock.quantity}</span>
                      </TableCell>
                      <TableCell>{formatDate(stock.lastUpdated)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Không có dữ liệu tồn kho
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Allocations Tab */}
      {activeTab === "allocations" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value={AllocationStatus.PENDING}>
                        Đang chờ
                      </SelectItem>
                      <SelectItem value={AllocationStatus.IN_TRANSIT}>
                        Đang vận chuyển
                      </SelectItem>
                      <SelectItem value={AllocationStatus.DELIVERED}>
                        Đã giao
                      </SelectItem>
                      <SelectItem value={AllocationStatus.CANCELLED}>
                        Đã hủy
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog
                  open={isCreateAllocationOpen}
                  onOpenChange={setIsCreateAllocationOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo phân bổ mới
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tạo phân bổ mới</DialogTitle>
                      <DialogDescription>
                        Tạo phân bổ vật phẩm cho đội cứu trợ
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Thêm mặt hàng</Label>
                        <div className="grid grid-cols-4 gap-2">
                          <CategorySelect
                            value={tempItem.category}
                            onValueChange={(value) =>
                              setTempItem({ ...tempItem, category: value })
                            }
                            placeholder="Chọn danh mục..."
                          />
                          <Select
                            value={tempItem.condition}
                            onValueChange={(value: ItemCondition) =>
                              setTempItem({ ...tempItem, condition: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ItemCondition.EXCELLENT}>
                                Tuyệt vời
                              </SelectItem>
                              <SelectItem value={ItemCondition.GOOD}>Tốt</SelectItem>
                              <SelectItem value={ItemCondition.FAIR}>Khá</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="Số lượng"
                            value={tempItem.quantity || ""}
                            onChange={(e) =>
                              setTempItem({
                                ...tempItem,
                                quantity: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                          <Button onClick={handleAddItem} type="button">
                            Thêm
                          </Button>
                        </div>
                      </div>

                      {(allocationForm.items?.length || 0) > 0 && (
                        <div className="space-y-2">
                          <Label>Danh sách mặt hàng</Label>
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Danh mục</TableHead>
                                  <TableHead>Tình trạng</TableHead>
                                  <TableHead>Số lượng</TableHead>
                                  <TableHead></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(allocationForm.items || []).map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>
                                      {getConditionBadge(item.condition)}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemoveItem(index)}
                                      >
                                        Xóa
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateAllocationOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button onClick={handleCreateAllocation} disabled={isLoading}>
                        Tạo phân bổ
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Danh sách phân bổ ({filteredAllocations?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : (filteredAllocations?.length || 0) > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Đội</TableHead>
                      <TableHead>Số mặt hàng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(filteredAllocations || []).map((allocation) => (
                      <TableRow key={allocation.id}>
                        <TableCell className="font-mono text-xs">
                          {allocation.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {allocation.teamName || allocation.teamId}
                        </TableCell>
                        <TableCell>{allocation.items?.length || 0}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(allocation.status)}>
                            {allocation.status === AllocationStatus.PENDING
                              ? "Đang chờ"
                              : allocation.status === AllocationStatus.IN_TRANSIT
                                ? "Đang vận chuyển"
                                : allocation.status === AllocationStatus.DELIVERED
                                  ? "Đã giao"
                                  : "Đã hủy"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(allocation.createdAt)}</TableCell>
                        <TableCell>
                          {allocation.status === AllocationStatus.PENDING && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(
                                    allocation.id,
                                    AllocationStatus.IN_TRANSIT
                                  )
                                }
                              >
                                Vận chuyển
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleUpdateStatus(
                                    allocation.id,
                                    AllocationStatus.CANCELLED
                                  )
                                }
                              >
                                Hủy
                              </Button>
                            </div>
                          )}
                          {allocation.status === AllocationStatus.IN_TRANSIT && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(
                                  allocation.id,
                                  AllocationStatus.DELIVERED
                                )
                              }
                            >
                              Đã giao
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Không có phân bổ nào
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Receipts Tab */}
      {activeTab === "receipts" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Biên lai nhập kho ({receipts?.length || 0})</CardTitle>
            <Dialog
              open={isCreateReceiptOpen}
              onOpenChange={setIsCreateReceiptOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo biên lai mới
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo biên lai nhập kho</DialogTitle>
                  <DialogDescription>
                    Tạo biên lai từ quyên góp đã được phê duyệt
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="donationId">ID quyên góp</Label>
                    <Input
                      id="donationId"
                      placeholder="550e8400-e29b-41d4-a716-446655440000"
                      value={receiptForm.donationId}
                      onChange={(e) =>
                        setReceiptForm({ donationId: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateReceiptOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleCreateReceipt} disabled={isLoading}>
                    Tạo biên lai
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : (receipts?.length || 0) > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>ID quyên góp</TableHead>
                    <TableHead>Người quyên góp</TableHead>
                    <TableHead>Ngày nhận</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(receipts || []).map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-mono text-xs">
                        {receipt.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {receipt.donationId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{receipt.donorName || "-"}</TableCell>
                      <TableCell>{formatDate(receipt.receivedAt)}</TableCell>
                      <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Không có biên lai nào
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
