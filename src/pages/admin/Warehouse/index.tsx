import { useState, useEffect } from "react";
import { Package, FileText, Eye } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { warehouseApi } from "../../../service/warehouse/api";
import { formatDate } from "../../../lib/utils";
import { toast } from "sonner";

type Tab = "stocks" | "receipts";

export default function Warehouse() {
  const [activeTab, setActiveTab] = useState<Tab>("stocks");
  const [stocks, setStocks] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [stockPage, setStockPage] = useState(1);
  const [receiptPage, setReceiptPage] = useState(1);

  // Dialog states
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchStocks();
    fetchReceipts();
  }, []);

  const fetchStocks = async () => {
    setIsLoadingStocks(true);
    try {
      const response = await warehouseApi.getStocks(stockPage, 20);
      console.log("Stocks response:", response);
      if (response.success && response.data) {
        setStocks(response.data.data || []);
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách tồn kho");
      console.error("Error fetching stocks:", error);
    } finally {
      setIsLoadingStocks(false);
    }
  };

  const fetchReceipts = async () => {
    setIsLoadingReceipts(true);
    try {
      const response = await warehouseApi.getReceipts(receiptPage, 20);
      console.log("Receipts response:", response);
      if (response.success && response.data) {
        setReceipts(response.data.data || []);
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách biên lai");
      console.error("Error fetching receipts:", error);
    } finally {
      setIsLoadingReceipts(false);
    }
  };

  const handleViewStockDetail = (stock: any) => {
    setSelectedStock(stock);
    setIsStockDialogOpen(true);
  };

  const handleViewReceiptDetail = async (receipt: any) => {
    setIsLoadingDetail(true);
    setIsReceiptDialogOpen(true);
    try {
      const response = await warehouseApi.getReceiptById(receipt.id);
      console.log("Receipt detail response:", response);
      if (response.success && response.data) {
        setSelectedReceipt(response.data);
      } else {
        setSelectedReceipt(receipt);
      }
    } catch (error: any) {
      console.error("Error fetching receipt detail:", error);
      setSelectedReceipt(receipt);
      toast.error("Không thể tải chi tiết biên lai");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getConditionBadge = (condition: string) => {
    const conditionColors: Record<string, string> = {
      EXCELLENT: "bg-green-100 text-green-800",
      GOOD: "bg-blue-100 text-blue-800",
      FAIR: "bg-yellow-100 text-yellow-800",
      POOR: "bg-red-100 text-red-800",
    };

    const conditionLabels: Record<string, string> = {
      EXCELLENT: "Xuất sắc",
      GOOD: "Tốt",
      FAIR: "Khá",
      POOR: "Kém",
    };

    return (
      <Badge
        className={conditionColors[condition] || "bg-gray-100 text-gray-800"}
      >
        {conditionLabels[condition] || condition}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Kho</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tồn kho và biên lai nhập kho
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
          <Package className="inline h-4 w-4 mr-2" />
          Tồn kho
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
            {isLoadingStocks ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : (stocks?.length || 0) > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Tình trạng</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Cập nhật lần cuối</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock: any) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-mono text-xs">
                        {stock.id?.substring(0, 8) || "N/A"}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {stock.category?.name || stock.categoryName || "-"}
                      </TableCell>
                      <TableCell>
                        {getConditionBadge(stock.condition || "GOOD")}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {stock.quantity || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        {stock.lastUpdated || stock.updatedAt
                          ? formatDate(stock.lastUpdated || stock.updatedAt)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewStockDetail(stock)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </TableCell>
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

      {/* Receipts Tab */}
      {activeTab === "receipts" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Biên lai nhập kho ({receipts?.length || 0})</CardTitle>
            <Button onClick={fetchReceipts} variant="outline" size="sm">
              Làm mới
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingReceipts ? (
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
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt: any) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-mono text-xs">
                        {receipt.id?.substring(0, 8) || "N/A"}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {receipt.donationId?.substring(0, 8) || "N/A"}...
                      </TableCell>
                      <TableCell>{receipt.donorName || "-"}</TableCell>
                      <TableCell>
                        {receipt.receivedAt
                          ? formatDate(receipt.receivedAt)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {receipt.createdAt
                          ? formatDate(receipt.createdAt)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewReceiptDetail(receipt)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </TableCell>
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

      {/* Stock Detail Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết tồn kho</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về sản phẩm trong kho
            </DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    ID
                  </p>
                  <p className="text-sm font-mono">{selectedStock.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Danh mục
                  </p>
                  <p className="text-sm">
                    {selectedStock.category?.name ||
                      selectedStock.categoryName ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Số lượng
                  </p>
                  <p className="text-lg font-semibold">
                    {selectedStock.quantity || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tình trạng
                  </p>
                  <div className="mt-1">
                    {getConditionBadge(selectedStock.condition || "GOOD")}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </p>
                  <p className="text-sm">
                    {selectedStock.createdAt
                      ? formatDate(selectedStock.createdAt)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Cập nhật lần cuối
                  </p>
                  <p className="text-sm">
                    {selectedStock.lastUpdated || selectedStock.updatedAt
                      ? formatDate(
                          selectedStock.lastUpdated || selectedStock.updatedAt,
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              {selectedStock.location && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vị trí
                  </p>
                  <p className="text-sm">{selectedStock.location}</p>
                </div>
              )}

              {selectedStock.note && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ghi chú
                  </p>
                  <p className="text-sm">{selectedStock.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Detail Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết biên lai nhập kho</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về biên lai nhập kho
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : selectedReceipt ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    ID Biên lai
                  </p>
                  <p className="text-sm font-mono">{selectedReceipt.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    ID Quyên góp
                  </p>
                  <p className="text-sm font-mono">
                    {selectedReceipt.donationId || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Người quyên góp
                  </p>
                  <p className="text-sm">{selectedReceipt.donorName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ngày nhận
                  </p>
                  <p className="text-sm">
                    {selectedReceipt.receivedAt
                      ? formatDate(selectedReceipt.receivedAt)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </p>
                  <p className="text-sm">
                    {selectedReceipt.createdAt
                      ? formatDate(selectedReceipt.createdAt)
                      : "-"}
                  </p>
                </div>
              </div>

              {selectedReceipt.items && selectedReceipt.items.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Danh sách sản phẩm ({selectedReceipt.items.length})
                  </p>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead>Danh mục</TableHead>
                          <TableHead>Số lượng</TableHead>
                          <TableHead>Đơn vị</TableHead>
                          <TableHead>Tình trạng</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedReceipt.items.map(
                          (item: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {item.name || "-"}
                              </TableCell>
                              <TableCell>
                                {item.category?.name || "-"}
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">
                                  {item.quantity || 0}
                                </span>
                              </TableCell>
                              <TableCell>{item.unit || "-"}</TableCell>
                              <TableCell>
                                {getConditionBadge(item.condition || "GOOD")}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {selectedReceipt.note && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ghi chú
                  </p>
                  <p className="text-sm">{selectedReceipt.note}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
