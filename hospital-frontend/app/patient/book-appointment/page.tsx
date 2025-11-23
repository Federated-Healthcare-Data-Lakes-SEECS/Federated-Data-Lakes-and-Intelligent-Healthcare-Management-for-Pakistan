"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Star, 
  Clock, 
  Award, 
  GraduationCap, 
  Languages, 
  DollarSign,
  Calendar,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { 
  mockDoctorsDetailed, 
  mockDoctorSchedules 
} from "@/lib/mock-data-patient-booking";

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

  // Filter doctors based on search
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return mockDoctorsDetailed;
    
    const query = searchQuery.toLowerCase();
    return mockDoctorsDetailed.filter((doctor) =>
      `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query) ||
      doctor.departmentName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Get doctor details
  const selectedDoctorDetails = selectedDoctor
    ? mockDoctorsDetailed.find((d) => d.id === selectedDoctor)
    : null;

  // Get available slots for selected doctor
  const availableSlots = selectedDoctor
    ? mockDoctorSchedules.find((s) => s.doctorId === selectedDoctor)?.slots.filter(
        (slot) =>
          !slot.isBooked &&
          slot.isBookable &&
          new Date(slot.startTime) > new Date()
      ) || []
    : [];

  // Group slots by date
  const groupedSlots = useMemo(() => {
    const grouped: Record<string, typeof availableSlots> = {};
    availableSlots.forEach((slot) => {
      const date = new Date(slot.startTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    return grouped;
  }, [availableSlots]);

  const handleBooking = () => {
    if (!selectedSlot) return;
    
    // API call would go here
    console.log("Booking:", { 
      slotId: selectedSlot.slotId,
      doctorId: selectedSlot.doctorId,
      reason 
    });
    
    alert("Appointment booked successfully!");
    router.push("/patient/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Book Appointment</h1>
                <p className="text-sm text-muted-foreground">
                  Find and book with the best doctors
                </p>
              </div>
            </div>
            
            {selectedSlot && (
              <Button onClick={handleBooking} size="lg" className="gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Confirm Booking
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Search & Doctor List */}
          <div className="lg:col-span-1 space-y-6">
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
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {filteredDoctors.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Doctors</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {filteredDoctors.reduce((sum, d) => {
                      const schedule = mockDoctorSchedules.find(s => s.doctorId === d.id);
                      const availableCount = schedule?.slots.filter(sl => !sl.isBooked && sl.isBookable && new Date(sl.startTime) > new Date()).length || 0;
                      return sum + availableCount;
                    }, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Slots</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {new Set(filteredDoctors.map(d => d.departmentName)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Departments</p>
                </CardContent>
              </Card>
            </div>

            {/* Doctor List */}
            <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
              {filteredDoctors.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No doctors found matching your search
                  </CardContent>
                </Card>
              ) : (
                filteredDoctors.map((doctor) => {
                  const doctorSlots = mockDoctorSchedules.find(s => s.doctorId === doctor.id)?.slots.filter(
                    sl => !sl.isBooked && sl.isBookable && new Date(sl.startTime) > new Date()
                  ).length || 0;
                  
                  return (
                    <Card
                      key={doctor.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedDoctor === doctor.id
                          ? "ring-2 ring-primary shadow-lg"
                          : ""
                      }`}
                      onClick={() => setSelectedDoctor(doctor.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {doctor.firstName} {doctor.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {doctor.specialization}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{doctor.rating}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Award className="h-3 w-3" />
                                <span>{doctor.experience}y</span>
                              </div>
                              {doctorSlots > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {doctorSlots} slots
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
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
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                        {selectedDoctorDetails.firstName.charAt(0)}{selectedDoctorDetails.lastName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">
                          {selectedDoctorDetails.firstName} {selectedDoctorDetails.lastName}
                        </h2>
                        <p className="text-lg text-muted-foreground">
                          {selectedDoctorDetails.specialization}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{selectedDoctorDetails.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({selectedDoctorDetails.totalReviews} reviews)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Award className="h-4 w-4" />
                            <span className="text-sm">{selectedDoctorDetails.experience} years exp.</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm">Rs. {selectedDoctorDetails.consultationFee}</span>
                          </div>
                        </div>
                        
                        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                          {selectedDoctorDetails.about}
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                              <GraduationCap className="h-4 w-4" />
                              Education
                            </div>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              {selectedDoctorDetails.education.map((edu, idx) => (
                                <li key={idx}>• {edu}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                              <Languages className="h-4 w-4" />
                              Languages
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {selectedDoctorDetails.languages.join(", ")}
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold mt-3 mb-2">
                              <Award className="h-4 w-4" />
                              Achievements
                            </div>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              {selectedDoctorDetails.achievements.slice(0, 2).map((achievement, idx) => (
                                <li key={idx}>• {achievement}</li>
                              ))}
                            </ul>
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

                    {availableSlots.length === 0 ? (
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
    </div>
  );
}
