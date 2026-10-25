import type { Category, ProductWithCategory } from '@/features/products/types';
import type { Tables } from '@/types';

export const categoryFixtures: Category[] = [
  { id: 1, name: 'Áo', slug: 'ao', created_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: 'Quần', slug: 'quan', created_at: '2026-01-01T00:00:00Z' },
];

export const productFixtures: ProductWithCategory[] = [
  {
    id: 1,
    category_id: 1,
    name: 'Áo thun cotton nam',
    sku: 'AO-THUN-001',
    description: 'Cotton 100%',
    price: 199_000,
    stock: 42,
    status: 'active',
    image_url: null,
    created_at: '2026-10-01T03:00:00Z',
    updated_at: '2026-10-01T03:00:00Z',
    category: { id: 1, name: 'Áo' },
  },
  {
    id: 2,
    category_id: 2,
    name: 'Quần jeans slim',
    sku: 'QUAN-JEAN-002',
    description: null,
    price: 549_000,
    stock: 0,
    status: 'active',
    image_url: null,
    created_at: '2026-10-02T03:00:00Z',
    updated_at: '2026-10-02T03:00:00Z',
    category: { id: 2, name: 'Quần' },
  },
  {
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
    category: null,
  },
];

export const customerFixtures: Tables<'customers'>[] = [
  {
    id: 1,
    full_name: 'Nguyễn Văn A',
    email: 'a@example.com',
    phone: '0901234567',
    address: 'Số 1 Lê Lợi',
    city: 'Hà Nội',
    created_at: '2026-09-20T03:00:00Z',
  },
];

export const profileFixture: Tables<'profiles'> = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Nguyễn Duy',
  avatar_url: null,
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
};
