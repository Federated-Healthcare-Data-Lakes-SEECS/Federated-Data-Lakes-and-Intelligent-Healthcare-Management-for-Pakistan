"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import AppointmentsList from "./appointments-list";

export default function PatientAppointmentsPage() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">My Appointments</h1>
          <p className="text-muted-foreground text-base md:text-lg mt-1">View and manage your appointments</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', weekday: 'short' })}</p>
        </div>
      </header>

      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Appointment History
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100/80">
              <TabsTrigger value="all" className="text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                All
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Completed
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Cancelled
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <AppointmentsList filter="all" />
            </TabsContent>
            <TabsContent value="upcoming" className="mt-6">
              <AppointmentsList filter="upcoming" />
            </TabsContent>
            <TabsContent value="completed" className="mt-6">
              <AppointmentsList filter="completed" />
            </TabsContent>
            <TabsContent value="cancelled" className="mt-6">
              <AppointmentsList filter="cancelled" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
