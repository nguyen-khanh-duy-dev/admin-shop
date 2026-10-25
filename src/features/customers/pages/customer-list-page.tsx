import { useState } from 'react';
import { PlusIcon } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/features/auth/hooks';
import { useUrlFilters } from '@/hooks';

import { useCustomersQuery } from '../api';
import { CustomerFilters, CustomerFormDialog, CustomerTable } from '../components';
import {
  isCustomerSortField,
  type Customer,
  type CustomerListFilters as Filters,
  type CustomerSortField,
} from '../types';

const PAGE_SIZE = 20;

const DEFAULT_URL_FILTERS = {
  q: '',
  city: 'all',
  page: 1,
  sort: 'created_at',
  dir: 'desc',
};

export default function CustomerListPage() {
  const { can } = usePermission();
  const {
    filters: urlFilters,
    setFilters,
    resetFilters,
    isFiltered,
  } = useUrlFilters(DEFAULT_URL_FILTERS);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const filters: Filters = {
    q: urlFilters.q,
    city: urlFilters.city,
    page: urlFilters.page,
    pageSize: PAGE_SIZE,
    sortBy: isCustomerSortField(urlFilters.sort) ? urlFilters.sort : 'created_at',
    sortDir: urlFilters.dir === 'asc' ? 'asc' : 'desc',
  };

  const customersQuery = useCustomersQuery(filters);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditing(customer);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khách hàng"
        description="Danh bạ khách hàng và thông tin liên hệ."
        actions={
          can('customers.create') ? (
            <Button onClick={openCreate}>
              <PlusIcon className="size-4" aria-hidden />
              Thêm khách hàng
            </Button>
          ) : null
        }
      />

      <CustomerFilters
        filters={filters}
        onChange={(patch) =>
          setFilters({
            ...(patch.q !== undefined ? { q: patch.q } : {}),
            ...(patch.city !== undefined ? { city: patch.city } : {}),
          })
        }
        onReset={resetFilters}
        isFiltered={isFiltered}
      />

      <CustomerTable
        customers={customersQuery.data?.rows ?? []}
        isLoading={customersQuery.isPending}
        isError={customersQuery.isError}
        error={customersQuery.error}
        onRetry={() => void customersQuery.refetch()}
        pagination={{
          page: filters.page,
          pageSize: PAGE_SIZE,
          total: customersQuery.data?.total ?? 0,
          pageCount: customersQuery.data?.pageCount ?? 1,
          onPageChange: (page) => setFilters({ page }),
        }}
        sortBy={filters.sortBy}
        sortDir={filters.sortDir}
        onSortChange={(sortBy: CustomerSortField, sortDir) =>
          setFilters({ sort: sortBy, dir: sortDir })
        }
        onEdit={openEdit}
        onCreate={openCreate}
        isFiltered={isFiltered}
      />

      <CustomerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} customer={editing} />
    </div>
  );
}
