import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ options, className = '', ...props }) => {
  return (
    <select
      className={`
        bg-[#2A2A2A] border border-[#333333] rounded-md
        px-4 py-3 text-sm text-[#F5F5F5]
        transition-all duration-200 ease-in-out
        focus:border-[#E67514] focus:outline-none
        cursor-pointer
        ${className}
      `}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-[#2A2A2A] text-[#F5F5F5]">
          {option.label}
        </option>
      ))}
    </select>
  );
};

