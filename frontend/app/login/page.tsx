"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "@/component/Header";      // 👈 "components" na "Header"
import Input from "@/component/Input";        // 👈 "components" na "Input"
import Button from "@/component/button";      // 👈 "components" na "Button" (B kubwa)

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      console.log("Logged in!");
      router.push("/role-selection");
    } catch (error) {
      console.error(error);
      
      // Firebase error handling
      const firebaseError = error as { code?: string; message?: string };
      const errorCode = firebaseError.code;
      
      if (errorCode === "auth/user-not-found" || errorCode === "auth/wrong-password") {
        setError("Invalid email or password");
      } else if (errorCode === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (errorCode === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Failed to login. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header title="Welcome Back" subtitle="Log in to continue" />
      
      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          icon="📧"
          required
        />

        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          icon="🔒"
          required
        />

        <div className="text-right">
          <button 
            onClick={() => router.push("/forgot-password")}
            className="text-teal-600 text-sm hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <Button 
          onClick={handleLogin}
          disabled={loading}
          loading={loading}
          fullWidth
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>

        <p className="text-center text-gray-600">
          Do not have an account?{" "}
          <button
            onClick={() => router.push("/auth")}
            className="text-teal-600 font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}