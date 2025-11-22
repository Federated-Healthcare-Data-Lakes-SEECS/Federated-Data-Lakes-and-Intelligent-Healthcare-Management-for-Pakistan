"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Grid3x3, EyeOff, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { getScheduleWithSlots, toggleSlotBookable, cancelAppointment } from "@/lib/utils-doctor";
import { useState } from 'react';

interface ScheduleListProps { schedules: any[]; }

export default function ScheduleList({ schedules }: ScheduleListProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const rerender = () => setRefreshKey(k => k + 1);

  return (
    <div className="space-y-6" key={refreshKey}>
      {schedules.map((schedule) => {
        const full = getScheduleWithSlots(schedule.id);
        if (!full) return null;
        const booked = full.slots.filter((s: any) => s.isBooked).length;
        const unbookable = full.slots.filter((s: any) => !s.isBookable && !s.isBooked).length;
        const available = full.slots.length - booked - unbookable;

        return (
          <Card key={schedule.id} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {schedule.from.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {schedule.from.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {schedule.to.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs gap-1"><Grid3x3 className="w-3 h-3" /> {full.slots.length} slots</Badge>
                  <Badge variant="secondary" className="text-xs">{booked} booked</Badge>
                  <Badge variant="outline" className="text-xs">{available} available</Badge>
                  <Badge variant="destructive" className="text-xs bg-destructive/10 text-destructive border-destructive/30">{unbookable} blocked</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                {full.slots.map((slot: any) => {
                  const status = slot.isBooked ? 'booked' : (!slot.isBookable ? 'unbookable' : 'available');
                  return (
                    <div key={slot.id} className={`p-3 rounded-md border text-xs flex flex-col gap-2 ${status === 'booked' ? 'bg-primary/10 border-primary/30' : status === 'unbookable' ? 'bg-muted/40 border-muted-foreground/20' : 'bg-secondary/20 border-secondary/30'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{slot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <StatusBadge status={status} />
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {status === 'booked' && (
                          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { cancelAppointment(slot.id); rerender(); }}>
                            <XCircle className="w-3 h-3" /> Cancel
                          </Button>
                        )}
                        {status !== 'booked' && (
                          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { toggleSlotBookable(slot.id); rerender(); }}>
                            {slot.isBookable ? <EyeOff className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />} {slot.isBookable ? 'Block' : 'Unblock'}
                          </Button>
                        )}
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
