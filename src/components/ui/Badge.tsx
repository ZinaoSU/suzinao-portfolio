import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'purple' | 'cyan' | 'orange' | 'green' | 'pink';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'purple',
  size = 'sm',
  className = '',
}) => {
  const colors = {
    purple: 'bg-primary-purple/20 text-primary-purple border-primary-purple/30',
    cyan: 'bg-primary-cyan/20 text-primary-cyan border-primary-cyan/30',
    orange: 'bg-primary-orange/20 text-primary-orange border-primary-orange/30',
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${colors[color]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
