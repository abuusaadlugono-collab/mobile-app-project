"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";  // 👈 ADDED query, where, getDocs!
import { auth, db } from "@/lib/firebase";
import Header from "@/component/Header";
import Input from "@/component/Input";
import Button from "@/component/button";  
import Select from "@/component/select";
export default function PostGig() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    budget: "",
    location: "",
    deadline: ""
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/auth");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.title || !form.category || !form.description || !form.budget || !form.location) {
      setError("All fields are required");
      return;
    }

    if (Number(form.budget) < 50) {
      setError("Minimum budget is KSh 50");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");

      // Get user name from Firestore
      const userQuery = query(collection(db, "users"), where("uid", "==", user.uid));
      const userSnapshot = await getDocs(userQuery);
      let clientName = "Client";
      userSnapshot.forEach(doc => {
        const data = doc.data();
        clientName = data.clientProfile?.fullName || data.name || "Client";
      });

      // Save gig to Firestore
      await addDoc(collection(db, "gigs"), {
        ...form,
        budget: Number(form.budget),
        clientId: user.uid,
        clientName: clientName,
        status: "open",
        createdAt: serverTimestamp(),
        applications: [],
        views: 0
      });

      router.push("/client/dashboard?posted=true");

    } catch (error) {
      console.error("Post gig error:", error);
      setError("Failed to post gig. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Post a New Gig" subtitle="Describe what you need help with" />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {["Details", "Review", "Post"].map((step, index) => (
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
          <p className="text-center text-xs text-gray-500 mt-2">Step 1 of 3: Gig Details</p>
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
            {/* Title */}
            <Input
              type="text"
              name="title"
              placeholder="e.g., Need help with laptop repair"
              value={form.title}
              onChange={handleChange}
              icon="📌"
              label="Gig Title"
              required
            />

            <Select
  name="category"
  value={form.category}
  onChange={handleChange}
  label="Category"
  icon="🔧"
  options={[
    { value: "tech", label: "Tap-Tech (Tech Support)" },
    { value: "skill", label: "Tap-Skill (Tutoring)" },
    { value: "run", label: "Tap-Run (Errands)" }
  ]}
  required
  error={error} // Optional - kuonyesha error
/>
            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the task in detail. Include any specific requirements, skills needed, or instructions for students."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-gray-400">
                {form.description.length}/500 characters
              </p>
            </div>

            {/* Budget & Location Row */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                name="budget"
                placeholder="500"
                value={form.budget}
                onChange={handleChange}
                icon="💰"
                label="Budget (KSh)"
                required
              />
              <Input
                type="text"
                name="location"
                placeholder="Hostel C, Library, etc."
                value={form.location}
                onChange={handleChange}
                icon="📍"
                label="Location"
                required
              />
            </div>

            {/* Deadline (Optional) */}
            <Input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              icon="📅"
              label="Deadline (Optional)"
            />

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              loading={loading}
              fullWidth
              className="mt-6"
            >
              {loading ? "Posting..." : "Post Gig"}
            </Button>
          </div>
        </div>

        {/* Tips Box */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-teal-50 border border-teal-100 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-teal-800 mb-2 flex items-center">
            <span className="text-xl mr-2">💡</span>
            Tips for a great gig:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-teal-500 mr-2">•</span>
              Be clear and specific about what you need
            </li>
            <li className="flex items-start">
              <span className="text-teal-500 mr-2">•</span>
              Set a realistic budget based on the task
            </li>
            <li className="flex items-start">
              <span className="text-teal-500 mr-2">•</span>
              Include location to help students near you
            </li>
            <li className="flex items-start">
              <span className="text-teal-500 mr-2">•</span>
              Add deadline if the task is urgent
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}