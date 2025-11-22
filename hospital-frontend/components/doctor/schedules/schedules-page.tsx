"use client";

import { useState } from "react";
import { fetchSchedulesLite } from "@/lib/mock-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import ScheduleList from "./schedule-list";
import CreateScheduleDialog from "./create-schedule-dialog";

export default function SchedulesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const schedules = fetchSchedulesLite();

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

      <ScheduleList schedules={schedules} />
      <CreateScheduleDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
