"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TestTube, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ClipboardList,
  Beaker,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getAssignedLabTests, type PatientLabTest, getStatusColor, getStatusDisplayText } from "@/lib/api-labtest";
import { toast } from "sonner";

interface DashboardStats {
  totalAssigned: number;
  pendingSampleCollection: number;
  pendingTestExecution: number;
  pendingResultSubmission: number;
}

export default function LabTechnicianDashboardPage() {
  const { user } = useAuth();
  const [labTests, setLabTests] = useState<PatientLabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssigned: 0,
    pendingSampleCollection: 0,
    pendingTestExecution: 0,
    pendingResultSubmission: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const tests = await getAssignedLabTests();
        setLabTests(tests);
        
        // Calculate stats
        const totalAssigned = tests.length;
        const pendingSampleCollection = tests.filter(t => t.status === "ORDERED").length;
        const pendingTestExecution = tests.filter(t => t.status === "SAMPLE_COLLECTED").length;
        const pendingResultSubmission = tests.filter(t => t.status === "PERFORMED" || t.status === "REJECTED").length;
        
        setStats({
          totalAssigned,
          pendingSampleCollection,
          pendingTestExecution,
          pendingResultSubmission,
        });
      } catch (err: any) {
        console.error("Failed to load dashboard data:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mt-1">
            Here's your lab work overview
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-lg font-semibold">
            {new Date().toLocaleDateString("en-PK", {
              month: "short",
              day: "numeric",
              weekday: "short",
            })}
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardList}
          label="Total Assigned"
          value={stats.totalAssigned}
          color="cyan"
        />
        <StatCard
          icon={TestTube}
          label="Pending Sample"
          value={stats.pendingSampleCollection}
          color="blue"
        />
        <StatCard
          icon={Beaker}
          label="Pending Test"
          value={stats.pendingTestExecution}
          color="purple"
        />
        <StatCard
          icon={Activity}
          label="Pending Results"
          value={stats.pendingResultSubmission}
          color="orange"
        />
      </div>

      {/* Recent Lab Tests */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold tracking-wide flex items-center gap-2">
              <TestTube className="w-5 h-5 text-cyan-600" />
              Recent Assigned Tests
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-cyan-50 text-cyan-700 border border-cyan-200"
            >
              {labTests.slice(0, 5).length} Showing
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {labTests.length === 0 ? (
            <div className="text-center py-8">
              <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">No lab tests assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {labTests.slice(0, 5).map((test) => (
                <div
                  key={test.id}
                  className="p-4 border rounded-lg bg-slate-50 hover:bg-cyan-50/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{test.labTest.name}</p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(test.status)}`}
                        >
                          {getStatusDisplayText(test.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Patient: {test.patient.firstName} {test.patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Department: {test.labTest.departmentName}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      ID: {test.id}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "cyan" | "blue" | "purple" | "orange";
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    cyan: "bg-cyan-100 text-cyan-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <Card className="border shadow-sm bg-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
