"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import Header from "@/component/Header";
import Button from "@/component/button";

interface Gig {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  status: string;
  clientName: string;
  createdAt: Date;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [studentStatus, setStudentStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    activeGigs: 0,
    completedGigs: 0,
    rating: 0
  });
  const [availableGigs, setAvailableGigs] = useState<Gig[]>([]);
  const [myGigs, setMyGigs] = useState<Gig[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        // Get student data and verification status
        const userQuery = query(collection(db, "users"), where("uid", "==", user.uid));
        const userSnapshot = await getDocs(userQuery);
        
        userSnapshot.forEach(doc => {
          const data = doc.data();
          setUserName(data.name || "Student");
          setStudentStatus(data.studentStatus || "pending");
          
          // Update stats with rating if exists
          setStats(prev => ({
            ...prev,
            rating: data.rating || 0
          }));
        });

        // Load available gigs (open gigs)
        const availableQuery = query(
          collection(db, "gigs"),
          where("status", "==", "open"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const availableSnapshot = await getDocs(availableQuery);
        
        const available: Gig[] = [];
        availableSnapshot.forEach(doc => {
          available.push({ 
            id: doc.id, 
            ...doc.data() 
          } as Gig);
        });
        setAvailableGigs(available);

        // Load student's gigs (accepted or applied)
        const myGigsQuery = query(
          collection(db, "gigs"),
          where("studentId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const myGigsSnapshot = await getDocs(myGigsQuery);
        
        const myGigsList: Gig[] = [];
        let totalEarned = 0;
        let activeCount = 0;
        let completedCount = 0;

        myGigsSnapshot.forEach(doc => {
          const gig = { id: doc.id, ...doc.data() } as Gig;
          myGigsList.push(gig);
          
          if (gig.status === "completed") {
            completedCount++;
            totalEarned += gig.budget || 0;
          } else if (gig.status !== "cancelled") {
            activeCount++;
          }
        });

        setMyGigs(myGigsList);
        setStats(prev => ({
          ...prev,
          totalEarned,
          activeGigs: activeCount,
          completedGigs: completedCount
        }));

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

  // If student not verified, show message
  if (studentStatus !== "verified" && studentStatus !== "pending") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Required</h2>
          <p className="text-gray-600 mb-6">
            You need to verify your student ID before you can access the dashboard.
          </p>
          <Button onClick={() => router.push("/student/verify")}>
            Go to Verification
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="Student Dashboard"
        subtitle={`Ready to earn, ${userName}! 💪`}
        showBack={false}
        rightElement={
          <div className="flex items-center gap-2">
            {studentStatus === "pending" && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                Pending
              </span>
            )}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold">
              {userName.charAt(0)}
            </div>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Total Earned</p>
            <p className="text-2xl font-bold text-teal-600">KSh {stats.totalEarned}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Active Gigs</p>
            <p className="text-2xl font-bold text-teal-600">{stats.activeGigs}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Completed</p>
            <p className="text-2xl font-bold text-teal-600">{stats.completedGigs}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Rating</p>
            <p className="text-2xl font-bold text-teal-600">{stats.rating} ⭐</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => router.push("/student/find-gigs")}
            className="p-4 bg-teal-50 rounded-xl text-center hover:bg-teal-100 transition"
          >
            <span className="text-2xl mb-2 block">🔍</span>
            <span className="text-xs font-medium text-gray-700">Find Gigs</span>
          </button>
          <button
            onClick={() => router.push("/student/my-gigs")}
            className="p-4 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition"
          >
            <span className="text-2xl mb-2 block">📋</span>
            <span className="text-xs font-medium text-gray-700">My Gigs</span>
          </button>
          <button
            onClick={() => router.push("/student/messages")}
            className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition"
          >
            <span className="text-2xl mb-2 block">💬</span>
            <span className="text-xs font-medium text-gray-700">Messages</span>
          </button>
          <button
            onClick={() => router.push("/student/profile")}
            className="p-4 bg-orange-50 rounded-xl text-center hover:bg-orange-100 transition"
          >
            <span className="text-2xl mb-2 block">⚙️</span>
            <span className="text-xs font-medium text-gray-700">Profile</span>
          </button>
        </div>

        {/* Available Gigs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Available Gigs Near You</h2>
            {availableGigs.length > 0 && (
              <button className="text-sm text-teal-600">View All →</button>
            )}
          </div>
          
          {availableGigs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 mb-2">No gigs available</p>
              <p className="text-sm text-gray-400">Check back later</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {availableGigs.map((gig) => (
                <div key={gig.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{gig.title}</h3>
                      <p className="text-xs text-gray-500">{gig.location}</p>
                    </div>
                    <span className="font-bold text-teal-600">KSh {gig.budget}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{gig.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Posted by {gig.clientName}</span>
                    <button
                      onClick={() => router.push(`/gigs/${gig.id}`)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Active Gigs */}
        {myGigs.filter(g => g.status !== "completed").length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">My Active Gigs</h2>
              <button className="text-sm text-teal-600">View All →</button>
            </div>
            <div className="divide-y divide-gray-100">
              {myGigs.filter(g => g.status !== "completed").slice(0, 3).map((gig) => (
                <div key={gig.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{gig.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(gig.status)}`}>
                          {gig.status}
                        </span>
                        <span className="text-xs text-gray-500">KSh {gig.budget}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/gigs/${gig.id}`)}
                      className="text-teal-600 text-sm font-medium"
                    >
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}