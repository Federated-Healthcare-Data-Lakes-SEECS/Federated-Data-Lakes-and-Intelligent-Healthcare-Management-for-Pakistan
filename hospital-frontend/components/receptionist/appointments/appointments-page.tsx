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
import { Loader2, Calendar, Clock, User, Search } from "lucide-react";
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
        return "bg-blue-500";
      case "COMPLETED":
        return "bg-green-500";
      case "NOT_ATTENDED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
        <p className="text-muted-foreground mt-2">
          View and manage walk-in appointments you've booked
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
              <label className="text-sm font-medium">Time</label>
              <Select value={timeFilter} onValueChange={(v: any) => setTimeFilter(v)}>
                <SelectTrigger>
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
              <label className="text-sm font-medium">Search Patient/Doctor</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient or doctor name..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No appointments found matching your search"
                  : "No appointments found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""}
            </div>
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Patient Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">
                            {appointment.patient.firstName} {appointment.patient.lastName}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {appointment.patient.email}
                        </p>
                        {appointment.patient.phoneNumber && (
                          <p className="text-sm text-muted-foreground ml-6">
                            {appointment.patient.phoneNumber}
                          </p>
                        )}
                      </div>

                      {/* Doctor Info */}
                      <div className="ml-6 pl-4 border-l-2">
                        <p className="text-sm font-medium">
                          Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <Badge variant="outline">{appointment.doctor.specialization}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {appointment.doctor.departmentName}
                          </span>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground ml-6">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatAppointmentDate(appointment.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatAppointmentTime(appointment.startTime, appointment.endTime)}
                        </span>
                      </div>

                      {/* Reason */}
                      {appointment.reason && (
                        <div className="ml-6 p-3 bg-secondary rounded-md">
                          <p className="text-sm">
                            <span className="font-medium">Reason:</span> {appointment.reason}
                          </p>
                        </div>
                      )}

                      {/* Appointment ID */}
                      <p className="text-xs text-muted-foreground ml-6">
                        Appointment ID: #{appointment.id}
                      </p>
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
