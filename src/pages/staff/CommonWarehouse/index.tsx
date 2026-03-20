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
import { Receipt, StockItem } from "@/types/warehouse";
import { warehouseApi } from "@/service/warehouse/api";
import { warehouseApi as warehouseApiNew } from "@/apis/warehouseApi";
import { TeamSelectorDropdown } from "@/components/ui/TeamSelectorDropdown";

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

const truncateText = (
  value: string | null | undefined,
  length: number,
): string => {
  if (!value) return "N/A";
  return value.length > length ? `${value.slice(0, length)}...` : value;
};

export default function CommonWarehouse() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"stocks" | "receipts">("stocks");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceiptDetail, setSelectedReceiptDetail] =
    useState<Receipt | null>(null);
  const [isReceiptDetailLoading, setIsReceiptDetailLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [showDistributeForm, setShowDistributeForm] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  useEffect(() => {
    if (activeTab === "stocks") {
      fetchStocks();
    } else {
      fetchReceipts();
    }
  }, [page, activeTab]);

  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      const response = await warehouseApi.getStocks(page, 10);
      if (response.success) {
        setStocks(response.data.data);
        setTotalPages(response.data.meta.pages);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách tồn kho");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const response = await warehouseApi.getReceipts(page, 10);
      if (response.success) {
        setReceipts(response.data.data);
        setTotalPages(response.data.meta.pages);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách kho");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReceipts = receipts.filter((receipt) => {
    const searchLower = searchQuery.toLowerCase();
    const donationMatch = receipt.donationId
      ?.toLowerCase()
      .includes(searchLower);
    const itemsMatch =
      receipt.items?.some((item) =>
        item.category?.name?.toLowerCase().includes(searchLower),
      ) || false;
    return donationMatch || itemsMatch;
  });

  const filteredStocks = stocks.filter((stock) => {
    const searchLower = searchQuery.toLowerCase();
    const categoryMatch = stock.category?.name
      ?.toLowerCase()
      .includes(searchLower);
    return categoryMatch;
  });

  const handleOpenReceiptDetail = async (receipt: Receipt) => {
    setSelectedReceiptDetail(receipt);
    setIsReceiptDetailLoading(true);
    try {
      const response = await warehouseApiNew.getReceipt(receipt.id);
      if (response.success) {
        setSelectedReceiptDetail(response.data as Receipt);
      } else {
        toast.error("Không thể tải chi tiết phiếu nhập");
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết phiếu nhập");
    } finally {
      setIsReceiptDetailLoading(false);
    }
  };

  const handleOpenDistributeDialog = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowDistributeForm(true);
    setSelectedTeamId("");
  };

  const handleDistribute = async (teamId: string) => {
    if (!selectedReceipt?.items || selectedReceipt.items.length === 0) {
      toast.error("Phiếu nhập không có sản phẩm để phân phối");
      return;
    }

    setIsDistributing(true);
    try {
      // Map receipt items to allocation items format
      const items = selectedReceipt.items.map((item) => ({
        category: item.category?.name || item.categoryId,
        condition: item.condition as any,
        quantity: item.quantity,
      }));

      await warehouseApiNew.createAllocation({
        teamId,
        donationId: selectedReceipt.donationId,
        eventId: selectedReceipt.donation?.eventId,
        items,
      });

      toast.success("Phân phối sản phẩm thành công!");
      setShowDistributeForm(false);
      setSelectedReceipt(null);
      setSelectedTeamId("");

      // Refresh receipts
      fetchReceipts();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Không thể phân phối sản phẩm. Vui lòng thử lại.",
      );
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-red-50/30 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Quản lý kho chung
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Tồn kho và lịch sử phiếu nhập từ donation
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setActiveTab("stocks");
                setPage(1);
              }}
              className={`min-w-[150px] rounded-xl border px-5 py-2 text-sm font-bold tracking-wide transition-all duration-200 ${
                activeTab === "stocks"
                  ? "border-red-600 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-[0_12px_26px_-14px_rgba(220,38,38,0.9)]"
                  : "border-red-300 bg-gradient-to-r from-red-50 to-rose-100 text-red-700 hover:border-red-400 hover:from-red-100 hover:to-rose-200"
              }`}
            >
              Tồn kho
            </Button>
            <Button
              onClick={() => {
                setActiveTab("receipts");
                setPage(1);
              }}
              className={`min-w-[150px] rounded-xl border px-5 py-2 text-sm font-bold tracking-wide transition-all duration-200 ${
                activeTab === "receipts"
                  ? "border-red-600 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-[0_12px_26px_-14px_rgba(220,38,38,0.9)]"
                  : "border-red-300 bg-gradient-to-r from-red-50 to-rose-100 text-red-700 hover:border-red-400 hover:from-red-100 hover:to-rose-200"
              }`}
            >
              Lịch sử nhập kho
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder={
              activeTab === "stocks"
                ? "Tìm theo danh mục..."
                : "Tìm theo donationId hoặc danh mục..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md rounded-xl border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0"
          />
        </CardContent>
      </Card>

      {activeTab === "stocks" ? (
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Tồn kho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border-none">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-slate-50/80">
                    <TableHead className="text-slate-600">Danh mục</TableHead>
                    <TableHead className="text-slate-600">Tình trạng</TableHead>
                    <TableHead className="text-slate-600">Số lượng</TableHead>
                    <TableHead className="text-slate-600">Cập nhật</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : filteredStocks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-slate-600"
                      >
                        {searchQuery
                          ? "Không tìm thấy kết quả"
                          : "Chưa có dữ liệu tồn kho"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStocks.map((stock) => (
                      <TableRow
                        key={stock.id}
                        className="transition-all duration-200 hover:bg-slate-50/80"
                      >
                        <TableCell className="font-semibold text-slate-900">
                          {stock.category?.name || "Chưa phân loại"}
                        </TableCell>
                        <TableCell>
                          <div
                            className={`${conditionClassMap[stock.condition] || "bg-slate-100 text-slate-700"} inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                          >
                            {conditionLabelMap[stock.condition] ||
                              stock.condition}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {stock.quantity}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(stock.updatedAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Lịch sử nhập kho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border-none">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-slate-50/80">
                    <TableHead className="text-slate-600">Mã phiếu</TableHead>
                    <TableHead className="text-slate-600">
                      Donation ID
                    </TableHead>
                    <TableHead className="text-slate-600">Ngày nhập</TableHead>
                    <TableHead className="text-slate-600">Sản phẩm</TableHead>
                    <TableHead className="text-slate-600">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : filteredReceipts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-slate-600"
                      >
                        {searchQuery
                          ? "Không tìm thấy kết quả"
                          : "Chưa có lịch sử nhập kho"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReceipts.map((receipt) => (
                      <TableRow
                        key={receipt.id}
                        className="transition-all duration-200 hover:bg-slate-50/80"
                      >
                        <TableCell className="font-semibold text-slate-900">
                          {truncateText(receipt.id, 8)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {truncateText(receipt.donationId, 12)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(receipt.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {receipt.items?.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="font-semibold text-slate-900">
                                  {item.category?.name || "Chưa phân loại"}
                                </span>
                                <span className="text-slate-600">
                                  × {item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReceiptDetail(receipt)}
                              className="rounded-lg hover:bg-red-50 hover:text-red-700 "
                            >
                              Chi tiết
                            </Button>
                            {receipt.donation?.status === "RECEIVED" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleOpenDistributeDialog(receipt)
                                }
                              >
                                Phân phối
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

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

      {showDistributeForm && selectedReceipt && (
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Phân phối sản phẩm</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Mã phiếu: {truncateText(selectedReceipt.id, 12)} • Donation ID:{" "}
              {truncateText(selectedReceipt.donationId, 12)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Chọn đội cứu hộ
              </label>
              <TeamSelectorDropdown
                value={selectedTeamId}
                onChange={(teamId) => setSelectedTeamId(teamId)}
                disabled={isDistributing}
              />
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase text-red-700">
                Sản phẩm sẽ được phân phối
              </p>
              <div className="space-y-2">
                {selectedReceipt.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {item.category?.name || "Chưa phân loại"}
                      </span>
                      <div
                        className={`ml-2 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${conditionClassMap[item.condition] || "bg-slate-100 text-slate-700"}`}
                      >
                        {conditionLabelMap[item.condition] || item.condition}
                      </div>
                    </div>
                    <span className="font-semibold">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDistributeForm(false);
                  setSelectedReceipt(null);
                  setSelectedTeamId("");
                }}
                disabled={isDistributing}
                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
              >
                Hủy
              </Button>
              <Button
                onClick={() => handleDistribute(selectedTeamId)}
                disabled={!selectedTeamId || isDistributing}
                className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800"
              >
                {isDistributing ? "Đang phân phối..." : "Xác nhận phân phối"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReceiptDetail &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết phiếu nhập
                </h2>
                <button
                  onClick={() => setSelectedReceiptDetail(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {isReceiptDetailLoading && (
                  <div className="text-sm text-gray-500">
                    Đang tải chi tiết phiếu nhập...
                  </div>
                )}

                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Mã phiếu</p>
                      <p className="font-mono text-sm font-semibold text-gray-900 mt-1">
                        {truncateText(selectedReceiptDetail.id, 12)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Donation ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-900 mt-1">
                        {truncateText(selectedReceiptDetail.donationId, 12)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày nhập</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {new Date(
                          selectedReceiptDetail.createdAt,
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedReceiptDetail.createdBy && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Người tạo phiếu
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Họ tên</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {selectedReceiptDetail.createdBy.profile?.fullName ||
                            selectedReceiptDetail.createdBy.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {selectedReceiptDetail.createdBy.email}
                        </p>
                      </div>
                      {selectedReceiptDetail.createdBy.profile?.address && (
                        <div>
                          <p className="text-sm text-gray-600">Địa chỉ</p>
                          <p className="font-semibold text-gray-900 mt-1">
                            {selectedReceiptDetail.createdBy.profile.address}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Chức vụ</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {selectedReceiptDetail.createdBy.role}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReceiptDetail.donation && (
                  <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Thông tin quyên góp
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Trạng thái</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {selectedReceiptDetail.donation.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Ghi chú</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {selectedReceiptDetail.donation.note || "(Không có)"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Vật phẩm nhập ({selectedReceiptDetail.items?.length || 0})
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
                        {selectedReceiptDetail.items?.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {item.category?.name || item.categoryId}
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
                  onClick={() => setSelectedReceiptDetail(null)}
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
