"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Header from "@/component/Header";

type Role = "client" | "student" | "both";
type Language = "en" | "sw";

export default function RoleSelection() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/auth");
    }
  }, [router]);

  const handleRoleSelect = async (role: Role) => {
    if (loading) return;
    
    setSelectedRole(role);
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      const userData = {
        role: role,
        ...(role === "student" || role === "both" ? { studentStatus: "pending" } : {}),
        roleSelectedAt: new Date(),
        preferredLanguage: language,
        updatedAt: new Date()
      };

      if (userDoc.exists()) {
        await updateDoc(userDocRef, userData);
      } else {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "User",
          createdAt: new Date(),
          ...userData
        });
      }

      await new Promise(resolve => setTimeout(resolve, 600));

      if (role === "client") router.push("/client/setup");
      else if (role === "student") router.push("/student/verify");
      else router.push("/client/setup?mode=both");

    } catch (err) {
      console.error("Role selection error:", err);
      setError("Tatizo limetokea. Jaribu tena.");
      setLoading(false);
      setSelectedRole(null);
    }
  };

  const t = {
    en: {
      headerTitle: "Choose Your Role",
      headerSubtitle: "This will help you use MUSTTap in the way that suits you best",
      step: "Step 1 of 1",
      roles: {
        client: { title: "Client", description: "Post jobs and hire verified students", benefits: ["Post gigs", "Get bids", "Choose best student"] },
        student: { title: "Student", description: "Offer services and earn while you learn", benefits: ["Find freelance work", "Build portfolio", "Get paid directly"] },
        both: { title: "Both", description: "Work and hire with ease", benefits: ["Switch modes", "Get & offer services", "Both benefits"] },
      },
      selecting: "Selecting...",
      skip: "Choose later (you can change)",
      retry: "Try again",
    },
    sw: {
      headerTitle: "Chagua Jukumu Lako",
      headerSubtitle: "Hii itakusaidia kutumia MUSTTap kwa njia inayokufaa zaidi",
      step: "Hatua 1 ya 1",
      roles: {
        client: { title: "Mteja", description: "Chapisha kazi na uajiri wanafunzi walioidhinishwa", benefits: ["Chapisha kazi", "Pata zabuni", "Chagua mwanafunzi bora"] },
        student: { title: "Mwanafunzi", description: "Toa huduma na upate pesa ukiwa unapata elimu", benefits: ["Pata kazi", "Jenga portfolio", "Lipwa moja kwa moja"] },
        both: { title: "Zote Mbili", description: "Fanya kazi na uajiri kwa urahisi", benefits: ["Badilisha mode", "Pata na toa huduma", "Faida zote mbili"] },
      },
      selecting: "Inachaguliwa...",
      skip: "Chagua baadaye (unaweza kubadilisha)",
      retry: "Jaribu tena",
    },
  };

  const content = t[language];

  const roles = [
    { id: "client" as Role, ...content.roles.client, icon: "💼" },
    { id: "student" as Role, ...content.roles.student, icon: "🎓" },
    { id: "both" as Role, ...content.roles.both, icon: "🔄" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title={content.headerTitle} subtitle={content.headerSubtitle} showBack={false} />

      {/* Language Switcher */}
      <div className="flex justify-end max-w-5xl mx-auto w-full px-4 pt-4">
        <div className="bg-white rounded-full shadow-sm border border-gray-200 p-1 inline-flex">
          <button onClick={() => setLanguage("en")} className={`px-4 py-2 rounded-full text-sm font-medium transition ${language === "en" ? "bg-teal-600 text-white" : "text-gray-600 hover:text-gray-900"}`}>English</button>
          <button onClick={() => setLanguage("sw")} className={`px-4 py-2 rounded-full text-sm font-medium transition ${language === "sw" ? "bg-teal-600 text-white" : "text-gray-600 hover:text-gray-900"}`}>Kiswahili</button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
        {/* Progress indicator */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-teal-600">{content.step}</span>
            <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden"><div className="h-full w-full bg-teal-500" /></div>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center text-sm text-red-700">
              {error}
              <button onClick={() => setError(null)} className="ml-2 underline hover:text-red-800">{content.retry}</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {roles.map((role) => (
            <motion.button
              key={role.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect(role.id)}
              disabled={loading}
              className={`
                group relative bg-white border-2 rounded-2xl p-6 md:p-8 text-left
                shadow-md hover:shadow-lg transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2
                ${selectedRole === role.id ? "border-teal-600 ring-2 ring-teal-200 shadow-teal-100" : "border-gray-200 hover:border-teal-400"}
                ${loading && selectedRole === role.id ? "opacity-80" : ""}
                min-h-[280px] flex flex-col
              `}
            >
              <div className="text-5xl mb-5">{role.icon}</div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-base text-gray-600 mb-4 flex-grow">{role.description}</p>

              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                {role.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-teal-500">✓</span> {benefit}</li>
                ))}
              </ul>

              {/* 👇 LOADING SPINNER NDANI YA BUTTON */}
              {loading && selectedRole === role.id && (
                <div className="flex items-center justify-center gap-2 text-teal-600 font-medium">
                  <div className="w-5 h-5 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span>{content.selecting}</span>
                </div>
              )}

              {/* Selected indicator (when not loading) */}
              {selectedRole === role.id && !loading && (
                <div className="absolute bottom-4 right-4 text-teal-600 font-medium">
                  ✓ {content.selecting}
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Skip button */}
        <div className="mt-10 text-center">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-gray-700 text-sm underline" disabled={loading}>
            {content.skip}
          </button>
        </div>
      </div>

      {/* 👇 FULL-SCREEN LOADING OVERLAY IMEONDOSHWA - HAMJATAKIWA */}
    </div>
  );
}