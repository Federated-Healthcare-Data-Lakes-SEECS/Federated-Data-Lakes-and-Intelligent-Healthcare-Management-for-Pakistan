"use client";

import { useState, useEffect, useMemo } from "react";
import { getSchedules } from "@/lib/api/doctor";
import type { Schedule } from "@/lib/api/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import ScheduleList from "./schedule-list";
import CreateScheduleDialog from "./create-schedule-dialog";
import { cn } from "@/lib/utils";

export default function SchedulesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today

  const fetchSchedulesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSchedules();
      setSchedules(data);
    } catch (err: any) {
      console.error("Error fetching schedules:", err);
      setError(err.response?.data?.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulesData();
  }, []);

  const handleScheduleCreated = () => {
    fetchSchedulesData();
  };

  // Generate date options (1 past day + today + 6 future days = 8 total)
  const dateOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add "All" option
    options.push({
      value: "all",
      label: "All",
      date: null,
      isToday: false,
    });

    // Add yesterday (-1), today (0), and next 6 days (1-6)
    for (let i = -1; i <= 6; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const isToday = i === 0;
      
      options.push({
        value: date.toISOString().split('T')[0],
        label: isToday ? "Today" : date.toLocaleDateString('en-PK', { weekday: 'short' }),
        fullLabel: date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
        date: date,
        isToday,
      });
    }

    return options;
  }, []);

  // Filter schedules by selected date
  const filteredSchedules = useMemo(() => {
    if (selectedDate === "all") return schedules;

    const selected = new Date(selectedDate);
    selected.setDate(selected.getDate() + 1);
    selected.setHours(0, 0, 0, 0);
    const nextDay = new Date(selected);
    nextDay.setDate(selected.getDate() + 1);

    return schedules.filter(schedule => {
      const scheduleStart = new Date(schedule.from);
      const scheduleEnd = new Date(schedule.to);
      
      // Show schedule if it overlaps with the selected date
      return (
        (scheduleStart >= selected && scheduleStart < nextDay) ||
        (scheduleEnd > selected && scheduleEnd <= nextDay) ||
        (scheduleStart < selected && scheduleEnd > nextDay)
      );
    });
  }, [schedules, selectedDate]);

  console.log("Filtered Schedules:", filteredSchedules);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center space-y-3">
            <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading schedules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-100">
          <Card className="border shadow-sm border-destructive/50 bg-white">
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Schedules</h1>
            <p className="text-muted-foreground text-base md:text-lg">Manage your consultation availability</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            size="lg" 
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="w-5 h-5" /> New Schedule
          </Button>
        </div>

        {/* Date Selector */}
        <Card className="border shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              Filter by Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-rows-1 grid-cols-9  gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {dateOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => setSelectedDate(option.value)}
                  variant={selectedDate === option.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "shrink-0 min-w-20 flex flex-col items-center gap-1 h-auto py-3 transition-all",
                    selectedDate === option.value
                      ? "bg-blue-600 text-white hover:bg-blue-700 border-0"
                      : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50",
                    option.isToday && selectedDate !== option.value && "border-blue-300 bg-blue-50/30"
                  )}
                >
                  <span className="text-sm font-bold">{option.label}</span>
                  {option.fullLabel && (
                    <span className={cn(
                      "text-xs",
                      selectedDate === option.value ? "text-white/90" : "text-muted-foreground"
                    )}>
                      {option.fullLabel}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule List */}
        <ScheduleList 
          schedules={filteredSchedules} 
          onScheduleDeleted={fetchSchedulesData}
          selectedDate={selectedDate}
        />

        {/* Create Dialog */}
        <CreateScheduleDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          onScheduleCreated={handleScheduleCreated}
        />
    </div>
  );
}
