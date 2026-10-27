import { PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/features/auth/hooks';
import { useUrlFilters } from '@/hooks';

import { useProductsQuery } from '../api';
import { ProductFilters, ProductTable } from '../components';
import {
  isProductSortField,
  isProductStatus,
  type ProductListFilters as Filters,
  type ProductSortField,
} from '../types';

const PAGE_SIZE = 20;

/** Bộ lọc mặc định, cũng là tập khoá được đọc từ query string. */
const DEFAULT_URL_FILTERS = {
  q: '',
  status: 'all',
  stock: 'all',
  category: 'all',
  page: 1,
  sort: 'created_at',
  dir: 'desc',
};

export default function ProductListPage() {
  const navigate = useNavigate();
  const { can } = usePermission();
  const {
    filters: urlFilters,
    setFilters,
    resetFilters,
    isFiltered,
  } = useUrlFilters(DEFAULT_URL_FILTERS);

  // Query string là chuỗi thuần; quy về type nghiệp vụ ở đúng một chỗ.
  const filters: Filters = {
    q: urlFilters.q,
    status: isProductStatus(urlFilters.status) ? urlFilters.status : 'all',
    stock: urlFilters.stock === 'low' ? 'low' : 'all',
    categoryId: urlFilters.category === 'all' ? 'all' : Number(urlFilters.category),
    page: urlFilters.page,
    pageSize: PAGE_SIZE,
    sortBy: isProductSortField(urlFilters.sort) ? urlFilters.sort : 'created_at',
    sortDir: urlFilters.dir === 'asc' ? 'asc' : 'desc',
  };

  const productsQuery = useProductsQuery(filters);

  function handleFiltersChange(patch: Partial<Filters>) {
    setFilters({
      ...(patch.q !== undefined ? { q: patch.q } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.stock !== undefined ? { stock: patch.stock } : {}),
      ...(patch.categoryId !== undefined ? { category: String(patch.categoryId) } : {}),
    });
  }

  function handleSortChange(sortBy: ProductSortField, sortDir: 'asc' | 'desc') {
    setFilters({ sort: sortBy, dir: sortDir });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sản phẩm"
        description="Quản lý danh mục hàng hoá, giá bán và tồn kho."
        actions={
          can('products.create') ? (
            <Button onClick={() => void navigate('/san-pham/moi')}>
              <PlusIcon className="size-4" aria-hidden />
              Thêm sản phẩm
            </Button>
          ) : null
        }
      />

      <ProductFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={resetFilters}
        isFiltered={isFiltered}
      />

      <ProductTable
        products={productsQuery.data?.rows ?? []}
        isLoading={productsQuery.isPending}
        isError={productsQuery.isError}
        error={productsQuery.error}
        onRetry={() => void productsQuery.refetch()}
        pagination={{
          page: filters.page,
          pageSize: PAGE_SIZE,
          total: productsQuery.data?.total ?? 0,
          pageCount: productsQuery.data?.pageCount ?? 1,
          onPageChange: (page) => setFilters({ page }),
        }}
        sortBy={filters.sortBy}
        sortDir={filters.sortDir}
        onSortChange={handleSortChange}
        isFiltered={isFiltered}
      />
    </div>
  );
}
