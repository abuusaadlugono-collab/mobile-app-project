"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Header from "@/component/Header";
import Input from "@/component/Input";
import Button from "@/component/button";

export default function AuthPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Creating user with:", form.email);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        form.email, 
        form.password
      );
      
      const user = userCredential.user;
      console.log("User created:", user.uid);

      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        role: null,
        createdAt: new Date(),
        uid: user.uid
      });

      console.log("User data saved to Firestore");
      router.push("/login?registered=true");
      
    } catch (error) {
      console.error("Signup error:", error);
      
      const firebaseError = error as { code?: string; message?: string };
      
      if (firebaseError.code === "auth/email-already-in-use") {
        setError("Email already in use. Please login.");
      } else if (firebaseError.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (firebaseError.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError(`Failed to create account: ${firebaseError.message || "Try again"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header title="Create Account" subtitle="Join MUSTTap community" />
      
      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          icon="👤"
          label="Full Name"
          required
        />

        <Input
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          icon="📧"
          label="Email"
          required
        />

        <Input
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          icon="🔒"
          label="Password"
          required
        />

        <p className="text-xs text-gray-500 -mt-2">
          Password must be at least 6 characters
        </p>

        <Button 
          onClick={handleSignup}
          disabled={loading}
          loading={loading}
          fullWidth
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-teal-600 font-semibold hover:underline"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}