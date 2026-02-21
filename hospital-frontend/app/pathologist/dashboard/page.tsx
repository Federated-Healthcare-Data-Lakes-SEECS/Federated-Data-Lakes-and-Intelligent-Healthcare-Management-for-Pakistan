"use client";

import { useState } from "react";
import PathologistNavigation from "@/components/pathologist/pathologist-navigation";
import PathologistDashboardPage from "@/components/pathologist/dashboard/dashboard-page";
import PendingReviewPage from "@/components/pathologist/pending-review-page";
import ReviewHistoryPage from "@/components/pathologist/review-history-page";

type PageType = "dashboard" | "review" | "history";

export default function PathologistDashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <PathologistDashboardPage />;
      case "review":
        return <PendingReviewPage />;
      case "history":
        return <ReviewHistoryPage />;
      default:
        return <PathologistDashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <PathologistNavigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <main className="flex-1 overflow-y-auto">{renderPage()}</main>
    </div>
  );
}
