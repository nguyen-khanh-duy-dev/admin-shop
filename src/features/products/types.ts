import type { Enums, Tables } from '@/types';

export type Product = Tables<'products'>;
export type ProductStatus = Enums<'product_status'>;
export type Category = Tables<'categories'>;

/** Sản phẩm kèm danh mục đã join, dùng cho bảng danh sách. */
export type ProductWithCategory = Product & {
  category: Pick<Category, 'id' | 'name'> | null;
};

/** Các cột được phép sắp xếp (khớp với chỉ mục trong database). */
export const PRODUCT_SORT_FIELDS = ['name', 'price', 'stock', 'created_at'] as const;
export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

/** Tồn kho dưới ngưỡng này (không tính bằng) được coi là sắp hết hàng. */
export const LOW_STOCK_THRESHOLD = 5;

export type ProductListFilters = {
  /** Từ khoá tìm trong tên và SKU. */
  q: string;
  status: ProductStatus | 'all';
  /** 'low' chỉ lấy sản phẩm có tồn < `LOW_STOCK_THRESHOLD`. */
  stock: 'all' | 'low';
  /** Id danh mục, hoặc 'all' để bỏ lọc. */
  categoryId: number | 'all';
  page: number;
  pageSize: number;
  sortBy: ProductSortField;
  sortDir: 'asc' | 'desc';
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Đang bán',
  draft: 'Nháp',
  archived: 'Đã ẩn',
};

export function isProductSortField(value: string): value is ProductSortField {
  return (PRODUCT_SORT_FIELDS as readonly string[]).includes(value);
}

export function isProductStatus(value: string): value is ProductStatus {
  return value in PRODUCT_STATUS_LABELS;
}
