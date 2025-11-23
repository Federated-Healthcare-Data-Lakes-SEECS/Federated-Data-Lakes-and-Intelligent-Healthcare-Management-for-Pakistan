"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, User, Clock, Pill, TestTube, Loader2 } from "lucide-react";
import {
  getPatientProfile,
  getDashboardStats,
  getUpcomingAppointments,
  getRecentCheckups,
  type PatientProfile,
  type DashboardStats,
  type Appointment,
  type Checkup,
} from "@/lib/api-patient";

export default function PatientDashboardPage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentCheckups, setRecentCheckups] = useState<Checkup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [profileData, statsData, appointmentsData, checkupsData] = await Promise.all([
          getPatientProfile(),
          getDashboardStats(),
          getUpcomingAppointments(3),
          getRecentCheckups(3),
        ]);
        
        setProfile(profileData);
        setStats(statsData);
        setUpcomingAppointments(appointmentsData);
        setRecentCheckups(checkupsData);
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
      title: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      icon: Calendar,
      description: "Scheduled visits",
    },
    {
      title: "Completed Checkups",
      value: stats.completedCheckups,
      icon: FileText,
      description: "Medical history",
    },
    {
      title: "Pending Lab Tests",
      value: stats.pendingLabTests,
      icon: TestTube,
      description: "Tests pending",
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
          Here's your health overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
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
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <p className="font-medium">{profile.bloodGroup || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{profile.gender.toLowerCase()}</p>
            </div>
          </div>
          {profile.address && (
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{profile.address}</p>
            </div>
          )}
          {profile.emergencyContact && (
            <div>
              <p className="text-sm text-muted-foreground">Emergency Contact</p>
              <p className="font-medium">{profile.emergencyContact}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No upcoming appointments
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">
                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                      </p>
                      <Badge variant="outline">{appointment.doctor.specialization}</Badge>
                      <Badge 
                        variant="outline" 
                        className={appointment.appointmentType === "online" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}
                      >
                        {appointment.appointmentType === "online" ? "Online" : "Walk-in"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appointment.doctor.departmentName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(appointment.startTime).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {appointment.reason && (
                      <p className="text-sm mt-2">
                        <span className="text-muted-foreground">Reason:</span> {appointment.reason}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-blue-500">{appointment.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Checkups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Medical History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCheckups.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No medical history available yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentCheckups.map((checkup) => (
              <div
                key={checkup.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      Dr. {checkup.doctor.firstName} {checkup.doctor.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {checkup.doctor.specialization}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(checkup.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {checkup.diagnosis && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Diagnosis:</p>
                    <p className="text-sm text-muted-foreground">{checkup.diagnosis}</p>
                  </div>
                )}

                <div className="flex gap-4 text-sm pt-2 border-t">
                  {checkup.medications && checkup.medications.length > 0 && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Pill className="h-3.5 w-3.5" />
                      {checkup.medications.length} medications
                    </span>
                  )}
                  {checkup.recommendedLabTests && checkup.recommendedLabTests.length > 0 && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TestTube className="h-3.5 w-3.5" />
                      {checkup.recommendedLabTests.length} lab tests
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
