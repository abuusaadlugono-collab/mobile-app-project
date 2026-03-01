"use client";

import { useState } from "react";

interface InputProps {
  type?: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export default function Input({ 
  type = "text",
  name,
  placeholder = "",
  value,
  onChange,
  icon,
  label,
  required = false,
  error,
  disabled = false
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`
        flex items-center border rounded-lg px-4 py-3
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${disabled ? 'bg-gray-50' : 'bg-white'}
        focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent
        transition-all
      `}>
        {icon && <span className="text-gray-400 mr-2">{icon}</span>}
        
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent"
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        )}
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}