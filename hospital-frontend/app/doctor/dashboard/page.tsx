"use client";

import { useState } from "react";
import DashboardPage from "@/components/doctor/dashboard/dashboard-page";
import SchedulesPage from "@/components/doctor/schedules/schedules-page";
import AppointmentsPage from "@/components/doctor/appointments/appointments-page";
import HistoryPage from "@/components/doctor/history/history-page";
import DoctorNavigation from "@/components/doctor/doctor-navigation";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "schedules" | "appointments" | "history"
  >("dashboard");

  return (
    <div className="flex h-screen bg-background">
      <DoctorNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "schedules" && <SchedulesPage />}
        {currentPage === "appointments" && <AppointmentsPage />}
        {currentPage === "history" && <HistoryPage />}
      </main>
    </div>
  );
}
