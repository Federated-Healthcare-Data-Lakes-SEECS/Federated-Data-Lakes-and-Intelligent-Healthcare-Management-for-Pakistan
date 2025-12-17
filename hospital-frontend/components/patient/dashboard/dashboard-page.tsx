"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  FileText, 
  User, 
  Clock, 
  Pill, 
  TestTube, 
  Loader2,
  Activity,
  Heart,
  Phone,
  Mail,
  MapPin,
  Droplet,
  AlertTriangle,
  CalendarCheck
} from "lucide-react";
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
import { cn } from "@/lib/utils";

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
          <p className="text-muted-foreground text-base md:text-lg mt-1">Here's your health overview</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', weekday: 'short' })}</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Calendar} label="Upcoming Appointments" value={stats.upcomingAppointments} color="emerald" />
        <StatCard icon={FileText} label="Completed Checkups" value={stats.completedCheckups} color="blue" />
        <StatCard icon={TestTube} label="Pending Lab Tests" value={stats.pendingLabTests} color="purple" />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2 border shadow-sm bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold tracking-wide flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
                Upcoming Appointments
              </CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                {upcomingAppointments.length} Scheduled
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg bg-slate-50 hover:bg-emerald-50/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-white">
                          {`${appointment.doctor.firstName[0]}${appointment.doctor.lastName[0]}`}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground text-base">
                            Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                          </p>
                          <Badge variant="outline" className="text-sm">{appointment.doctor.specialization}</Badge>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              appointment.appointmentType === "online" 
                                ? "bg-blue-50 text-blue-700 border-blue-200" 
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            )}
                          >
                            {appointment.appointmentType === "online" ? "Online" : "Walk-in"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor.departmentName}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(appointment.startTime).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', weekday: 'short' })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {appointment.reason && (
                          <p className="text-sm mt-1">
                            <span className="text-muted-foreground">Reason:</span> {appointment.reason}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-emerald-500 text-white shrink-0">{appointment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="border shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-wide flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {profile.firstName[0]}{profile.lastName[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold text-lg">{profile.firstName} {profile.lastName}</p>
                <div className="flex items-center gap-2 mt-1">
                  {profile.bloodGroup && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-red-500" />
                      {profile.bloodGroup}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs capitalize">
                    {profile.gender.toLowerCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-base">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{profile.email}</span>
              </div>
              {profile.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{profile.phoneNumber}</span>
                </div>
              )}
              {profile.dateOfBirth && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{profile.address}</span>
                </div>
              )}
              {profile.emergencyContact && (
                <div className="flex items-center gap-3 pt-2 border-t">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Emergency Contact</p>
                    <p className="font-medium">{profile.emergencyContact}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Medical History */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold tracking-wide flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Recent Medical History
            </CardTitle>
            <Badge variant="secondary" className="bg-emerald-600">
              {recentCheckups.length} Records
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {recentCheckups.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">No medical history available yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCheckups.map((checkup) => (
                <div
                  key={checkup.id}
                  className="p-4 border rounded-lg bg-slate-50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-base">
                          Dr. {checkup.doctor.firstName} {checkup.doctor.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {checkup.doctor.specialization}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(checkup.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  {checkup.diagnosis && (
                    <div className="mb-3 p-2 bg-white rounded border">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</p>
                      <p className="text-base line-clamp-2">{checkup.diagnosis}</p>
                    </div>
                  )}

                  <div className="flex gap-3 text-sm">
                    {checkup.medications && checkup.medications.length > 0 && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Pill className="h-3.5 w-3.5" />
                        {checkup.medications.length} meds
                      </span>
                    )}
                    {checkup.recommendedLabTests && checkup.recommendedLabTests.length > 0 && (
                      <span className="flex items-center gap-1 text-purple-600">
                        <TestTube className="h-3.5 w-3.5" />
                        {checkup.recommendedLabTests.length} tests
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

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colorClasses = {
    emerald: "bg-emerald-600 text-white",
    blue: "bg-blue-600 text-white",
    purple: "bg-purple-600 text-white",
    cyan: "bg-cyan-600 text-white",
    orange: "bg-orange-600 text-white",
    amber: "bg-amber-600 text-white",
  };

  return (
    <Card className="border shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
