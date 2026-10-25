import { ClockIcon, PackageIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';

import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { useAuth } from '@/features/auth/hooks';
import { formatCurrency, formatNumber } from '@/lib/utils';

import { useDashboardStatsQuery } from '../api';
import { LowStockCard, RecentOrdersCard, StatCard } from '../components';

export default function DashboardPage() {
  const { profile } = useAuth();
  const statsQuery = useDashboardStatsQuery();
  const stats = statsQuery.data;
  const isLoading = statsQuery.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={profile?.full_name ? `Chào ${profile.full_name}` : 'Tổng quan'}
        description="Tình hình bán hàng hôm nay và 30 ngày gần nhất."
      />

      {statsQuery.isError ? (
        <ErrorState
          title="Không tải được số liệu tổng quan"
          error={statsQuery.error}
          onRetry={() => void statsQuery.refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Doanh thu hôm nay"
            value={formatCurrency(stats?.revenueToday ?? 0)}
            hint={`30 ngày: ${formatCurrency(stats?.revenueMonth ?? 0)}`}
            icon={TrendingUpIcon}
            isLoading={isLoading}
          />
          <StatCard
            label="Đơn hôm nay"
            value={formatNumber(stats?.ordersToday ?? 0)}
            hint={`${formatNumber(stats?.pendingOrders ?? 0)} đơn chờ xử lý`}
            icon={ClockIcon}
            isLoading={isLoading}
          />
          <StatCard
            label="Sản phẩm đang bán"
            value={formatNumber(stats?.activeProducts ?? 0)}
            icon={PackageIcon}
            isLoading={isLoading}
          />
          <StatCard
            label="Khách hàng mới"
            value={formatNumber(stats?.newCustomers ?? 0)}
            hint="Trong 30 ngày"
            icon={UsersIcon}
            isLoading={isLoading}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrdersCard />
        <LowStockCard />
      </div>
    </div>
  );
}
