"use client";

import { useEffect, useState } from "react";
import { getDoctorProfile, getDashboardStats, getUpcomingAppointments, getRecentCheckups } from "@/lib/api/doctor";
import type { DoctorProfile, DashboardStats, UpcomingAppointment, RecentCheckup } from "@/lib/api/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, MinusCircle, ListChecks, Globe, Building2, Droplet, AlertTriangle, Activity, Pill, FlaskConical } from 'lucide-react';

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

  return (
    <div className="p-6 md:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome, {doctor.firstName}</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">{doctor.specialization}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', weekday: 'short' })}</p>
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-wide">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No appointments today</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(a => {
                  const patientAge = a.patient?.dateOfBirth 
                    ? Math.floor((Date.now() - new Date(a.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    : null;
                  
                  return (
                    <div key={a.id} className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {`${a.patient?.firstName?.[0] || ''}${a.patient?.lastName?.[0] || ''}`.toUpperCase() || 'PT'}
                            </span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">
                                {a.patient?.firstName} {a.patient?.lastName}
                              </p>
                              {patientAge && (
                                <span className="text-xs text-muted-foreground">({patientAge}y)</span>
                              )}
                              {a.appointmentType && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border bg-background">
                                  {a.appointmentType === 'online' ? <Globe className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                                  <span className="capitalize">{a.appointmentType}</span>
                                </span>
                              )}
                              {a.status && (
                                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border bg-background capitalize">
                                  {a.status}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(a.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded border bg-background">
                                {a.reason}
                              </span>
                              {a.patient?.bloodGroup && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-background">
                                  <Droplet className="w-3 h-3" /> {a.patient.bloodGroup}
                                </span>
                              )}
                              {a.patient?.allergies && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-background text-orange-700">
                                  <AlertTriangle className="w-3 h-3" /> Allergies
                                </span>
                              )}
                            </div>
                            
                            {a.patient?.medicalHistory && (
                              <p className="text-xs text-muted-foreground italic line-clamp-1">
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
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-wide">Recent Checkups</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCheckups.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No checkups yet</p>
            ) : (
              <ul className="space-y-3">
                {recentCheckups.map(c => {
                  const medsCount = (c.medications?.length || 0);
                  const testsCount = (c.recommendedLabTests?.length || 0);
                  const hasAdditionalMeds = c.additionalMedications?.trim();
                  const hasAdditionalTests = c.additionalTests?.trim();
                  
                  return (
                    <li key={c.id} className="text-xs p-3 rounded-lg border bg-muted/30 hover:bg-muted/40 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">
                          {c.appointment.patient.firstName} {c.appointment.patient.lastName}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(c.appointment.slot.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      {/* Vitals */}
                      {(c.bloodPressure || c.temperature || c.heartRate || c.bloodSugar) && (
                        <div className="flex flex-wrap gap-2">
                          {c.bloodPressure && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border bg-background">
                              <Activity className="w-3 h-3" /> {c.bloodPressure} mmHg
                            </span>
                          )}
                          {c.temperature && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border bg-background">
                              {c.temperature}°F
                            </span>
                          )}
                          {c.heartRate && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border bg-background">
                              ♥ {c.heartRate} bpm
                            </span>
                          )}
                          {c.bloodSugar && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border bg-background">
                              {c.bloodSugar} mg/dL
                            </span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Diagnosis:</span> {c.diagnosis.slice(0, 60)}{c.diagnosis.length > 60 ? '…' : ''}
                      </p>
                      
                      {c.symptoms && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Symptoms:</span> {c.symptoms.slice(0, 50)}{c.symptoms.length > 50 ? '…' : ''}
                        </p>
                      )}
                      
                      {/* Medications & Tests Summary */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(medsCount > 0 || hasAdditionalMeds) && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border bg-background">
                            <Pill className="w-3 h-3" /> 
                            {medsCount > 0 ? `${medsCount} Med${medsCount > 1 ? 's' : ''}` : 'Meds'}
                            {hasAdditionalMeds && ' +'}
                          </span>
                        )}
                        {(testsCount > 0 || hasAdditionalTests) && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border bg-background">
                            <FlaskConical className="w-3 h-3" /> 
                            {testsCount > 0 ? `${testsCount} Test${testsCount > 1 ? 's' : ''}` : 'Tests'}
                            {hasAdditionalTests && ' +'}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
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
    <Card className="border shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
            <p className="text-xl font-semibold mt-1">{value}</p>
          </div>
          <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center text-primary">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
