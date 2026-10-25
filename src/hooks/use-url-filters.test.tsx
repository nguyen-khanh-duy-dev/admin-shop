import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useUrlFilters } from './use-url-filters';

const DEFAULTS = { q: '', status: 'all', page: 1 };

function setup(route = '/') {
  return renderHook(() => ({ filters: useUrlFilters(DEFAULTS), location: useLocation() }), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>,
  });
}

describe('useUrlFilters', () => {
  it('trả về giá trị mặc định khi URL không có query string', () => {
    const { result } = setup();

    expect(result.current.filters.filters).toEqual(DEFAULTS);
    expect(result.current.filters.isFiltered).toBe(false);
  });

  it('đọc giá trị từ query string và ép đúng kiểu số', () => {
    const { result } = setup('/?q=ao&status=draft&page=3');

    expect(result.current.filters.filters).toEqual({ q: 'ao', status: 'draft', page: 3 });
    expect(result.current.filters.isFiltered).toBe(true);
  });

  it('bỏ qua page không phải số và dùng giá trị mặc định', () => {
    const { result } = setup('/?page=khong-phai-so');

    expect(result.current.filters.filters.page).toBe(1);
  });

  it('ghi giá trị mới lên URL', () => {
    const { result } = setup();

    act(() => {
      result.current.filters.setFilters({ q: 'jeans' });
    });

    expect(result.current.location.search).toBe('?q=jeans');
    expect(result.current.filters.filters.q).toBe('jeans');
  });

  it('xoá khỏi URL khi giá trị trùng mặc định', () => {
    const { result } = setup('/?status=draft');

    act(() => {
      result.current.filters.setFilters({ status: 'all' });
    });

    expect(result.current.location.search).toBe('');
  });

  it('đổi bộ lọc khác thì page quay về mặc định', () => {
    const { result } = setup('/?page=5');

    act(() => {
      result.current.filters.setFilters({ q: 'ao' });
    });

    expect(result.current.filters.filters.page).toBe(1);
    expect(result.current.location.search).toBe('?q=ao');
  });

  it('đổi trực tiếp page thì giữ nguyên page vừa truyền', () => {
    const { result } = setup('/?q=ao');

    act(() => {
      result.current.filters.setFilters({ page: 2 });
    });

    expect(result.current.filters.filters).toEqual({ q: 'ao', status: 'all', page: 2 });
  });

  it('resetFilters xoá toàn bộ query string', () => {
    const { result } = setup('/?q=ao&status=draft&page=4');

    act(() => {
      result.current.filters.resetFilters();
    });

    expect(result.current.location.search).toBe('');
    expect(result.current.filters.isFiltered).toBe(false);
  });
});
