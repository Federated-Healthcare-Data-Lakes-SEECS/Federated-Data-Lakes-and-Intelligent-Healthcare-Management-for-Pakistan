"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Stethoscope, Loader2 } from "lucide-react";
import {
  getMyAppointments,
  cancelAppointment,
  canCancelAppointment,
  type Appointment,
} from "@/lib/api-patient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AppointmentsListProps {
  filter: "all" | "upcoming" | "completed";
}

function AppointmentsList({ filter }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Load appointments based on filter
  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true);
        let status: string = "all";
        let timeFilter: "all" | "upcoming" | "past" = "all";

        if (filter === "upcoming") {
          status = "BOOKED";
          timeFilter = "upcoming";
        } else if (filter === "completed") {
          status = "COMPLETED";
          timeFilter = "past";
        }

        const data = await getMyAppointments(status, timeFilter);
        setAppointments(data);
      } catch (err: any) {
        console.error("Failed to load appointments:", err);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [filter]);

  const handleCancelAppointment = (id: number) => {
    setSelectedAppointmentId(id);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedAppointmentId) return;

    try {
      setCancelling(true);
      await cancelAppointment(selectedAppointmentId);
      
      // Update local state
      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointmentId
            ? { ...apt, status: "CANCELLED" as const }
            : apt
        )
      );
      
      toast.success("Appointment cancelled successfully");
      setCancelDialogOpen(false);
      setSelectedAppointmentId(null);
    } catch (err: any) {
      console.error("Failed to cancel appointment:", err);
      toast.error(err.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string, startTime: string) => {
    const appointmentDate = new Date(startTime);
    const now = new Date();
    const isPast = appointmentDate < now;

    if (status === "CANCELLED") {
      return <Badge variant="destructive">Cancelled</Badge>;
    } else if (status === "COMPLETED" || isPast) {
      return <Badge className="bg-green-500">Completed</Badge>;
    } else if (status === "BOOKED") {
      return <Badge className="bg-blue-500">Confirmed</Badge>;
    } else if (status === "NOT_ATTENDED") {
      return <Badge variant="outline">Not Attended</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Calendar className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
        <div>
          <p className="text-lg font-semibold">No appointments found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {filter === "upcoming" && "You don't have any upcoming appointments scheduled."}
            {filter === "completed" && "You don't have any completed appointments yet."}
            {filter === "all" && "You haven't booked any appointments yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {appointments.map((appointment) => {
          const appointmentDate = new Date(appointment.startTime);
          const canCancel = canCancelAppointment(appointment.startTime);

          return (
            <div
              key={appointment.id}
              className="p-4 border rounded-lg space-y-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-lg">
                      Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                    </h3>
                    {getStatusBadge(appointment.status, appointment.startTime)}
                    <Badge 
                      variant="outline" 
                      className={appointment.appointmentType === "online" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}
                    >
                      {appointment.appointmentType === "online" ? "Online" : "Walk-in"}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {appointment.doctor.departmentName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {appointment.doctor.specialization}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {appointmentDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {appointment.reason && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <span className="font-medium">Reason: </span>
                      {appointment.reason}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Booked on: {new Date(appointment.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {canCancel && appointment.appointmentType === "online" && appointment.status === "BOOKED" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="ml-4"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelling}
            >
              No, Keep It
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AppointmentsList;