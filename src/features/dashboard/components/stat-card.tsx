import { type LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  isLoading?: boolean;
};

/** Thẻ số liệu trên dashboard. */
export function StatCard({ label, value, hint, icon: Icon, isLoading = false }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="truncate text-2xl font-semibold tabular-nums">{value}</p>
          )}
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
