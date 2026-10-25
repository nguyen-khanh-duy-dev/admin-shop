import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { SEGMENT_LABELS } from './nav-config';

function labelFor(segment: string) {
  const known = SEGMENT_LABELS[segment];
  if (known) return known;
  // Id số (ví dụ /san-pham/12/sua) hiển thị thành "#12".
  if (/^\d+$/.test(segment)) return `#${segment}`;
  return segment;
}

/**
 * Breadcrumb tự suy ra từ URL hiện tại, nhãn lấy từ `SEGMENT_LABELS`.
 * Mục cuối không phải link vì đang ở chính trang đó.
 */
export function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbItem>
          {segments.length === 0 ? (
            <BreadcrumbPage>Tổng quan</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to="/">Tổng quan</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{labelFor(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href}>{labelFor(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
