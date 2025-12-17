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
  filter: "all" | "upcoming" | "completed" | "cancelled";
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

        // Set correct filters based on tab
        if (filter === "upcoming") {
          // Show only upcoming booked appointments
          status = "BOOKED";
          timeFilter = "upcoming";
        } else if (filter === "completed") {
          // Show completed appointments (both explicitly completed and past booked ones)
          status = "COMPLETED";
          timeFilter = "all"; // Don't filter by time, backend will handle it
        } else if (filter === "cancelled") {
          // Show only cancelled appointments
          status = "CANCELLED";
          timeFilter = "all";
        } else {
          // Show all appointments
          status = "all";
          timeFilter = "all";
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
    } else if (status === "CHECKUP_DRAFT") {
      return <Badge className="bg-yellow-500">Checkup Drafted</Badge>;
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
            {filter === "cancelled" && "You don't have any cancelled appointments."}
            {filter === "all" && "You haven't booked any appointments yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
        {appointments.map((appointment) => {
          const appointmentDate = new Date(appointment.startTime);
          const canCancel = canCancelAppointment(appointment.startTime);

          return (
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
                    <h3 className="font-semibold text-base">
                      Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                    </h3>
                    {getStatusBadge(appointment.status, appointment.startTime)}
                    <Badge 
                      variant="outline" 
                      className={appointment.appointmentType === "online" ? "bg-blue-50 text-blue-700 border-blue-200 text-xs" : "bg-purple-50 text-purple-700 border-purple-200 text-xs"}
                    >
                      {appointment.appointmentType === "online" ? "Online" : "Walk-in"}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {appointment.doctor.specialization}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {appointmentDate.toLocaleDateString('en-PK', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* {appointment.reason && (
                    <div className="mt-2 p-2 bg-white rounded border text-sm">
                      <span className="font-medium text-muted-foreground">Reason: </span>
                      {appointment.reason}
                    </div>
                  )} */}
                </div>

                {canCancel && appointment.appointmentType === "online" && appointment.status === "BOOKED" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="shrink-0"
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