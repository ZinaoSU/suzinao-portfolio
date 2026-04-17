import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  gradient = false,
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
        ${gradient ? 'bg-gradient-to-br from-white/10 to-white/5' : ''}
        ${hover ? 'transition-all duration-300 hover:border-primary-purple/50 hover:shadow-xl hover:shadow-primary-purple/10' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
