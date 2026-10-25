import { useEffect, useRef, useState } from 'react';

import { useDebounce } from './use-debounce';

/**
 * Ô tìm kiếm có debounce, đồng bộ hai chiều với một giá trị bên ngoài (ở đây là
 * query string trên URL).
 *
 * Người dùng gõ tới đâu input hiện tới đó, nhưng `onCommit` chỉ được gọi sau
 * khi ngừng gõ `delay` ms — nên không sinh một request cho mỗi ký tự. Ngược
 * lại, khi `value` đổi vì lý do bên ngoài (bấm back/forward, bấm "Bỏ lọc") thì
 * input được nạp lại theo giá trị mới.
 *
 *   const [search, setSearch] = useDebouncedSearch(filters.q, (q) => onChange({ q }));
 */
export function useDebouncedSearch(
  value: string,
  onCommit: (next: string) => void,
  delay = 350,
): readonly [string, (next: string) => void] {
  const [draft, setDraft] = useState(value);
  /** Giá trị đã khớp giữa input và bên ngoài — dùng để biết phía nào vừa đổi. */
  const synced = useRef(value);
  const debounced = useDebounce(draft, delay);

  // Giữ callback trong ref để nơi gọi truyền arrow function inline cũng được,
  // không làm effect bên dưới chạy lại mỗi lần render.
  const commitRef = useRef(onCommit);
  useEffect(() => {
    commitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    if (debounced === synced.current) return;
    synced.current = debounced;
    commitRef.current(debounced);
  }, [debounced]);

  useEffect(() => {
    if (value === synced.current) return;
    synced.current = value;
    // URL là một nguồn dữ liệu bên ngoài React, và đây đúng là việc đồng bộ
    // state nội bộ theo nó — trường hợp mà quy tắc này không bao phủ. Không
    // dùng được cách "tính trong lúc render" vì còn phải cập nhật `synced` để
    // phân biệt thay đổi do người dùng gõ với thay đổi do điều hướng.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(value);
  }, [value]);

  return [draft, setDraft] as const;
}
