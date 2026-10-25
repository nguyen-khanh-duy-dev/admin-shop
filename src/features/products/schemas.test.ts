import { describe, expect, it } from 'vitest';

import {
  PRODUCT_FORM_DEFAULTS,
  productSchema,
  toProductFormValues,
  toProductPayload,
} from './schemas';
import type { Product } from './types';

const validValues = {
  name: 'Áo thun cotton nam',
  sku: 'AO-THUN-001',
  description: 'Cotton 100%',
  price: 199_000,
  stock: 42,
  status: 'active' as const,
  categoryId: '1',
  imageUrl: '',
};

describe('productSchema', () => {
  it('nhận giá trị hợp lệ', () => {
    const result = productSchema.safeParse(validValues);
    expect(result.success).toBe(true);
  });

  it('từ chối tên ngắn hơn 2 ký tự', () => {
    const result = productSchema.safeParse({ ...validValues, name: 'A' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('tối thiểu 2 ký tự');
  });

  it('từ chối SKU có chữ thường', () => {
    const result = productSchema.safeParse({ ...validValues, sku: 'ao-thun-001' });
    expect(result.success).toBe(false);
  });

  it('từ chối giá âm', () => {
    const result = productSchema.safeParse({ ...validValues, price: -1 });
    expect(result.success).toBe(false);
  });

  it('từ chối giá có phần thập phân', () => {
    const result = productSchema.safeParse({ ...validValues, price: 199_000.5 });
    expect(result.success).toBe(false);
  });

  it('từ chối tồn kho âm', () => {
    const result = productSchema.safeParse({ ...validValues, stock: -5 });
    expect(result.success).toBe(false);
  });

  it('nhận ảnh rỗng nhưng từ chối URL sai', () => {
    expect(productSchema.safeParse({ ...validValues, imageUrl: '' }).success).toBe(true);
    expect(productSchema.safeParse({ ...validValues, imageUrl: 'khong-phai-url' }).success).toBe(
      false,
    );
  });

  it('cắt khoảng trắng ở đầu và cuối tên', () => {
    const result = productSchema.safeParse({ ...validValues, name: '  Áo thun  ' });
    expect(result.success && result.data.name).toBe('Áo thun');
  });

  it('giá trị mặc định của form là hợp lệ về mặt type nhưng chưa đủ để lưu', () => {
    // Tên và SKU rỗng: form mới mở thì chưa submit được, đúng như mong muốn.
    expect(productSchema.safeParse(PRODUCT_FORM_DEFAULTS).success).toBe(false);
  });
});

describe('toProductPayload', () => {
  it('đổi chuỗi rỗng thành null cho các cột cho phép null', () => {
    const payload = toProductPayload({ ...validValues, description: '', imageUrl: '' });

    expect(payload.description).toBeNull();
    expect(payload.image_url).toBeNull();
  });

  it('đổi categoryId rỗng thành null', () => {
    const payload = toProductPayload({ ...validValues, categoryId: '' });
    expect(payload.category_id).toBeNull();
  });

  it('đổi categoryId sang số', () => {
    const payload = toProductPayload({ ...validValues, categoryId: '7' });
    expect(payload.category_id).toBe(7);
  });
});

describe('toProductFormValues', () => {
  it('đổi null từ database thành chuỗi rỗng cho form', () => {
    const product: Product = {
      id: 3,
      category_id: null,
      name: 'Mũ lưỡi trai',
      sku: 'MU-LT-003',
      description: null,
      price: 89_000,
      stock: 7,
      status: 'draft',
      image_url: null,
      created_at: '2026-10-03T03:00:00Z',
      updated_at: '2026-10-03T03:00:00Z',
    };

    expect(toProductFormValues(product)).toEqual({
      name: 'Mũ lưỡi trai',
      sku: 'MU-LT-003',
      description: '',
      price: 89_000,
      stock: 7,
      status: 'draft',
      categoryId: '',
      imageUrl: '',
    });
  });
});
