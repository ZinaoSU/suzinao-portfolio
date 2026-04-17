import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  gradient?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  gradient = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 cursor-pointer';
  
  const variants = {
    primary: gradient 
      ? 'bg-gradient-to-r from-primary-purple via-primary-violet to-primary-orange text-white hover:shadow-lg hover:shadow-primary-purple/30'
      : 'bg-primary-purple text-white hover:bg-primary-violet hover:shadow-lg hover:shadow-primary-purple/30',
    secondary: 'bg-dark-cardLight text-white hover:bg-white/10 border border-white/20',
    outline: 'border-2 border-primary-purple text-primary-purple hover:bg-primary-purple/10',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
