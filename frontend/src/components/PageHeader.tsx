import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconBgColor?: string;
  titleColor?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon: Icon,
  iconBgColor = "bg-blue-700",
  titleColor = "text-blue-700"
}) => {
  return (
    <div className="text-center space-y-4">
      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${iconBgColor} mb-4 shadow-lg`}>
        <Icon className="h-10 w-10 text-white" />
      </div>
      <h1 className={`text-4xl font-bold ${titleColor} tracking-tight`}>
        {title}
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        {subtitle}
      </p>
    </div>
  );
};

export default PageHeader;
