"use client";

import { useState, useMemo } from "react";
import { createSchedule } from "@/lib/api/doctor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Grid3x3, AlertTriangle } from "lucide-react";
import { DateTimePicker } from "@/app/components/lingua-time/datetime-picker";
import { toast } from "sonner";

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleCreated?: () => void;
}

export default function CreateScheduleDialog({
  open,
  onOpenChange,
  onScheduleCreated,
}: CreateScheduleDialogProps) {
  const [startDateTime, setStartDateTime] = useState<Date | undefined>(undefined);
  const [durationHours, setDurationHours] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [noOfSlots, setNoOfSlots] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate end time based on start time and duration
  const endDateTime = useMemo(() => {
    if (!startDateTime) return undefined;
    const hours = parseInt(durationHours) || 0;
    const minutes = parseInt(durationMinutes) || 0;
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes <= 0) return undefined;
    
    const end = new Date(startDateTime.getTime() + totalMinutes * 60000);
    return end;
  }, [startDateTime, durationHours, durationMinutes]);

  const totalMinutes = useMemo(() => {
    if (!startDateTime || !endDateTime) return 0;
    return Math.max(0, (endDateTime.getTime() - startDateTime.getTime()) / 60000);
  }, [startDateTime, endDateTime]);

  const suggestedSlotDuration = useMemo(() => {
    const slots = parseInt(noOfSlots) || 0;
    if (totalMinutes === 0 || slots === 0) return 0;
    return Math.floor(totalMinutes / slots);
  }, [totalMinutes, noOfSlots]);

  const previewSlots = useMemo(() => {
    const slots = parseInt(noOfSlots) || 0;
    if (!startDateTime || suggestedSlotDuration === 0) return [];
    const out: { start: string; end: string }[] = [];
    let cursor = new Date(startDateTime.getTime());
    for (let i = 0; i < slots; i++) {
      const end = new Date(cursor.getTime() + suggestedSlotDuration * 60000);
      if (endDateTime && end.getTime() > endDateTime.getTime()) break;
      out.push({
        start: cursor.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        end: end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      cursor = end;
    }
    return out.slice(0, 6); // cap preview
  }, [startDateTime, endDateTime, noOfSlots, suggestedSlotDuration]);

  // Check if schedule is in the past
  const isPastSchedule = useMemo(() => {
    if (!startDateTime) return false;
    return startDateTime.getTime() < Date.now();
  }, [startDateTime]);

  const isValid =
    startDateTime &&
    endDateTime &&
    parseInt(noOfSlots) > 0 &&
    totalMinutes > 0 &&
    !isPastSchedule;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !startDateTime || !endDateTime) return;
    setSubmitting(true);
    setError(null);
    
    try {
      await createSchedule({
        from: startDateTime.toISOString(),
        to: endDateTime.toISOString(),
        noOfSlots: parseInt(noOfSlots),
      });
      
      // Reset form
      setStartDateTime(undefined);
      setDurationHours("");
      setDurationMinutes("");
      setNoOfSlots("");
      
      toast.success("Schedule created successfully!");
      onScheduleCreated?.();
      onOpenChange(false);
    } catch (err: any) {
      // console.error("Error creating schedule:", err);
      setError(err.response?.data?.message || "Failed to create schedule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        if (!submitting) onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-md" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-wide">
            Create Schedule
          </DialogTitle>
          <DialogDescription className="text-xs">
            Define availability window; slots will be auto-generated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="startDateTime"
                className="text-xs font-medium"
              >
                Start Date & Time
              </Label>
              <DateTimePicker
                dateTime={startDateTime}
                setDateTime={setStartDateTime}
                disabled={submitting}
                aria-describedby={undefined}
              />
              {isPastSchedule && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Cannot create schedules in the past
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="durationHours"
                  className="text-xs font-medium"
                >
                  Duration (Hours)
                </Label>
                <Input
                  id="durationHours"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="durationMinutes"
                  className="text-xs font-medium"
                >
                  Duration (Minutes)
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={0}
                  max={59}
                  placeholder="0"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            
            {endDateTime && (
              <p className="text-xs text-muted-foreground">
                End time: {endDateTime.toLocaleString()}
              </p>
            )}
            
            <div className="space-y-2">
              <Label
                htmlFor="noOfSlots"
                className="text-xs font-medium"
              >
                Number of Slots
              </Label>
              <Input
                id="noOfSlots"
                type="number"
                min={1}
                value={noOfSlots}
                onChange={(e) => setNoOfSlots(e.target.value)}
                disabled={submitting}
                required
              />
              {suggestedSlotDuration > 0 && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Approx {suggestedSlotDuration} min
                  per slot
                </p>
              )}
            </div>
          </div>

          {previewSlots.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground flex items-center gap-1">
                <Grid3x3 className="w-3 h-3" /> Slot Preview
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {previewSlots.map((p, i) => (
                  <div
                    key={i}
                    className="p-2 border rounded-md bg-muted/30"
                  >
                    {p.start} - {p.end}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!isValid || submitting}
            >
              {submitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
