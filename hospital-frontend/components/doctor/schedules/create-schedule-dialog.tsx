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
import { Clock, Grid3x3 } from "lucide-react";

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
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    noOfSlots: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minutesDiff = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(`${formData.date}T${formData.startTime}:00`);
    const end = new Date(`${formData.date}T${formData.endTime}:00`);
    return Math.max(0, (end.getTime() - start.getTime()) / 60000);
  }, [formData]);

  const suggestedSlotDuration = useMemo(() => {
    const slots = parseInt(formData.noOfSlots) || 0;
    if (minutesDiff === 0 || slots === 0) return 0;
    return Math.floor(minutesDiff / slots);
  }, [minutesDiff, formData.noOfSlots]);

  const previewSlots = useMemo(() => {
    const slots = parseInt(formData.noOfSlots) || 0;
    if (!formData.date || !formData.startTime || suggestedSlotDuration === 0)
      return [];
    const out: { start: string; end: string }[] = [];
    let cursor = new Date(`${formData.date}T${formData.startTime}:00`);
    for (let i = 0; i < slots; i++) {
      const end = new Date(cursor.getTime() + suggestedSlotDuration * 60000);
      if (end.toISOString() > `${formData.date}T${formData.endTime}:00Z`) break;
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
  }, [
    formData.date,
    formData.startTime,
    formData.endTime,
    formData.noOfSlots,
    suggestedSlotDuration,
  ]);

  const isValid =
    formData.date &&
    formData.startTime &&
    formData.endTime &&
    parseInt(formData.noOfSlots) > 0 &&
    minutesDiff > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    
    try {
      // Combine date and time to create ISO timestamps
      const fromDateTime = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
      const toDateTime = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();
      
      await createSchedule({
        from: fromDateTime,
        to: toDateTime,
        noOfSlots: parseInt(formData.noOfSlots),
      });
      
      // Reset form
      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        noOfSlots: "",
      });
      
      alert("Schedule created successfully!");
      onScheduleCreated?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error creating schedule:", err);
      setError(err.response?.data?.message || "Failed to create schedule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!submitting) onOpenChange(o);
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
                htmlFor="date"
                className="text-xs font-medium"
              >
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="startTime"
                  className="text-xs font-medium"
                >
                  Start
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="endTime"
                  className="text-xs font-medium"
                >
                  End
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>
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
                value={formData.noOfSlots}
                onChange={(e) =>
                  setFormData({ ...formData, noOfSlots: e.target.value })
                }
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
