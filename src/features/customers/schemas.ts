import { z } from 'zod';

import type { TablesInsert, TablesUpdate } from '@/types';

import type { Customer } from './types';

/** Số điện thoại Việt Nam: 10 số bắt đầu bằng 0, cho phép dấu cách hoặc gạch. */
const PHONE_PATTERN = /^0\d{9}$/;

export const customerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Tên khách hàng tối thiểu 2 ký tự.')
    .max(120, 'Tên khách hàng tối đa 120 ký tự.'),
  email: z.union([z.literal(''), z.email('Email không đúng định dạng.')]),
  phone: z.union([
    z.literal(''),
    z
      .string()
      .trim()
      .transform((value) => value.replace(/[\s.-]/g, ''))
      .refine(
        (value) => PHONE_PATTERN.test(value),
        'Số điện thoại phải gồm 10 số, bắt đầu bằng 0.',
      ),
  ]),
  address: z.string().trim().max(255, 'Địa chỉ tối đa 255 ký tự.'),
  city: z.string().trim().max(100, 'Tỉnh/thành tối đa 100 ký tự.'),
});

export type CustomerFormValues = z.input<typeof customerSchema>;
export type CustomerFormOutput = z.output<typeof customerSchema>;

export const CUSTOMER_FORM_DEFAULTS: CustomerFormValues = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
};

export function toCustomerPayload(
  values: CustomerFormOutput,
): TablesInsert<'customers'> & TablesUpdate<'customers'> {
  return {
    full_name: values.fullName,
    email: values.email === '' ? null : values.email,
    phone: values.phone === '' ? null : values.phone,
    address: values.address === '' ? null : values.address,
    city: values.city === '' ? null : values.city,
  };
}

export function toCustomerFormValues(customer: Customer): CustomerFormValues {
  return {
    fullName: customer.full_name,
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    address: customer.address ?? '',
    city: customer.city ?? '',
  };
}
