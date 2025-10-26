import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import { LoadingSpinnerProps } from '@/types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-primary',
        sizes[size],
        className
      )}
    />
  );
};

export default LoadingSpinner;