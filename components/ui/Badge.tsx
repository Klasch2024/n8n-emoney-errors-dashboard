import React from 'react';

type BadgeVariant = 'error' | 'warning' | 'success' | 'info' | 'neutral' | 'primary' | 'secondary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const variants = {
    error: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.3)]',
    warning: 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.3)]',
    success: 'bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.3)]',
    info: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border border-[rgba(59,130,246,0.3)]',
    neutral: 'bg-[rgba(190,190,190,0.1)] text-[#BEBEBE] border border-[rgba(190,190,190,0.2)]',
    primary: 'bg-[rgba(230,117,20,0.1)] text-[#E67514] border border-[rgba(230,117,20,0.3)]',
    secondary: 'bg-[rgba(190,190,190,0.1)] text-[#BEBEBE] border border-[rgba(190,190,190,0.2)]',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-md px-3 py-1 text-xs font-medium
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
};

