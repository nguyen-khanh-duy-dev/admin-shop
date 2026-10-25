import { useEffect, useState } from 'react';

/**
 * Trả về `value` sau khi nó ngừng đổi trong `delay` ms.
 * Dùng cho ô tìm kiếm: gõ liên tục nhưng chỉ gọi API một lần.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
