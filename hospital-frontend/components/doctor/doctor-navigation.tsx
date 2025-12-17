"use client";

import { Calendar, Clock, FileText, Home, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DoctorNavigationProps {
  currentPage: "dashboard" | "schedules" | "appointments" | "history";
  setCurrentPage: (page: "dashboard" | "schedules" | "appointments" | "history") => void;
}

export default function DoctorNavigation({
  currentPage,
  setCurrentPage,
}: DoctorNavigationProps) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "schedules",
      label: "Schedules",
      icon: Calendar,
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Clock,
    },
    {
      id: "history",
      label: "History",
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
      <div className="mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Medicare</h1>
          <p className="text-sm text-muted-foreground">Doctor Portal</p>
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
                setCurrentPage(item.id as "dashboard" | "schedules" | "appointments" | "history")
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
