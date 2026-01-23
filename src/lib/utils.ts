import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Chờ xử lý',
    approved: 'Đã duyệt',
    in_progress: 'Đang thực hiện',
    completed: 'Hoàn thành',
    rejected: 'Từ chối',
    verified: 'Đã xác minh',
    distributed: 'Đã phân phối',
    active: 'Đang hoạt động',
    inactive: 'Không hoạt động',
    cancelled: 'Đã hủy',
  };
  return labels[status] || status;
}

export function getUrgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    critical: 'Khẩn cấp',
  };
  return labels[urgency] || urgency;
}
