"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Calendar, Clock, User, Search, ClipboardList, Filter } from "lucide-react";
import {
  getMyAppointments,
  formatAppointmentTime,
  formatAppointmentDate,
  type Appointment,
} from "@/lib/api-receptionist";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, timeFilter]);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyAppointments(
        statusFilter !== "all" ? statusFilter : undefined,
        timeFilter,
        undefined
      );
      setAppointments(data);
      setFilteredAppointments(data);
    } catch (err: any) {
      console.error("Failed to load appointments:", err);
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilter = () => {
    if (!searchTerm.trim()) {
      setFilteredAppointments(appointments);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = appointments.filter(
      (apt) =>
        apt.patient.firstName.toLowerCase().includes(term) ||
        apt.patient.lastName.toLowerCase().includes(term) ||
        apt.patient.email.toLowerCase().includes(term) ||
        apt.doctor.firstName.toLowerCase().includes(term) ||
        apt.doctor.lastName.toLowerCase().includes(term)
    );
    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BOOKED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "NOT_ATTENDED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-center min-h-100">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            My Appointments
          </h1>
          <p className="text-muted-foreground text-base mt-1">
            View and manage walk-in appointments you've booked
          </p>
        </div>
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-base px-3 py-1">
          {filteredAppointments.length} Appointments
        </Badge>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold tracking-wide flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-base text-slate-700">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-slate-200 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="NOT_ATTENDED">Not Attended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-base text-slate-700">Time</label>
              <Select value={timeFilter} onValueChange={(v: any) => setTimeFilter(v)}>
                <SelectTrigger className="border-slate-200 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-base text-slate-700">Search Patient/Doctor</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient or doctor name..."
                  className="pl-10 border-slate-200"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card className="border shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                <ClipboardList className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No appointments found matching your search"
                  : "No appointments found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="border shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Patient Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <User className="h-4 w-4 text-emerald-600" />
                          </div>
                          <h3 className="font-semibold text-lg text-slate-900">
                            {appointment.patient.firstName} {appointment.patient.lastName}
                          </h3>
                        </div>
                        <p className="text-base text-muted-foreground ml-9">
                          {appointment.patient.email}
                        </p>
                        {appointment.patient.phoneNumber && (
                          <p className="text-base text-muted-foreground ml-9">
                            {appointment.patient.phoneNumber}
                          </p>
                        )}
                      </div>

                      {/* Doctor Info */}
                      <div className="ml-9 pl-4 border-l-2 border-slate-200">
                        <p className="text-base font-medium text-slate-900">
                          Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {appointment.doctor.specialization}
                          </Badge>
                          <span className="text-base text-muted-foreground">
                            {appointment.doctor.departmentName}
                          </span>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-4 text-base text-muted-foreground ml-9">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-md">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          {formatAppointmentDate(appointment.startTime)}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-md">
                          <Clock className="h-4 w-4 text-slate-500" />
                          {formatAppointmentTime(appointment.startTime, appointment.endTime)}
                        </span>
                      </div>

                      {/* Reason */}
                      {appointment.reason && (
                        <div className="ml-9 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-base">
                            <span className="font-medium text-slate-700">Reason:</span>{" "}
                            <span className="text-slate-600">{appointment.reason}</span>
                          </p>
                        </div>
                      )}

                      {/* Appointment ID */}
                      {/* <p className="text-sm text-muted-foreground ml-9">
                        Appointment ID: #{appointment.id}
                      </p> */}
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Walk-in
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
