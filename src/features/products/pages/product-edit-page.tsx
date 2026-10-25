import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { useNavigate, useParams } from 'react-router-dom';

import { useCreateProduct, useProductQuery, useUpdateProduct } from '../api';
import { ProductForm } from '../components';
import {
  PRODUCT_FORM_DEFAULTS,
  toProductFormValues,
  toProductPayload,
  type ProductFormValues,
} from '../schemas';

/**
 * Trang thêm mới và chỉnh sửa sản phẩm.
 *
 * Cùng một component phục vụ hai route: `/san-pham/moi` (không có `:id`) và
 * `/san-pham/:id/sua`. Form và validation giống nhau, chỉ khác mutation được
 * gọi khi submit.
 */
export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const productId = id === undefined ? null : Number(id);
  const isEditMode = productId !== null;

  const productQuery = useProductQuery(productId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  async function handleSubmit(values: ProductFormValues) {
    const payload = toProductPayload(values);

    if (isEditMode) {
      await updateProduct.mutateAsync({ id: productId, patch: payload });
    } else {
      await createProduct.mutateAsync(payload);
    }

    void navigate('/san-pham');
  }

  if (isEditMode && productQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isEditMode && productQuery.isError) {
    return (
      <ErrorState
        title="Không tải được sản phẩm"
        error={productQuery.error}
        onRetry={() => void productQuery.refetch()}
      />
    );
  }

  const product = productQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? (product?.name ?? 'Chỉnh sửa sản phẩm') : 'Thêm sản phẩm'}
        description={
          isEditMode
            ? 'Cập nhật thông tin, giá bán và tồn kho của sản phẩm.'
            : 'Điền thông tin để thêm sản phẩm mới vào danh mục.'
        }
      />

      <ProductForm
        defaultValues={product ? toProductFormValues(product) : PRODUCT_FORM_DEFAULTS}
        onSubmit={handleSubmit}
        isPending={createProduct.isPending || updateProduct.isPending}
        submitLabel={isEditMode ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
        onCancel={() => void navigate('/san-pham')}
      />
    </div>
  );
}
