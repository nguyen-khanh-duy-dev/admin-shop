import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';

import { useCategoriesQuery } from '../api';
import { productSchema, type ProductFormValues } from '../schemas';
import { PRODUCT_STATUS_LABELS } from '../types';

/** Giá trị đặc biệt cho mục "không thuộc danh mục nào" — Radix Select không nhận value rỗng. */
const NO_CATEGORY = '__none__';

export type ProductFormProps = {
  defaultValues: ProductFormValues;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  isPending: boolean;
  /** Nhãn nút lưu, ví dụ "Thêm sản phẩm" hoặc "Lưu thay đổi". */
  submitLabel: string;
  onCancel?: () => void;
};

/**
 * Form thêm/sửa sản phẩm. Dùng chung một Zod schema với type của form nên
 * ràng buộc hiển thị trên UI luôn khớp với type được kiểm tra lúc build.
 */
export function ProductForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
}: ProductFormProps) {
  const categoriesQuery = useCategoriesQuery();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const price = form.watch('price');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
        noValidate
      >
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm</FormLabel>
                  <FormControl>
                    <Input placeholder="Áo thun cotton nam" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="AO-THUN-001"
                      className="font-mono"
                      {...field}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>Mã quản lý nội bộ, không được trùng.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Chất liệu, kích cỡ, hướng dẫn bảo quản…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh sản phẩm (URL)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Giá và tồn kho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán (VND)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        inputMode="numeric"
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === '' ? Number.NaN : Number(event.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    {Number.isFinite(price) && price > 0 ? (
                      <FormDescription>{formatCurrency(price)}</FormDescription>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng tồn</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === '' ? Number.NaN : Number(event.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân loại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select
                      value={field.value === '' ? NO_CATEGORY : field.value}
                      onValueChange={(value) => field.onChange(value === NO_CATEGORY ? '' : value)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_CATEGORY}>Không phân loại</SelectItem>
                        {(categoriesQuery.data ?? []).map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
              {submitLabel}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Huỷ
              </Button>
            ) : null}
          </div>
        </div>
      </form>
    </Form>
  );
}
