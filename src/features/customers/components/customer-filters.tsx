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

import { useCustomerCitiesQuery } from '../api';
import type { CustomerListFilters as Filters } from '../types';

export type CustomerFiltersProps = {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  isFiltered: boolean;
};

/** Thanh lọc khách hàng: tìm theo tên/email/điện thoại và lọc theo tỉnh thành. */
export function CustomerFilters({ filters, onChange, onReset, isFiltered }: CustomerFiltersProps) {
  const citiesQuery = useCustomerCitiesQuery();
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
          placeholder="Tìm tên, email hoặc số điện thoại…"
          className="pl-9"
          aria-label="Tìm khách hàng"
        />
      </div>

      <Select value={filters.city} onValueChange={(value) => onChange({ city: value })}>
        <SelectTrigger className="sm:w-48" aria-label="Lọc theo tỉnh thành">
          <SelectValue placeholder="Tỉnh/Thành" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi tỉnh/thành</SelectItem>
          {(citiesQuery.data ?? []).map((city) => (
            <SelectItem key={city} value={city}>
              {city}
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
