"use client";

import { useState } from "react";
import PatientDashboardPage from "@/components/patient/dashboard/dashboard-page";
import PatientAppointmentsPage from "@/components/patient/appointments/appointments-page";
import PatientHistoryPage from "@/components/patient/history/history-page";
import BookAppointmentPage from "@/components/patient/booking/book-appointment-page";
import PatientLabTestsPage from "@/components/patient/lab-tests/lab-tests-page";
import EnhancedPatientSidebar from "@/components/patient/enhanced-patient-sidebar";

export default function PatientDashboard() {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "appointments" | "history" | "book" | "lab-tests"
  >("dashboard");

  return (
    <div className="flex h-screen bg-linear-to-br from-emerald-50/50 via-white to-teal-50/50">
      <EnhancedPatientSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <PatientDashboardPage />}
        {currentPage === "appointments" && <PatientAppointmentsPage />}
        {currentPage === "history" && <PatientHistoryPage />}
        {currentPage === "book" && <BookAppointmentPage />}
        {currentPage === "lab-tests" && <PatientLabTestsPage />}
      </main>
    </div>
  );
}
