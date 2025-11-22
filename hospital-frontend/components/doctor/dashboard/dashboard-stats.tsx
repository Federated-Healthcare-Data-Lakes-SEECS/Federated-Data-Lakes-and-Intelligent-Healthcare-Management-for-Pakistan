"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

interface StatsProps {
  stats: {
    totalAppointments: number;
    completedCheckups: number;
    pendingAppointments: number;
    totalPatients: number;
  };
}

export default function DashboardStats({ stats }: StatsProps) {
  const statItems = [
    {
      label: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Completed Checkups",
      value: stats.completedCheckups,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Pending Appointments",
      value: stats.pendingAppointments,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {item.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
