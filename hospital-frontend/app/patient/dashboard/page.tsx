"use client";

import { useState } from "react";
import PatientDashboardPage from "@/components/patient/dashboard/dashboard-page";
import PatientAppointmentsPage from "@/components/patient/appointments/appointments-page";
import PatientHistoryPage from "@/components/patient/history/history-page";
import BookAppointmentPage from "@/components/patient/booking/book-appointment-page";
import PatientNavigation from "@/components/patient/patient-navigation";

export default function PatientDashboard() {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "appointments" | "history" | "book"
  >("dashboard");

  return (
    <div className="flex h-screen bg-background">
      <PatientNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <PatientDashboardPage />}
        {currentPage === "appointments" && <PatientAppointmentsPage />}
        {currentPage === "history" && <PatientHistoryPage />}
        {currentPage === "book" && <BookAppointmentPage />}
      </main>
    </div>
  );
}
