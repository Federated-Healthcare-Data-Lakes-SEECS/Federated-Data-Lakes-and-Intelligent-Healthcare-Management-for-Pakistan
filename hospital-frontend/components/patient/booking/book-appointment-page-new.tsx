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
  Users
} from "lucide-react";
import {
  getDoctorsByDate,
  bookAppointment,
  type DoctorWithSlotsForDate,
  type AppointmentSlot,
} from "@/lib/api-patient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  // Generate date options (today + next 6 days = 7 total)
  const dateOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const isToday = i === 0;

      options.push({
        value: date.toISOString().split("T")[0],
        label: isToday ? "Today" : date.toLocaleDateString("en-PK", { weekday: "short" }),
        fullLabel: date.toLocaleDateString("en-PK", { month: "short", day: "numeric" }),
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
        const data = await getDoctorsByDate(selectedDate, 8); // Max 8 slots per doctor
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

  // Filter doctors based on search
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;

    const query = searchQuery.toLowerCase();
    return doctors.filter(
      (doctor) =>
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        doctor.departmentName.toLowerCase().includes(query)
    );
  }, [searchQuery, doctors]);

  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      setBooking(true);
      await bookAppointment({
        slotId: selectedSlot.slotId,
        reason: reason.trim() || undefined,
      });

      toast.success("Appointment booked successfully!");
      router.push("/patient/appointments");
    } catch (err: any) {
      console.error("Failed to book appointment:", err);
      toast.error(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-125">
        <div className="text-center space-y-3">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading available doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Book Appointment</h1>
          <p className="text-muted-foreground text-base mt-1">
            Select a date and find available doctors
          </p>
        </div>

        {selectedSlot && (
          <Button
            onClick={handleBooking}
            size="lg"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
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
      </div>

      {/* Date Selector */}
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-blue-600" />
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
                    ? "bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-md"
                    : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50",
                  option.isToday && selectedDate !== option.value && "border-blue-300 bg-blue-50/30"
                )}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <span
                  className={cn(
                    "text-xs",
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
        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by doctor name, specialization, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-primary">
                  {filteredDoctors.length}
                </p>
                <p className="text-sm text-muted-foreground">Doctors Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
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
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Doctor Info */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {doctor.firstName.charAt(0)}
                    {doctor.lastName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-1">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-muted-foreground text-base mb-2">
                      {doctor.specialization}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-base">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{doctor.departmentName}</span>
                      </div>
                      <Badge variant="secondary" className="gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {doctor.availableSlotsCount} slots available
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h4 className="text-base font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
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
                            "p-3 border-2 rounded-lg text-base font-medium transition-all",
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white shadow-lg scale-105"
                              : "border-border hover:border-blue-600 hover:bg-blue-50"
                          )}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {startTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-sm opacity-75 mt-1">
                            {endTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reason Input - Fixed Bottom Card */}
      {selectedSlot && (
        <Card className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 shadow-2xl border-2 border-blue-200 z-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-base">
              <p className="text-muted-foreground mb-1">Selected Time:</p>
              <p className="font-semibold">
                {new Date(selectedSlot.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(selectedSlot.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            
            <div>
              <label className="block text-base font-semibold mb-2">
                Reason for Visit (Optional)
              </label>
              <Textarea
                placeholder="Describe your symptoms or reason for consultation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none text-base"
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
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
