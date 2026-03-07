export const primaryButtonClass =
  "rounded-xl border border-red-700 bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white shadow-[0_10px_24px_-10px_rgba(220,38,38,0.75)] hover:from-red-500 hover:to-rose-600";

export const secondaryButtonClass =
  "rounded-xl border border-red-300 bg-white text-red-700 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-700 disabled:border-red-200 disabled:bg-red-50 disabled:text-red-300 disabled:opacity-100";

export const editStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "OPEN", label: "Đang mở" },
  { value: "CLOSED", label: "Đã đóng" },
  { value: "CANCELLED", label: "Đã hủy" },
] as const;

export const createTypeOptions = [
  { value: "DONATION", label: "Quyên góp" },
  { value: "VOLUNTEER", label: "Tình nguyện" },
] as const;
