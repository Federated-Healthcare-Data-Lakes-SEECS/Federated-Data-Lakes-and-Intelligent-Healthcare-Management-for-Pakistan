"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Grid3x3, Trash2, Ban, CheckCircle } from 'lucide-react';
import { deleteSchedule, toggleSlotBookability } from "@/lib/api/doctor";
import type { Schedule } from "@/lib/api/doctor";
import { toast } from "sonner";

interface ScheduleListProps { 
  schedules: Schedule[];
  onScheduleDeleted?: () => void;
}

export default function ScheduleList({ schedules, onScheduleDeleted }: ScheduleListProps) {
  const handleDelete = async (scheduleId: number) => {
    if (!confirm("Are you sure you want to delete this schedule? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteSchedule(scheduleId);
      toast.success("Schedule deleted successfully!");
      onScheduleDeleted?.();
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete schedule";
      
      // Check if it's the booked slots error
      if (error.response?.status === 400 || errorMessage.toLowerCase().includes('booked')) {
        toast.error("This schedule cannot be deleted - some slots are already booked");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleToggleBookability = async (slotId: number) => {
    try {
      const result = await toggleSlotBookability(slotId);
      toast.success(result.message || "Slot bookability updated");
      onScheduleDeleted?.(); // Refresh the list
    } catch (error: any) {
      console.error("Error toggling slot:", error);
      toast.error(error.response?.data?.message || "Failed to update slot");
    }
  };

  if (schedules.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">No Schedules Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first schedule to start accepting appointments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {schedules.map((schedule) => {
        const booked = schedule.appointmentSlots.filter(s => s.isBooked).length;
        const unbookable = schedule.appointmentSlots.filter(s => !s.isBookable && !s.isBooked).length;
        const available = schedule.appointmentSlots.length - booked - unbookable;
        const scheduleDate = new Date(schedule.from);
        const scheduleEndDate = new Date(schedule.to);

        const hasBookedSlots = booked > 0;

        return (
          <Card key={schedule.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {scheduleDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {scheduleEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex gap-2 items-center flex-wrap justify-end">
                  <Badge variant="outline" className="text-xs gap-1">
                    <Grid3x3 className="w-3 h-3" /> {schedule.appointmentSlots.length} slots
                  </Badge>
                  {booked > 0 && (
                    <Badge variant="outline" className="text-xs">{booked} booked</Badge>
                  )}
                  {available > 0 && (
                    <Badge variant="secondary" className="text-xs">{available} available</Badge>
                  )}
                  {unbookable > 0 && (
                    <Badge variant="outline" className="text-xs">{unbookable} blocked</Badge>
                  )}
                  {!hasBookedSlots && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDelete(schedule.id)}
                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                {schedule.appointmentSlots.map((slot) => {
                  const status = slot.isBooked ? 'booked' : (!slot.isBookable ? 'unbookable' : 'available');
                  const slotStartTime = new Date(slot.startTime);
                  const slotEndTime = new Date(slot.endTime);
                  
                  return (
                    <div key={slot.id} className={`p-3 rounded-lg border text-xs flex flex-col gap-2 transition-all ${status === 'booked' ? 'bg-muted/50' : status === 'unbookable' ? 'bg-muted/30' : 'bg-background'}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <span className="font-semibold block text-foreground">{slotStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[10px] text-muted-foreground">{slotEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <StatusBadge status={status} />
                      </div>
                      {!slot.isBooked && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1 font-medium"
                          onClick={() => handleToggleBookability(slot.id)}
                        >
                          {slot.isBookable ? (
                            <><Ban className="w-3 h-3" /> Block</>
                          ) : (
                            <><CheckCircle className="w-3 h-3" /> Enable</>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'booked') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] border bg-primary/10 text-primary font-semibold">
        Booked
      </span>
    );
  }
  if (status === 'unbookable') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] border bg-muted text-muted-foreground font-semibold">
        Blocked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] border bg-secondary text-secondary-foreground font-semibold">
      Available
    </span>
  );
}
