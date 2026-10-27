import { type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  /** Truyền vào thì cả thẻ thành link, bấm để xem chi tiết số liệu. */
  href?: string;
};

/** Thẻ số liệu: nhãn, giá trị lớn, gợi ý nhỏ và icon. Dùng ở dashboard và trang chi tiết. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  isLoading = false,
  href,
}: StatCardProps) {
  const card = (
    <Card className={cn(href && 'h-full transition-colors hover:bg-muted/50')}>
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

  if (!href) return card;

  return (
    <Link
      to={href}
      className="rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {card}
    </Link>
  );
}
