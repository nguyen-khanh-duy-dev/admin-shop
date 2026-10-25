import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from '@/features/orders/components';
import { formatCurrency, formatRelative } from '@/lib/utils';

import { useRecentOrdersQuery } from '../api';

/** Danh sách 5 đơn mới nhất; bấm vào để mở chi tiết. */
export function RecentOrdersCard() {
  const ordersQuery = useRecentOrdersQuery();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Đơn hàng mới nhất</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/don-hang">Xem tất cả</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {ordersQuery.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={`recent-order-${String(index)}`} className="h-12 w-full" />
            ))}
          </div>
        ) : ordersQuery.isError ? (
          <ErrorState
            error={ordersQuery.error}
            onRetry={() => void ordersQuery.refetch()}
            className="py-8"
          />
        ) : ordersQuery.data.length === 0 ? (
          <EmptyState title="Chưa có đơn hàng nào" className="py-8" />
        ) : (
          <ul className="divide-y">
            {ordersQuery.data.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/don-hang/${String(order.id)}`}
                  className="-mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {order.customer?.full_name ?? 'Khách lẻ'}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{order.code}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(order.created_at)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
