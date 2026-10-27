import { SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebouncedSearch } from '@/hooks';

import { useCategoriesQuery } from '../api';
import {
  LOW_STOCK_THRESHOLD,
  PRODUCT_STATUS_LABELS,
  type ProductListFilters as Filters,
  type ProductStatus,
} from '../types';

export type ProductFiltersProps = {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  isFiltered: boolean;
};

/**
 * Thanh lọc của trang danh sách sản phẩm.
 *
 * Ô tìm kiếm gõ tới đâu hiện tới đó nhưng chỉ đẩy lên URL sau 350ms ngừng gõ,
 * nên không tạo một request cho mỗi ký tự.
 */
export function ProductFilters({ filters, onChange, onReset, isFiltered }: ProductFiltersProps) {
  const categoriesQuery = useCategoriesQuery();
  const [search, setSearch] = useDebouncedSearch(filters.q, (q) => onChange({ q }));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:max-w-xs sm:flex-1">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên hoặc SKU…"
          className="pl-9"
          aria-label="Tìm sản phẩm"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => onChange({ status: value as ProductStatus | 'all' })}
      >
        <SelectTrigger className="sm:w-40" aria-label="Lọc theo trạng thái">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi trạng thái</SelectItem>
          {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.stock}
        onValueChange={(value) => onChange({ stock: value === 'low' ? 'low' : 'all' })}
      >
        <SelectTrigger className="sm:w-44" aria-label="Lọc theo tồn kho">
          <SelectValue placeholder="Tồn kho" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi mức tồn</SelectItem>
          <SelectItem value="low">{`Sắp hết hàng (< ${String(LOW_STOCK_THRESHOLD)})`}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.categoryId === 'all' ? 'all' : String(filters.categoryId)}
        onValueChange={(value) => onChange({ categoryId: value === 'all' ? 'all' : Number(value) })}
      >
        <SelectTrigger className="sm:w-48" aria-label="Lọc theo danh mục">
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi danh mục</SelectItem>
          {(categoriesQuery.data ?? []).map((category) => (
            <SelectItem key={category.id} value={String(category.id)}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isFiltered ? (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <XIcon className="size-4" aria-hidden />
          Bỏ lọc
        </Button>
      ) : null}
    </div>
  );
}
