"use client";

import { useState } from "react";
import EnhancedDashboardPage from "@/components/doctor/dashboard/enhanced-dashboard-page";
import SchedulesPage from "@/components/doctor/schedules/schedules-page";
import AppointmentsPageNew from "@/components/doctor/appointments/appointments-page-new";
import HistoryPage from "@/components/doctor/history/history-page-new";
import EnhancedDoctorSidebar from "@/components/doctor/enhanced-doctor-sidebar";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "schedules" | "appointments" | "history"
  >("dashboard");

  return (
    <div className="flex h-screen bg-linear-to-br from-blue-50/50 via-white to-cyan-50/50">
      <EnhancedDoctorSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <EnhancedDashboardPage />}
        {currentPage === "schedules" && <SchedulesPage />}
        {currentPage === "appointments" && <AppointmentsPageNew />}
        {currentPage === "history" && <HistoryPage />}
      </main>
    </div>
  );
}
