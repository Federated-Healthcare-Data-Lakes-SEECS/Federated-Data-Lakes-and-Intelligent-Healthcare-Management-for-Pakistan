"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ClipboardList,
  History,
  TestTube
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getLabTestsForReview, getReviewedLabTests, type PatientLabTest, getStatusColor, getStatusDisplayText } from "@/lib/api-labtest";
import { toast } from "sonner";

interface DashboardStats {
  pendingReview: number;
  approved: number;
  rejected: number;
}

export default function PathologistDashboardPage() {
  const { user } = useAuth();
  const [pendingTests, setPendingTests] = useState<PatientLabTest[]>([]);
  const [reviewedTests, setReviewedTests] = useState<PatientLabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    pendingReview: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pending, reviewed] = await Promise.all([
          getLabTestsForReview(),
          getReviewedLabTests(),
        ]);
        setPendingTests(pending);
        setReviewedTests(reviewed);
        
        // Calculate stats
        const approved = reviewed.filter(t => t.status === "APPROVED").length;
        const rejected = reviewed.filter(t => t.status === "REJECTED").length;
        
        setStats({
          pendingReview: pending.length,
          approved,
          rejected,
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
        <div className="flex items-center justify-center min-h-100">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
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
            Here's your review overview
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={ClipboardList}
          label="Pending Review"
          value={stats.pendingReview}
          color="purple"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={stats.approved}
          color="green"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          color="red"
        />
      </div>

      {/* Pending Lab Tests */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold tracking-wide flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
              Pending Review
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-purple-50 text-purple-700 border border-purple-200"
            >
              {pendingTests.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingTests.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">No tests pending review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTests.slice(0, 5).map((test) => (
                <div
                  key={test.id}
                  className="p-4 border rounded-lg bg-slate-50 hover:bg-purple-50/50 transition-all"
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
                        Lab Technician: {test.labTechnician?.firstName} {test.labTechnician?.lastName}
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

      {/* Recent Reviews */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold tracking-wide flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Recent Reviews
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-700 border border-slate-200"
            >
              {reviewedTests.slice(0, 5).length} Showing
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {reviewedTests.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">No review history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewedTests.slice(0, 5).map((test) => (
                <div
                  key={test.id}
                  className="p-4 border rounded-lg bg-slate-50 hover:bg-purple-50/50 transition-all"
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
  color: "purple" | "green" | "red";
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
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
