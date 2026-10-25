import { useState } from 'react';
import { Loader2Icon } from 'lucide-react';

import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/features/auth/hooks';

import { useUpdateOrder } from '../api';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  type Order,
  type OrderStatus,
} from '../types';

export type OrderStatusActionsProps = {
  order: Order;
};

/**
 * Các nút chuyển trạng thái đơn hàng, chỉ hiện những bước hợp lệ theo
 * `ORDER_STATUS_TRANSITIONS`. Huỷ đơn luôn phải xác nhận vì không quay lại được.
 */
export function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const { can } = usePermission();
  const updateOrder = useUpdateOrder();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status];

  if (!can('orders.update') || nextStatuses.length === 0) return null;

  function applyStatus(status: OrderStatus) {
    updateOrder.mutate({ id: order.id, patch: { status } });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            variant={status === 'cancelled' ? 'outline' : 'default'}
            size="sm"
            disabled={updateOrder.isPending}
            onClick={() => {
              if (status === 'cancelled') setPendingStatus(status);
              else applyStatus(status);
            }}
          >
            {updateOrder.isPending ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
            ) : null}
            {status === 'cancelled' ? 'Huỷ đơn' : `Chuyển sang ${ORDER_STATUS_LABELS[status]}`}
          </Button>
        ))}
      </div>

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null);
        }}
        title="Huỷ đơn hàng này?"
        description={`Đơn ${order.code} sẽ chuyển sang trạng thái đã huỷ và không thể mở lại.`}
        confirmLabel="Huỷ đơn"
        cancelLabel="Quay lại"
        variant="destructive"
        isPending={updateOrder.isPending}
        onConfirm={() => {
          if (!pendingStatus) return;
          updateOrder.mutate(
            { id: order.id, patch: { status: pendingStatus } },
            { onSuccess: () => setPendingStatus(null) },
          );
        }}
      />
    </>
  );
}
