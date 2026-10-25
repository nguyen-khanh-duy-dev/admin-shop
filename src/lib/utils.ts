import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

/** Gộp class Tailwind; class sau ghi đè class trước khi trùng nhóm. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 1250000 -> "1.250.000 ₫" */
export function formatCurrency(value: number, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** 1250000 -> "1.250.000" (không kèm ký hiệu tiền tệ) */
export function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

/** 0.1234 -> "12,3%" */
export function formatPercent(value: number, fractionDigits = 1) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function toDate(value: string | number | Date): Date | null {
  const date = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(date) ? date : null;
}

/**
 * "2026-10-25T08:30:00Z" -> "25/10/2026".
 * Trả về chuỗi rỗng nếu giá trị không phải ngày hợp lệ (dữ liệu API có thể null).
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  pattern = 'dd/MM/yyyy',
) {
  if (value === null || value === undefined) return '';
  const date = toDate(value);
  return date ? format(date, pattern, { locale: vi }) : '';
}

/** "2026-10-25T08:30:00Z" -> "25/10/2026 15:30" */
export function formatDateTime(value: string | number | Date | null | undefined) {
  return formatDate(value, 'dd/MM/yyyy HH:mm');
}

/** "2026-10-25T08:30:00Z" -> "3 ngày trước" */
export function formatRelative(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined) return '';
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true, locale: vi }) : '';
}

/** "Áo Thun Nam" -> "ao-thun-nam" */
export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "Nguyễn Duy" -> "ND" */
export function getInitials(name: string | null | undefined) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? '') : '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

/** Lấy thông điệp đọc được từ bất kỳ lỗi nào (Error, PostgrestError, string...). */
export function getErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại.') {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const { message } = error;
    if (typeof message === 'string') return message;
  }
  return fallback;
}
