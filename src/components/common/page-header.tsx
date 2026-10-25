export type PageHeaderProps = {
  title: string;
  description?: string;
  /** Nút hành động bên phải tiêu đề. */
  actions?: React.ReactNode;
};

/** Khối tiêu đề chuẩn cho mọi trang trong dashboard. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
