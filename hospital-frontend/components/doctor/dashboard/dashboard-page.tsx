"use client";

import { useEffect, useState } from "react";
import { getDoctorProfile, getDashboardStats, getUpcomingAppointments, getRecentCheckups } from "@/lib/api/doctor";
import type { DoctorProfile, DashboardStats, UpcomingAppointment, RecentCheckup } from "@/lib/api/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, MinusCircle, ListChecks } from 'lucide-react';

export default function DashboardPage() {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingAppointment[]>([]);
  const [recentCheckups, setRecentCheckups] = useState<RecentCheckup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all dashboard data in parallel
        const [doctorData, statsData, upcomingData, checkupsData] = await Promise.all([
          getDoctorProfile(),
          getDashboardStats(),
          getUpcomingAppointments(5),
          getRecentCheckups(5),
        ]);

        setDoctor(doctorData);
        setStats(statsData);
        setUpcoming(upcomingData);
        setRecentCheckups(checkupsData);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor || !stats) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">{error || "Failed to load dashboard"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome, {doctor.firstName}</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">{doctor.specialization}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Calendar} label="Schedules" value={stats.schedules} />
        <StatCard icon={CheckCircle} label="Booked" value={stats.bookedSlots} />
        <StatCard icon={Clock} label="Available" value={stats.availableSlots} />
        <StatCard icon={MinusCircle} label="Blocked" value={stats.unbookableSlots} />
        <StatCard icon={ListChecks} label="Checkups" value={stats.checkups} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No appointments today</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(a => (
                  <div key={a.startTime} className="p-4 border rounded-md flex items-center justify-between text-sm bg-muted/30">
                    <div className="flex flex-col">
                      <span className="font-medium">{new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-xs text-muted-foreground">{a.reason}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(a.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide">Recent Checkups</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCheckups.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No checkups yet</p>
            ) : (
              <ul className="space-y-3">
                {recentCheckups.map(c => (
                  <li key={c.id} className="text-xs p-3 rounded-md border bg-secondary/20">
                    <p className="font-medium mb-1">{new Date(c.appointment.slot.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                    <p className="text-muted-foreground leading-snug">{c.diagnosis.slice(0, 80)}{c.diagnosis.length > 80 ? '…' : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
            <p className="text-xl font-semibold mt-1">{value}</p>
          </div>
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
