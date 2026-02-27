"use client";

import { useState, useEffect } from "react";
import { getAvailableSlotsForSchedule, rescheduleAppointment } from "@/lib/api/doctor";
import type { UpcomingAppointment } from "@/lib/api/doctor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: UpcomingAppointment;
  onRescheduled: () => void;
}

interface AvailableSlot {
  id: number;
  scheduleId: number;
  startTime: string;
  endTime: string;
  isBookable: boolean;
  isBooked: boolean;
}

export default function RescheduleDialog({
  open,
  onOpenChange,
  appointment,
  onRescheduled,
}: RescheduleDialogProps) {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && appointment.scheduleId) {
      fetchAvailableSlots();
    }
  }, [open, appointment.scheduleId]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSlotId(null);
      const slots = await getAvailableSlotsForSchedule(appointment.scheduleId);
      setAvailableSlots(slots);
    } catch (err: any) {
      console.error("Error fetching available slots:", err);
      setError(err.response?.data?.message || "Failed to load available slots");
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlotId) return;

    try {
      setRescheduling(true);
      const result = await rescheduleAppointment(appointment.id, selectedSlotId);
      toast.success(result.message || "Appointment rescheduled successfully");
      onOpenChange(false);
      onRescheduled();
    } catch (err: any) {
      console.error("Error rescheduling appointment:", err);
      toast.error(err.response?.data?.message || "Failed to reschedule appointment");
    } finally {
      setRescheduling(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border shadow-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new time slot for{" "}
            <span className="font-semibold text-foreground">
              {appointment.patient.firstName} {appointment.patient.lastName}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Current appointment info */}
        <div className="bg-slate-50 rounded-lg p-3 border">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1.5">Current Slot</p>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{formatDate(appointment.startTime)}</span>
            <span className="text-muted-foreground">•</span>
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-medium">
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </span>
          </div>
        </div>

        {/* Available slots */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading available slots...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchAvailableSlots}>
                Retry
              </Button>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Calendar className="w-10 h-10 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground text-center">
                No available slots in this schedule.
                <br />
                The appointment can only be cancelled.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                Available Slots ({availableSlots.length})
              </p>
              <div className="grid gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200",
                      selectedSlotId === slot.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        selectedSlotId === slot.id
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(slot.startTime)}
                      </div>
                    </div>
                    {selectedSlotId === slot.id && (
                      <Badge className="bg-blue-600 text-white border-0">Selected</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-3 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={rescheduling}>
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedSlotId || rescheduling}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {rescheduling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Rescheduling...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" /> Reschedule
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
