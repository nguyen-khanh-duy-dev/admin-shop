import { Badge } from '@/components/ui/badge';

import { PRODUCT_STATUS_LABELS, type ProductStatus } from '../types';

const VARIANTS: Record<ProductStatus, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  draft: 'secondary',
  archived: 'outline',
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <Badge variant={VARIANTS[status]}>{PRODUCT_STATUS_LABELS[status]}</Badge>;
}
