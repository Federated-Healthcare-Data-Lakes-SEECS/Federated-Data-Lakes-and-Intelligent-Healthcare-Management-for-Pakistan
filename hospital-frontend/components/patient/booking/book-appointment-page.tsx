"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Clock, 
  Award, 
  Calendar,
  CheckCircle2,
  Briefcase,
  Loader2,
  CalendarPlus,
  Users,
  Brain
} from "lucide-react";
import {
  getDoctorsByDate,
  bookAppointment,
  type DoctorWithSlotsForDate,
} from "@/lib/api-patient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSemanticSearch } from "@/hooks/use-semantic-search";

interface SelectedSlot {
  slotId: number;
  doctorId: number;
  startTime: string;
  endTime: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  ); // Default to today
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [reason, setReason] = useState("");
  const [doctors, setDoctors] = useState<DoctorWithSlotsForDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  // Generate date options (today + next 6 days = 7 total)
  const dateOptions = useMemo(() => {
    const options = [];
    // Get current date in Pakistan timezone
    const today = new Date();
    const pakOffset = 5 * 60; // Pakistan is UTC+5
    const pakTime = new Date(today.getTime() + pakOffset * 60 * 1000);
    
    const year = pakTime.getUTCFullYear();
    const month = pakTime.getUTCMonth();
    const day = pakTime.getUTCDate();

    for (let i = 0; i < 7; i++) {
      // Create date in Pakistan timezone
      const date = new Date(Date.UTC(year, month, day + i, 0, 0, 0, 0));
      const isToday = i === 0;

      // Format for display in Pakistan timezone
      const displayDate = new Date(date.getTime() + pakOffset * 60 * 1000);

      options.push({
        value: `${displayDate.getUTCFullYear()}-${String(displayDate.getUTCMonth() + 1).padStart(2, '0')}-${String(displayDate.getUTCDate()).padStart(2, '0')}`,
        label: isToday ? "Today" : displayDate.toLocaleDateString("en-PK", { weekday: "short", timeZone: "Asia/Karachi" }),
        fullLabel: displayDate.toLocaleDateString("en-PK", { month: "short", day: "numeric", timeZone: "Asia/Karachi" }),
        date: date,
        isToday,
      });
    }

    return options;
  }, []);

  // Load doctors for selected date
  useEffect(() => {
    async function loadDoctorsForDate() {
      try {
        setLoading(true);
        // Pass the date string as-is (YYYY-MM-DD format)
        const data = await getDoctorsByDate(selectedDate, 12, true); // Max 12 slots per doctor
        setDoctors(data.doctors);
        setSelectedSlot(null); // Reset selected slot when date changes
      } catch (err: any) {
        console.error("Failed to load doctors:", err);
        toast.error("Failed to load doctors for selected date");
      } finally {
        setLoading(false);
      }
    }

    loadDoctorsForDate();
  }, [selectedDate]);

  // Semantic search hook (replaces simple string filter)
  const { results: filteredDoctors, isModelReady, isSearching } = useSemanticSearch(doctors, searchQuery);

  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      setBooking(true);
      const appointment = await bookAppointment({
        slotId: selectedSlot.slotId,
        reason: reason.trim() || undefined,
      });

      setBookedAppointment(appointment);
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Failed to book appointment:", err);
      toast.error(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  const handleBookAnother = () => {
    setShowSuccess(false);
    setBookedAppointment(null);
    setSelectedSlot(null);
    setReason("");
    setSearchQuery("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const formatAppointmentDate = (dateString: string) => {
    // Parse the ISO datetime string and format for Pakistan timezone
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Karachi",
    });
  };

  const formatAppointmentTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Karachi",
    });
    const end = new Date(endTime).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Karachi",
    });
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 min-h-screen bg-slate-50/50">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
            <p className="text-muted-foreground">Loading available doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  // Success View
  if (showSuccess && bookedAppointment) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-slate-50/50">
        <Card className="max-w-2xl mx-auto border border-green-200 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-green-700">Appointment Booked Successfully!</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your appointment has been confirmed
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 space-y-4">
              <div className="p-3 bg-white rounded-lg border border-green-100">
                <p className="text-xs text-muted-foreground mb-1">Patient</p>
                <p className="font-medium text-slate-900">
                  {bookedAppointment.patient.firstName} {bookedAppointment.patient.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{bookedAppointment.patient.email}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-green-100">
                <p className="text-xs text-muted-foreground mb-1">Doctor</p>
                <p className="font-medium text-slate-900">
                  {bookedAppointment.doctor.firstName} {bookedAppointment.doctor.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {bookedAppointment.doctor.specialization} - {bookedAppointment.doctor.departmentName}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-green-100">
                <p className="text-xs text-muted-foreground mb-1">Appointment Time</p>
                <p className="font-medium text-slate-900">
                  {formatAppointmentDate(bookedAppointment.startTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatAppointmentTime(bookedAppointment.startTime, bookedAppointment.endTime)}
                </p>
              </div>
              {bookedAppointment.reason && (
                <div className="p-3 bg-white rounded-lg border border-green-100">
                  <p className="text-xs text-muted-foreground mb-1">Reason for Visit</p>
                  <p className="text-sm text-slate-700">{bookedAppointment.reason}</p>
                </div>
              )}
              <div className="p-3 bg-white rounded-lg border border-green-100">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {bookedAppointment.status}
                </Badge>
              </div>
            </div>

            <Button onClick={handleBookAnother} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Book Another Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Book Appointment</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">Select a date and find available doctors</p>
        </div>
        
        {selectedSlot && (
          <Button 
            onClick={handleBooking} 
            size="lg" 
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            disabled={booking}
          >
            {booking ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Confirm Booking
              </>
            )}
          </Button>
        )}
      </header>

      {/* Date Selector */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Select Appointment Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-2">
            {dateOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => setSelectedDate(option.value)}
                variant={selectedDate === option.value ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-3 transition-all",
                  selectedDate === option.value
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 border-0 shadow-md"
                    : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50",
                  option.isToday && selectedDate !== option.value && "border-emerald-300 bg-emerald-50/30"
                )}
              >
                <span className="text-sm">{option.label}</span>
                <span
                  className={cn(
                    "text-sm",
                    selectedDate === option.value ? "text-white/90" : "text-muted-foreground"
                  )}
                >
                  {option.fullLabel}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search & Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="md:col-span-3 border shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <Input
                placeholder="Search by doctor name, specialization, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-32 text-base placeholder:text-base"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
                {isSearching && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                )}
                {isModelReady ? (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Brain className="h-2.5 w-2.5" />
                    AI Search
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-slate-50 text-slate-500 border border-slate-200">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    Loading AI
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] uppercase tracking-wide text-muted-foreground font-medium">Available Doctors</p>
                <p className="text-xl font-semibold mt-1">{filteredDoctors.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <Card className="border shadow-sm bg-white">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4 mx-auto">
              <Calendar className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Doctors Available</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No doctors found matching your search criteria."
                : "No doctors have available slots on this date. Please try another date."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredDoctors.map((doctor) => {
            return (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow border bg-white">
              <CardContent className="p-6">
                {/* Doctor Info */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {doctor.firstName.charAt(0)}
                    {doctor.lastName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-1">
                      {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {doctor.specialization}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Award className="h-4 w-4 text-emerald-600" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Briefcase className="h-4 w-4 text-emerald-600" />
                        <span>{doctor.departmentName}</span>
                      </div>
                      <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Clock className="h-3 w-3" />
                        {doctor.availableSlotsCount} slots available
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    Available Time Slots
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {doctor.slots.map((slot) => {
                      const startTime = new Date(slot.startTime);
                      const endTime = new Date(slot.endTime);
                      const isSelected =
                        selectedSlot?.slotId === slot.id &&
                        selectedSlot?.doctorId === doctor.id;

                      return (
                        <button
                          key={slot.id}
                          onClick={() => {
                            setSelectedSlot({
                              slotId: slot.id,
                              doctorId: doctor.id,
                              startTime: slot.startTime,
                              endTime: slot.endTime,
                            });
                          }}
                          className={cn(
                            "p-3 border-2 rounded-lg text-sm font-medium transition-all",
                            isSelected
                              ? "border-emerald-500 bg-emerald-600 text-white shadow-lg scale-105"
                              : "border-border hover:border-emerald-300 hover:bg-emerald-50"
                          )}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" />
                            {startTime.toLocaleTimeString("en-PK", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Karachi",
                            })}
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {endTime.toLocaleTimeString("en-PK", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Karachi",
                            })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Reason Input - Fixed Bottom Card */}
      {selectedSlot && (
        <Card className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 shadow-2xl border-2 border-emerald-200 z-50 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Selected Time:</p>
              <p className="font-semibold">
                {new Date(selectedSlot.startTime).toLocaleTimeString("en-PK", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Karachi",
                })}{" "}
                -{" "}
                {new Date(selectedSlot.endTime).toLocaleTimeString("en-PK", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Karachi",
                })}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">
                Reason for Visit (Optional)
              </label>
              <Textarea
                placeholder="Describe your symptoms or reason for consultation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none bg-slate-50"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedSlot(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBooking}
                disabled={booking}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {booking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
