"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  createdAt?: Date | string;  // 👈 Aina sahihi
}

export default function Header({ 
  title,
  subtitle, 
  showBack = true,
  rightElement,
  createdAt
}: HeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {showBack && (
            <button 
              onClick={() => router.back()} 
              className="mr-4 text-white hover:opacity-80 transition"
            >
              ← Back
            </button>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
      
      <div className="flex justify-between items-center">
        {subtitle && <p className="text-teal-100">{subtitle}</p>}
        {createdAt && (
          <p className="text-sm text-teal-200">
            {new Date(createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}