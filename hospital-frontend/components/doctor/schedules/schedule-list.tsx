"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Grid3x3, Trash2 } from 'lucide-react';
import { deleteSchedule } from "@/lib/api/doctor";
import type { Schedule } from "@/lib/api/doctor";

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
      alert("Schedule deleted successfully!");
      onScheduleDeleted?.();
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      alert(error.response?.data?.message || "Failed to delete schedule");
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

        return (
          <Card key={schedule.id} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {scheduleDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {scheduleEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <Badge variant="outline" className="text-xs gap-1"><Grid3x3 className="w-3 h-3" /> {schedule.appointmentSlots.length} slots</Badge>
                  <Badge variant="secondary" className="text-xs">{booked} booked</Badge>
                  <Badge variant="outline" className="text-xs">{available} available</Badge>
                  {unbookable > 0 && (
                    <Badge variant="destructive" className="text-xs bg-destructive/10 text-destructive border-destructive/30">{unbookable} blocked</Badge>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDelete(schedule.id)}
                    className="h-7"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
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
                    <div key={slot.id} className={`p-3 rounded-md border text-xs flex flex-col gap-2 ${status === 'booked' ? 'bg-primary/10 border-primary/30' : status === 'unbookable' ? 'bg-muted/40 border-muted-foreground/20' : 'bg-secondary/20 border-secondary/30'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium block">{slotStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[10px] text-muted-foreground">{slotEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <StatusBadge status={status} />
                      </div>
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
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary text-primary-foreground font-medium">
        Booked
      </span>
    );
  }
  if (status === 'unbookable') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
        Blocked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
      Available
    </span>
  );
}
