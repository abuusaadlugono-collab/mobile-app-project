"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Baada ya sekunde 2, anza fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      
      // Baada ya fade out, nenda landing
      setTimeout(() => {
        router.push("/landing");
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-teal-600 to-teal-800 flex flex-col items-center justify-center transition-opacity duration-500 ${
      fadeOut ? "opacity-0" : "opacity-100"
    }`}>
      {/* Logo */}
      <div className="w-32 h-32 bg-white rounded-2xl shadow-2xl flex items-center justify-center mb-6 animate-bounce">
        <span className="text-5xl font-bold text-teal-600">M</span>
      </div>
      
      {/* App Name */}
      <h1 className="text-4xl font-bold text-white mb-2">MUSTTap</h1>
      
      {/* Tagline */}
      <p className="text-teal-100 text-lg">Must University Services</p>
      
      {/* Loading Spinner */}
      <div className="mt-8">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}