import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/display/StatusBadge';
import { Eye } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Rule {
  id?: string;
  name?: string;
  active?: boolean;
  priority?: number;
  event?: {
    type?: string;
    params?: Record<string, any>;
  };
  markets?: string[];
}

interface RuleCardProps {
  rule: Rule;
  index: number;
  categoryColor: string;
  categoryIcon: LucideIcon;
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, index, categoryColor, categoryIcon: CategoryIcon }) => {
  // Define stronger border classes for each category
  const getBorderClass = (color: string) => {
    switch(color) {
      case 'emerald': return 'border-2 border-emerald-400 hover:border-emerald-500';
      case 'purple': return 'border-2 border-purple-400 hover:border-purple-500';
      case 'orange': return 'border-2 border-orange-400 hover:border-orange-500';
      case 'red': return 'border-2 border-red-400 hover:border-red-500';
      default: return 'border-2 border-gray-400 hover:border-gray-500';
    }
  };

  return (
    <Card className={`${getBorderClass(categoryColor)} hover:shadow-lg transition-all duration-300 cursor-pointer`}>
      <CardHeader className={`bg-${categoryColor}-50 pb-3 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${categoryColor}-200 rounded-lg`}>
              <CategoryIcon className={`h-5 w-5 text-${categoryColor}-700`} />
            </div>
            <div>
              <CardTitle className={`text-lg font-bold text-${categoryColor}-800 line-clamp-1`}>
                {rule.name || `Rule ${index + 1}`}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <StatusBadge 
                  status={rule.active !== false ? 'active' : 'inactive'}
                />
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryColor}-200 text-${categoryColor}-800`}>
                  Priority: {rule.priority || 1}
                </span>
              </div>
            </div>
          </div>
          <Eye className="h-5 w-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Event Type:</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${categoryColor}-50 text-${categoryColor}-700 border border-${categoryColor}-200`}>
              {rule.event?.type || 'Unknown'}
            </span>
          </div>
          
          {rule.markets && rule.markets.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Markets:</p>
              <div className="flex flex-wrap gap-1">
                {rule.markets.map((market) => (
                  <span key={market} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {market}
                  </span>
                ))}
              </div>
            </div>
          )}

          {rule.event?.params && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Configuration:</p>
              <div className="bg-gray-50 rounded-lg p-3 text-xs">
                {Object.entries(rule.event.params).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center mb-1 last:mb-0">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-medium text-gray-800">
                      {typeof value === 'object' ? JSON.stringify(value).slice(0, 20) + '...' : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RuleCard;
