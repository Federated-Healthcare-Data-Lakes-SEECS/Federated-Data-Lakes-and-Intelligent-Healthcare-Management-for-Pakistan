"use client";

import { useEffect, useState } from "react";
import { 
  getDoctorProfile, 
  getDashboardStats, 
  getTodaysAppointments,
  getWeeklyStats,
  getRecentPatients,
  getUpcomingSchedule,
  type DoctorProfile, 
  type DashboardStats,
  type TodaysAppointmentsSummary,
  type WeeklyStats,
  type RecentPatient,
  type UpcomingScheduleItem
} from "@/lib/api/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  MinusCircle, 
  ListChecks, 
  Globe, 
  Building2, 
  Droplet, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
  FileText,
  Users,
  CalendarCheck
} from 'lucide-react';
import PatientDetailsModal from "../patient-details-modal";
import { cn, hasActualAllergies } from "@/lib/utils";

export default function EnhancedDashboardPage() {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todaysAppointments, setTodaysAppointments] = useState<TodaysAppointmentsSummary>({
    upcoming: [],
    completed: [],
    missed: [],
    cancelled: [],
  });
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    patientsSeenThisWeek: 0,
    pendingCheckups: 0,
  });
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState<UpcomingScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all dashboard data in parallel
        const [
          doctorData, 
          statsData, 
          todaysData,
          weeklyData,
          patientsData,
          scheduleData
        ] = await Promise.all([
          getDoctorProfile(),
          getDashboardStats(),
          getTodaysAppointments(),
          getWeeklyStats(),
          getRecentPatients(10),
          getUpcomingSchedule(),
        ]);

        console.log('Todays Appointments Data:', todaysData);

        setDoctor(doctorData);
        setStats(statsData);
        setTodaysAppointments(todaysData);
        setWeeklyStats(weeklyData);
        setRecentPatients(patientsData);
        setUpcomingSchedule(scheduleData);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const handlePatientClick = (patientId: number) => {
    setSelectedPatientId(patientId);
    setIsPatientModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-center min-h-100">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor || !stats) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-center min-h-100">
          <p className="text-destructive">{error || "Failed to load dashboard"}</p>
        </div>
      </div>
    );
  }

  const totalTodaysAppointments = 
    todaysAppointments.upcoming.length + 
    todaysAppointments.completed.length + 
    todaysAppointments.missed.length + 
    todaysAppointments.cancelled.length;

  return (
    <>
      <div className="p-6 md:p-8 space-y-8 min-h-screen bg-slate-50/50">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, Dr. {doctor.firstName}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mt-1">{doctor.specialization} • {doctor.departmentName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', weekday: 'short' })}</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="Schedules" value={stats.schedules} color="blue" />
          <StatCard icon={CheckCircle} label="Booked Slots" value={stats.bookedSlots} color="green" />
          <StatCard icon={Clock} label="Available Slots" value={stats.availableSlots} color="cyan" />
          <StatCard icon={MinusCircle} label="Blocked Slots" value={stats.unbookableSlots} color="orange" />
          <StatCard icon={ListChecks} label="Checkups" value={stats.checkups} color="purple" />
          <StatCard icon={TrendingUp} label="Patients Seen" value={weeklyStats.patientsSeenThisWeek} color="emerald" />
          <StatCard icon={FileText} label="Drafted Checkups" value={weeklyStats.pendingCheckups} color="amber" />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Appointments with Tabs */}
          <Card className="lg:col-span-2 border shadow-sm bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  Today's Appointments
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 text-sm">
                  {totalTodaysAppointments} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100/80">
                  <TabsTrigger value="upcoming" className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Upcoming ({todaysAppointments.upcoming.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white">
                    Completed ({todaysAppointments.completed.length})
                  </TabsTrigger>
                  <TabsTrigger value="missed" className="text-sm data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                    Missed ({todaysAppointments.missed.length})
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    Cancelled ({todaysAppointments.cancelled.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-4">
                  <AppointmentList appointments={todaysAppointments.upcoming} emptyMessage="No upcoming appointments" />
                </TabsContent>

                <TabsContent value="completed" className="mt-4">
                  <AppointmentList appointments={todaysAppointments.completed} emptyMessage="No completed appointments" />
                </TabsContent>

                <TabsContent value="missed" className="mt-4">
                  <AppointmentList appointments={todaysAppointments.missed} emptyMessage="No missed appointments" />
                </TabsContent>

                <TabsContent value="cancelled" className="mt-4">
                  <AppointmentList appointments={todaysAppointments.cancelled} emptyMessage="No cancelled appointments" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="border shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Recent Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No patients yet</p>
              ) : (
                <ul className="space-y-2 max-h-125 overflow-y-auto">
                  {recentPatients.map((patient) => {
                    const age = patient.dateOfBirth 
                      ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                      : null;

                    return (
                      <li 
                        key={patient.id} 
                        className="p-3 rounded-lg border bg-slate-50 hover:bg-blue-50 transition-all cursor-pointer"
                        onClick={() => handlePatientClick(patient.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-[15px]">
                              {patient.firstName} {patient.lastName}
                            </p>
                            {age && (
                              <p className="text-muted-foreground text-sm">{age} years old</p>
                            )}
                            {patient.bloodGroup && (
                              <div className="flex items-center gap-1 mt-1">
                                <Droplet className="w-3 h-3 text-red-600" />
                                <span className="text-sm">{patient.bloodGroup}</span>
                              </div>
                            )}
                            {hasActualAllergies(patient.allergies) && (
                              <div className="flex items-center gap-1 mt-1 text-orange-700">
                                <AlertTriangle className="w-3 h-3" />
                                <span className="text-sm">Has allergies</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {patient.totalAppointments} visit{patient.totalAppointments !== 1 ? 's' : ''}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(patient.lastAppointmentDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Schedule Preview */}
        <Card className="border shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Schedules (Today & Tomorrow)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedule.length === 0 ? (
              <p className="text-base text-muted-foreground text-center py-6">No schedules in the next 2 days</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcomingSchedule.map((schedule) => {
                  // Validate and parse dates
                  if (!schedule.from || !schedule.to) {
                    console.error('Invalid schedule data:', schedule);
                    return null;
                  }
                  
                  const startDate = new Date(schedule.from);
                  const endDate = new Date(schedule.to);
                  
                  // Check if dates are valid
                  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    console.error('Invalid date values:', { from: schedule.from, to: schedule.to });
                    return null;
                  }
                  
                  const isToday = startDate.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={schedule.id} 
                      className="p-4 border rounded-lg bg-slate-50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={isToday ? "default" : "secondary"} className="text-sm">
                          {isToday ? "Today" : "Tomorrow"}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          {schedule.totalSlots} slots
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-base">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm mt-3">
                          <div className="text-center p-2 rounded bg-green-50 border border-green-200">
                            <p className="font-semibold text-green-700">{schedule.availableSlots}</p>
                            <p className="text-green-600">Available</p>
                          </div>
                          <div className="text-center p-2 rounded bg-blue-50 border border-blue-200">
                            <p className="font-semibold text-blue-700">{schedule.bookedSlots}</p>
                            <p className="text-blue-600">Booked</p>
                          </div>
                          <div className="text-center p-2 rounded bg-orange-50 border border-orange-200">
                            <p className="font-semibold text-orange-700">{schedule.unbookableSlots}</p>
                            <p className="text-orange-600">Blocked</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        patientId={selectedPatientId}
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />
    </>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colorClasses = {
    blue: "bg-blue-600 text-white",
    green: "bg-green-600 text-white",
    cyan: "bg-cyan-600 text-white",
    orange: "bg-orange-600 text-white",
    purple: "bg-purple-600 text-white",
    emerald: "bg-emerald-600 text-white",
    amber: "bg-amber-600 text-white",
  };

  return (
    <Card className="border shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="py-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold mt-1 text-muted-foreground">{value}</p>
          </div>
          <div className={`w-9 h-9 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentList({ appointments, emptyMessage }: { appointments: any[]; emptyMessage: string }) {
  if (appointments.length === 0) {
    return (
      <p className="text-base text-muted-foreground py-8 text-center">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-3 max-h-100 overflow-y-auto">
      {appointments.map((a) => {
        const patientAge = a.patient?.dateOfBirth 
          ? Math.floor((Date.now() - new Date(a.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null;
        
        return (
          <div key={a.id} className="p-4 border rounded-lg bg-slate-50 hover:bg-blue-50/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-white">
                    {`${a.patient?.firstName?.[0] || ''}${a.patient?.lastName?.[0] || ''}`.toUpperCase() || 'PT'}
                  </span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground text-[15px]">
                      {a.patient?.firstName} {a.patient?.lastName}
                    </p>
                    {patientAge && (
                      <span className="text-sm text-muted-foreground">({patientAge}y)</span>
                    )}
                    {a.appointmentType && (
                      <Badge variant="outline" className="text-xs">
                        {a.appointmentType === 'online' ? <Globe className="w-3 h-3 mr-1" /> : <Building2 className="w-3 h-3 mr-1" />}
                        {a.appointmentType}
                      </Badge>
                    )}
                    {a.status && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {a.status}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(a.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Badge variant="outline" className="text-sm">
                      {a.reason}
                    </Badge>
                    {a.patient?.bloodGroup && (
                      <Badge variant="outline" className="text-sm flex items-center gap-1">
                        <Droplet className="w-3 h-3" /> {a.patient.bloodGroup}
                      </Badge>
                    )}
                    {hasActualAllergies(a.patient?.allergies) && (
                      <Badge variant="outline" className="text-sm flex items-center gap-1 text-orange-700 border-orange-300">
                        <AlertTriangle className="w-3 h-3" /> Allergies
                      </Badge>
                    )}
                  </div>
                  
                  {a.patient?.medicalHistory && (
                    <p className="text-sm text-muted-foreground italic line-clamp-1">
                      History: {a.patient.medicalHistory}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
