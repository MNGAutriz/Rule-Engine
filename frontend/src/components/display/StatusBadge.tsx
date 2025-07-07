import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'ended' | 'upcoming' | 'online' | 'offline';
  text?: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, size = 'sm' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
      case 'online':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: CheckCircle,
          defaultText: status === 'active' ? 'Active' : 'Online'
        };
      case 'inactive':
      case 'offline':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: Clock,
          defaultText: status === 'inactive' ? 'Inactive' : 'Offline'
        };
      case 'ended':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: XCircle,
          defaultText: 'Ended'
        };
      case 'upcoming':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: Clock,
          defaultText: 'Upcoming'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: Clock,
          defaultText: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const displayText = text || config.defaultText;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full ${textSize} font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon className={`${iconSize} mr-1`} />
      {displayText}
    </span>
  );
};

export default StatusBadge;
