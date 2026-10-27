import { useId, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCompactCurrency, formatCurrency, formatDate, formatNumber } from '@/lib/utils';

import { useRevenueSeriesQuery } from '../api';
import type { RevenuePoint, RevenueRange, RevenueSeries } from '../types';

const RANGE_OPTIONS: { value: RevenueRange; label: string }[] = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '12m', label: '12 tháng' },
];

/** Nhãn trục X: ngày -> "27/10", tháng -> "10/2026". */
function formatTick(key: string, bucket: RevenueSeries['bucket']) {
  return bucket === 'day' ? formatDate(key, 'dd/MM') : formatDate(`${key}-01`, 'MM/yyyy');
}

/** Nhãn đầy đủ trong tooltip: "Thứ Hai, 27/10/2026" hoặc "Tháng 10/2026". */
function formatTooltipLabel(key: string, bucket: RevenueSeries['bucket']) {
  if (bucket === 'month') return `Tháng ${formatDate(`${key}-01`, 'MM/yyyy')}`;
  const label = formatDate(key, 'EEEE, dd/MM/yyyy');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Biểu đồ vùng doanh thu đơn hoàn thành, chọn được 7 ngày / 30 ngày / 12 tháng. */
export function RevenueChartCard() {
  const [range, setRange] = useState<RevenueRange>('30d');
  const revenueQuery = useRevenueSeriesQuery(range);
  const gradientId = useId();

  const series = revenueQuery.data;
  const totalRevenue = series?.points.reduce((sum, point) => sum + point.revenue, 0) ?? 0;
  const totalOrders = series?.points.reduce((sum, point) => sum + point.orders, 0) ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>Doanh thu</CardTitle>
          <CardDescription>
            {series ? (
              `${formatCurrency(totalRevenue)} từ ${formatNumber(totalOrders)} đơn hoàn thành`
            ) : (
              <Skeleton className="h-4 w-48" />
            )}
          </CardDescription>
        </div>
        <div
          role="group"
          aria-label="Khoảng thời gian"
          className="flex gap-1 rounded-lg border p-1"
        >
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={range === option.value ? 'secondary' : 'ghost'}
              aria-pressed={range === option.value}
              className="h-7 px-3"
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {revenueQuery.isPending ? (
          <Skeleton className="h-72 w-full" />
        ) : revenueQuery.isError ? (
          <ErrorState
            title="Không tải được doanh thu"
            error={revenueQuery.error}
            onRetry={() => void revenueQuery.refetch()}
            className="h-72 py-0"
          />
        ) : (
          <div
            className={cn(
              'h-72 transition-opacity',
              revenueQuery.isPlaceholderData && 'opacity-50',
            )}
            aria-busy={revenueQuery.isPlaceholderData}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueQuery.data.points} margin={{ top: 8, right: 8, left: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="key"
                  tickFormatter={(key: string) => formatTick(key, revenueQuery.data.bucket)}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value: number) => formatCompactCurrency(value)}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    const point = payload?.[0]?.payload as RevenuePoint | undefined;
                    if (!active || !point) return null;
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                        <p className="text-xs text-muted-foreground">
                          {formatTooltipLabel(point.key, revenueQuery.data.bucket)}
                        </p>
                        <p className="font-semibold tabular-nums">
                          {formatCurrency(point.revenue)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(point.orders)} đơn hoàn thành
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
