import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email.').email('Email không đúng định dạng.'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự.'),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = loginSchema.pick({ email: true });

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
