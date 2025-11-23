"use client";

import { Home, UserPlus, Calendar, ClipboardList, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface ReceptionistNavigationProps {
  currentPage: "dashboard" | "register" | "book" | "appointments";
  setCurrentPage: (page: "dashboard" | "register" | "book" | "appointments") => void;
}

export default function ReceptionistNavigation({
  currentPage,
  setCurrentPage,
}: ReceptionistNavigationProps) {
  const router = useRouter();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "register",
      label: "Register Patient",
      icon: UserPlus,
    },
    {
      id: "book",
      label: "Book Appointment",
      icon: Calendar,
    },
    {
      id: "appointments",
      label: "My Appointments",
      icon: ClipboardList,
    },
  ];

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
      <div className="mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">HealthHub</h1>
          <p className="text-sm text-muted-foreground">Receptionist Portal</p>
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
                setCurrentPage(item.id as "dashboard" | "register" | "book" | "appointments")
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

      <Button onClick={handleLogout} className="w-full gap-2" variant="outline">
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </aside>
  );
}
