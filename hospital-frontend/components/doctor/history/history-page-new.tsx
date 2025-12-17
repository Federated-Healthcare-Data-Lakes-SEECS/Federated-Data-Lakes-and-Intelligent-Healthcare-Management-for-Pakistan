"use client";

import { useState, useEffect, useMemo } from "react";
import { getCheckupHistory } from "@/lib/api/doctor";
import type { RecentCheckup } from "@/lib/api/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckupDetailsView } from "../shared/checkup-details";
import {
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  ChevronRight,
  FileText,
  Mic,
  Loader2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Activity,
  CalendarDays,
  Users,
  TrendingUp,
} from "lucide-react";

type SortField = "date" | "patient" | "diagnosis";
type SortOrder = "asc" | "desc";
type TimeFilter = "all" | "today" | "week" | "month" | "year";

export default function HistoryPage() {
  const [checkups, setCheckups] = useState<RecentCheckup[]>([]);
  const [selectedCheckup, setSelectedCheckup] = useState<RecentCheckup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    async function fetchCheckups() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCheckupHistory();
        setCheckups(data);
      } catch (err: any) {
        console.error("Error fetching checkup history:", err);
        setError(err.response?.data?.message || "Failed to load checkup history");
      } finally {
        setLoading(false);
      }
    }

    fetchCheckups();
  }, []);

  // Filtered and sorted checkups
  const filteredCheckups = useMemo(() => {
    let result = [...checkups];

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (timeFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      result = result.filter(
        (checkup) => new Date(checkup.appointment.slot.startTime) >= filterDate
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (checkup) =>
          checkup.appointment.patient.firstName.toLowerCase().includes(query) ||
          checkup.appointment.patient.lastName.toLowerCase().includes(query) ||
          checkup.diagnosis.toLowerCase().includes(query) ||
          checkup.symptoms?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          comparison =
            new Date(a.appointment.slot.startTime).getTime() -
            new Date(b.appointment.slot.startTime).getTime();
          break;
        case "patient":
          comparison = `${a.appointment.patient.firstName} ${a.appointment.patient.lastName}`.localeCompare(
            `${b.appointment.patient.firstName} ${b.appointment.patient.lastName}`
          );
          break;
        case "diagnosis":
          comparison = a.diagnosis.localeCompare(b.diagnosis);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [checkups, searchQuery, timeFilter, sortField, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    return {
      total: checkups.length,
      today: checkups.filter(
        (c) => new Date(c.appointment.slot.startTime) >= today
      ).length,
      thisWeek: checkups.filter(
        (c) => new Date(c.appointment.slot.startTime) >= weekAgo
      ).length,
      thisMonth: checkups.filter(
        (c) => new Date(c.appointment.slot.startTime) >= monthAgo
      ).length,
      withAudio: checkups.filter((c) => c.hasAudio).length,
    };
  }, [checkups]);

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading checkup history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCheckup) {
    return (
      <div className="p-6 md:p-8">
        <CheckupDetailsView
          checkup={selectedCheckup}
          patientInfo={{
            firstName: selectedCheckup.appointment.patient.firstName,
            lastName: selectedCheckup.appointment.patient.lastName,
            dateOfBirth: selectedCheckup.appointment.patient.dateOfBirth,
            gender: selectedCheckup.appointment.patient.gender,
            bloodGroup: selectedCheckup.appointment.patient.bloodGroup,
            medicalHistory: selectedCheckup.appointment.patient.medicalHistory,
            familyHistory: selectedCheckup.appointment.patient.familyHistory,
            allergies: selectedCheckup.appointment.patient.allergies,
          }}
          onBack={() => setSelectedCheckup(null)}
          showGlassmorphic={true}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Medical History
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          View and search through past checkups and patient records
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Total Checkups"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={<CalendarDays className="w-5 h-5" />}
          label="This Week"
          value={stats.thisWeek}
          color="green"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="This Month"
          value={stats.thisMonth}
          color="purple"
        />
        <StatCard
          icon={<Mic className="w-5 h-5" />}
          label="With Audio"
          value={stats.withAudio}
          color="orange"
        />
      </div>

      {/* Filters and Search */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-base">Filter & Search</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, diagnosis, or symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-slate-200"
              />
            </div>

            {/* Time Filter */}
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
              <SelectTrigger className="w-full md:w-40 border-slate-200">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
              <SelectTrigger className="w-full md:w-35 border-slate-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="diagnosis">Diagnosis</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSortOrder}
              className="border-slate-200"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {searchQuery || timeFilter !== "all" ? (
        <div className="flex items-center gap-2 text-base text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>
            Showing {filteredCheckups.length} of {checkups.length} checkups
          </span>
        </div>
      ) : null}

      {/* Checkups List */}
      <div className="grid gap-4">
        {filteredCheckups.length === 0 ? (
          <Card className="border shadow-sm bg-white">
            <CardContent className="py-12">
              <div className="text-center space-y-3">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <p className="text-base text-muted-foreground">
                  {searchQuery || timeFilter !== "all"
                    ? "No checkups match your filters"
                    : "No checkup history available"}
                </p>
                {(searchQuery || timeFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setTimeFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCheckups.map((checkup) => (
            <CheckupCard
              key={checkup.id}
              checkup={checkup}
              onClick={() => setSelectedCheckup(checkup)}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-600 text-white",
    green: "bg-green-600 text-white",
    purple: "bg-purple-600 text-white",
    orange: "bg-orange-600 text-white",
  };

  return (
    <Card className="border shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
            <p className="text-xl font-semibold mt-1">{value}</p>
          </div>
          <div className={`w-9 h-9 rounded-lg ${colorClasses[color]} flex items-center justify-center shadow-sm`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Checkup Card Component
function CheckupCard({
  checkup,
  onClick,
  formatDate,
  formatTime,
}: {
  checkup: RecentCheckup;
  onClick: () => void;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
}) {
  return (
    <Card
      className="border shadow-sm bg-white hover:shadow-md transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-white">
                {`${checkup.appointment.patient.firstName[0]}${checkup.appointment.patient.lastName[0]}`.toUpperCase()}
              </span>
            </div>

            <div className="flex-1 space-y-3">
              {/* Patient Name and Time */}
              <div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-blue-600 transition-colors">
                  {checkup.appointment.patient.firstName}{" "}
                  {checkup.appointment.patient.lastName}
                </h3>
                <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(checkup.appointment.slot.startTime)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(checkup.appointment.slot.startTime)}
                  </span>
                </div>
              </div>

              {/* Diagnosis Preview */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Diagnosis
                </p>
                <p className="text-sm text-foreground line-clamp-2">
                  {checkup.diagnosis}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {checkup.medications && checkup.medications.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-sm gap-1 bg-green-100 text-green-700 border-green-200"
                  >
                    <Pill className="w-3 h-3" />
                    {checkup.medications.length} Medication
                    {checkup.medications.length > 1 ? "s" : ""}
                  </Badge>
                )}
                {checkup.recommendedLabTests && checkup.recommendedLabTests.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-sm gap-1 bg-purple-100 text-purple-700 border-purple-200"
                  >
                    <FlaskConical className="w-3 h-3" />
                    {checkup.recommendedLabTests.length} Test
                    {checkup.recommendedLabTests.length > 1 ? "s" : ""}
                  </Badge>
                )}
                {/* Audio Status Badge */}
                {checkup.hasAudio && checkup.audioInfo && (
                  <Badge
                    variant={
                      checkup.audioInfo.status === "COMPLETED"
                        ? "default"
                        : checkup.audioInfo.status === "FAILED"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-sm gap-1"
                  >
                    {checkup.audioInfo.status === "PENDING" && (
                      <Clock className="w-3 h-3" />
                    )}
                    {checkup.audioInfo.status === "PROCESSING" && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    {checkup.audioInfo.status === "COMPLETED" && (
                      <Mic className="w-3 h-3" />
                    )}
                    {checkup.audioInfo.status === "FAILED" && (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    Audio {checkup.audioInfo.status.toLowerCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
