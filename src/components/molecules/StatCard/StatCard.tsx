import { HTMLAttributes, forwardRef } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/atoms/Card';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils';

export interface StatCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
    positive?: boolean;
  };
  description?: string;
}

/**
 * StatCard molecule for displaying statistics with optional trend
 *
 * @example
 * <StatCard
 *   title="Total Scans Today"
 *   value={234}
 *   icon={Users}
 *   trend={{ value: '+12%', direction: 'up', positive: true }}
 * />
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, icon, trend, description, className, ...props }, ref) => {
    return (
      <Card ref={ref} padding="lg" hover className={className} {...props}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>

            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}

            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <Icon
                  icon={trend.direction === 'up' ? TrendingUp : TrendingDown}
                  size="sm"
                  className={cn(trend.positive ? 'text-success' : 'text-error')}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.positive ? 'text-success' : 'text-error',
                  )}
                >
                  {trend.value}
                </span>
              </div>
            )}
          </div>

          {icon && (
            <div className="rounded-lg bg-primary/10 p-3">
              <Icon icon={icon} size="lg" className="text-primary" />
            </div>
          )}
        </div>
      </Card>
    );
  },
);

StatCard.displayName = 'StatCard';
