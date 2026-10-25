import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type FilterValue = string | number;

/**
 * Đồng bộ bộ lọc của trang danh sách với query string trên URL.
 *
 * Nhờ vậy người dùng F5 hay copy link vẫn giữ nguyên trạng thái lọc, và nút
 * back/forward của trình duyệt hoạt động đúng.
 *
 * `defaults` nên là hằng số đặt ngoài component để tránh tính lại mỗi lần render:
 *
 *   const DEFAULTS = { q: '', status: 'all', page: 1 };
 *   const { filters, setFilters, resetFilters } = useUrlFilters(DEFAULTS);
 *
 * Giá trị trùng với default sẽ bị xoá khỏi URL để link gọn. Khi đổi bất kỳ bộ
 * lọc nào mà không truyền `page`, `page` tự quay về mặc định — tránh cảnh lọc
 * xong lại đứng ở trang 5 trống rỗng.
 */
export function useUrlFilters<T extends Record<string, FilterValue>>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result = { ...defaults };

    for (const key of Object.keys(defaults)) {
      const raw = searchParams.get(key);
      if (raw === null || raw === '') continue;

      const fallback = defaults[key];
      if (typeof fallback === 'number') {
        const parsed = Number(raw);
        result[key as keyof T] = (Number.isFinite(parsed) ? parsed : fallback) as T[keyof T];
      } else {
        result[key as keyof T] = raw as T[keyof T];
      }
    }

    return result;
  }, [searchParams, defaults]);

  const setFilters = useCallback(
    (patch: Partial<T>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          const entries = { ...patch };

          if (!('page' in entries) && 'page' in defaults) {
            next.delete('page');
          }

          for (const [key, value] of Object.entries(entries)) {
            if (value === undefined) continue;
            const isDefault = value === defaults[key];
            if (isDefault || value === '') next.delete(key);
            else next.set(key, String(value));
          }

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, defaults],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  /** True khi người dùng đã đổi ít nhất một bộ lọc so với mặc định. */
  const isFiltered = useMemo(
    () => Object.keys(defaults).some((key) => filters[key] !== defaults[key]),
    [filters, defaults],
  );

  return { filters, setFilters, resetFilters, isFiltered };
}
