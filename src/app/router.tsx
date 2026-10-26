import { lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { AppLayout } from '@/components/layout';
import { ProtectedRoute, RoleGuard } from '@/features/auth/components';

import { NotFoundPage } from './not-found-page';

/**
 * Mỗi trang là một chunk riêng (lazy load), nên mở app chỉ tải đúng trang đang
 * cần. Fallback khi chunk chưa về là `<Suspense>` trong `AppLayout`.
 */
const LoginPage = lazy(() => import('@/features/auth/pages/login-page'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard-page'));
const ProductListPage = lazy(() => import('@/features/products/pages/product-list-page'));
const ProductEditPage = lazy(() => import('@/features/products/pages/product-edit-page'));
const OrderListPage = lazy(() => import('@/features/orders/pages/order-list-page'));
const OrderDetailPage = lazy(() => import('@/features/orders/pages/order-detail-page'));
const CustomerListPage = lazy(() => import('@/features/customers/pages/customer-list-page'));
const CustomerDetailPage = lazy(() => import('@/features/customers/pages/customer-detail-page'));

const router = createBrowserRouter([
  {
    path: '/dang-nhap',
    element: <LoginPage />,
  },
  {
    // Tầng 1: phải đăng nhập. Tầng 2: khung giao diện. Tầng 3: quyền theo feature.
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: 'san-pham',
            element: <RoleGuard permission="products.view" />,
            children: [
              { index: true, element: <ProductListPage /> },
              { path: 'moi', element: <ProductEditPage /> },
              { path: ':id/sua', element: <ProductEditPage /> },
            ],
          },
          {
            path: 'don-hang',
            element: <RoleGuard permission="orders.view" />,
            children: [
              { index: true, element: <OrderListPage /> },
              { path: ':id', element: <OrderDetailPage /> },
            ],
          },
          {
            path: 'khach-hang',
            element: <RoleGuard permission="customers.view" />,
            children: [
              { index: true, element: <CustomerListPage /> },
              { path: ':id', element: <CustomerDetailPage /> },
            ],
          },
          { path: '404', element: <NotFoundPage /> },
          { path: '*', element: <Navigate to="/404" replace /> },
        ],
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
