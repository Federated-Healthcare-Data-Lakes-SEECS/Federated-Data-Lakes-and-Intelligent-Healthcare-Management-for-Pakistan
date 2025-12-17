"use client";

import { Home, Calendar, Clock, FileText, LogOut, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken } from '@/lib/auth';
import { clear } from 'console';

interface EnhancedDoctorSidebarProps {
  currentPage: "dashboard" | "schedules" | "appointments" | "history";
  setCurrentPage: (page: "dashboard" | "schedules" | "appointments" | "history") => void;
}

export default function EnhancedDoctorSidebar({
  currentPage,
  setCurrentPage,
}: EnhancedDoctorSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

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
      label: "Checkup History",
      icon: FileText,
    },
  ];

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <aside 
      className={cn(
        "relative border-r border-slate-200 bg-white p-6 flex flex-col transition-all duration-300 shadow-sm",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn("mb-8 transition-all duration-300", isCollapsed && "mb-6")}>
        {!isCollapsed ? (
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Medicare
            </h1>
            <p className="text-sm text-blue-600 font-medium">Doctor Portal</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        variant="ghost"
        size="icon"
        className={cn(
          "absolute -right-3 top-24 h-6 w-6 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-blue-50 transition-all z-10",
          isCollapsed && "rotate-180"
        )}
      >
        <ChevronLeft className="h-3 w-3 text-blue-600" />
      </Button>

      {/* Navigation */}
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
                "w-full transition-all duration-200",
                isCollapsed ? "justify-center px-2" : "justify-start gap-3",
                isActive
                  ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
              variant="ghost"
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-5 h-5")} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <Button 
        onClick={handleLogout}
        className={cn(
          "w-full gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
          isCollapsed && "justify-center px-2"
        )} 
        variant="outline"
        title={isCollapsed ? "Logout" : undefined}
      >
        <LogOut className="w-4 h-4" />
        {!isCollapsed && "Logout"}
      </Button>
    </aside>
  );
}
