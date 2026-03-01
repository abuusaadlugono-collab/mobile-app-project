"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/component/button";

export default function LandingPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: "🔧", title: "Tap-Tech", desc: "Tech support & repairs" },
    { icon: "📚", title: "Tap-Skill", desc: "Tutoring & skills" },
    { icon: "🏃", title: "Tap-Run", desc: "Errands & deliveries" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Status Bar */}
      <div className="bg-teal-600 text-white py-3 px-4 flex justify-between text-sm">
        <span className="font-medium">{currentTime}</span>
        <div className="flex items-center space-x-2">
          <span>📶</span>
        
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl font-bold text-teal-600">M</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to <span className="text-teal-600">MUSTTap</span>
          </h1>
          <p className="text-gray-600">
            Connect with verified MUST students for any service
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-2xl">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button onClick={() => router.push("/auth")} fullWidth>
            Get Started
          </Button>
          <Button onClick={() => router.push("/login")} variant="secondary" fullWidth>
            Already have an account? Log In
          </Button>
        </div>

        {/* Trust Badge */}
        <p className="text-center text-xs text-gray-500 mt-8">
          ⭐ 100% Verified MUST Students
        </p>
      </div>
    </div>
  );
}