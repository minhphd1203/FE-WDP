import { LayoutGrid, List, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { secondaryButtonClass } from "../constants";

interface EventFiltersProps {
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  layoutMode: "list" | "grid";
  setLayoutMode: (value: "list" | "grid") => void;
  onResetFilters: () => void;
}

export default function EventFilters({
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  layoutMode,
  setLayoutMode,
  onResetFilters,
}: EventFiltersProps) {
  const hasFilters =
    statusFilter !== "all" || typeFilter !== "all" || !!searchQuery;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => setTypeFilter("DONATION")}
          className={`h-11 rounded-xl px-4 focus-visible:border-red-400 focus-visible:outline-none focus-visible:ring-red-500/20 ${
            typeFilter === "DONATION"
              ? "border-red-600 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-[0_12px_26px_-14px_rgba(220,38,38,0.9)]"
              : "border-red-300 bg-gradient-to-r from-red-50 to-rose-100 text-red-700 hover:border-red-400 hover:from-red-100 hover:to-rose-200"
          }`}
        >
          Quyên góp
        </Button>
        <Button
          type="button"
          onClick={() => setTypeFilter("VOLUNTEER")}
          className={`h-11 rounded-xl px-4 focus-visible:border-red-400 focus-visible:outline-none focus-visible:ring-red-500/20 ${
            typeFilter === "VOLUNTEER"
              ? "border border-red-600 bg-gradient-to-r from-red-500 to-rose-600 text-white"
              : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          Tình nguyện
        </Button>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
        <div className="relative min-w-[260px] flex-1 lg:max-w-[420px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
          <input
            placeholder="Tìm theo tiêu đề hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border-[1px] border-red-400 pl-10 pr-3 text-base focus:outline-red-500 focus:ring-0"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-[180px] rounded-xl border-red-200 focus-visible:border-red-400 focus-visible:ring-red-500/20">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="DRAFT">Nháp</SelectItem>
            <SelectItem value="OPEN">Đang mở</SelectItem>
            <SelectItem value="CLOSED">Đã đóng</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-xl border border-red-200 bg-white p-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setLayoutMode("list")}
            className={`h-9 rounded-lg px-3 focus-visible:outline-none focus-visible:ring-red-500/20 ${
              layoutMode === "list"
                ? "bg-red-50 text-red-700"
                : "text-slate-500"
            }`}
            title="Dạng dọc"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setLayoutMode("grid")}
            className={`h-9 rounded-lg px-3 focus-visible:outline-none focus-visible:ring-red-500/20 ${
              layoutMode === "grid"
                ? "bg-red-50 text-red-700"
                : "text-slate-500"
            }`}
            title="Dạng lưới"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasFilters ? (
        <Button
          type="button"
          onClick={onResetFilters}
          className={`h-11 ${secondaryButtonClass}`}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Đặt lại bộ lọc
        </Button>
      ) : null}
    </div>
  );
}
