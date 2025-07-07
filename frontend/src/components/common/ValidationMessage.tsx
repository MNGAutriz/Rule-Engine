import React from 'react';

interface ValidationMessageProps {
  message: string;
  type?: 'success' | 'error';
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ message, type = 'error' }) => {
  const isSuccess = message.includes('✅') || type === 'success';
  
  return (
    <div className={`p-3 rounded-md text-sm ${
      isSuccess 
        ? 'bg-green-50 text-green-800 border border-green-200' 
        : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {message}
    </div>
  );
};

export default ValidationMessage;
