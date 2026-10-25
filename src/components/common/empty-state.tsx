import { InboxIcon, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmptyStateProps = {
  /** Icon minh hoạ; mặc định là hộp rỗng. */
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Nút hành động chính, ví dụ "Thêm sản phẩm". */
  action?: { label: string; onClick: () => void };
  className?: string;
};

/** Hiển thị khi truy vấn thành công nhưng không có dòng nào. */
export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Button onClick={action.onClick} size="sm" className="mt-2">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
