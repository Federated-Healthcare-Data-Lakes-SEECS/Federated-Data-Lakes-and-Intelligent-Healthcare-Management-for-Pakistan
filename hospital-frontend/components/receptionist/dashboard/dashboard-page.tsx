"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ClipboardList, Users, User, Loader2, UserPlus } from "lucide-react";
import {
  getReceptionistProfile,
  getDashboardStats,
  type ReceptionistProfile,
  type DashboardStats,
} from "@/lib/api-receptionist";

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
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile || !stats) return null;

  const statsCards = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      description: "Appointments today",
      color: "text-blue-600",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: ClipboardList,
      description: "All time",
      color: "text-green-600",
    },
    {
      title: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      icon: Calendar,
      description: "Scheduled ahead",
      color: "text-purple-600",
    },
    {
      title: "Patients Registered Today",
      value: stats.patientsRegisteredToday,
      icon: Users,
      description: "New patients",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {profile.firstName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's your reception desk overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {profile.firstName} {profile.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{profile.phoneNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{profile.gender.toLowerCase()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="font-medium">{profile.experience} years</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Qualification</p>
              <p className="font-medium">{profile.qualification || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg hover:bg-secondary cursor-pointer transition-colors">
              <UserPlus className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Register Patient</h3>
              <p className="text-sm text-muted-foreground">Add new walk-in patient</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-secondary cursor-pointer transition-colors">
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Book Appointment</h3>
              <p className="text-sm text-muted-foreground">Schedule walk-in visit</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-secondary cursor-pointer transition-colors">
              <ClipboardList className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">View Appointments</h3>
              <p className="text-sm text-muted-foreground">Check booked visits</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
