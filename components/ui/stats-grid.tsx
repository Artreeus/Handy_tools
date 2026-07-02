import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatItem {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  caption?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  /** 'inline': label/value pairs in a plain grid (place inside your own Card). 'cards': each stat as its own bordered Card with an optional icon. */
  variant?: 'inline' | 'cards';
}

export function StatsGrid({ stats, variant = 'inline' }: StatsGridProps) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {stat.icon && <stat.icon className={`h-4 w-4 ${stat.iconClassName ?? 'text-slate-500'}`} />}
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold mt-1 ${stat.valueClassName ?? ''}`}>{stat.value}</div>
              {stat.caption && <div className="text-xs text-slate-500">{stat.caption}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="font-medium text-slate-900">{stat.label}</div>
          <div className={stat.valueClassName ?? 'text-slate-600'}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
