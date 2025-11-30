import React from 'react';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]">
          {icon}
        </div>
      )}
      <input
        className={`
          bg-[#2A2A2A] border border-[#333333] rounded-md
          px-4 py-3 text-sm text-[#F5F5F5]
          transition-all duration-200 ease-in-out
          placeholder:text-[#8A8A8A]
          focus:border-[#E67514] focus:outline-none focus:shadow-[0_0_0_3px_rgba(230,117,20,0.1)]
          ${icon ? 'pl-10' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export const SearchInput: React.FC<Omit<InputProps, 'icon'>> = (props) => {
  return <Input icon={<Search size={16} />} {...props} />;
};

