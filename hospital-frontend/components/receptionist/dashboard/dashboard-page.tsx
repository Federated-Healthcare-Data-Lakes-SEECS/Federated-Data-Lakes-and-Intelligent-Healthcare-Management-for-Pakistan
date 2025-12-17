"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  ClipboardList, 
  Users, 
  User, 
  Loader2, 
  UserPlus, 
  Clock,
  TrendingUp,
  CalendarCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getReceptionistProfile,
  getDashboardStats,
  type ReceptionistProfile,
  type DashboardStats,
} from "@/lib/api-receptionist";

// Enhanced Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-600 text-white",
    blue: "bg-blue-600 text-white",
    purple: "bg-purple-600 text-white",
    orange: "bg-orange-600 text-white",
    cyan: "bg-cyan-600 text-white",
    green: "bg-green-600 text-white",
  };

  const bgColor = colorClasses[color] || colorClasses.emerald;

  return (
    <Card className="border shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="py-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium ">{label}</p>
            <p className="text-3xl font-bold mt-1.5">{value}</p>
          </div>
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shadow-sm", bgColor)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReceptionistDashboardPage() {
  const [profile, setProfile] = useState<ReceptionistProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [profileData, statsData] = await Promise.all([
          getReceptionistProfile(),
          getDashboardStats(),
        ]);
        
        setProfile(profileData);
        setStats(statsData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load dashboard data:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-center min-h-100">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-center min-h-100">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile || !stats) return null;

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {profile.firstName}!
          </h1>
          <p className="text-muted-foreground text-base mt-1">
            Here's your reception desk overview
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-lg font-semibold">
            {new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', weekday: 'short' })}
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Today's Appointments" value={stats.todayAppointments} color="blue" />
        <StatCard icon={ClipboardList} label="Total Appointments" value={stats.totalAppointments} color="emerald" />
        <StatCard icon={Clock} label="Upcoming Appointments" value={stats.upcomingAppointments} color="purple" />
        <StatCard icon={UserPlus} label="Registered Today" value={stats.patientsRegisteredToday} color="orange" />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="border shadow-sm bg-white">
          <CardHeader className="border-emerald-100">
            <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-linear-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500 mb-1.5">Full Name</p>
                <p className="font-medium text-base text-slate-900">
                  {profile.firstName} {profile.lastName}
                </p>
              </div>
              <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1.5">Email</p>
                <p className="font-medium text-base text-slate-900 truncate">{profile.email}</p>
              </div>
              <div className="p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 mb-1.5">Phone</p>
                <p className="font-medium text-base text-slate-900">{profile.phoneNumber || "N/A"}</p>
              </div>
              <div className="p-4 bg-linear-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                <p className="text-sm text-pink-600 mb-1.5">Gender</p>
                <p className="font-medium text-base text-slate-900 capitalize">{profile.gender.toLowerCase()}</p>
              </div>
              <div className="p-4 bg-linear-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-600 mb-1.5">Experience</p>
                <p className="font-medium text-base text-slate-900">{profile.experience} years</p>
              </div>
              <div className="p-4 bg-linear-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                <p className="text-sm text-teal-600 mb-1.5">Qualification</p>
                <p className="font-medium text-base text-slate-900">{profile.qualification || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-wide flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="p-4 border border-emerald-100 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all hover:shadow-sm group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                    <UserPlus className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Register Patient</h3>
                    <p className="text-base text-muted-foreground">Add new walk-in patient</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-blue-100 rounded-lg hover:bg-blue-50 cursor-pointer transition-all hover:shadow-sm group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Book Appointment</h3>
                    <p className="text-base text-muted-foreground">Schedule walk-in visit</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-purple-100 rounded-lg hover:bg-purple-50 cursor-pointer transition-all hover:shadow-sm group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">View Appointments</h3>
                    <p className="text-base text-muted-foreground">Check booked visits</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
