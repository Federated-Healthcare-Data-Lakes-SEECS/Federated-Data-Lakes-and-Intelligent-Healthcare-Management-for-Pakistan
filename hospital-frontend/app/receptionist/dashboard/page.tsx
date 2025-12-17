"use client";

import { useState } from "react";
import ReceptionistDashboardPage from "@/components/receptionist/dashboard/dashboard-page";
import RegisterPatientPage from "@/components/receptionist/register-patient/register-patient-page";
import BookAppointmentPage from "@/components/receptionist/book-appointment/book-appointment-page";
import AppointmentsPage from "@/components/receptionist/appointments/appointments-page";
import ReceptionistNavigation from "@/components/receptionist/receptionist-navigation";

export default function ReceptionistDashboard() {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "register" | "book" | "appointments"
  >("dashboard");

  return (
    <div className="flex h-screen bg-linear-to-br from-emerald-50/50 via-white to-cyan-50/50">
      <ReceptionistNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <ReceptionistDashboardPage />}
        {currentPage === "register" && <RegisterPatientPage />}
        {currentPage === "book" && <BookAppointmentPage />}
        {currentPage === "appointments" && <AppointmentsPage />}
      </main>
    </div>
  );
}
