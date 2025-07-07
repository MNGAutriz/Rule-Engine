import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface NavigationItemProps {
  id: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  onClick: (id: string) => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ 
  id, 
  icon: Icon, 
  label, 
  isActive, 
  collapsed, 
  onClick 
}) => {
  return (
    <li className="group">
      <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer relative overflow-hidden
          ${isActive 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
          }
          ${collapsed ? 'justify-center px-2' : ''}
        `}
      >
        <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'text-white' : 'group-hover:text-blue-600'}`} />
        <span className={`font-medium transition-all duration-300 ${collapsed ? 'hidden' : 'opacity-100'}`}>
          {label}
        </span>
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-10 rounded-lg"></div>
        )}
      </button>
    </li>
  );
};

export default NavigationItem;
