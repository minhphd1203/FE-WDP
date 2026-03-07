import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  minDateTime?: string;
  placeholder?: string;
  error?: string;
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

const toDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const pad = (n: number) => String(n).padStart(2, "0");

const toLocalDateTimeString = (d: Date) => {
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const getMonthGrid = (year: number, month: number) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const leading = first.getDay();
  const total = last.getDate();
  const cells: Array<number | null> = [];

  for (let i = 0; i < leading; i += 1) cells.push(null);
  for (let d = 1; d <= total; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
};

export default function DateTimePicker({
  id,
  value,
  onChange,
  minDateTime,
  placeholder = "Chọn ngày giờ",
  error,
}: DateTimePickerProps) {
  const selected = toDate(value) ?? new Date();
  const min = toDate(minDateTime);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [day, setDay] = useState(selected.getDate());
  const [hour, setHour] = useState(selected.getHours());
  const [minute, setMinute] = useState(selected.getMinutes());
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const parsed = toDate(value);
    if (!parsed) return;
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
    setDay(parsed.getDate());
    setHour(parsed.getHours());
    setMinute(parsed.getMinutes());
  }, [value]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener("mousedown", onClickOutside);
    }
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const monthGrid = useMemo(
    () => getMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const currentValue = toDate(value);

  const applyValue = () => {
    const next = new Date(viewYear, viewMonth, day, hour, minute, 0, 0);
    const finalValue = min && next < min ? min : next;
    onChange(toLocalDateTimeString(finalValue));
    setOpen(false);
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
      return;
    }
    setViewMonth((prev) => prev - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
      return;
    }
    setViewMonth((prev) => prev + 1);
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between rounded-xl border-[1px] border-red-400 bg-white px-3 text-left text-base focus:outline-red-500"
      >
        <span className={currentValue ? "text-slate-800" : "text-slate-400"}>
          {currentValue ? currentValue.toLocaleString("vi-VN") : placeholder}
        </span>
        <Calendar className="h-4 w-4 text-slate-500" />
      </button>

      {open ? (
        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goPrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="font-semibold text-slate-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="mb-4 grid grid-cols-7 gap-1">
            {monthGrid.map((cell, idx) => {
              if (!cell) return <div key={`blank-${idx}`} className="h-9" />;

              const selectedDay = cell === day;
              return (
                <button
                  key={`${viewYear}-${viewMonth}-${cell}`}
                  type="button"
                  onClick={() => setDay(cell)}
                  className={`h-9 rounded-lg text-sm transition-colors ${
                    selectedDay
                      ? "bg-red-600 text-white"
                      : "text-slate-700 hover:bg-red-50"
                  }`}
                >
                  {cell}
                </button>
              );
            })}
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                <Clock3 className="h-3 w-3" />
                Giờ
              </p>
              <Select
                value={String(hour)}
                onValueChange={(v) => setHour(Number(v))}
              >
                <SelectTrigger className="h-10 rounded-xl border-red-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                    <SelectItem key={`h-${h}`} value={String(h)}>
                      {pad(h)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500">Phút</p>
              <Select
                value={String(minute)}
                onValueChange={(v) => setMinute(Number(v))}
              >
                <SelectTrigger className="h-10 rounded-xl border-red-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <SelectItem key={`m-${m}`} value={String(m)}>
                      {pad(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              className="rounded-xl border border-red-700 bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white"
              onClick={applyValue}
            >
              Chọn
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
