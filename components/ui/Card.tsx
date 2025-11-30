import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`
        bg-[#2A2A2A] border border-[#333333] rounded-xl p-6
        shadow-[0_2px_8px_rgba(0,0,0,0.3)]
        transition-all duration-200 ease-in-out
        ${hover ? 'hover:border-[#E67514] hover:shadow-[0_4px_16px_rgba(230,117,20,0.15)] hover:-translate-y-[2px]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

