import { z } from 'zod';

import type { TablesInsert, TablesUpdate } from '@/types';

import type { Product, ProductStatus } from './types';

export const PRODUCT_STATUS_VALUES = ['active', 'draft', 'archived'] as const satisfies readonly [
  ProductStatus,
  ...ProductStatus[],
];

/**
 * Schema dùng chung cho form và type.
 *
 * Các ràng buộc ở đây khớp với CHECK constraint trong database
 * (`char_length(name) between 2 and 200`, `price >= 0`, `stock >= 0`) để người
 * dùng thấy lỗi ngay trên form thay vì đợi Postgres từ chối.
 */
export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tên sản phẩm tối thiểu 2 ký tự.')
    .max(200, 'Tên sản phẩm tối đa 200 ký tự.'),
  sku: z
    .string()
    .trim()
    .min(3, 'SKU tối thiểu 3 ký tự.')
    .max(50, 'SKU tối đa 50 ký tự.')
    .regex(/^[A-Z0-9][A-Z0-9-]*$/, 'SKU chỉ gồm chữ in hoa, số và dấu gạch ngang.'),
  description: z.string().trim().max(2000, 'Mô tả tối đa 2000 ký tự.'),
  price: z
    .number('Vui lòng nhập giá.')
    .int('Giá tính theo đồng, không có phần thập phân.')
    .min(0, 'Giá không được âm.')
    .max(999_999_999_999, 'Giá vượt quá giới hạn cho phép.'),
  stock: z
    .number('Vui lòng nhập số lượng tồn.')
    .int('Số lượng tồn phải là số nguyên.')
    .min(0, 'Số lượng tồn không được âm.'),
  status: z.enum(PRODUCT_STATUS_VALUES),
  /** '' nghĩa là không thuộc danh mục nào (cột cho phép null). */
  categoryId: z.string(),
  imageUrl: z.union([z.literal(''), z.url('Đường dẫn ảnh không hợp lệ.')]),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const PRODUCT_FORM_DEFAULTS: ProductFormValues = {
  name: '',
  sku: '',
  description: '',
  price: 0,
  stock: 0,
  status: 'draft',
  categoryId: '',
  imageUrl: '',
};

/**
 * Chuyển giá trị form sang payload cho Supabase.
 *
 * Form dùng chuỗi rỗng cho "không có giá trị" (vì input HTML không có null),
 * còn database dùng null — việc quy đổi gom về đúng một chỗ là đây.
 */
export function toProductPayload(
  values: ProductFormValues,
): TablesInsert<'products'> & TablesUpdate<'products'> {
  return {
    name: values.name,
    sku: values.sku,
    description: values.description === '' ? null : values.description,
    price: values.price,
    stock: values.stock,
    status: values.status,
    category_id: values.categoryId === '' ? null : Number(values.categoryId),
    image_url: values.imageUrl === '' ? null : values.imageUrl,
  };
}

/** Chuyển dữ liệu từ database sang giá trị khởi tạo cho form chỉnh sửa. */
export function toProductFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    description: product.description ?? '',
    price: product.price,
    stock: product.stock,
    status: product.status,
    categoryId: product.category_id === null ? '' : String(product.category_id),
    imageUrl: product.image_url ?? '',
  };
}
