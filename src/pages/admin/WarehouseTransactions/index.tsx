import { useEffect, useState, useMemo } from "react";
import {
  Filter,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  rescueOrderApi,
  WarehouseTransaction,
  WarehouseTransactionFilters,
} from "../../../apis/rescueOrderApi";
import { Button } from "../../../components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { formatDateTime } from "../../../lib/utils";
import DateFilterPicker from "./DateFilterPicker";

const LIMIT = 20;

const sourceLabels: Record<string, string> = {
  RESCUE_DISPATCH: "Cấp phát cứu trợ",
  RESCUE_RETURN: "Hoàn kho cứu trợ",
  MANUAL_REPLENISHMENT: "Bổ sung thủ công",
  DONATION_RECEIPT: "Nhận quyên góp",
  ALLOCATION_DISPATCH: "Cấp phát phân bổ",
};

const sourceColors: Record<string, string> = {
  RESCUE_DISPATCH: "bg-orange-100 text-orange-800",
  RESCUE_RETURN: "bg-emerald-100 text-emerald-800",
  MANUAL_REPLENISHMENT: "bg-blue-100 text-blue-800",
  DONATION_RECEIPT: "bg-purple-100 text-purple-800",
  ALLOCATION_DISPATCH: "bg-pink-100 text-pink-800",
};

const typeLabels: Record<string, string> = {
  IN: "Nhập",
  OUT: "Xuất",
};

export default function WarehouseTransactions() {
  const [transactions, setTransactions] = useState<WarehouseTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const fetchTransactions = async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const filters: WarehouseTransactionFilters = {
        page: pageNum,
        limit: LIMIT,
      };

      if (selectedSource) filters.source = selectedSource as any;
      if (selectedType) filters.type = selectedType as any;
      if (selectedCategory) filters.categoryId = selectedCategory;
      if (fromDate) filters.from = fromDate;
      if (toDate) filters.to = toDate;

      const response = await rescueOrderApi.listWarehouseTransactions(filters);

      if (response.success) {
        setTransactions(response.data.data || []);
        setTotal(response.data.meta.total || 0);
        setPage(pageNum);
      }
    } catch (error) {
      toast.error("Không thể tải sổ giao dịch kho");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTransactions(1);
  }, []);

  const handleFilterChange = () => {
    void fetchTransactions(1);
  };

  const handleResetFilters = () => {
    setSelectedSource("");
    setSelectedType("");
    setSelectedCategory("");
    setFromDate("");
    setToDate("");
    void fetchTransactions(1);
  };

  const stats = useMemo(() => {
    const inTotal = transactions
      .filter((t) => t.type === "IN")
      .reduce((sum, t) => sum + t.quantity, 0);
    const outTotal = transactions
      .filter((t) => t.type === "OUT")
      .reduce((sum, t) => sum + t.quantity, 0);

    return {
      total: total,
      inCount: transactions.filter((t) => t.type === "IN").length,
      outCount: transactions.filter((t) => t.type === "OUT").length,
      inTotal,
      outTotal,
    };
  }, [transactions, total]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-red-50/30 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Sổ giao dịch kho
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Theo dõi lịch sử nhập xuất hàng hóa theo từng loại giao dịch.
          </p>
        </div>
        <Button
          onClick={() => void fetchTransactions(page)}
          variant="outline"
          className="rounded-xl border-red-200 text-red-700  hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Tổng giao dịch</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.total}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Nhập (IN)</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {stats.inTotal}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {stats.inCount} giao dịch
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Xuất (OUT)</p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {stats.outTotal}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {stats.outCount} giao dịch
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Số dư</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.inTotal - stats.outTotal}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-visible rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(255,255,255,0.95))]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Bộ lọc giao dịch</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Tinh chỉnh theo loại giao dịch, chiều hàng và khoảng thời gian.
              </p>
            </div>
            {(selectedSource ||
              selectedType ||
              selectedCategory ||
              fromDate ||
              toDate) && (
              <Button
                onClick={handleResetFilters}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="overflow-visible pt-6">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_1fr_1fr_180px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <label className="text-sm font-semibold text-slate-700">
                Loại giao dịch
              </label>
              <Select
                value={selectedSource || "ALL"}
                onValueChange={(v) => setSelectedSource(v === "ALL" ? "" : v)}
              >
                <SelectTrigger className="mt-2 h-11 rounded-xl border-slate-200 bg-white shadow-sm">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="RESCUE_DISPATCH">
                    Cấp phát cứu trợ
                  </SelectItem>
                  <SelectItem value="RESCUE_RETURN">
                    Hoàn kho cứu trợ
                  </SelectItem>
                  <SelectItem value="MANUAL_REPLENISHMENT">
                    Bổ sung thủ công
                  </SelectItem>
                  <SelectItem value="DONATION_RECEIPT">
                    Nhận quyên góp
                  </SelectItem>
                  <SelectItem value="ALLOCATION_DISPATCH">
                    Cấp phát phân bổ
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <label className="text-sm font-semibold text-slate-700">
                Chiều hàng
              </label>
              <Select
                value={selectedType || "ALL"}
                onValueChange={(v) => setSelectedType(v === "ALL" ? "" : v)}
              >
                <SelectTrigger className="mt-2 h-11 rounded-xl border-slate-200 bg-white shadow-sm">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="IN">Nhập (IN)</SelectItem>
                  <SelectItem value="OUT">Xuất (OUT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <DateFilterPicker
                label="Từ ngày"
                value={fromDate}
                onChange={setFromDate}
                maxDate={toDate || undefined}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <DateFilterPicker
                label="Đến ngày"
                value={toDate}
                onChange={setToDate}
                minDate={fromDate || undefined}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleFilterChange}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white shadow-[0_16px_32px_-16px_rgba(220,38,38,0.75)] hover:from-red-700 hover:to-rose-800"
              >
                <Filter className="h-4 w-4" />
                Lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">
            Danh sách giao dịch ({transactions.length}/{total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border-none">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-slate-50/80">
                  <TableHead className="text-slate-600 text-center">
                    Loại giao dịch
                  </TableHead>
                  <TableHead className="text-slate-600 text-center">
                    Hạng mục
                  </TableHead>
                  <TableHead className="text-center text-slate-600">
                    Chiều
                  </TableHead>
                  <TableHead className="text-center text-slate-600">
                    Số lượng
                  </TableHead>
                  <TableHead className="text-center text-slate-600">
                    Trước
                  </TableHead>
                  <TableHead className="text-center text-slate-600">
                    Sau
                  </TableHead>
                  <TableHead className="text-center text-slate-600">
                    Thời gian
                  </TableHead>
                  <TableHead className="text-center text-slate-600">
                    Ghi chú
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-slate-600"
                    >
                      Đang tải giao dịch...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-slate-600"
                    >
                      Không có giao dịch nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="hover:bg-slate-50/80"
                    >
                      <TableCell className="py-3 text-center">
                        <div
                          className={`${sourceColors[transaction.source] || "bg-slate-100 text-slate-700"} inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                        >
                          {sourceLabels[transaction.source] ||
                            transaction.source}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-slate-700 text-center">
                        <div>
                          <p className="font-medium">
                            {transaction.category?.name || "Không xác định"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        {transaction.type === "IN" ? (
                          <div className="flex items-center justify-center gap-1 text-emerald-700">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">
                              {typeLabels[transaction.type]}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-red-700">
                            <TrendingDown className="h-4 w-4" />
                            <span className="font-medium">
                              {typeLabels[transaction.type]}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-center font-semibold text-slate-900">
                        {transaction.quantity}
                      </TableCell>
                      <TableCell className="py-3 text-center text-slate-600">
                        {transaction.balanceBefore}
                      </TableCell>
                      <TableCell className="py-3 text-center text-slate-600">
                        {transaction.balanceAfter}
                      </TableCell>
                      <TableCell className="py-3 text-center text-slate-600 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {formatDateTime(transaction.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center text-slate-600">
                        <div className="max-w-xs truncate text-sm">
                          {transaction.note || "-"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                onClick={() => void fetchTransactions(page - 1)}
                disabled={page === 1 || isLoading}
                variant="outline"
                className="rounded-lg border-red-200"
              >
                Trước
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <Button
                      key={pageNum}
                      onClick={() => void fetchTransactions(pageNum)}
                      variant={pageNum === page ? "default" : "outline"}
                      className={
                        pageNum === page
                          ? "rounded-lg bg-red-600 text-white hover:bg-red-700"
                          : "rounded-lg border-red-200"
                      }
                      size="sm"
                    >
                      {pageNum}
                    </Button>
                  ),
                )}
              </div>
              <Button
                onClick={() => void fetchTransactions(page + 1)}
                disabled={page === totalPages || isLoading}
                variant="outline"
                className="rounded-lg border-red-200"
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
