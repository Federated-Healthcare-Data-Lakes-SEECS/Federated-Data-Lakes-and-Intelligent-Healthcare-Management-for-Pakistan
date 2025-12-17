"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Grid3x3, 
  Trash2, 
  Ban, 
  CheckCircle,
  User,
  Phone,
  Mail,
  Droplet,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { deleteSchedule, toggleSlotBookability } from "@/lib/api/doctor";
import type { Schedule } from "@/lib/api/doctor";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ScheduleListProps { 
  schedules: Schedule[];
  onScheduleDeleted?: () => void;
  selectedDate?: string;
}

export default function ScheduleList({ schedules, onScheduleDeleted, selectedDate }: ScheduleListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingSlotId, setTogglingSlotId] = useState<number | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);

  const handleDelete = async (scheduleId: number) => {
    try {
      setDeletingId(scheduleId);
      await deleteSchedule(scheduleId);
      toast.success("Schedule deleted successfully!");
      onScheduleDeleted?.();
      setScheduleToDelete(null);
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete schedule";
      
      if (error.response?.status === 400 || errorMessage.toLowerCase().includes('booked')) {
        toast.error("This schedule cannot be deleted - some slots are already booked");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleBookability = async (slotId: number) => {
    try {
      setTogglingSlotId(slotId);
      const result = await toggleSlotBookability(slotId);
      toast.success(result.message || "Slot bookability updated");
      onScheduleDeleted?.();
    } catch (error: any) {
      console.error("Error toggling slot:", error);
      toast.error(error.response?.data?.message || "Failed to update slot");
    } finally {
      setTogglingSlotId(null);
    }
  };

  if (schedules.length === 0) {
    return (
      <Card className="border-2 border-dashed border-slate-200 shadow-none bg-slate-50/50 rounded-2xl">
        <CardContent className="py-20">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200/50">
              <Calendar className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-2xl text-slate-900 tracking-tight">
                {selectedDate === "all" ? "No Schedules Found" : "No Schedules for This Date"}
              </h3>
              <p className="text-base text-slate-600 max-w-md leading-relaxed">
                {selectedDate === "all" 
                  ? "Create your first schedule to start accepting appointments and manage your availability"
                  : "No schedules available for the selected date. Try selecting a different date or create a new schedule."}
              </p>
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
        const scheduleStart = new Date(schedule.from);
        const scheduleEnd = new Date(schedule.to);
        const hasBookedSlots = booked > 0;

        // Check if schedule spans multiple days
        const startDay = scheduleStart.toISOString().split('T')[0];
        const endDay = scheduleEnd.toISOString().split('T')[0];
        const isMultiDay = startDay !== endDay;

        return (
          <Card 
            key={schedule.id} 
            className="border border-slate-200 shadow-md bg-white hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
          >
            <CardHeader className="pb-5 bg-linear-to-r from-slate-50 to-white border-b border-slate-100 -mt-6 pt-6 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <CardTitle className="text-xl font-semibold flex items-center gap-3">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-md shadow-blue-200/50">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      {scheduleStart.toLocaleDateString('en-PK', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </CardTitle>
                  
                  <div className="flex flex-wrap items-center gap-3 text-base">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-slate-700">
                        {scheduleStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {scheduleEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {isMultiDay && (
                      <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 gap-1.5 px-3 py-1.5 text-sm">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Multi-day schedule
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 items-start flex-wrap justify-end">
                  <Badge className="bg-slate-100 text-slate-700 gap-1.5 px-3 py-1.5 font-medium border-0 text-sm">
                    <Grid3x3 className="w-3.5 h-3.5" /> {schedule.appointmentSlots.length} slots
                  </Badge>
                  {booked > 0 && (
                    <Badge className="bg-linear-to-br from-blue-600 to-blue-700 text-white gap-1.5 px-3 py-1.5 font-medium shadow-md shadow-blue-200/50 border-0 text-sm">
                      <CheckCircle className="w-3.5 h-3.5" /> {booked} booked
                    </Badge>
                  )}
                  {available > 0 && (
                    <Badge className="bg-green-100 text-green-700 gap-1.5 px-3 py-1.5 font-medium border-0 text-sm">
                      {available} available
                    </Badge>
                  )}
                  {unbookable > 0 && (
                    <Badge className="gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 font-medium border-0 text-sm">
                      <Ban className="w-3.5 h-3.5" /> {unbookable} blocked
                    </Badge>
                  )}
                  {!hasBookedSlots && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setScheduleToDelete(schedule.id)}
                      disabled={deletingId === schedule.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all rounded-xl"
                    >
                      {deletingId === schedule.id ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 pb-6 px-6 bg-slate-50/30">
              <div className="space-y-4">
                {schedule.appointmentSlots.length > 0 && (
                  <div className="mb-4 flex items-center gap-3 pb-3 border-b border-slate-200">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <span className="text-lg font-semibold text-slate-800 tracking-tight">Time Slots</span>
                    <span className="text-base text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                      {schedule.appointmentSlots.length} total
                    </span>
                  </div>
                )}
                <div className="max-h-[calc(2*170px)] overflow-y-auto pr-2 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {schedule.appointmentSlots.map((slot) => {
                    const status = slot.isBooked ? 'booked' : (!slot.isBookable ? 'unbookable' : 'available');
                    const slotStartTime = new Date(slot.startTime);
                    const slotEndTime = new Date(slot.endTime);
                    const appointment = slot.appointments?.[0];
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "relative group p-5 rounded-2xl border flex flex-col gap-4 shadow-sm transition-all duration-300",
                          status === 'booked'
                            ? "border-blue-200 bg-linear-to-br from-blue-50 to-blue-100/50 hover:shadow-lg hover:shadow-blue-200/50 hover:-translate-y-0.5"
                            : status === 'unbookable'
                            ? "border-slate-200 bg-linear-to-br from-slate-50 to-slate-100/50 hover:shadow-md hover:shadow-slate-200/50"
                            : "border-green-200 bg-linear-to-br from-white to-green-50/30 hover:shadow-lg hover:shadow-green-200/50 hover:-translate-y-0.5"
                        )}
                        style={{ minHeight: 140 }}
                      >
                        {/* Time Info */}
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-medium text-base shadow-md transition-transform group-hover:scale-110",
                            status === 'booked' ? "bg-linear-to-br from-blue-600 to-blue-700 text-white" :
                            status === 'unbookable' ? "bg-linear-to-br from-slate-400 to-slate-500 text-white" :
                            "bg-linear-to-br from-green-500 to-green-600 text-white"
                          )}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-base text-slate-900 tracking-tight">
                              {slotStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-sm text-slate-600 font-medium">
                              {slotEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        {/* Patient or Status */}
                        {appointment ? (
                          <div className="flex flex-col gap-2 min-w-0">
                            <div className="flex items-center gap-3 bg-white/60 rounded-xl p-2">
                              <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0 shadow-md">
                                <span className="text-sm font-semibold text-white">
                                  {appointment.patient.user.firstName[0]}{appointment.patient.user.lastName[0]}
                                </span>
                              </div>
                              <div className="truncate flex-1">
                                <div className="text-sm font-medium text-slate-900 truncate">
                                  {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                                </div>
                                <div className="text-sm text-slate-600 truncate">
                                  {appointment.reason || 'Consultation'}
                                </div>
                              </div>
                            </div>
                            {/* {appointment.walkinAppointment && (
                              <Badge variant="secondary" className="w-fit text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 border-purple-200">
                                🚶 Walk-in
                              </Badge>
                            )} */}
                          </div>
                        ) : (
                          <StatusBadge status={status} />
                        )}

                        {/* Actions */}
                        {!slot.isBooked && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={togglingSlotId === slot.id}
                            className={cn(
                              "h-9 w-9 p-0 shrink-0 transition-all duration-200 absolute top-3 right-3 rounded-xl shadow-sm hover:shadow-md",
                              slot.isBookable
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookability(slot.id);
                            }}
                            title={slot.isBookable ? "Block slot" : "Enable slot"}
                          >
                            {togglingSlotId === slot.id ? (
                              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            ) : slot.isBookable ? (
                              <Ban className="w-5 h-5" />
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      <AlertDialog open={scheduleToDelete !== null} onOpenChange={(open) => !open && setScheduleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule? This action cannot be undone and will remove all associated time slots.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => scheduleToDelete && handleDelete(scheduleToDelete)}
              disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingId ? "Deleting..." : "Delete Schedule"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'booked') {
    return (
      <Badge className="bg-linear-to-br from-blue-600 to-blue-700 text-white text-sm px-3 py-1.5 font-medium shadow-sm border-0">
        ✓ Booked
      </Badge>
    );
  }
  if (status === 'unbookable') {
    return (
      <Badge className="bg-slate-100 text-slate-700 text-sm px-3 py-1.5 font-medium border-0">
        ✕ Blocked
      </Badge>
    );
  }
  return (
    <Badge className="bg-linear-to-br from-green-500 to-green-600 text-white border-0 text-sm px-3 py-1.5 font-medium shadow-sm">
      ✓ Available
    </Badge>
  );
}

