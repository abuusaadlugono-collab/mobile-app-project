"use client";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({ 
  children, 
  onClick, 
  variant = "primary",
  fullWidth = false,
  disabled = false,
  loading = false,
  className = "",
  type = "button"
}: ButtonProps) {
  const baseStyle = "py-3 rounded-xl font-semibold transition-all flex items-center justify-center";
  const widthStyle = fullWidth ? "w-full" : "px-6";
  
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-300",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
    outline: "border-2 border-teal-600 text-teal-600 hover:bg-teal-50 disabled:border-gray-300 disabled:text-gray-400"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${widthStyle} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
}