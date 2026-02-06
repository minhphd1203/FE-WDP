import { useEffect, useState } from "react";
import { warehouseApi } from "../../../apis/warehouseApi";
import { Receipt, StockItem } from "../../../types/warehouse";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { toast } from "sonner";

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

export default function WarehouseManagement() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"stocks" | "receipts">("stocks");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedReceipts, setExpandedReceipts] = useState<Set<string>>(
    new Set(),
  );

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

  const toggleReceiptDetail = (receiptId: string) => {
    const next = new Set(expandedReceipts);
    if (next.has(receiptId)) {
      next.delete(receiptId);
    } else {
      next.add(receiptId);
    }
    setExpandedReceipts(next);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý kho</h1>
        <p className="text-gray-500">
          Tồn kho và lịch sử phiếu nhập từ donation
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-6 border-b flex">
        <button
          onClick={() => {
            setActiveTab("stocks");
            setPage(1);
          }}
          className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "stocks"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Tồn kho
        </button>
        <button
          onClick={() => {
            setActiveTab("receipts");
            setPage(1);
          }}
          className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "receipts"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Lịch sử nhập kho
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
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
                  Chi tiết
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
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleReceiptDetail(receipt.id)}
                      >
                        {expandedReceipts.has(receipt.id) ? "Ẩn" : "Xem"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {filteredReceipts.map((receipt) =>
            expandedReceipts.has(receipt.id) ? (
              <div
                key={`${receipt.id}-detail`}
                className="border-t px-6 py-4 bg-gray-50"
              >
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Chi tiết phiếu nhập
                </div>
                <div className="space-y-2">
                  {receipt.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="font-medium text-gray-900">
                        {item.category?.name || "Chưa phân loại"}
                      </span>
                      <span className="text-gray-500">× {item.quantity}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          conditionClassMap[item.condition] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {conditionLabelMap[item.condition] || item.condition}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null,
          )}
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
    </div>
  );
}
