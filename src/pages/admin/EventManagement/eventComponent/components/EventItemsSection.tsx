import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import { primaryButtonClass, secondaryButtonClass } from "../constants";
import { DeleteDialogState } from "../types";
import { formatEventDate, getStatusConfig, getTypeLabel } from "../utils";

interface EventItemsSectionProps {
  isLoading: boolean;
  filteredEvents: Event[];
  totalItems: number;
  layoutMode: "list" | "grid";
  page: number;
  totalPages: number;
  visiblePages: number[];
  onRefetch: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (event: Event) => void;
  setDeleteDialog: (value: DeleteDialogState) => void;
  setPage: (value: number | ((prev: number) => number)) => void;
}

export default function EventItemsSection({
  isLoading,
  filteredEvents,
  totalItems,
  layoutMode,
  page,
  totalPages,
  visiblePages,
  onRefetch,
  onOpenCreate,
  onOpenEdit,
  setDeleteDialog,
  setPage,
}: EventItemsSectionProps) {
  return (
    <>
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">
          Đang tải...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-12 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-muted-foreground">
            Không tìm thấy sự kiện nào
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Thử điều chỉnh bộ lọc hoặc tạo sự kiện mới
          </p>
          <div className="flex justify-center gap-2">
            <Button className={secondaryButtonClass} onClick={onRefetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button onClick={onOpenCreate} className={primaryButtonClass}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo sự kiện đầu tiên
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={
            layoutMode === "grid"
              ? "grid gap-4 md:grid-cols-2"
              : "flex flex-col gap-3"
          }
        >
          {filteredEvents.map((event) => {
            const statusConfig = getStatusConfig(event.status);
            return (
              <article
                key={event.id}
                className={`rounded-2xl border border-red-100 bg-white p-4 shadow-sm ${
                  layoutMode === "list"
                    ? "flex flex-col gap-4 lg:flex-row lg:items-center"
                    : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                      {getTypeLabel(event.type)}
                    </span>
                    <div
                      className={`${statusConfig.className} inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold`}
                    >
                      {statusConfig.label}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {event.title}
                  </h3>

                  {event.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {event.description}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-red-500" />
                      {formatEventDate(event.startDate)}
                    </span>
                    {event.location ? (
                      <span className="inline-flex max-w-full items-center gap-1.5 truncate">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span className="truncate">{event.location}</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 lg:ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenEdit(event)}
                    className="rounded-lg hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDeleteDialog({
                        open: true,
                        eventId: event.id,
                        eventTitle: event.title,
                      })
                    }
                    className="rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Trang {page}/{totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || isLoading}
            className={secondaryButtonClass}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Trước
          </Button>

          {visiblePages.map((pageItem) => (
            <Button
              key={pageItem}
              type="button"
              size="sm"
              variant={pageItem === page ? "default" : "outline"}
              onClick={() => setPage(pageItem)}
              disabled={isLoading}
              className={`min-w-9 rounded-xl ${pageItem === page ? primaryButtonClass : secondaryButtonClass}`}
            >
              {pageItem}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || isLoading}
            className={secondaryButtonClass}
          >
            Sau
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Danh sách sự kiện ({totalItems})
      </div>
    </>
  );
}
