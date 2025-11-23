"use client";

import { useState, useEffect } from "react";
import { getBookedAppointments, getDrugs, getLabTests } from "@/lib/api/doctor";
import type { UpcomingAppointment, Drug, LabTest } from "@/lib/api/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppointmentsList from "./appointments-list";
import CheckupForm from "./checkup-form";
import { ArrowLeft, FileText } from "lucide-react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<UpcomingAppointment | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "checkup">("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch appointments, drugs, and lab tests in parallel
        const [appointmentsData, drugsData, labTestsData] = await Promise.all([
          getBookedAppointments(),
          getDrugs(),
          getLabTests(),
        ]);

        setAppointments(appointmentsData);
        setDrugs(drugsData.filter(d => d.isActive)); // Only show active drugs
        setLabTests(labTestsData.filter(lt => lt.isActive)); // Only show active lab tests
      } catch (err: any) {
        console.error("Error fetching appointments data:", err);
        setError(err.response?.data?.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleCancelAppointment = (id: number) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" } : a));
    if (selectedAppointment?.id === id) {
      setSelectedAppointment(prev => prev ? { ...prev, status: "cancelled" } : prev);
    }
  };

  const handleSelectAppointment = (apt: UpcomingAppointment) => {
    setSelectedAppointment(apt);
    setViewMode("checkup");
  };

  const handleBackToList = () => {
    setViewMode("list");
    // keep selected for quick return if needed
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading appointments...</p>
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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Appointments & Checkups</h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage booked appointments and perform patient checkups</p>
      </div>

      {viewMode === "list" && (
        <Card className="border-0 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg md:text-xl">Booked Appointments</CardTitle>
            {selectedAppointment && (
              <Button size="sm" variant="outline" onClick={() => setViewMode("checkup")} className="gap-2">
                <FileText className="w-4 h-4" /> Resume Checkup
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <AppointmentsList
              appointments={appointments}
              selectedAppointment={selectedAppointment}
              onSelectAppointment={handleSelectAppointment}
              onCancelAppointment={handleCancelAppointment}
            />
          </CardContent>
        </Card>
      )}

      {viewMode === "checkup" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBackToList} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Appointments
            </Button>
            {selectedAppointment && selectedAppointment.status === "cancelled" && (
              <BadgeCancelled />
            )}
          </div>
          {selectedAppointment ? (
            selectedAppointment.status === "cancelled" ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-8">
                  <div className="text-center space-y-3">
                    <h2 className="text-xl font-semibold">Appointment Cancelled</h2>
                    <p className="text-muted-foreground text-sm">This appointment has been cancelled. Return to the list to select another.</p>
                    <Button onClick={handleBackToList} size="sm" className="mt-2">Go to List</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CheckupForm appointment={selectedAppointment} drugs={drugs} labTests={labTests} />
            )
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-12">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No Appointment Selected</h3>
                  <p className="text-muted-foreground text-sm">Select an appointment from the list to perform a checkup.</p>
                  <Button onClick={handleBackToList} size="sm" variant="outline" className="mt-4">Go to Appointment List</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Helper badge component for cancelled status
function BadgeCancelled() {
  return (
    <span className="inline-flex items-center rounded-md bg-destructive/10 text-destructive px-2 py-1 text-xs font-medium border border-destructive/20">
      Cancelled
    </span>
  );
}
