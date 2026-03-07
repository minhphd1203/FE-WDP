export const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const toLocalDateTimeInput = (value?: string) => {
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

export const getTypeLabel = (type: string) => {
  const normalizedType = (type || "").toUpperCase();
  if (normalizedType === "VOLUNTEER" || normalizedType === "RELIEF_TEAM") {
    return "Tình nguyện";
  }
  return "Quyên góp";
};

export const formatEventDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusConfig = (status: string) => {
  const normalizedStatus = (status || "").toUpperCase();
  const statusMap: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Nháp", className: "bg-yellow-100 text-yellow-800" },
    OPEN: { label: "Đang mở", className: "bg-green-100 text-green-800" },
    CLOSED: { label: "Đã đóng", className: "bg-gray-100 text-gray-800" },
    CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
  };

  return statusMap[normalizedStatus] || statusMap.DRAFT;
};

export const getVisiblePages = (page: number, totalPages: number) => {
  const pageStart = Math.max(1, page - 1);
  const pageEnd = Math.min(totalPages, page + 1);
  return Array.from(
    { length: pageEnd - pageStart + 1 },
    (_, index) => pageStart + index,
  );
};
