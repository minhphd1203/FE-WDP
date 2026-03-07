import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
  useUpdateEventStatus,
} from "@/hooks/useEvent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import OSMLocationPicker from "@/components/ui/osm-location-picker";
import DateTimePicker from "../components/DateTimePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createEventSchema,
  CreateEventFormData,
  updateEventSchema,
  UpdateEventFormData,
} from "@/schema/eventSchema";
import { Event } from "@/types";

const primaryButtonClass =
  "rounded-xl border border-red-700 bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white shadow-[0_10px_24px_-10px_rgba(220,38,38,0.75)] hover:from-red-500 hover:to-rose-600";
const secondaryButtonClass =
  "rounded-xl border border-red-300 bg-white text-red-700 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-700 disabled:border-red-200 disabled:bg-red-50 disabled:text-red-300 disabled:opacity-100";

export default function EventsList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [layoutMode, setLayoutMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editStatus, setEditStatus] = useState<
    "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED"
  >("DRAFT");
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch,
  } = useEvents({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: debouncedSearch || undefined,
    page,
    limit,
  });
  const deleteEventMutation = useDeleteEvent();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const updateStatusMutation = useUpdateEventStatus();

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    setValue: setValueCreate,
    watch: watchCreate,
    reset: resetCreate,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      type: "VOLUNTEER",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    watch: watchEdit,
    setValue: setValueEdit,
    reset: resetEdit,
  } = useForm<UpdateEventFormData>({
    resolver: zodResolver(updateEventSchema),
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    eventId: string | null;
    eventTitle: string;
  }>({
    open: false,
    eventId: null,
    eventTitle: "",
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, debouncedSearch]);

  const paginated = eventsResponse?.data;
  const events = (paginated?.data || []) as Event[];
  const filteredEvents = events.filter((event) => {
    if (typeFilter === "all") return true;

    const normalizedType = (event.type || "").toString().toUpperCase();
    if (typeFilter === "DONATION") {
      return (
        normalizedType === "DONATION" || normalizedType === "PRODUCT_DONATION"
      );
    }
    if (typeFilter === "VOLUNTEER") {
      return normalizedType === "VOLUNTEER" || normalizedType === "RELIEF_TEAM";
    }

    return true;
  });
  const meta = paginated?.meta;
  const totalPages = Math.max(meta?.pages || 1, 1);
  const totalItems =
    typeFilter === "all" ? meta?.total || events.length : filteredEvents.length;

  const pageStart = Math.max(1, page - 1);
  const pageEnd = Math.min(totalPages, page + 1);
  const visiblePages = Array.from(
    { length: pageEnd - pageStart + 1 },
    (_, index) => pageStart + index,
  );

  const handleDelete = async () => {
    if (!deleteDialog.eventId) return;

    try {
      await deleteEventMutation.mutateAsync(deleteDialog.eventId);
      setDeleteDialog({ open: false, eventId: null, eventTitle: "" });
    } catch (error) {
      // Error handled in hook
    }
  };

  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const toLocalDateTimeInput = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleCreateEvent = async (data: CreateEventFormData) => {
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      await createEventMutation.mutateAsync(payload);
      setIsCreateDialogOpen(false);
      resetCreate({ type: "VOLUNTEER" });
      await refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setEditStatus(event.status as "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED");
    resetEdit({
      title: event.title,
      description: event.description,
      startDate: toLocalDateTimeInput(event.startDate),
      endDate: toLocalDateTimeInput(event.endDate),
      location: event.location || "",
    });
  };

  const handleEditEvent = async (data: UpdateEventFormData) => {
    if (!editingEvent) return;

    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      await updateEventMutation.mutateAsync({
        id: editingEvent.id,
        data: payload,
      });

      if (editingEvent.status !== editStatus) {
        await updateStatusMutation.mutateAsync({
          id: editingEvent.id,
          data: { status: editStatus },
        });
      }

      setEditingEvent(null);
      await refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = (status || "").toUpperCase();
    const statusMap: Record<string, { label: string; className: string }> = {
      DRAFT: { label: "Nháp", className: "bg-yellow-100 text-yellow-800" },
      OPEN: { label: "Đang mở", className: "bg-green-100 text-green-800" },
      CLOSED: { label: "Đã đóng", className: "bg-gray-100 text-gray-800" },
      CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
    };

    const config = statusMap[normalizedStatus] || statusMap.DRAFT;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const normalizedType = (type || "").toUpperCase();
    if (normalizedType === "VOLUNTEER" || normalizedType === "RELIEF_TEAM") {
      return "Tình nguyện";
    }
    return "Quyên góp";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="space-y-6 bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 sm:p-6">
        <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
          <CardContent className="flex min-h-[280px] items-center justify-center">
            <div className="text-center">
              <p className="mb-2 text-red-500">
                Có lỗi xảy ra khi tải danh sách sự kiện
              </p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <Button
                onClick={() => refetch()}
                className={`${primaryButtonClass} mt-4`}
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Quản lý Sự kiện
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Quản lý các sự kiện Đội cứu trợ và sự kiện Quyên góp
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className={primaryButtonClass}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo sự kiện mới
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardContent className="pt-6">
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

            {(statusFilter !== "all" ||
              typeFilter !== "all" ||
              searchQuery) && (
              <Button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setSearchQuery("");
                }}
                className={`h-11 ${secondaryButtonClass}`}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Đặt lại bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="tracking-tight text-slate-900">
            Danh sách sự kiện ({totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              <div className="flex gap-2 justify-center">
                <Button
                  className={secondaryButtonClass}
                  onClick={() => refetch()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Làm mới
                </Button>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className={primaryButtonClass}
                >
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
              {filteredEvents.map((event) => (
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
                      {getStatusBadge(event.status)}
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
                        {formatDate(event.startDate)}
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
                      onClick={() => openEditDialog(event)}
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
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Trang {page}/{totalPages}
              {isLoading && <span className="ml-2">Đang cập nhật...</span>}
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
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page >= totalPages || isLoading}
                className={secondaryButtonClass}
              >
                Sau
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sự kiện</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sự kiện "{deleteDialog.eventTitle}"?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, eventId: null, eventTitle: "" })
              }
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetCreate({ type: "VOLUNTEER" });
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl border-2 bg-gradient-to-br from-white to-red-50/30">
          <DialogHeader className="border-b border-red-100 pb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Tạo sự kiện mới
            </DialogTitle>
            <DialogDescription>
              Tạo sự kiện ngay trong trang danh sách mà không cần chuyển trang.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitCreate(handleCreateEvent)}
            className="space-y-4"
          >
            <input type="hidden" {...registerCreate("startDate")} />
            <input type="hidden" {...registerCreate("endDate")} />

            <div className="space-y-2">
              <Label htmlFor="create-type">Loại sự kiện *</Label>
              <Select
                value={watchCreate("type")}
                onValueChange={(value) =>
                  setValueCreate("type", value as "DONATION" | "VOLUNTEER")
                }
              >
                <SelectTrigger
                  id="create-type"
                  className="h-11 rounded-xl border-2 border-red-200 bg-white transition-all focus:ring-2 focus:ring-red-500/20"
                >
                  <SelectValue placeholder="Chọn loại sự kiện" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DONATION">Quyên góp</SelectItem>
                  <SelectItem value="VOLUNTEER">Tình nguyện</SelectItem>
                </SelectContent>
              </Select>
              {errorsCreate.type && (
                <p className="text-sm text-red-500">
                  {errorsCreate.type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-title">Tiêu đề *</Label>
              <Input
                id="create-title"
                placeholder="Nhập tiêu đề sự kiện"
                className="h-11 w-full rounded-xl border-[1px] border-red-400 px-3 text-base focus:outline-red-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                {...registerCreate("title")}
              />
              {errorsCreate.title && (
                <p className="text-sm text-red-500">
                  {errorsCreate.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Mô tả *</Label>
              <Textarea
                id="create-description"
                placeholder="Mô tả chi tiết về sự kiện"
                rows={4}
                className="min-h-[80px] resize-none rounded-xl border-2 border-red-200 bg-white transition-all focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
                {...registerCreate("description")}
              />
              {errorsCreate.description && (
                <p className="text-sm text-red-500">
                  {errorsCreate.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-startDate">Ngày bắt đầu *</Label>
                <DateTimePicker
                  id="create-startDate"
                  minDateTime={getCurrentDateTimeLocal()}
                  value={watchCreate("startDate") || ""}
                  onChange={(value) =>
                    setValueCreate("startDate", value, { shouldValidate: true })
                  }
                  error={errorsCreate.startDate?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-endDate">Ngày kết thúc *</Label>
                <DateTimePicker
                  id="create-endDate"
                  minDateTime={
                    watchCreate("startDate") || getCurrentDateTimeLocal()
                  }
                  value={watchCreate("endDate") || ""}
                  onChange={(value) =>
                    setValueCreate("endDate", value, { shouldValidate: true })
                  }
                  error={errorsCreate.endDate?.message}
                />
              </div>
            </div>

            {watchCreate("type") === "VOLUNTEER" ? (
              <div className="space-y-2">
                <Label htmlFor="create-location">Địa điểm tập trung</Label>
                <OSMLocationPicker
                  value={watchCreate("location") || ""}
                  onChange={(value) =>
                    setValueCreate("location", value, {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Chon tren ban do truoc, hoac tim dia diem"
                  error={errorsCreate.location?.message}
                  showMap={true}
                  mapFirst={true}
                />
              </div>
            ) : null}

            <DialogFooter className="border-t border-red-100 pt-4">
              <Button
                type="button"
                variant="outline"
                className={secondaryButtonClass}
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createEventMutation.isPending}
                className={primaryButtonClass}
              >
                {createEventMutation.isPending ? "Đang tạo..." : "Tạo sự kiện"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingEvent}
        onOpenChange={(open) => {
          if (!open) setEditingEvent(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl border-2 bg-gradient-to-br from-white to-red-50/30">
          <DialogHeader className="border-b border-red-100 pb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Chỉnh sửa sự kiện
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và trạng thái sự kiện trực tiếp bằng popup.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitEdit(handleEditEvent)}
            className="space-y-4"
          >
            <input type="hidden" {...registerEdit("startDate")} />
            <input type="hidden" {...registerEdit("endDate")} />

            <div className="space-y-2">
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Select
                value={editStatus}
                onValueChange={(v) => setEditStatus(v as any)}
              >
                <SelectTrigger
                  id="edit-status"
                  className="h-11 rounded-xl border-2 border-red-200 bg-white transition-all focus:ring-2 focus:ring-red-500/20"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Nháp</SelectItem>
                  <SelectItem value="OPEN">Đang mở</SelectItem>
                  <SelectItem value="CLOSED">Đã đóng</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-title">Tiêu đề *</Label>
              <Input
                id="edit-title"
                placeholder="Nhập tiêu đề sự kiện"
                className="h-11 w-full rounded-xl border-[1px] border-red-400 px-3 text-base focus:outline-red-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                {...registerEdit("title")}
              />
              {errorsEdit.title && (
                <p className="text-sm text-red-500">
                  {errorsEdit.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả *</Label>
              <Textarea
                id="edit-description"
                placeholder="Mô tả chi tiết về sự kiện"
                rows={4}
                className="min-h-[80px] resize-none rounded-xl border-2 border-red-200 bg-white transition-all focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
                {...registerEdit("description")}
              />
              {errorsEdit.description && (
                <p className="text-sm text-red-500">
                  {errorsEdit.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Ngày bắt đầu *</Label>
                <DateTimePicker
                  id="edit-startDate"
                  value={watchEdit("startDate") || ""}
                  onChange={(value) =>
                    setValueEdit("startDate", value, { shouldValidate: true })
                  }
                  error={errorsEdit.startDate?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">Ngày kết thúc *</Label>
                <DateTimePicker
                  id="edit-endDate"
                  minDateTime={watchEdit("startDate") || ""}
                  value={watchEdit("endDate") || ""}
                  onChange={(value) =>
                    setValueEdit("endDate", value, { shouldValidate: true })
                  }
                  error={errorsEdit.endDate?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Địa điểm</Label>
              <OSMLocationPicker
                value={watchEdit("location") || ""}
                onChange={(value) =>
                  setValueEdit("location", value, { shouldValidate: true })
                }
                placeholder="Chon tren ban do truoc, hoac tim dia diem"
                error={errorsEdit.location?.message}
                showMap={true}
                mapFirst={true}
              />
            </div>

            <DialogFooter className="border-t border-red-100 pt-4">
              <Button
                type="button"
                variant="outline"
                className={secondaryButtonClass}
                onClick={() => setEditingEvent(null)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  updateEventMutation.isPending ||
                  updateStatusMutation.isPending
                }
                className={primaryButtonClass}
              >
                {updateEventMutation.isPending || updateStatusMutation.isPending
                  ? "Đang cập nhật..."
                  : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
