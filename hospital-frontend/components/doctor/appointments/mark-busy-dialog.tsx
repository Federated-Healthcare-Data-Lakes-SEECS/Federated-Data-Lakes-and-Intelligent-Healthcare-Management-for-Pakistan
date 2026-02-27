"use client";

import { useState } from "react";
import { markBusyAndReschedule } from "@/lib/api/doctor";
import type { MarkBusyResult } from "@/lib/api/doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Ban,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";

interface MarkBusyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function MarkBusyDialog({
  open,
  onOpenChange,
  onComplete,
}: MarkBusyDialogProps) {
  const [busyFrom, setBusyFrom] = useState("");
  const [busyTo, setBusyTo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MarkBusyResult | null>(null);

  const handleSubmit = async () => {
    if (!busyFrom || !busyTo) {
      toast.error("Please select both start and end times");
      return;
    }

    const fromDate = new Date(busyFrom);
    const toDate = new Date(busyTo);

    if (fromDate >= toDate) {
      toast.error("Start time must be before end time");
      return;
    }

    try {
      setSubmitting(true);
      setResult(null);
      const res = await markBusyAndReschedule(
        fromDate.toISOString(),
        toDate.toISOString(),
      );
      setResult(res);
      toast.success(res.message);
    } catch (err: any) {
      console.error("Error marking busy:", err);
      toast.error(err.response?.data?.message || "Failed to mark busy interval");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (result) {
      onComplete();
    }
    setResult(null);
    setBusyFrom("");
    setBusyTo("");
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white border shadow-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Ban className="w-5 h-5 text-orange-600" />
            Mark Busy Interval
          </DialogTitle>
          <DialogDescription>
            Mark yourself as unavailable for a time period. Overlapping appointments will be
            automatically rescheduled to available slots or cancelled if no slots are available.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <>
            {/* Warning card */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-orange-800">
                    This action will block affected time slots and reschedule or cancel any
                    overlapping booked appointments.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Time inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="busyFrom" className="text-sm font-medium">
                  Busy From
                </Label>
                <Input
                  id="busyFrom"
                  type="datetime-local"
                  value={busyFrom}
                  onChange={(e) => setBusyFrom(e.target.value)}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="busyTo" className="text-sm font-medium">
                  Busy Until
                </Label>
                <Input
                  id="busyTo"
                  type="datetime-local"
                  value={busyTo}
                  onChange={(e) => setBusyTo(e.target.value)}
                  className="border-slate-200"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-3 border-t">
              <Button variant="outline" onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!busyFrom || !busyTo || submitting}
                className="bg-orange-600 hover:bg-orange-700 gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" /> Mark Busy
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* Result view */
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="py-3 px-4 text-center">
                  <CalendarClock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-green-700">{result.totalRescheduled}</p>
                  <p className="text-xs text-green-600 font-medium">Rescheduled</p>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-3 px-4 text-center">
                  <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-red-700">{result.totalCancelled}</p>
                  <p className="text-xs text-red-600 font-medium">Cancelled</p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="py-3 px-4 text-center">
                  <Ban className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-orange-700">{result.totalSlotsBlocked}</p>
                  <p className="text-xs text-orange-600 font-medium">Slots Blocked</p>
                </CardContent>
              </Card>
            </div>

            {/* Detail per schedule */}
            {result.details.map((detail) => (
              <Card key={detail.scheduleId} className="border shadow-sm">
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Schedule #{detail.scheduleId}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {detail.slotsBlocked} slot(s) blocked
                    </span>
                  </div>

                  {detail.rescheduled.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Rescheduled
                      </p>
                      {detail.rescheduled.map((item) => (
                        <div
                          key={item.appointmentId}
                          className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-sm"
                        >
                          <span className="font-medium text-green-800">{item.patientName}</span>
                          <span className="text-green-600 flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            {formatTime(item.fromSlot.startTime)}
                            <ArrowRight className="w-3 h-3" />
                            {formatTime(item.toSlot.startTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {detail.cancelled.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Cancelled
                      </p>
                      {detail.cancelled.map((item) => (
                        <div
                          key={item.appointmentId}
                          className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-sm"
                        >
                          <span className="font-medium text-red-800">{item.patientName}</span>
                          <span className="text-red-600 flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            {formatTime(item.slot.startTime)} - {formatTime(item.slot.endTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {detail.rescheduled.length === 0 && detail.cancelled.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No booked appointments were affected in this schedule.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            <DialogFooter className="gap-2 pt-3 border-t">
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
