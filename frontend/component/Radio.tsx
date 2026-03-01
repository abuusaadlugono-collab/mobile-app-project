"use client";

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  required?: boolean;
  error?: string;
}

export default function RadioGroup({ 
  name,
  value,
  onChange,
  options,
  label,
  required = false,
  error
}: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 text-teal-600"
            />
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}