"use client";

import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  label?: string;
  placeholder?: string;
  icon?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function Select({ 
  name,
  value,
  onChange,
  options,
  label,
  placeholder = "Select an option",
  icon,
  required = false,
  error,
  disabled = false,
  className = "",
  ...props // Kwa props zingine za HTML select
}: SelectProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`
        flex items-center border rounded-lg px-4 py-3
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${disabled ? 'bg-gray-50' : 'bg-white'}
        focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent
        transition-all duration-200
      `}>
        {icon && <span className="text-gray-400 mr-2 text-lg">{icon}</span>}
        
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="w-full outline-none bg-transparent text-gray-900 disabled:text-gray-500"
          {...props}
        >
          <option value="" disabled className="text-gray-400">
            {placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="text-gray-900"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}