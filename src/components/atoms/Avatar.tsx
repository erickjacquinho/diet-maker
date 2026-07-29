import React from 'react';

export interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'emerald' | 'charcoal' | 'inner';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = 'md',
  variant = 'inner',
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-sm',
  };

  const variants = {
    emerald: 'bg-warm-emerald text-white font-bold',
    charcoal: 'bg-warm-charcoal text-white font-black',
    inner: 'bg-warm-inner border border-warm-borderDark text-warm-charcoal font-black',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {initials}
    </div>
  );
};
