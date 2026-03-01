"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Header from "@/component/Header";
import Button from "@/component/button";

export default function StudentPending() {
  const router = useRouter();
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/auth");
      return;
    }

    // Listen for real-time updates on verification status
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStatus(data.studentStatus || "pending");
        
        // If verified, redirect to dashboard
        if (data.studentStatus === "verified") {
          router.push("/student/dashboard");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Calculate time remaining - sio state, inahesabiwa moja kwa moja
  const getTimeRemaining = () => {
    const submittedAt = new Date();
    submittedAt.setHours(submittedAt.getHours() + 24);
    const now = new Date();
    const diff = submittedAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} hours ${minutes} minutes`;
    } else if (minutes > 0) {
      return `${minutes} minutes`;
    } else {
      return "Any moment now";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Verification Pending" subtitle="Thank you for submitting your information" showBack={false} />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Status Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-8 text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">⏳</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Under Review</h2>
            <p className="text-yellow-100">Your application is being processed</p>
          </div>

          {/* Status Info */}
          <div className="p-8">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Verification Progress</span>
                <span className="text-sm font-medium text-yellow-600">Pending</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full w-2/3 animate-pulse"></div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⏱️</span>
                  <span className="text-sm text-gray-500">Estimated time</span>
                </div>
                <p className="text-xl font-semibold text-gray-800">{getTimeRemaining()}</p>
                <p className="text-xs text-gray-400 mt-1">Typically 24-48 hours</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📧</span>
                  <span className="text-sm text-gray-500">Notification</span>
                </div>
                <p className="text-sm text-gray-600">You will receive an email when verified</p>
              </div>
            </div>

            {/* Status Steps */}
            <div className="space-y-4 mb-8">
              <h3 className="font-semibold text-gray-800 mb-3">Verification Steps:</h3>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Application Submitted</p>
                  <p className="text-sm text-gray-500">Your information has been received</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-600 text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Under Review</p>
                  <p className="text-sm text-gray-500">Admin is verifying your documents</p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-50">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gray-400 text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Verification Complete</p>
                  <p className="text-sm text-gray-400">You will get access to the dashboard</p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <span className="text-lg mr-2">📌</span>
                Important Notes:
              </h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Make sure your email is correct - we will send updates there
                </li> 
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  You can still browse the app while waiting
                </li>
                <li className="flex items-st art">
                  <span className="mr-2">•</span>
                  Contact support if verification takes more than 48 hours
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => router.push("/")}
                variant="outline"
                fullWidth
              >
                Browse Home
              </Button>
              <Button 
                onClick={() => router.push("/student/profile")}
                variant="secondary"
                fullWidth
              >
                View Profile
              </Button>
            </div>

            {/* Support Link */}
            <p className="text-center text-xs text-gray-400 mt-6">
              Need help? <button className="text-teal-600 hover:underline">Contact Support</button>
            </p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Live status: {status === "pending" ? "Pending Review" : "Processing"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}