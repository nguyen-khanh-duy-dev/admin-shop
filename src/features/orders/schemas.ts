import { z } from 'zod';

import type { OrderStatus } from './types';

export const ORDER_STATUS_VALUES = [
  'pending',
  'shipping',
  'completed',
  'cancelled',
] as const satisfies readonly [OrderStatus, ...OrderStatus[]];

/** Form cập nhật đơn: chỉ cho sửa trạng thái và ghi chú. */
export const orderUpdateSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
  note: z.string().trim().max(1000, 'Ghi chú tối đa 1000 ký tự.'),
});

export type OrderUpdateValues = z.infer<typeof orderUpdateSchema>;
