"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Header from "@/component/Header";
import Input from "@/component/Input";
import Button from "@/component/button";


export default function ClientSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    location: "",
    language: "English"
  });

  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/auth");
        return;
      }

      // Check if user already has client profile
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().clientProfile?.completed) {
        router.push("/client/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.phone || !form.location) {
      setError("All fields are required");
      return;
    }

    if (form.phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");

      await updateDoc(doc(db, "users", user.uid), {
        clientProfile: {
          fullName: form.fullName,
          phone: form.phone,
          location: form.location,
          language: form.language,
          completed: true,
          createdAt: new Date()
        }
      });

      router.push("/client/dashboard");

    } catch (error) {
      console.error("Setup error:", error);
      setError("Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Complete Your Profile" subtitle="Tell us about yourself" />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {["Profile", "Dashboard", "Start"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                  ${index === 0 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'}
                `}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-12 h-1 mx-1 rounded ${index === 0 ? 'bg-teal-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">Step 1 of 3: Complete your profile</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            {/* Full Name */}
            <Input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              icon="👤"
              label="Full Name"
              required
            />

            {/* Phone Number */}
            <Input
              type="tel"
              name="phone"
              placeholder="0712345678"
              value={form.phone}
              onChange={handleChange}
              icon="📱"
              label="Phone Number"
              required
            />

            {/* Location */}
            <Input
              type="text"
              name="location"
              placeholder="E.g., Hostel C, Hall 4"
              value={form.location}
              onChange={handleChange}
              icon="📍"
              label="Location"
              required
            />

            {/* Language */}
            
        

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              loading={loading}
              fullWidth
              className="mt-6"
            >
              {loading ? "Saving..." : "Continue to Dashboard"}
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 flex items-start">
            <span className="text-xl mr-2">ℹ️</span>
            This information helps students find you and know where to offer services.
          </p>
        </div>
      </div>
    </div>
  );
}