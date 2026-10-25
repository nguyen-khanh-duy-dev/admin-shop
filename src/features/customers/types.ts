import type { Tables } from '@/types';

export type Customer = Tables<'customers'>;

export const CUSTOMER_SORT_FIELDS = ['full_name', 'created_at'] as const;
export type CustomerSortField = (typeof CUSTOMER_SORT_FIELDS)[number];

export type CustomerListFilters = {
  /** Từ khoá tìm trong tên, email và số điện thoại. */
  q: string;
  /** Lọc theo tỉnh/thành, hoặc 'all'. */
  city: string;
  page: number;
  pageSize: number;
  sortBy: CustomerSortField;
  sortDir: 'asc' | 'desc';
};

export function isCustomerSortField(value: string): value is CustomerSortField {
  return (CUSTOMER_SORT_FIELDS as readonly string[]).includes(value);
}
