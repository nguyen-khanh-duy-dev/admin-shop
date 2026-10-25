import { PackageCheckIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatNumber } from '@/lib/utils';

import { useLowStockQuery } from '../api';

const LOW_STOCK_THRESHOLD = 10;

/** Sản phẩm tồn kho thấp, để nhập hàng trước khi hết. */
export function LowStockCard() {
  const productsQuery = useLowStockQuery(LOW_STOCK_THRESHOLD);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Sắp hết hàng</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/san-pham?sort=stock&dir=asc">Xem sản phẩm</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {productsQuery.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={`low-stock-${String(index)}`} className="h-10 w-full" />
            ))}
          </div>
        ) : productsQuery.isError ? (
          <ErrorState
            error={productsQuery.error}
            onRetry={() => void productsQuery.refetch()}
            className="py-8"
          />
        ) : productsQuery.data.length === 0 ? (
          <EmptyState
            icon={PackageCheckIcon}
            title="Tồn kho ổn"
            description={`Không có sản phẩm nào còn dưới ${String(LOW_STOCK_THRESHOLD)} đơn vị.`}
            className="py-8"
          />
        ) : (
          <ul className="divide-y">
            {productsQuery.data.map((product) => (
              <li key={product.id}>
                <Link
                  to={`/san-pham/${String(product.id)}/sua`}
                  className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium tabular-nums',
                      product.stock === 0
                        ? 'text-destructive'
                        : 'text-amber-600 dark:text-amber-400',
                    )}
                  >
                    {product.stock === 0 ? 'Hết hàng' : `Còn ${formatNumber(product.stock)}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
