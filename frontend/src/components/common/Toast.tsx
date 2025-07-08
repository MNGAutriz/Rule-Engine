import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';
  const iconBgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';

  return (
    <div className={`fixed top-4 right-4 z-[9999] max-w-md w-full transform transition-all duration-300 ease-in-out animate-in slide-in-from-right-4 fade-in-0`}>
      <div className={`${bgColor} ${borderColor} ${textColor} bg-opacity-90 backdrop-blur-lg border-2 border-opacity-70 rounded-xl p-4 shadow-2xl ring-1 ring-white ring-opacity-20`}>
        <div className="flex items-start gap-3">
          <div className={`${iconBgColor} ${iconColor} bg-opacity-80 flex-shrink-0 mt-0.5 p-2 rounded-lg shadow-sm`}>
            {type === 'success' ? (
              <CheckCircle className="h-5 w-5 drop-shadow-sm" />
            ) : (
              <XCircle className="h-5 w-5 drop-shadow-sm" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-relaxed drop-shadow-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0 ml-2 p-1 rounded-lg hover:bg-black hover:bg-opacity-5`}
          >
            <X className="h-4 w-4 drop-shadow-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
