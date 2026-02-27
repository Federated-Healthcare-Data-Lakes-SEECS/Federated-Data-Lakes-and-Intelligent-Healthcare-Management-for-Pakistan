"use client";

import { useState, useEffect, useMemo } from "react";
import { getBookedAppointments, getAllAppointments, getDrugs, getLabTests, cancelAppointment, getCheckupByAppointmentId } from "@/lib/api/doctor";
import type { UpcomingAppointment, Drug, LabTest, CheckupData } from "@/lib/api/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CheckupForm from "./checkup-form";
import RescheduleDialog from "./reschedule-dialog";
import MarkBusyDialog from "./mark-busy-dialog";
import { CheckupDetailsView } from "../shared/checkup-details";
import { 
  ArrowLeft, 
  FileText, 
  Calendar,
  Clock,
  Globe,
  Building2,
  Droplet,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  CalendarX,
  CalendarClock,
  Loader2,
  Eye,
  Ban,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { hasActualAllergies } from "@/lib/utils";

type FilterType = 'all' | 'today' | 'nextWeek' | 'lastWeek' | 'lastMonth' | 'lastYear';
type TabType = 'upcoming' | 'completed' | 'cancelled' | 'noshow';

export default function AppointmentsPageNew() {
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<UpcomingAppointment | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "checkup" | "viewCheckup">("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [checkupData, setCheckupData] = useState<CheckupData | null>(null);
  const [loadingCheckup, setLoadingCheckup] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<UpcomingAppointment | null>(null);
  const [markBusyDialogOpen, setMarkBusyDialogOpen] = useState(false);

  // Fetch appointments based on filter
  const fetchAppointments = async (filterType: FilterType) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use getAllAppointments for 'all', otherwise use filtered endpoint
      const appointmentsPromise = filterType === 'all'
        ? getAllAppointments()
        : getBookedAppointments(filterType);
      
      const [appointmentsData, drugsData, labTestsData] = await Promise.all([
        appointmentsPromise,
        getDrugs(),
        getLabTests(),
      ]);

      setAppointments(appointmentsData);
      setDrugs(drugsData.filter(d => d.isActive));
      setLabTests(labTestsData.filter(lt => lt.isActive));
    } catch (err: any) {
      console.error("Error fetching appointments data:", err);
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(filter);
  }, [filter]);

  // Categorize appointments
  const categorizedAppointments = useMemo(() => {
    const now = new Date();
    
    return {
      upcoming: appointments.filter(apt => {
        const aptTime = new Date(apt.startTime);
        return apt.status === 'booked' && aptTime > now;
      }),
      completed: appointments.filter(apt => apt.status === 'completed'),
      cancelled: appointments.filter(apt => 
        apt.status === 'cancelled' || apt.status === 'not_attended'
      ),
      noshow: appointments.filter(apt => {
        const aptTime = new Date(apt.startTime);
        return apt.status === 'booked' && aptTime < now;
      }),
    };
  }, [appointments]);

  const handleCancelAppointment = async (id: number) => {
    try {
      await cancelAppointment(id);
      toast.success("Appointment cancelled successfully");
      
      // Refresh appointments
      await fetchAppointments(filter);
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
      
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(null);
        setViewMode("list");
      }
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleSelectAppointment = async (apt: UpcomingAppointment) => {
    setSelectedAppointment(apt);
    
    // If completed, fetch and view checkup details
    if (apt.status === 'completed') {
      setLoadingCheckup(true);
      setViewMode("viewCheckup");
      try {
        const checkup = await getCheckupByAppointmentId(apt.id);
        setCheckupData(checkup);
      } catch (error: any) {
        console.error("Error fetching checkup:", error);
        toast.error("Failed to load checkup details");
        setCheckupData(null);
      } finally {
        setLoadingCheckup(false);
      }
    } else if (apt.status === 'booked') {
      // For upcoming or no-show appointments, allow checkup
      setViewMode("checkup");
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedAppointment(null);
    setCheckupData(null);
  };

  const handleCheckupComplete = async () => {
    // Refresh appointments after checkup completion
    await fetchAppointments(filter);
    setViewMode("list");
    setSelectedAppointment(null);
  };

  const handleCancelClick = (id: number) => {
    setAppointmentToCancel(id);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (appointmentToCancel) {
      handleCancelAppointment(appointmentToCancel);
    }
  };

  const handleRescheduleClick = (apt: UpcomingAppointment) => {
    setAppointmentToReschedule(apt);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduled = async () => {
    await fetchAppointments(filter);
    setRescheduleDialogOpen(false);
    setAppointmentToReschedule(null);
  };

  const handleMarkBusyComplete = async () => {
    await fetchAppointments(filter);
    setMarkBusyDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-100">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // View checkup details mode (for completed appointments)
  if (viewMode === "viewCheckup" && selectedAppointment) {
    // Show loading while fetching checkup
    if (loadingCheckup) {
      return (
        <div className="p-6 md:p-8 space-y-6">
          <Button variant="ghost" onClick={handleBackToList} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Appointments
          </Button>
          <Card className="border shadow-sm bg-white">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading checkup details...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Show checkup details
    if (checkupData) {
      return (
        <div className="p-6 md:p-8">
          <CheckupDetailsView
            checkup={checkupData}
            patientInfo={{
              firstName: selectedAppointment.patient.firstName,
              lastName: selectedAppointment.patient.lastName,
              dateOfBirth: selectedAppointment.patient.dateOfBirth,
              gender: selectedAppointment.patient.gender,
              bloodGroup: selectedAppointment.patient.bloodGroup,
              allergies: selectedAppointment.patient.allergies,
            }}
            onBack={handleBackToList}
            showGlassmorphic={true}
          />
        </div>
      );
    }

    // No checkup found
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Button variant="ghost" onClick={handleBackToList} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Appointments
        </Button>
        <Card className="border shadow-sm bg-white">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <h2 className="text-xl font-semibold">No Checkup Found</h2>
              <p className="text-muted-foreground text-sm">
                No checkup record found for this appointment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Checkup form mode
  if (viewMode === "checkup" && selectedAppointment) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToList} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Appointments
          </Button>
          {selectedAppointment.status === "cancelled" && (
            <Badge variant="destructive">Cancelled</Badge>
          )}
        </div>
        <CheckupForm 
          appointment={selectedAppointment} 
          drugs={drugs} 
          labTests={labTests}
          onCheckupComplete={handleCheckupComplete}
        />
      </div>
    );
  }

  // Main list view
  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Appointments Management
          </h1>
          <Button
            onClick={() => setMarkBusyDialogOpen(true)}
            variant="outline"
            className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
          >
            <Ban className="w-4 h-4" /> Mark Busy
          </Button>
        </div>
        <p className="text-muted-foreground text-base md:text-lg">
          Manage and track all your patient appointments
        </p>
      </div>

      {/* Filter and Stats Card */}
      <Card className="border shadow-sm bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl">Filter Appointments</CardTitle>
            <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
              <SelectTrigger className="w-full sm:w-45 border-slate-200">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="nextWeek">Next Week</SelectItem>
                <SelectItem value="lastWeek">Last Week</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<CalendarClock className="w-5 h-5" />}
              label="Upcoming"
              value={categorizedAppointments.upcoming.length}
              color="blue"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Completed"
              value={categorizedAppointments.completed.length}
              color="green"
            />
            <StatCard
              icon={<XCircle className="w-5 h-5" />}
              label="Cancelled"
              value={categorizedAppointments.cancelled.length}
              color="red"
            />
            <StatCard
              icon={<CalendarX className="w-5 h-5" />}
              label="No Shows"
              value={categorizedAppointments.noshow.length}
              color="orange"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appointments Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 p-1 bg-slate-100/80">
          <TabsTrigger value="upcoming" className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Upcoming ({categorizedAppointments.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Completed ({categorizedAppointments.completed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Cancelled ({categorizedAppointments.cancelled.length})
          </TabsTrigger>
          <TabsTrigger value="noshow" className="text-sm data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            No Shows ({categorizedAppointments.noshow.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6 space-y-4">
          <AppointmentsList
            appointments={categorizedAppointments.upcoming}
            onSelectAppointment={handleSelectAppointment}
            onCancelAppointment={handleCancelClick}
            onRescheduleAppointment={handleRescheduleClick}
            emptyMessage="No upcoming appointments"
            showCancelButton={true}
            showCheckupButton={true}
            showRescheduleButton={true}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-4">
          <AppointmentsList
            appointments={categorizedAppointments.completed}
            onSelectAppointment={handleSelectAppointment}
            emptyMessage="No completed appointments"
            showCancelButton={false}
            showCheckupButton={false}
            showViewCheckupButton={true}
          />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6 space-y-4">
          <AppointmentsList
            appointments={categorizedAppointments.cancelled}
            emptyMessage="No cancelled appointments"
            showCancelButton={false}
            showCheckupButton={false}
          />
        </TabsContent>

        <TabsContent value="noshow" className="mt-6 space-y-4">
          <AppointmentsList
            appointments={categorizedAppointments.noshow}
            onSelectAppointment={handleSelectAppointment}
            onRescheduleAppointment={handleRescheduleClick}
            emptyMessage="No missed appointments"
            showCancelButton={false}
            showCheckupButton={false}
            showRescheduleButton={true}
          />
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-white border shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      {appointmentToReschedule && (
        <RescheduleDialog
          open={rescheduleDialogOpen}
          onOpenChange={(open) => {
            setRescheduleDialogOpen(open);
            if (!open) setAppointmentToReschedule(null);
          }}
          appointment={appointmentToReschedule}
          onRescheduled={handleRescheduled}
        />
      )}

      {/* Mark Busy Dialog */}
      <MarkBusyDialog
        open={markBusyDialogOpen}
        onOpenChange={setMarkBusyDialogOpen}
        onComplete={handleMarkBusyComplete}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-600 text-white",
    green: "bg-green-600 text-white",
    red: "bg-red-600 text-white",
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

// Appointments List Component
interface AppointmentsListProps {
  appointments: UpcomingAppointment[];
  onSelectAppointment?: (apt: UpcomingAppointment) => void;
  onCancelAppointment?: (id: number) => void;
  onRescheduleAppointment?: (apt: UpcomingAppointment) => void;
  emptyMessage: string;
  showCancelButton: boolean;
  showCheckupButton: boolean;
  showViewCheckupButton?: boolean;
  showRescheduleButton?: boolean;
}

function AppointmentsList({
  appointments,
  onSelectAppointment,
  onCancelAppointment,
  onRescheduleAppointment,
  emptyMessage,
  showCancelButton,
  showCheckupButton,
  showViewCheckupButton = false,
  showRescheduleButton = false,
}: AppointmentsListProps) {
  if (appointments.length === 0) {
    return (
      <Card className="border shadow-sm bg-white">
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-base text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <AppointmentCard
          key={apt.id}
          appointment={apt}
          onSelectAppointment={onSelectAppointment}
          onCancelAppointment={onCancelAppointment}
          onRescheduleAppointment={onRescheduleAppointment}
          showCancelButton={showCancelButton}
          showCheckupButton={showCheckupButton}
          showViewCheckupButton={showViewCheckupButton}
          showRescheduleButton={showRescheduleButton}
        />
      ))}
    </div>
  );
}

// Appointment Card Component
interface AppointmentCardProps {
  appointment: UpcomingAppointment;
  onSelectAppointment?: (apt: UpcomingAppointment) => void;
  onCancelAppointment?: (id: number) => void;
  onRescheduleAppointment?: (apt: UpcomingAppointment) => void;
  showCancelButton: boolean;
  showCheckupButton: boolean;
  showViewCheckupButton?: boolean;
  showRescheduleButton?: boolean;
}

function AppointmentCard({
  appointment,
  onSelectAppointment,
  onCancelAppointment,
  onRescheduleAppointment,
  showCancelButton,
  showCheckupButton,
  showViewCheckupButton = false,
  showRescheduleButton = false,
}: AppointmentCardProps) {
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
  const formatTimeRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    return `${start.toLocaleTimeString([], opts)} - ${end.toLocaleTimeString([], opts)}`;
  };

  const patientAge = appointment.patient.dateOfBirth
    ? Math.floor((Date.now() - new Date(appointment.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const appointmentType = appointment.appointmentType || 'unknown';

  return (
    <Card className="border shadow-sm bg-white hover:shadow-md transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-white">
                {`${appointment.patient.firstName[0]}${appointment.patient.lastName[0]}`.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground text-lg">
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </p>
                {patientAge && <span className="text-sm text-muted-foreground">({patientAge}y)</span>}
                <Badge variant="outline" className="capitalize text-sm">
                  {appointment.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="text-sm gap-1">
                  {appointmentType === 'online' ? (
                    <>
                      <Globe className="w-3 h-3" /> Online
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3 h-3" /> Walk-in
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-base text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {formatTimeRange(appointment.startTime, appointment.endTime)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {formatDate(appointment.startTime)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm">{appointment.reason}</Badge>
                {appointment.patient.bloodGroup && (
                  <Badge variant="outline" className="text-sm gap-1">
                    <Droplet className="w-3 h-3" /> {appointment.patient.bloodGroup}
                  </Badge>
                )}
                {hasActualAllergies(appointment.patient.allergies) && (
                  <Badge variant="outline" className="text-sm gap-1 text-orange-700 border-orange-300 bg-orange-50">
                    <AlertTriangle className="w-3 h-3" /> Allergies
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {(showCheckupButton || showCancelButton || showViewCheckupButton || showRescheduleButton) && (
            <div className="flex flex-wrap gap-2 justify-end pt-2 border-t">
              {showViewCheckupButton && onSelectAppointment && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onSelectAppointment(appointment)}
                  className="font-medium bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4 mr-1" /> View Checkup
                </Button>
              )}
              {showCheckupButton && onSelectAppointment && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onSelectAppointment(appointment)}
                  className="font-medium bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4 mr-1" /> 
                  Perform Checkup
                </Button>
              )}
              {showRescheduleButton && onRescheduleAppointment && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRescheduleAppointment(appointment)}
                  className="font-medium border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1" /> Reschedule
                </Button>
              )}
              {showCancelButton && onCancelAppointment && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCancelAppointment(appointment.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4 mr-1" /> Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
