import { RefreshCwIcon, TriangleAlertIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn, getErrorMessage } from '@/lib/utils';

export type ErrorStateProps = {
  /** Lỗi thô từ React Query; sẽ được rút ra thông điệp đọc được. */
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
};

/** Hiển thị khi truy vấn thất bại, kèm nút thử lại. */
export function ErrorState({
  error,
  title = 'Không tải được dữ liệu',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
      {onRetry ? (
        <Button onClick={onRetry} size="sm" variant="outline" className="mt-2">
          <RefreshCwIcon className="size-4" aria-hidden />
          Thử lại
        </Button>
      ) : null}
    </div>
  );
}
