import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/utils';

import { useAuth } from '../hooks';
import { loginSchema, type LoginValues } from '../schemas';

/** Form đăng nhập. Sau khi thành công sẽ quay lại trang người dùng định vào. */
export function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // ProtectedRoute lưu lại đường dẫn bị chặn trong `location.state.from`.
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  async function onSubmit(values: LoginValues) {
    try {
      await login(values);
      toast.success('Đăng nhập thành công.');
      void navigate(redirectTo, { replace: true });
    } catch (error) {
      form.setError('password', { message: getErrorMessage(error) });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="ban@shop.vn"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-10"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-1 -translate-y-1/2"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" aria-hidden />
                    ) : (
                      <EyeIcon className="size-4" aria-hidden />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoggingIn}>
          {isLoggingIn ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
          Đăng nhập
        </Button>
      </form>
    </Form>
  );
}
