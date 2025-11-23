"use client";

import { useState, useEffect } from "react";
import { getSchedules } from "@/lib/api/doctor";
import type { Schedule } from "@/lib/api/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import ScheduleList from "./schedule-list";
import CreateScheduleDialog from "./create-schedule-dialog";

export default function SchedulesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // Refresh schedules after creating a new one
    fetchSchedulesData();
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading schedules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Schedules</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage consultation availability</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> New Schedule
        </Button>
      </div>

      <ScheduleList schedules={schedules} onScheduleDeleted={fetchSchedulesData} />
      <CreateScheduleDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onScheduleCreated={handleScheduleCreated}
      />
    </div>
  );
}
