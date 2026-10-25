import { PageHeader } from '@/components/common/page-header';
import { useUrlFilters } from '@/hooks';

import { useOrdersQuery } from '../api';
import { OrderFilters, OrderTable } from '../components';
import {
  isOrderSortField,
  isOrderStatus,
  type OrderListFilters as Filters,
  type OrderSortField,
} from '../types';

const PAGE_SIZE = 20;

const DEFAULT_URL_FILTERS = {
  q: '',
  status: 'all',
  page: 1,
  sort: 'created_at',
  dir: 'desc',
};

export default function OrderListPage() {
  const {
    filters: urlFilters,
    setFilters,
    resetFilters,
    isFiltered,
  } = useUrlFilters(DEFAULT_URL_FILTERS);

  const filters: Filters = {
    q: urlFilters.q,
    status: isOrderStatus(urlFilters.status) ? urlFilters.status : 'all',
    page: urlFilters.page,
    pageSize: PAGE_SIZE,
    sortBy: isOrderSortField(urlFilters.sort) ? urlFilters.sort : 'created_at',
    sortDir: urlFilters.dir === 'asc' ? 'asc' : 'desc',
  };

  const ordersQuery = useOrdersQuery(filters);

  function handleFiltersChange(patch: Partial<Filters>) {
    setFilters({
      ...(patch.q !== undefined ? { q: patch.q } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    });
  }

  function handleSortChange(sortBy: OrderSortField, sortDir: 'asc' | 'desc') {
    setFilters({ sort: sortBy, dir: sortDir });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Đơn hàng" description="Theo dõi và cập nhật trạng thái các đơn hàng." />

      <OrderFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={resetFilters}
        isFiltered={isFiltered}
      />

      <OrderTable
        orders={ordersQuery.data?.rows ?? []}
        isLoading={ordersQuery.isPending}
        isError={ordersQuery.isError}
        error={ordersQuery.error}
        onRetry={() => void ordersQuery.refetch()}
        pagination={{
          page: filters.page,
          pageSize: PAGE_SIZE,
          total: ordersQuery.data?.total ?? 0,
          pageCount: ordersQuery.data?.pageCount ?? 1,
          onPageChange: (page) => setFilters({ page }),
        }}
        sortBy={filters.sortBy}
        sortDir={filters.sortDir}
        onSortChange={handleSortChange}
        isFiltered={isFiltered}
      />
    </div>
  );
}
