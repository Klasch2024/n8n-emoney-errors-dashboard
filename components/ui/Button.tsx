import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-medium transition-all duration-200 ease-in-out';
  
  const variants = {
    primary: `
      bg-[#E67514] text-white border-none rounded-md
      px-6 py-3 text-sm
      shadow-[0_2px_4px_rgba(230,117,20,0.2)]
      hover:bg-[#FF8C2E] hover:shadow-[0_4px_8px_rgba(230,117,20,0.3)] hover:-translate-y-[1px]
      active:bg-[#D66510] active:translate-y-0
      disabled:bg-[#4A4A4A] disabled:text-[#8A8A8A] disabled:cursor-not-allowed disabled:shadow-none
    `,
    secondary: `
      bg-transparent text-[#E67514] border border-[#E67514] rounded-md
      px-6 py-3 text-sm
      hover:bg-[rgba(230,117,20,0.1)] hover:border-[#FF8C2E]
      active:bg-[rgba(230,117,20,0.2)]
    `,
    ghost: `
      bg-transparent text-[#BEBEBE] border-none rounded-md
      px-6 py-3 text-sm
      hover:bg-[#333333] hover:text-[#F5F5F5]
    `,
    icon: `
      bg-transparent text-[#BEBEBE] border-none rounded
      p-2
      hover:bg-[#333333] hover:text-[#E67514]
    `,
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

