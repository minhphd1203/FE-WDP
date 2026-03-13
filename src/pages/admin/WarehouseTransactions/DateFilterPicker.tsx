import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DateFilterPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
}

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const pad = (value: number) => String(value).padStart(2, "0");

const parseDate = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatValue = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatDisplay = (value?: string) => {
  const date = parseDate(value);
  if (!date) return "Chọn ngày";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

const isSameDate = (a: Date | null, b: Date | null) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const getMonthGrid = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const leadingDays = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: Array<{ date: Date; inCurrentMonth: boolean }> = [];

  for (let index = leadingDays - 1; index >= 0; index -= 1) {
    cells.push({
      date: new Date(year, month - 1, daysInPrevMonth - index),
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: new Date(year, month, day),
      inCurrentMonth: true,
    });
  }

  while (cells.length < 42) {
    const nextDay = cells.length - (leadingDays + daysInMonth) + 1;
    cells.push({
      date: new Date(year, month + 1, nextDay),
      inCurrentMonth: false,
    });
  }

  return cells;
};

export default function DateFilterPicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
}: DateFilterPickerProps) {
  const selectedDate = parseDate(value);
  const min = parseDate(minDate);
  const max = parseDate(maxDate);
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate?.getMonth() ?? today.getMonth(),
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!selectedDate) return;
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
  }, [value]);

  const monthGrid = useMemo(
    () => getMonthGrid(viewYear, viewMonth),
    [viewMonth, viewYear],
  );

  const isDisabledDate = (date: Date) => {
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  };

  const handlePickDate = (date: Date) => {
    if (isDisabledDate(date)) return;
    onChange(formatValue(date));
    setOpen(false);
  };

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((current) => current - 1);
      return;
    }
    setViewMonth((current) => current - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((current) => current + 1);
      return;
    }
    setViewMonth((current) => current + 1);
  };

  return (
    <div
      className={`relative space-y-2 ${open ? "z-50" : "z-0"}`}
      ref={wrapperRef}
    >
      <p className="text-sm font-semibold text-slate-700">{label}</p>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left shadow-sm transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-200"
      >
        <span className={selectedDate ? "text-slate-800" : "text-slate-400"}>
          {formatDisplay(value)}
        </span>
        <CalendarDays className="h-4 w-4 text-slate-500" />
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Chọn ngày
              </p>
              <p className="text-base font-bold text-slate-900">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="flex h-8 items-center justify-center text-xs font-semibold text-slate-400"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map(({ date, inCurrentMonth }) => {
              const isSelected = isSameDate(selectedDate, date);
              const isToday = isSameDate(today, date);
              const isDisabled = isDisabledDate(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handlePickDate(date)}
                  className={`flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-red-600 text-white shadow-sm"
                      : isDisabled
                        ? "cursor-not-allowed text-slate-300"
                        : inCurrentMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-400 hover:bg-slate-100"
                  } ${isToday && !isSelected ? "border border-red-200 bg-red-50 text-red-700" : "border border-transparent"}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
              Xóa ngày
            </button>

            <button
              type="button"
              onClick={() => handlePickDate(today)}
              className="rounded-lg px-2 py-1.5 text-sm font-semibold text-red-700 transition-colors "
            >
              Hôm nay
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
