import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  gradientColors: string;
  iconBgColor?: string;
  descriptionIcon?: LucideIcon;
}

interface StatsGridProps {
  stats: StatCard[];
  columns?: 'auto' | '2' | '3' | '4';
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, columns = 'auto' }) => {
  const getGridCols = () => {
    switch (columns) {
      case '2': return 'grid-cols-1 md:grid-cols-2';
      case '3': return 'grid-cols-1 md:grid-cols-3';
      case '4': return 'grid-cols-1 md:grid-cols-4';
      default: return `grid-cols-1 md:grid-cols-${Math.min(stats.length, 4)}`;
    }
  };

  return (
    <div className={`grid ${getGridCols()} gap-6`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const DescIcon = stat.descriptionIcon;
        
        return (
          <Card 
            key={index}
            className={`${stat.gradientColors} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={`text-sm font-semibold uppercase tracking-wider ${stat.iconBgColor?.includes('orange') ? 'text-orange-100' : 
                stat.iconBgColor?.includes('emerald') ? 'text-emerald-100' :
                stat.iconBgColor?.includes('purple') ? 'text-purple-100' :
                stat.iconBgColor?.includes('red') ? 'text-red-100' :
                'text-white/80'}`}>
                {stat.title}
              </CardTitle>
              <div className="p-3 bg-white/20 rounded-xl">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className={`flex items-center ${stat.iconBgColor?.includes('orange') ? 'text-orange-100' : 
                stat.iconBgColor?.includes('emerald') ? 'text-emerald-100' :
                stat.iconBgColor?.includes('purple') ? 'text-purple-100' :
                stat.iconBgColor?.includes('red') ? 'text-red-100' :
                'text-white/80'}`}>
                {DescIcon && <DescIcon className="h-4 w-4 mr-1" />}
                <span className="text-sm">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsGrid;
