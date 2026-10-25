import { describe, expect, it } from 'vitest';

import { hasPermission, PERMISSIONS } from './use-permission';

describe('hasPermission', () => {
  it('admin có mọi quyền được khai báo', () => {
    for (const permission of Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]) {
      expect(hasPermission('admin', permission)).toBe(true);
    }
  });

  it('staff xem và sửa được dữ liệu nghiệp vụ', () => {
    expect(hasPermission('staff', 'products.view')).toBe(true);
    expect(hasPermission('staff', 'products.update')).toBe(true);
    expect(hasPermission('staff', 'orders.update')).toBe(true);
  });

  it('staff không xoá được — khớp với policy chỉ cho admin xoá trong database', () => {
    expect(hasPermission('staff', 'products.delete')).toBe(false);
    expect(hasPermission('staff', 'orders.delete')).toBe(false);
    expect(hasPermission('staff', 'customers.delete')).toBe(false);
  });

  it('staff không vào được khu vực cấu hình', () => {
    expect(hasPermission('staff', 'settings.manage')).toBe(false);
  });

  it('chưa tải xong hồ sơ thì không có quyền gì', () => {
    expect(hasPermission(null, 'products.view')).toBe(false);
    expect(hasPermission(undefined, 'dashboard.view')).toBe(false);
  });
});
