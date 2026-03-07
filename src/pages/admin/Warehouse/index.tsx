import { useState, useEffect } from "react";
import { Package, FileText, Eye, RefreshCw } from "lucide-react";
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

const viewButtonClass =
  "h-9 rounded-lg border border-red-300 bg-white text-red-700 text-sm font-medium transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-700 disabled:border-red-200 disabled:bg-red-50 disabled:text-red-300";

export default function Warehouse() {
  const [activeTab, setActiveTab] = useState<Tab>("stocks");
  const [stocks, setStocks] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);

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
      const response = await warehouseApi.getStocks(1, 20);
      if (response.success && response.data) {
        setStocks(response.data.data || []);
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách tồn kho");
    } finally {
      setIsLoadingStocks(false);
    }
  };

  const fetchReceipts = async () => {
    setIsLoadingReceipts(true);
    try {
      const response = await warehouseApi.getReceipts(1, 20);
      if (response.success && response.data) {
        setReceipts(response.data.data || []);
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách biên lai");
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
      if (response.success && response.data) {
        setSelectedReceipt(response.data);
      } else {
        setSelectedReceipt(receipt);
      }
    } catch (error: any) {
      setSelectedReceipt(receipt);
      toast.error("Không thể tải chi tiết biên lai");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getConditionBadge = (condition: string) => {
    const conditionColors: Record<string, string> = {
      EXCELLENT: "bg-emerald-100 text-emerald-800",
      GOOD: "bg-cyan-100 text-cyan-800",
      FAIR: "bg-amber-100 text-amber-800",
      POOR: "bg-rose-100 text-rose-800",
    };

    const conditionLabels: Record<string, string> = {
      EXCELLENT: "Xuất sắc",
      GOOD: "Tốt",
      FAIR: "Khá",
      POOR: "Kém",
    };

    return (
      <Badge
        className={conditionColors[condition] || "bg-slate-100 text-slate-800"}
      >
        {conditionLabels[condition] || condition}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kho</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tồn kho và biên lai nhập kho
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-red-100">
        <button
          onClick={() => setActiveTab("stocks")}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === "stocks"
              ? "border-b-2 border-red-600 text-red-700"
              : "text-muted-foreground hover:text-slate-900"
          }`}
        >
          <Package className="h-4 w-4" />
          Tồn kho
        </button>
        <button
          onClick={() => setActiveTab("receipts")}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === "receipts"
              ? "border-b-2 border-red-600 text-red-700"
              : "text-muted-foreground hover:text-slate-900"
          }`}
        >
          <FileText className="h-4 w-4" />
          Biên lai nhập kho
        </button>
      </div>

      {/* Stocks Tab */}
      {activeTab === "stocks" && (
        <Card className="border-red-100">
          <CardHeader className="flex flex-row items-center justify-between border-b border-red-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">
              Tồn kho ({stocks?.length || 0})
            </CardTitle>
            <Button
              onClick={fetchStocks}
              variant="outline"
              size="sm"
              className="h-9 rounded-lg border-red-300 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingStocks ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : (stocks?.length || 0) > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-center">Tình trạng</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead className="text-center">
                      Cập nhật lần cuối
                    </TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock: any) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">
                        {stock.category?.name || stock.categoryName || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {getConditionBadge(stock.condition || "GOOD")}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">
                          {stock.quantity || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {stock.lastUpdated || stock.updatedAt
                          ? formatDate(stock.lastUpdated || stock.updatedAt)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className={viewButtonClass}
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
        <Card className="border-red-100">
          <CardHeader className="flex flex-row items-center justify-between border-b border-red-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">
              Biên lai nhập kho ({receipts?.length || 0})
            </CardTitle>
            <Button
              onClick={fetchReceipts}
              variant="outline"
              size="sm"
              className="h-9 rounded-lg border-red-300 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingReceipts ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : (receipts?.length || 0) > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">
                      Người quyên góp
                    </TableHead>
                    <TableHead className="text-center">Ngày nhận</TableHead>
                    <TableHead className="text-center">Ngày tạo</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt: any) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="text-center">
                        {receipt.donorName || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {receipt.receivedAt
                          ? formatDate(receipt.receivedAt)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {receipt.createdAt
                          ? formatDate(receipt.createdAt)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          className={viewButtonClass}
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
        <DialogContent className="max-w-2xl rounded-3xl border-2 border-red-100 bg-gradient-to-br from-white to-red-50/30">
          <DialogHeader className="border-b border-red-100 pb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Chi tiết tồn kho
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về sản phẩm trong kho
            </DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">ID</p>
                  <p className="text-sm font-mono font-semibold mt-1">
                    {selectedStock.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Danh mục</p>
                  <p className="text-sm font-semibold mt-1">
                    {selectedStock.category?.name ||
                      selectedStock.categoryName ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Số lượng</p>
                  <p className="text-lg font-bold text-red-700 mt-1">
                    {selectedStock.quantity || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Tình trạng
                  </p>
                  <div className="mt-1">
                    {getConditionBadge(selectedStock.condition || "GOOD")}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Ngày tạo</p>
                  <p className="text-sm mt-1">
                    {selectedStock.createdAt
                      ? formatDate(selectedStock.createdAt)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Cập nhật lần cuối
                  </p>
                  <p className="text-sm mt-1">
                    {selectedStock.lastUpdated || selectedStock.updatedAt
                      ? formatDate(
                          selectedStock.lastUpdated || selectedStock.updatedAt,
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              {selectedStock.location && (
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                  <p className="text-sm font-medium text-slate-600">Vị trí</p>
                  <p className="text-sm mt-1">{selectedStock.location}</p>
                </div>
              )}

              {selectedStock.note && (
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                  <p className="text-sm font-medium text-slate-600">Ghi chú</p>
                  <p className="text-sm mt-1">{selectedStock.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Detail Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-3xl border-2 border-red-100 bg-gradient-to-br from-white to-red-50/30">
          <DialogHeader className="border-b border-red-100 pb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Chi tiết biên lai nhập kho
            </DialogTitle>
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
                  <p className="text-sm font-medium text-slate-600">
                    ID Biên lai
                  </p>
                  <p className="text-sm font-mono font-semibold mt-1">
                    {selectedReceipt.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    ID Quyên góp
                  </p>
                  <p className="text-sm font-mono font-semibold mt-1">
                    {selectedReceipt.donationId || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Người quyên góp
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {selectedReceipt.donorName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Ngày nhận
                  </p>
                  <p className="text-sm mt-1">
                    {selectedReceipt.receivedAt
                      ? formatDate(selectedReceipt.receivedAt)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Ngày tạo</p>
                  <p className="text-sm mt-1">
                    {selectedReceipt.createdAt
                      ? formatDate(selectedReceipt.createdAt)
                      : "-"}
                  </p>
                </div>
              </div>

              {selectedReceipt.items && selectedReceipt.items.length > 0 && (
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                  <p className="text-sm font-bold text-slate-900 mb-3">
                    Danh sách sản phẩm ({selectedReceipt.items.length})
                  </p>
                  <div className="border border-red-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red-50/50">
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
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                  <p className="text-sm font-medium text-slate-600">Ghi chú</p>
                  <p className="text-sm mt-1">{selectedReceipt.note}</p>
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
