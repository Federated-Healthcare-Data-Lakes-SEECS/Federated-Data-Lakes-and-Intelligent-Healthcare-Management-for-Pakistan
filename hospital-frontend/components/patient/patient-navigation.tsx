"use client";

import { Calendar, FileText, Home, LogOut, CalendarPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PatientNavigationProps {
  currentPage: "dashboard" | "appointments" | "history" | "book";
  setCurrentPage: (page: "dashboard" | "appointments" | "history" | "book") => void;
}

export default function PatientNavigation({
  currentPage,
  setCurrentPage,
}: PatientNavigationProps) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "book",
      label: "Book Appointment",
      icon: CalendarPlus,
    },
    {
      id: "appointments",
      label: "My Appointments",
      icon: Calendar,
    },
    {
      id: "history",
      label: "Medical History",
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
      <div className="mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">HealthHub</h1>
          <p className="text-sm text-muted-foreground">Patient Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <Button
              key={item.id}
              onClick={() =>
                setCurrentPage(item.id as "dashboard" | "appointments" | "history" | "book")
              }
              className={cn(
                "w-full justify-start gap-3 h-10",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              )}
              variant="ghost"
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Button className="w-full gap-2" variant="outline">
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </aside>
  );
}
