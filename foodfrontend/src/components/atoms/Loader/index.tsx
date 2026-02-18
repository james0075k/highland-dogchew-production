import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  const spinnerClasses = `animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`;

  if (text) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className={spinnerClasses}></div>
        <span className="text-gray-600 text-base">{text}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={spinnerClasses}></div>
    </div>
  );
};

export default Loader; 