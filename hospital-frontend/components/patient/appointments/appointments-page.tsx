"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentsList from "./appointments-list";

export default function PatientAppointmentsPage() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your appointments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
