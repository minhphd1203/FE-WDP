import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
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
  EXCELLENT: "bg-green-100 text-green-800",
  GOOD: "bg-blue-100 text-blue-800",
  FAIR: "bg-yellow-100 text-yellow-800",
  POOR: "bg-red-100 text-red-800",
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
    <div className="p-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Quản lý kho chung
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Tồn kho và lịch sử phiếu nhập từ donation
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm mb-6 border-2 border-gray-100 overflow-hidden flex">
        <button
          onClick={() => {
            setActiveTab("stocks");
            setPage(1);
          }}
          className={`flex-1 px-6 py-4 text-sm font-semibold border-b-4 transition-all duration-300 ${
            activeTab === "stocks"
              ? "border-emerald-500 text-emerald-600 bg-emerald-50"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Tồn kho
        </button>
        <button
          onClick={() => {
            setActiveTab("receipts");
            setPage(1);
          }}
          className={`flex-1 px-6 py-4 text-sm font-semibold border-b-4 transition-all duration-300 ${
            activeTab === "receipts"
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Lịch sử nhập kho
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border-2 border-gray-100">
        <Input
          type="text"
          placeholder={
            activeTab === "stocks"
              ? "Tìm theo danh mục..."
              : "Tìm theo donationId hoặc danh mục..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {activeTab === "stocks" ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-gray-100">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Tình trạng
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Cập nhật
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searchQuery
                      ? "Không tìm thấy kết quả"
                      : "Chưa có dữ liệu tồn kho"}
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {stock.category?.name || "Chưa phân loại"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          conditionClassMap[stock.condition] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {conditionLabelMap[stock.condition] || stock.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(stock.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-gray-100">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Mã phiếu
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Donation ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Ngày nhập
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searchQuery
                      ? "Không tìm thấy kết quả"
                      : "Chưa có lịch sử nhập kho"}
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {receipt.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {receipt.donationId.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(receipt.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {receipt.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="font-medium text-gray-900">
                              {item.category?.name || "Chưa phân loại"}
                            </span>
                            <span className="text-gray-500">
                              × {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReceiptDetail(receipt)}
                      >
                        Chi tiết
                      </Button>
                      {receipt.donation?.status === "RECEIVED" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleOpenDistributeDialog(receipt)}
                        >
                          Phân phối
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

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

      {showDistributeForm && selectedReceipt && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-emerald-100 p-6 mt-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Phân phối sản phẩm
            </h3>
            <p className="text-sm text-gray-600">
              Mã phiếu: {selectedReceipt.id.substring(0, 12)}... • Donation ID:{" "}
              {selectedReceipt.donationId.substring(0, 12)}...
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Chọn đội cứu hộ
              </label>
              <TeamSelectorDropdown
                value={selectedTeamId}
                onChange={(teamId) => setSelectedTeamId(teamId)}
                disabled={isDistributing}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">
                Sản phẩm sẽ được phân phối
              </p>
              <div className="space-y-2">
                {selectedReceipt.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {item.category?.name || "Chưa phân loại"}
                      </span>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          conditionClassMap[item.condition] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {conditionLabelMap[item.condition] || item.condition}
                      </span>
                    </div>
                    <span className="text-gray-600 font-semibold">
                      ×{item.quantity}
                    </span>
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
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                onClick={() => handleDistribute(selectedTeamId)}
                disabled={!selectedTeamId || isDistributing}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-sm"
              >
                {isDistributing ? "Đang phân phối..." : "Xác nhận phân phối"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedReceiptDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã phiếu</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 mt-1">
                      {selectedReceiptDetail.id.substring(0, 12)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Donation ID</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 mt-1">
                      {selectedReceiptDetail.donationId.substring(0, 12)}...
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
        </div>
      )}
    </div>
  );
}
