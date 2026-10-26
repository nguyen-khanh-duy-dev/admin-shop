import { useState } from 'react';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  ShoppingBagIcon,
  UserXIcon,
  WalletIcon,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermission } from '@/features/auth/hooks';
import { useCustomerOrdersQuery, useCustomerOrderStatsQuery } from '@/features/orders/api';
import { isOrderSortField } from '@/features/orders/types';
import { useUrlFilters } from '@/hooks';
import { formatCurrency, formatDate, formatNumber, formatRelative } from '@/lib/utils';

import { useCustomerQuery } from '../api';
import { CustomerFormDialog, CustomerOrderTable } from '../components';
import type { Customer } from '../types';

const PAGE_SIZE = 10;

const DEFAULT_URL_FILTERS = {
  page: 1,
  sort: 'created_at',
  dir: 'desc',
};

/** Id trên URL phải là số nguyên dương; còn lại coi như không tồn tại. */
function parseCustomerId(raw: string | undefined) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Trang chi tiết khách hàng: thông tin liên hệ, số liệu mua hàng và lịch sử đơn. */
export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = parseCustomerId(id);
  const customerQuery = useCustomerQuery(customerId);

  if (customerId === null || customerQuery.data === null) {
    return (
      <EmptyState
        icon={UserXIcon}
        title="Không tìm thấy khách hàng"
        description="Khách hàng này không tồn tại hoặc đã bị xoá."
        action={{ label: 'Về danh sách khách hàng', onClick: () => void navigate('/khach-hang') }}
      />
    );
  }

  if (customerQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Skeleton className="h-64" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (customerQuery.isError) {
    return (
      <ErrorState
        title="Không tải được khách hàng"
        error={customerQuery.error}
        onRetry={() => void customerQuery.refetch()}
      />
    );
  }

  return <CustomerDetail customer={customerQuery.data} />;
}

function CustomerDetail({ customer }: { customer: Customer }) {
  const navigate = useNavigate();
  const { can } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { filters: urlFilters, setFilters } = useUrlFilters(DEFAULT_URL_FILTERS);

  const orderFilters = {
    page: urlFilters.page,
    pageSize: PAGE_SIZE,
    sortBy: isOrderSortField(urlFilters.sort) ? urlFilters.sort : 'created_at',
    sortDir: urlFilters.dir === 'asc' ? 'asc' : 'desc',
  } as const;

  const statsQuery = useCustomerOrderStatsQuery(customer.id);
  const ordersQuery = useCustomerOrdersQuery(customer.id, orderFilters);
  const stats = statsQuery.data;
  const address = [customer.address, customer.city].filter(Boolean).join(', ');

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.full_name}
        description={`Khách hàng từ ${formatDate(customer.created_at)}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void navigate('/khach-hang')}>
              <ArrowLeftIcon className="size-4" aria-hidden />
              Danh sách
            </Button>
            {can('customers.update') ? (
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <PencilIcon className="size-4" aria-hidden />
                Chỉnh sửa
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <InfoRow icon={MailIcon} label="Email" value={customer.email} />
              <InfoRow icon={PhoneIcon} label="Điện thoại" value={customer.phone} />
              <InfoRow icon={MapPinIcon} label="Địa chỉ" value={address} />
              <InfoRow
                icon={CalendarIcon}
                label="Ngày tham gia"
                value={formatDate(customer.created_at)}
              />
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {statsQuery.isError ? (
            <Card>
              <ErrorState
                title="Không tải được số liệu"
                error={statsQuery.error}
                onRetry={() => void statsQuery.refetch()}
                className="py-8"
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Tổng chi tiêu"
                value={formatCurrency(stats?.totalSpent ?? 0)}
                hint="Tính trên đơn đã hoàn thành"
                icon={WalletIcon}
                isLoading={statsQuery.isPending}
              />
              <StatCard
                label="Số đơn"
                value={formatNumber(stats?.orderCount ?? 0)}
                icon={ShoppingBagIcon}
                isLoading={statsQuery.isPending}
              />
              <StatCard
                label="Mua gần nhất"
                value={stats?.lastOrderAt ? formatDate(stats.lastOrderAt) : '—'}
                {...(stats?.lastOrderAt ? { hint: formatRelative(stats.lastOrderAt) } : {})}
                icon={ClockIcon}
                isLoading={statsQuery.isPending}
              />
            </div>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Lịch sử đơn hàng</h2>
        <CustomerOrderTable
          orders={ordersQuery.data?.rows ?? []}
          isLoading={ordersQuery.isPending}
          isError={ordersQuery.isError}
          error={ordersQuery.error}
          onRetry={() => void ordersQuery.refetch()}
          pagination={{
            page: orderFilters.page,
            pageSize: PAGE_SIZE,
            total: ordersQuery.data?.total ?? 0,
            pageCount: ordersQuery.data?.pageCount ?? 1,
            onPageChange: (page) => setFilters({ page }),
          }}
          sortBy={orderFilters.sortBy}
          sortDir={orderFilters.sortDir}
          onSortChange={(sortBy, sortDir) => setFilters({ sort: sortBy, dir: sortDir })}
        />
      </section>

      <CustomerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} customer={customer} />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="break-words">{value || '—'}</dd>
      </div>
    </div>
  );
}
