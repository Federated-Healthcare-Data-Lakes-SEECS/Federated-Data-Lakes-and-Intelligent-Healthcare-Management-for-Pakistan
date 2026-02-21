"use client";

import { useState } from "react";
import LabTechnicianDashboardPage from "@/components/lab-technician/dashboard/dashboard-page";
import AssignedTestsPage from "@/components/lab-technician/assigned-tests-page";
import LabTechnicianNavigation from "@/components/lab-technician/lab-technician-navigation";

export default function LabTechnicianDashboard() {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "assigned" | "completed"
  >("dashboard");

  return (
    <div className="flex h-screen bg-linear-to-br from-cyan-50/50 via-white to-blue-50/50">
      <LabTechnicianNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <LabTechnicianDashboardPage />}
        {currentPage === "assigned" && <AssignedTestsPage />}
      </main>
    </div>
  );
}
