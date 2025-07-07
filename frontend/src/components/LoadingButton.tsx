import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface LoadingButtonProps {
  loading: boolean;
  disabled?: boolean;
  onClick?: () => void;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  disabled,
  onClick,
  loadingText = 'Loading...',
  children,
  className = '',
  type = 'button'
}) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;
