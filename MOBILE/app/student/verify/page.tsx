"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Header from "@/component/Header";
import Input from "@/component/Input";
import Button from "@/component/button";
import Select from "@/component/select";

export default function StudentVerify() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    regNumber: "",
    course: "",
    yearOfStudy: "",
    phoneNumber: ""
  });

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/auth");
        return;
      }

      // Check if already verified
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().studentStatus === "verified") {
        router.push("/student/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.fullName || !form.studentId || !form.regNumber || !form.course || !form.yearOfStudy || !form.phoneNumber) {
      setError("All fields are required");
      return;
    }

    if (form.phoneNumber.length < 10) {
      setError("Please enter a valid phone number (10 digits)");
      return;
    }

    if (form.studentId.length < 5) {
      setError("Please enter a valid Student ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");

      // Save verification data to Firestore
      await updateDoc(doc(db, "users", user.uid), {
        studentProfile: {
          fullName: form.fullName,
          studentId: form.studentId,
          regNumber: form.regNumber,
          course: form.course,
          yearOfStudy: form.yearOfStudy,
          phoneNumber: form.phoneNumber,
          submittedAt: new Date()
        },
        studentStatus: "pending",
        updatedAt: new Date()
      });

      // Redirect to pending page
      router.push("/student/pending");

    } catch (error) {
      console.error("Verification error:", error);
      setError("Failed to submit verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Student Verification" subtitle="Verify your MUST identity" />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {["Personal", "Academic", "Verify"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                  ${index === 0 ? 'bg-teal-600 text-white' : index === 1 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'}
                `}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-12 h-1 mx-1 rounded ${index < 1 ? 'bg-teal-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">Step 2 of 3: Academic Information</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-800 text-sm flex items-start">
            <span className="text-xl mr-2">📌</span>
            <span>
              <strong>Important:</strong> You must be a registered MUST student. 
              Your information will be verified within 24-48 hours.
            </span>
          </p>
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
              label="Full Name (as on ID)"
              required
            />

            {/* Student ID */}
            <Input
              type="text"
              name="studentId"
              placeholder="STU-2024-0001"
              value={form.studentId}
              onChange={handleChange}
              icon="🆔"
              label="Student ID Number"
              required
            />

            {/* Registration Number */}
            <Input
              type="text"
              name="regNumber"
              placeholder="BIT-2020-001"
              value={form.regNumber}
              onChange={handleChange}
              icon="📋"
              label="Registration Number"
              required
            />

            {/* Course */}
            <Input
              type="text"
              name="course"
              placeholder="e.g., Computer Science"
              value={form.course}
              onChange={handleChange}
              icon="📚"
              label="Course of Study"
              required
            />

            {/* Year of Study */}
            <Select
              name="yearOfStudy"
              value={form.yearOfStudy}
              onChange={handleChange}
              label="Year of Study"
              icon="🎓"
              options={[
                { value: "1", label: "1st Year" },
                { value: "2", label: "2nd Year" },
                { value: "3", label: "3rd Year" },
                { value: "4", label: "4th Year" },
                { value: "5", label: "5th Year" },
                { value: "6+", label: "6th Year or Above" }
              ]}
              required
            />

            {/* Phone Number */}
            <Input
              type="tel"
              name="phoneNumber"
              placeholder="0712345678"
              value={form.phoneNumber}
              onChange={handleChange}
              icon="📱"
              label="Phone Number"
              required
            />
          </div>
        </div>

        {/* ID Upload Section - Coming Soon */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-xl mr-2">📎</span>
            Upload Student ID (Coming Soon)
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
            <p className="text-gray-500 mb-2">📄 Drag and drop or click to upload</p>
            <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
            <p className="text-xs text-teal-600 mt-2">This feature will be available soon</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
            fullWidth
          >
            {loading ? "Submitting..." : "Submit for Verification"}
          </Button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By submitting, you confirm that all information provided is accurate and true.
          False information may lead to account suspension.
        </p>
      </div>
    </div>
  );
}