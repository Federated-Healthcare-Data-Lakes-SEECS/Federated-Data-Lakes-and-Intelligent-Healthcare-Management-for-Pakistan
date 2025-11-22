"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, FileText, X, AlertCircle } from "lucide-react";

interface AppointmentProps {
  id: number;
  patientId: number;
  slotId: number;
  scheduleId: number;
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  reason: string;
  status: string;
  patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    bloodGroup: string;
    medicalHistory?: string;
    allergies?: string;
  };
  createdAt: string;
}

interface AppointmentsListProps {
  appointments: AppointmentProps[];
  selectedAppointment: AppointmentProps | null;
  onSelectAppointment: (apt: AppointmentProps) => void;
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
  return (
    <div className="space-y-4">
      {appointments.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground">No booked appointments</p>
            </div>
          </CardContent>
        </Card>
      )}

      {appointments.map((apt) => {
        const date = formatDate(apt.startTime);
        const timeRange = formatTimeRange(apt.startTime, apt.endTime);
        const isSelected = selectedAppointment?.id === apt.id;
        const isCancelled = apt.status === "cancelled";

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
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground text-lg">
                        {apt.patient.firstName} {apt.patient.lastName}
                      </p>
                      <Badge
                        variant={isCancelled ? 'secondary' : 'outline'}
                        className={`capitalize ${isCancelled ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}`}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {timeRange}
                      </span>
                      <span>{date}</span>
                      <Badge variant="outline" className="bg-accent/5">{apt.reason}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isCancelled}
                    onClick={() => onSelectAppointment(apt)}
                  >
                    <FileText className="w-4 h-4" /> {isCancelled ? 'View' : 'Perform Checkup'}
                  </Button>
                  {!isCancelled && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onCancelAppointment(apt.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" /> Cancel Appointment
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
