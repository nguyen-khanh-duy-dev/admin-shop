import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { ORDER_STATUS_LABELS, type OrderStatus } from '../types';

/** Màu nền riêng cho từng trạng thái để quét bảng bằng mắt nhanh hơn. */
const CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  shipping: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-muted text-muted-foreground',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="secondary" className={cn('border-0', CLASSES[status])}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
