import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  MapPin,
  Phone,
  Plus,
  Siren,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import {
  ReliefRequest,
  RescueRequestPriority,
  RescueRequestStatus,
} from "../../../types";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CalendarViewProps {
  requests: ReliefRequest[];
  onRequestClick: (request: ReliefRequest) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isLoading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Style maps                                                         */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<
  RescueRequestStatus,
  { dot: string; badge: string; border: string; bg: string; label: string }
> = {
  [RescueRequestStatus.NEW]: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    border: "border-l-blue-500",
    bg: "hover:bg-blue-50/40",
    label: "Mới",
  },
  [RescueRequestStatus.REVIEWED]: {
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    border: "border-l-indigo-500",
    bg: "hover:bg-indigo-50/40",
    label: "Đã đánh giá",
  },
  [RescueRequestStatus.ASSIGNED]: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    border: "border-l-amber-500",
    bg: "hover:bg-amber-50/40",
    label: "Đã phân công",
  },
  [RescueRequestStatus.ACCEPTED]: {
    dot: "bg-cyan-500",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    border: "border-l-cyan-500",
    bg: "hover:bg-cyan-50/40",
    label: "Đã chấp nhận",
  },
  [RescueRequestStatus.IN_PROGRESS]: {
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    border: "border-l-orange-500",
    bg: "hover:bg-orange-50/40",
    label: "Đang thực hiện",
  },
  [RescueRequestStatus.DONE]: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "border-l-emerald-500",
    bg: "hover:bg-emerald-50/40",
    label: "Hoàn thành",
  },
  [RescueRequestStatus.CANCELED]: {
    dot: "bg-slate-400",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    border: "border-l-slate-400",
    bg: "hover:bg-slate-50/40",
    label: "Đã hủy",
  },
  [RescueRequestStatus.REJECTED]: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    border: "border-l-red-500",
    bg: "hover:bg-red-50/40",
    label: "Từ chối",
  },
};

const PRIORITY_STYLES: Record<
  RescueRequestPriority,
  { dot: string; badge: string; label: string; ring: string }
> = {
  [RescueRequestPriority.LOW]: {
    dot: "bg-sky-400",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    label: "Thấp",
    ring: "",
  },
  [RescueRequestPriority.MEDIUM]: {
    dot: "bg-yellow-400",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    label: "TB",
    ring: "",
  },
  [RescueRequestPriority.HIGH]: {
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    label: "Cao",
    ring: "ring-1 ring-orange-200",
  },
  [RescueRequestPriority.CRITICAL]: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Khẩn",
    ring: "ring-2 ring-red-200",
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Compare the UTC calendar date of a createdAt timestamp against a local calendar date
const isSameDayUTC = (utcDate: Date, localDate: Date) =>
  utcDate.getUTCFullYear() === localDate.getFullYear() &&
  utcDate.getUTCMonth() === localDate.getMonth() &&
  utcDate.getUTCDate() === localDate.getDate();

const isToday = (d: Date) => isSameDay(d, new Date());

const getDateStrip = (baseDate: Date, days = 14) => {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - 4);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const formatTime = (date: string | Date) => {
  const d = new Date(date);
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")}`;
};

const relativeTime = (date: string | Date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
};

const CARD_WIDTH = 260;
const CARD_GAP = 8;
const PLUS_BTN_WIDTH = 52;

const hours = Array.from({ length: 24 }, (_, h) => h);

/* ------------------------------------------------------------------ */
/*  RequestCard                                                        */
/* ------------------------------------------------------------------ */

interface RequestCardProps {
  request: ReliefRequest;
  compact?: boolean;
  onClick: () => void;
}

const RequestCard = ({
  request,
  compact = false,
  onClick,
}: RequestCardProps) => {
  const statusStyle = STATUS_STYLES[request.status];
  const priorityStyle = PRIORITY_STYLES[request.priority];
  const isCritical = request.priority === RescueRequestPriority.CRITICAL;
  const teamAssigned = request.assignedTeams?.length ?? 0;
  const teamRequired = request.requiredTeams ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-[260px] shrink-0 rounded-3xl border-2 border-slate-100 bg-white text-left shadow-md transition-all duration-300",
        "hover:shadow-2xl hover:-translate-y-1 hover:border-red-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300",
        statusStyle.bg,
        priorityStyle.ring,
        isCritical && "animate-[pulse_3s_ease-in-out_infinite]",
      )}
    >
      {/* Top accent stripe */}
      <div
        className={cn(
          "h-2 rounded-t-[22px]",
          isCritical
            ? "bg-gradient-to-r from-red-500 via-orange-400 to-red-500"
            : statusStyle.dot,
        )}
      />

      <div
        className={cn(
          "flex flex-col gap-3 px-4 pb-4 pt-3",
          compact && "gap-2 px-3 pb-3 pt-2",
        )}
      >
        {/* Avatar + Name */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 text-red-500 shadow-sm">
            <User className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {request.guestName || "Không rõ"}
            </p>
            <p className="text-[11px] text-slate-400">
              {relativeTime(request.createdAt)}
            </p>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {request.guestPhone || "N/A"}
          </div>
          {!compact && request.address && (
            <div className="flex items-start gap-2 text-xs text-slate-600">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="line-clamp-2">{request.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {formatTime(request.createdAt)}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-slate-200" />

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none shadow-sm",
              priorityStyle.badge,
            )}
          >
            {priorityStyle.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none shadow-sm",
              statusStyle.badge,
            )}
          >
            {statusStyle.label}
          </span>
          {teamRequired > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
              <Users className="h-3.5 w-3.5" />
              <span className="tabular-nums">
                {teamAssigned}/{teamRequired}
              </span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

/* ------------------------------------------------------------------ */
/*  HourCardRow — shows cards in a row, +N button for overflow         */
/* ------------------------------------------------------------------ */

interface HourCardRowProps {
  list: ReliefRequest[];
  onRequestClick: (request: ReliefRequest) => void;
}

const HourCardRow = ({ list, onRequestClick }: HourCardRowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(list.length);
  const [showOverflow, setShowOverflow] = useState(false);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const width = el.clientWidth;
    // How many cards fit? Reserve space for the +N button if not all fit
    const maxFull = Math.floor((width + CARD_GAP) / (CARD_WIDTH + CARD_GAP));
    if (maxFull >= list.length) {
      setVisibleCount(list.length);
    } else {
      // Leave room for the +N button
      const maxWithBtn = Math.floor(
        (width - PLUS_BTN_WIDTH - CARD_GAP + CARD_GAP) /
          (CARD_WIDTH + CARD_GAP),
      );
      setVisibleCount(Math.max(1, maxWithBtn));
    }
  }, [list.length]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const overflowCount = list.length - visibleCount;
  const visibleCards = list.slice(0, visibleCount);
  const overflowCards = list.slice(visibleCount);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-start gap-2">
        {visibleCards.map((req) => (
          <RequestCard
            key={req.id}
            request={req}
            onClick={() => onRequestClick(req)}
          />
        ))}

        {overflowCount > 0 && (
          <button
            type="button"
            onClick={() => setShowOverflow(!showOverflow)}
            className={cn(
              "flex h-full min-h-[140px] w-[48px] shrink-0 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed transition-all",
              showOverflow
                ? "border-red-400 bg-red-50 text-red-600 shadow-md"
                : "border-red-200 bg-white text-red-500 hover:border-red-400  hover:shadow-md",
            )}
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs font-semibold">{overflowCount}</span>
          </button>
        )}
      </div>

      {/* Overflow list popover */}
      {showOverflow && overflowCards.length > 0 && (
        <div className="absolute right-0 top-0 z-20 w-[300px] rounded-3xl border-2 border-red-100 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <List className="h-3.5 w-3.5" />
              {overflowCount} yêu cầu khác
            </span>
            <button
              type="button"
              onClick={() => setShowOverflow(false)}
              className="rounded-lg p-1 text-slate-400 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {overflowCards.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                compact
                onClick={() => {
                  onRequestClick(req);
                  setShowOverflow(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  DateScrollbar                                                      */
/* ------------------------------------------------------------------ */

interface DateScrollbarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  requests: ReliefRequest[];
}

const DateScrollbar = ({
  selectedDate,
  onDateChange,
  requests,
}: DateScrollbarProps) => {
  const days = useMemo(() => getDateStrip(selectedDate), [selectedDate]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected date
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(
      "[data-active=true]",
    ) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedDate]);

  const goPrev = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 7);
    onDateChange(next);
  };

  const goNext = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    onDateChange(next);
  };

  const getMaxPriority = (day: Date): RescueRequestPriority | null => {
    const dayReqs = requests.filter((r) =>
      isSameDayUTC(new Date(r.createdAt), day),
    );
    if (dayReqs.length === 0) return null;
    const order = [
      RescueRequestPriority.CRITICAL,
      RescueRequestPriority.HIGH,
      RescueRequestPriority.MEDIUM,
      RescueRequestPriority.LOW,
    ];
    for (const p of order) {
      if (dayReqs.some((r) => r.priority === p)) return p;
    }
    return null;
  };

  /* Month-year label from selectedDate */
  const monthLabel = selectedDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-white to-red-50/30 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-sm">
            <CalendarDays className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold capitalize text-slate-900">
              {monthLabel}
            </h3>
            <p className="text-[11px] text-slate-400">
              Chọn ngày để xem timeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-400  hover:text-red-600"
            onClick={goPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-red-200 px-3 text-[11px] font-medium text-red-600 "
            onClick={() => onDateChange(new Date())}
          >
            Hôm nay
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-400  hover:text-red-600"
            onClick={goNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable date strip */}
      <div
        ref={scrollRef}
        className="overflow-x-auto border-t border-red-100/60 px-3 pb-4 pt-3 scrollbar-hide"
      >
        <div className="flex min-w-max gap-1.5">
          {days.map((day) => {
            const active = isSameDay(day, selectedDate);
            const today = isToday(day);
            const count = requests.filter((r) =>
              isSameDayUTC(new Date(r.createdAt), day),
            ).length;
            const maxPrio = getMaxPriority(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                data-active={active}
                onClick={() => onDateChange(day)}
                className={cn(
                  "group relative flex flex-col items-center rounded-2xl transition-all duration-200",
                  active
                    ? "min-w-[72px] bg-gradient-to-b from-red-500 to-rose-600 px-2.5 py-3 text-white shadow-lg shadow-red-200/60"
                    : "min-w-[60px] px-2 py-2 hover:bg-red-50/70",
                  today && !active && "ring-2 ring-red-200 ring-offset-1",
                )}
              >
                {/* Weekday */}
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    active ? "text-white/70" : "text-slate-400",
                  )}
                >
                  {day.toLocaleDateString("vi-VN", { weekday: "short" })}
                </span>

                {/* Date number */}
                <span
                  className={cn(
                    "mt-0.5 font-bold leading-none transition-all",
                    active
                      ? "text-2xl text-white"
                      : "text-xl text-slate-800 group-hover:text-red-600",
                  )}
                >
                  {day.getDate()}
                </span>

                {/* Count badge + priority */}
                <div className="mt-1.5 flex items-center gap-1">
                  {count > 0 && maxPrio && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        active ? "bg-white/60" : PRIORITY_STYLES[maxPrio].dot,
                      )}
                    />
                  )}
                  {count > 0 ? (
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[10px] font-semibold tabular-nums leading-tight",
                        active
                          ? "bg-white/20 text-white"
                          : "bg-red-100/80 text-red-600",
                      )}
                    >
                      {count}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "text-[10px]",
                        active ? "text-white/40" : "text-slate-300",
                      )}
                    >
                      —
                    </span>
                  )}
                </div>

                {/* Today dot when not active */}
                {today && !active && (
                  <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                    */
/* ------------------------------------------------------------------ */

const TimelineSkeleton = () => (
  <div className="animate-pulse space-y-0">
    {[8, 9, 10, 11, 12].map((h) => (
      <div
        key={h}
        className="grid grid-cols-[56px_1fr] border-b border-red-100"
      >
        <div className="flex items-start justify-end px-2 py-3">
          <div className="h-3 w-8 rounded bg-red-100" />
        </div>
        <div className="border-l border-red-100 px-3 py-3">
          <div className="max-w-[420px] space-y-2 rounded-lg border border-red-100 p-3">
            <div className="h-3 w-32 rounded bg-red-100" />
            <div className="h-2.5 w-24 rounded bg-red-100" />
            <div className="flex gap-2">
              <div className="h-4 w-12 rounded-full bg-red-100" />
              <div className="h-4 w-16 rounded-full bg-red-100" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  CalendarView                                                       */
/* ------------------------------------------------------------------ */

export const CalendarView = ({
  requests,
  onRequestClick,
  selectedDate,
  onDateChange,
  isLoading,
}: CalendarViewProps) => {
  const [showEmptyHours, setShowEmptyHours] = useState(false);
  const currentHourRef = useRef<HTMLDivElement>(null);

  const requestsByHour = useMemo(() => {
    const grouped: Record<number, ReliefRequest[]> = {};
    for (const req of requests) {
      const created = new Date(req.createdAt);
      if (!isSameDayUTC(created, selectedDate)) continue;
      const hour = created.getUTCHours();
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(req);
    }
    for (const hour of Object.keys(grouped)) {
      grouped[Number(hour)].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    return grouped;
  }, [requests, selectedDate]);

  const dailyCount = Object.values(requestsByHour).reduce(
    (sum, list) => sum + list.length,
    0,
  );
  const activeHours = hours.filter((h) => (requestsByHour[h]?.length ?? 0) > 0);
  const currentHour = new Date().getHours();
  const viewingToday = isSameDay(selectedDate, new Date());

  // Auto-scroll to current hour on today
  useEffect(() => {
    if (viewingToday && currentHourRef.current) {
      setTimeout(() => {
        currentHourRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [viewingToday, selectedDate]);

  const visibleHours = showEmptyHours
    ? hours
    : activeHours.length > 0
      ? activeHours
      : hours;

  // Count empty hidden hours
  const hiddenEmpty = hours.length - activeHours.length;

  return (
    <div className="space-y-4">
      <DateScrollbar
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        requests={requests}
      />

      <div className="rounded-xl border border-red-100 bg-gradient-to-br from-white to-red-50/30 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {selectedDate.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </h3>
              <p className="text-[11px] text-slate-500">
                Timeline yêu cầu trong ngày
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!showEmptyHours && hiddenEmpty > 0 && activeHours.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-red-700 "
                onClick={() => setShowEmptyHours(true)}
              >
                Hiện tất cả 24h
              </Button>
            )}
            {showEmptyHours && activeHours.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-red-700 "
                onClick={() => setShowEmptyHours(false)}
              >
                Chỉ giờ có yêu cầu
              </Button>
            )}
            <div
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums",
                dailyCount > 0
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-slate-100 text-slate-600 border-slate-200",
              )}
            >
              {dailyCount} yêu cầu
            </div>
          </div>
        </div>

        {/* Timeline body */}
        {isLoading ? (
          <TimelineSkeleton />
        ) : dailyCount === 0 && !showEmptyHours ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <div className="rounded-full bg-red-100 p-3">
              <Siren className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              Không có yêu cầu nào
            </p>
            <p className="text-xs text-slate-400">
              Chưa có yêu cầu cứu trợ nào cho ngày này.
            </p>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            {visibleHours.map((hour) => {
              const list = requestsByHour[hour] ?? [];
              const isCurrentHour = viewingToday && hour === currentHour;

              return (
                <div
                  key={hour}
                  ref={isCurrentHour ? currentHourRef : undefined}
                  className={cn(
                    "grid grid-cols-[56px_1fr] border-b border-red-100 last:border-b-0 transition-colors",
                    isCurrentHour && "bg-red-50/40",
                  )}
                >
                  {/* Hour label */}
                  <div className="relative flex items-start justify-end px-2 py-3">
                    <span
                      className={cn(
                        "text-[11px] font-medium tabular-nums",
                        isCurrentHour
                          ? "text-red-600 font-semibold"
                          : "text-slate-500",
                      )}
                    >
                      {hour.toString().padStart(2, "0")}:00
                    </span>
                    {/* Current-hour red dot */}
                    {isCurrentHour && (
                      <span className="absolute right-0 top-3.5 h-2 w-2 -translate-x-0.5 rounded-full bg-red-500 shadow-sm shadow-red-200" />
                    )}
                  </div>

                  {/* Content area */}
                  <div
                    className={cn(
                      "relative border-l px-3 py-2",
                      isCurrentHour ? "border-l-red-400" : "border-red-100",
                    )}
                  >
                    {/* Current-time line */}
                    {isCurrentHour && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-red-400/60" />
                    )}

                    {list.length === 0 ? (
                      <div className="flex h-10 items-center text-[11px] text-muted-foreground/50">
                        <Clock className="mr-1.5 h-3 w-3" />
                        Trống
                      </div>
                    ) : (
                      <HourCardRow
                        list={list}
                        onRequestClick={onRequestClick}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary bar */}
        {dailyCount > 0 && (
          <div className="flex items-center justify-between border-t border-red-100 bg-red-50/30 px-4 py-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-3">
              <span>{activeHours.length} khung giờ có yêu cầu</span>
              {requests.filter(
                (r) =>
                  isSameDay(new Date(r.createdAt), selectedDate) &&
                  r.priority === RescueRequestPriority.CRITICAL,
              ).length > 0 && (
                <span className="flex items-center gap-1 font-medium text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  {
                    requests.filter(
                      (r) =>
                        isSameDay(new Date(r.createdAt), selectedDate) &&
                        r.priority === RescueRequestPriority.CRITICAL,
                    ).length
                  }{" "}
                  khẩn cấp
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {[
                RescueRequestStatus.NEW,
                RescueRequestStatus.IN_PROGRESS,
                RescueRequestStatus.DONE,
              ].map((s) => {
                const c = requests.filter(
                  (r) =>
                    isSameDay(new Date(r.createdAt), selectedDate) &&
                    r.status === s,
                ).length;
                if (c === 0) return null;
                return (
                  <span key={s} className="flex items-center gap-1">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        STATUS_STYLES[s].dot,
                      )}
                    />
                    {c} {STATUS_STYLES[s].label.toLowerCase()}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
