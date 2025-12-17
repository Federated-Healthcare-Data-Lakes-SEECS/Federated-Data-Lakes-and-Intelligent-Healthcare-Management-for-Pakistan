"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, FileText, X, AlertCircle, Globe, Building2, Droplet, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { UpcomingAppointment } from "@/lib/api/doctor";

interface AppointmentsListProps {
  appointments: UpcomingAppointment[];
  selectedAppointment: UpcomingAppointment | null;
  onSelectAppointment: (apt: UpcomingAppointment) => void;
  onCancelAppointment: (id: number) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

function formatTimeRange(startStr: string, endStr: string) {
  const s = new Date(startStr);
  const e = new Date(endStr);
  const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  return `${s.toLocaleTimeString([], opts)} - ${e.toLocaleTimeString([], opts)}`;
}

export default function AppointmentsList({
  appointments,
  selectedAppointment,
  onSelectAppointment,
  onCancelAppointment,
}: AppointmentsListProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

  const handleCancelClick = (id: number) => {
    setAppointmentToCancel(id);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (appointmentToCancel) {
      onCancelAppointment(appointmentToCancel);
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
    }
  };

  // Group appointments by status
  const groupedAppointments = {
    booked: appointments.filter(apt => apt.status === "booked"),
    completed: appointments.filter(apt => apt.status === "completed"),
    cancelled: appointments.filter(apt => apt.status === "cancelled"),
    other: appointments.filter(apt => !["booked", "completed", "cancelled"].includes(apt.status)),
  };

  const allGrouped = [
    { status: "booked", title: "Booked", appointments: groupedAppointments.booked },
    { status: "completed", title: "Completed", appointments: groupedAppointments.completed },
    { status: "cancelled", title: "Cancelled", appointments: groupedAppointments.cancelled },
    { status: "other", title: "Other", appointments: groupedAppointments.other },
  ].filter(group => group.appointments.length > 0);

  return (
    <>
      <div className="space-y-6">
        {appointments.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
                <p className="text-muted-foreground">No appointments</p>
              </div>
            </CardContent>
          </Card>
        )}

        {allGrouped.map((group) => (
          <div key={group.status} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {group.title} ({group.appointments.length})
            </h3>
            <div className="space-y-4">
              {group.appointments.map((apt) => {
        const date = formatDate(apt.startTime);
        const timeRange = formatTimeRange(apt.startTime, apt.endTime);
        const isSelected = selectedAppointment?.id === apt.id;
        const isCancelled = apt.status === "cancelled";
        const patientAge = apt.patient.dateOfBirth 
          ? Math.floor((Date.now() - new Date(apt.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null;

        const appointmentType = apt.appointmentType || 'unknown';
        
        return (
          <Card
            key={apt.id}
            className={`border rounded-lg shadow-sm transition-all ${
              isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
            } ${isCancelled ? 'opacity-70 grayscale' : ''}`}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground text-lg">
                        {apt.patient.firstName} {apt.patient.lastName}
                      </p>
                      {patientAge && <span className="text-xs text-muted-foreground">({patientAge}y)</span>}
                      <Badge
                        variant={isCancelled ? 'secondary' : 'outline'}
                        className={`capitalize ${isCancelled ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}`}
                      >
                        {apt.status}
                      </Badge>
                      <Badge 
                        className="text-xs gap-1"
                        variant="outline"
                      >
                        {appointmentType === 'online' ? (
                          <>
                            <Globe className="w-3 h-3" /> Online
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3" /> Walk-in
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {timeRange}
                      </span>
                      <span>•</span>
                      <span>{date}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">{apt.reason}</Badge>
                      {apt.patient.bloodGroup && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Droplet className="w-3 h-3" /> {apt.patient.bloodGroup}
                        </Badge>
                      )}
                      {apt.patient.allergies && (
                        <Badge variant="outline" className="text-xs gap-1 text-orange-700 border-orange-300">
                          <AlertTriangle className="w-3 h-3" /> Allergies
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isCancelled}
                    onClick={() => onSelectAppointment(apt)}
                    className="font-medium"
                  >
                    <FileText className="w-4 h-4 mr-1" /> {isCancelled ? 'View Details' : 'Perform Checkup'}
                  </Button>
                  {!isCancelled && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelClick(apt.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive hover:bg-destructive/90">
              Yes, cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
