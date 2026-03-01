"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import Header from "@/component/Header";  // 👈 "components" (na s)
import Button from "@/component/button";  // 👈 "Button" (B kubwa)

interface Gig {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  createdAt: Date;
  studentName?: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeGigs: 0,
    completedGigs: 0
  });
  const [recentGigs, setRecentGigs] = useState<Gig[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        // Get user data
        const userQuery = query(collection(db, "users"), where("uid", "==", user.uid));
        const userSnapshot = await getDocs(userQuery);
        userSnapshot.forEach(doc => {
          const data = doc.data();
          setUserName(data.clientProfile?.fullName || data.name || "Client");
        });

        // Get client's gigs
        const gigsQuery = query(
          collection(db, "gigs"),
          where("clientId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const gigsSnapshot = await getDocs(gigsQuery);
        
        const gigs: Gig[] = [];
        let active = 0;
        let completed = 0;
        let total = 0;

        gigsSnapshot.forEach(doc => {
          const gig = { id: doc.id, ...doc.data() } as Gig;
          gigs.push(gig);
          
          if (gig.status === "completed") {
            completed++;
            total += gig.budget || 0;
          } else if (gig.status !== "cancelled") {
            active++;
          }
        });

        setRecentGigs(gigs);
        setStats({
          totalSpent: total,
          activeGigs: active,
          completedGigs: completed
        });

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-green-100 text-green-700",
      assigned: "bg-blue-100 text-blue-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Using Header component */}
      <Header 
        title="Client Dashboard"
        subtitle={`Welcome back, ${userName}! 👋`}
        showBack={false}
        rightElement={
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold">
            {userName.charAt(0)}
          </div>
        }
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Total Spent</p>
            <p className="text-2xl font-bold text-teal-600">KSh {stats.totalSpent}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Active Gigs</p>
            <p className="text-2xl font-bold text-teal-600">{stats.activeGigs}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Completed</p>
            <p className="text-2xl font-bold text-teal-600">{stats.completedGigs}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => router.push("/client/post-gig")}
            className="p-4 bg-teal-50 rounded-xl text-center hover:bg-teal-100 transition"
          >
            <span className="text-2xl mb-2 block">📝</span>
            <span className="text-xs font-medium text-gray-700">Post a Gig</span>
          </button>
          <button className="p-4 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition">
            <span className="text-2xl mb-2 block">🔍</span>
            <span className="text-xs font-medium text-gray-700">Find Students</span>
          </button>
          <button className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition">
            <span className="text-2xl mb-2 block">💬</span>
            <span className="text-xs font-medium text-gray-700">Messages</span>
          </button>
          <button className="p-4 bg-orange-50 rounded-xl text-center hover:bg-orange-100 transition">
            <span className="text-2xl mb-2 block">⚙️</span>
            <span className="text-xs font-medium text-gray-700">Settings</span>
          </button>
        </div>

        {/* Recent Gigs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Recent Gigs</h2>
            {recentGigs.length > 0 && (
              <button className="text-sm text-teal-600">View All →</button>
            )}
          </div>
          
          {recentGigs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 mb-2">No gigs yet</p>
              <p className="text-sm text-gray-400 mb-4">Post your first gig to get started</p>
              <Button onClick={() => router.push("/client/post-gig")}>
                Post a Gig
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentGigs.map((gig) => (
                <div key={gig.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">{gig.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gig.status)}`}>
                      {gig.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{gig.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-teal-600">KSh {gig.budget}</span>
                    {gig.studentName && (
                      <span className="text-gray-500">Assigned to: {gig.studentName}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}