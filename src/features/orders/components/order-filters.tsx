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

import { ORDER_STATUS_LABELS, type OrderListFilters as Filters, type OrderStatus } from '../types';

export type OrderFiltersProps = {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  isFiltered: boolean;
};

/** Thanh lọc đơn hàng: tìm theo mã đơn và lọc theo trạng thái. */
export function OrderFilters({ filters, onChange, onReset, isFiltered }: OrderFiltersProps) {
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
          placeholder="Tìm theo mã đơn…"
          className="pl-9"
          aria-label="Tìm đơn hàng"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => onChange({ status: value as OrderStatus | 'all' })}
      >
        <SelectTrigger className="sm:w-44" aria-label="Lọc theo trạng thái">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi trạng thái</SelectItem>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
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
