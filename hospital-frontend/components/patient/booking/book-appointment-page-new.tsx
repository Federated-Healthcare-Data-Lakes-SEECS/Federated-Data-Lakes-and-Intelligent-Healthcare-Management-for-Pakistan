"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Clock, 
  Award, 
  Calendar,
  CheckCircle2,
  Briefcase,
  Loader2
} from "lucide-react";
import {
  getAllDoctorsWithSlots,
  getDoctorAvailableSlots,
  bookAppointment,
  groupSlotsByDate,
  type DoctorWithSlots,
  type AppointmentSlot,
} from "@/lib/api-patient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SelectedSlot {
  slotId: number;
  doctorId: number;
  startTime: string;
  endTime: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [reason, setReason] = useState("");
  const [doctors, setDoctors] = useState<DoctorWithSlots[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all doctors on mount
  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true);
        const data = await getAllDoctorsWithSlots();
        setDoctors(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load doctors:", err);
        setError(err.response?.data?.message || "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    }

    loadDoctors();
  }, []);

  // Load doctor slots when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) {
      setAvailableSlots([]);
      return;
    }

    async function loadDoctorSlots() {
      if (!selectedDoctor) return; // Type guard
      
      try {
        setLoadingSlots(true);
        const data = await getDoctorAvailableSlots(selectedDoctor);
        setAvailableSlots(data.slots);
      } catch (err: any) {
        console.error("Failed to load slots:", err);
        toast.error("Failed to load available slots");
      } finally {
        setLoadingSlots(false);
      }
    }

    loadDoctorSlots();
  }, [selectedDoctor]);

  // Filter doctors based on search
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    
    const query = searchQuery.toLowerCase();
    return doctors.filter((doctor) =>
      `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query) ||
      doctor.departmentName.toLowerCase().includes(query)
    );
  }, [searchQuery, doctors]);

  // Get doctor details
  const selectedDoctorDetails = selectedDoctor
    ? doctors.find((d) => d.id === selectedDoctor)
    : null;

  // Group slots by date
  const groupedSlots = useMemo(() => {
    const futureSlots = availableSlots.filter(
      (slot) => new Date(slot.startTime) > new Date()
    );
    return groupSlotsByDate(futureSlots);
  }, [availableSlots]);

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
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Book Appointment</h1>
          <p className="text-muted-foreground mt-2">
            Find and book with the best doctors
          </p>
        </div>
        
        {selectedSlot && (
          <Button 
            onClick={handleBooking} 
            size="lg" 
            className="gap-2"
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Search & Doctor List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {filteredDoctors.length}
                </p>
                <p className="text-xs text-muted-foreground">Doctors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {filteredDoctors.reduce((sum, d) => sum + d.availableSlotsCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Slots</p>
              </CardContent>
            </Card>
          </div>

          {/* Doctor List */}
          <div className="space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
            {filteredDoctors.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No doctors found matching your search
                </CardContent>
              </Card>
            ) : (
              filteredDoctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedDoctor === doctor.id
                      ? "ring-2 ring-primary shadow-lg"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedDoctor(doctor.id);
                    setSelectedSlot(null);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {doctor.specialization}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Award className="h-3 w-3" />
                            <span>{doctor.experience}y</span>
                          </div>
                          {doctor.availableSlotsCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {doctor.availableSlotsCount} slots
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right: Doctor Profile & Slots */}
        <div className="lg:col-span-2">
          {!selectedDoctorDetails ? (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full p-12 text-center">
                <Calendar className="h-24 w-24 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Doctor</h3>
                <p className="text-muted-foreground">
                  Choose a doctor from the list to view their profile and available appointment slots
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Doctor Profile Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                      {selectedDoctorDetails.firstName.charAt(0)}{selectedDoctorDetails.lastName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        Dr. {selectedDoctorDetails.firstName} {selectedDoctorDetails.lastName}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        {selectedDoctorDetails.specialization}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Award className="h-4 w-4" />
                          <span className="text-sm">{selectedDoctorDetails.experience} years experience</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          <span className="text-sm">{selectedDoctorDetails.departmentName}</span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-sm font-semibold mb-1">Qualification</div>
                          <p className="text-sm text-muted-foreground">
                            {selectedDoctorDetails.qualification}
                          </p>
                        </div>
                        <div>
                          <div className="text-sm font-semibold mb-1">License Number</div>
                          <p className="text-sm text-muted-foreground">
                            {selectedDoctorDetails.licenseNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Slots */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Available Slots
                  </h3>

                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : Object.keys(groupedSlots).length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No available slots at the moment.</p>
                      <p className="text-sm mt-2">Please check back later or choose another doctor.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedSlots).map(([date, slots]) => (
                        <div key={date}>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {slots.map((slot) => {
                              const startTime = new Date(slot.startTime);
                              const endTime = new Date(slot.endTime);
                              const isSelected = selectedSlot?.slotId === slot.id;

                              return (
                                <button
                                  key={slot.id}
                                  onClick={() =>
                                    setSelectedSlot({
                                      slotId: slot.id,
                                      doctorId: selectedDoctorDetails.id,
                                      startTime: slot.startTime,
                                      endTime: slot.endTime,
                                    })
                                  }
                                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                                      : "border-border hover:border-primary hover:bg-accent"
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {startTime.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                  <div className="text-xs opacity-75 mt-1">
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
                      ))}
                    </div>
                  )}

                  {/* Reason Input */}
                  {selectedSlot && (
                    <div className="mt-6 pt-6 border-t">
                      <label className="block text-sm font-semibold mb-2">
                        Reason for Visit (Optional)
                      </label>
                      <Textarea
                        placeholder="Describe your symptoms or reason for consultation..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
