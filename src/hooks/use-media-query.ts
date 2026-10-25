import { useCallback, useSyncExternalStore } from 'react';

const SUPPORTED = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/**
 * Theo dõi một media query, ví dụ `useMediaQuery('(min-width: 768px)')`.
 *
 * Dùng `useSyncExternalStore` vì `matchMedia` đúng là một external store:
 * React tự lo việc đăng ký, huỷ đăng ký và đọc lại giá trị mới nhất, nên không
 * cần `useState` + `useEffect` và không có khoảng thời gian state bị lệch.
 * Trả về false ở môi trường không có `matchMedia`.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!SUPPORTED) return () => undefined;

      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', onStoreChange);
      return () => mediaQueryList.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (!SUPPORTED) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Breakpoint `md` của Tailwind: true khi màn hình nhỏ hơn 768px. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
