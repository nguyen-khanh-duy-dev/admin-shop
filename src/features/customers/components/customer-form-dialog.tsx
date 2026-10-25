import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useCreateCustomer, useUpdateCustomer } from '../api';
import {
  CUSTOMER_FORM_DEFAULTS,
  customerSchema,
  toCustomerFormValues,
  toCustomerPayload,
  type CustomerFormOutput,
  type CustomerFormValues,
} from '../schemas';
import type { Customer } from '../types';

export type CustomerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null nghĩa là thêm mới. */
  customer: Customer | null;
};

/**
 * Hộp thoại thêm/sửa khách hàng.
 *
 * Khách hàng có ít trường nên dùng dialog ngay trên trang danh sách, không cần
 * điều hướng sang trang riêng như sản phẩm.
 */
export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isEditMode = customer !== null;

  const form = useForm<CustomerFormValues, unknown, CustomerFormOutput>({
    resolver: zodResolver(customerSchema),
    defaultValues: CUSTOMER_FORM_DEFAULTS,
  });

  // Dialog không unmount khi đóng, nên phải nạp lại giá trị mỗi lần mở.
  useEffect(() => {
    if (!open) return;
    form.reset(customer ? toCustomerFormValues(customer) : CUSTOMER_FORM_DEFAULTS);
  }, [open, customer, form]);

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  async function onSubmit(values: CustomerFormOutput) {
    const payload = toCustomerPayload(values);

    if (isEditMode) await updateCustomer.mutateAsync({ id: customer.id, patch: payload });
    else await createCustomer.mutateAsync(payload);

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Sửa khách hàng' : 'Thêm khách hàng'}</DialogTitle>
          <DialogDescription>
            Email và số điện thoại không bắt buộc, nhưng rất nên có để liên hệ khi giao hàng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="khach@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input type="tel" inputMode="tel" placeholder="0901234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Số nhà, đường, phường/xã…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tỉnh/Thành phố</FormLabel>
                  <FormControl>
                    <Input placeholder="Hà Nội" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
                {isEditMode ? 'Lưu thay đổi' : 'Thêm khách hàng'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
