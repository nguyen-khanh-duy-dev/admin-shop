import { ArrowLeftIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/utils';

import { useOrderQuery } from '../api';
import { OrderStatusActions, OrderStatusBadge } from '../components';

/** Trang chi tiết đơn hàng: thông tin khách, các dòng hàng và nút chuyển trạng thái. */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id === undefined ? null : Number(id);
  const orderQuery = useOrderQuery(orderId);

  if (orderQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Skeleton className="h-80" />
          <Skeleton className="h-56" />
        </div>
      </div>
    );
  }

  if (orderQuery.isError) {
    return (
      <ErrorState
        title="Không tải được đơn hàng"
        error={orderQuery.error}
        onRetry={() => void orderQuery.refetch()}
      />
    );
  }

  const order = orderQuery.data;
  const itemsTotal = order.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Đơn ${order.code}`}
        description={`Đặt lúc ${formatDateTime(order.created_at)}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => void navigate('/don-hang')}>
            <ArrowLeftIcon className="size-4" aria-hidden />
            Danh sách
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm trong đơn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">SL</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(item.quantity)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Tổng {formatNumber(order.items.length)} dòng hàng
              </span>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Tổng tiền</p>
                <p className="text-lg font-semibold tabular-nums">{formatCurrency(order.total)}</p>
                {itemsTotal !== order.total ? (
                  <p className="text-xs text-muted-foreground">
                    Tính từ dòng hàng: {formatCurrency(itemsTotal)}
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrderStatusBadge status={order.status} />
              <OrderStatusActions order={order} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.customer?.full_name ?? '—'}</p>
              {order.customer?.phone ? (
                <p className="text-muted-foreground">{order.customer.phone}</p>
              ) : null}
              {order.note ? (
                <p className="pt-2 text-muted-foreground">Ghi chú: {order.note}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
