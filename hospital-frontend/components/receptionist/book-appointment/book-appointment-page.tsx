"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Search, User, Clock, CheckCircle2 } from "lucide-react";
import {
  searchPatients,
  getAllDoctorsWithSlots,
  bookWalkinAppointment,
  formatAppointmentTime,
  formatAppointmentDate,
  groupSlotsByDate,
  type Patient,
  type DoctorWithSlots,
  type AppointmentSlot,
  type Appointment,
} from "@/lib/api-receptionist";

export default function BookAppointmentPage() {
  const [step, setStep] = useState<"search" | "selectDoctor" | "selectSlot" | "success">("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<DoctorWithSlots[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithSlots | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await searchPatients(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError("No patients found. Please register the patient first.");
      }
    } catch (err: any) {
      console.error("Failed to search patients:", err);
      setError(err.response?.data?.message || "Failed to search patients");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setError(null);
    
    try {
      setLoading(true);
      const doctorsList = await getAllDoctorsWithSlots();
      setDoctors(doctorsList);
      
      if (doctorsList.length === 0) {
        setError("No doctors with available slots found");
      } else {
        setStep("selectDoctor");
      }
    } catch (err: any) {
      console.error("Failed to load doctors:", err);
      setError(err.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = (doctor: DoctorWithSlots) => {
    setSelectedDoctor(doctor);
    setStep("selectSlot");
  };

  const handleSelectSlot = (slot: AppointmentSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    if (!selectedPatient || !selectedSlot) {
      setError("Please select a patient and time slot");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const appointment = await bookWalkinAppointment({
        patientId: selectedPatient.id,
        slotId: selectedSlot.id,
        reason: reason.trim() || undefined,
      });
      
      setBookedAppointment(appointment);
      setStep("success");
    } catch (err: any) {
      console.error("Failed to book appointment:", err);
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAnother = () => {
    setStep("search");
    setSearchTerm("");
    setSearchResults([]);
    setSelectedPatient(null);
    setDoctors([]);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setReason("");
    setError(null);
    setBookedAppointment(null);
  };

  const handleBack = () => {
    if (step === "selectSlot") {
      setStep("selectDoctor");
      setSelectedSlot(null);
    } else if (step === "selectDoctor") {
      setStep("search");
      setSelectedPatient(null);
      setDoctors([]);
    }
  };

  // Success View
  if (step === "success" && bookedAppointment) {
    return (
      <div className="p-8">
        <Card className="max-w-2xl mx-auto border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <CardTitle className="text-green-700">Appointment Booked Successfully!</CardTitle>
                <CardDescription>
                  Walk-in appointment has been scheduled
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">
                  {bookedAppointment.patient.firstName} {bookedAppointment.patient.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{bookedAppointment.patient.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">
                  Dr. {bookedAppointment.doctor.firstName} {bookedAppointment.doctor.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {bookedAppointment.doctor.specialization} - {bookedAppointment.doctor.departmentName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Appointment Time</p>
                <p className="font-medium">
                  {formatAppointmentDate(bookedAppointment.startTime)}
                </p>
                <p className="text-sm">
                  {formatAppointmentTime(bookedAppointment.startTime, bookedAppointment.endTime)}
                </p>
              </div>
              {bookedAppointment.reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="text-sm">{bookedAppointment.reason}</p>
                </div>
              )}
            </div>

            <Button onClick={handleBookAnother} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Book Another Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Select Slot View
  if (step === "selectSlot" && selectedDoctor) {
    const groupedSlots = groupSlotsByDate(selectedDoctor.upcomingSlots);
    const dates = Object.keys(groupedSlots).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return (
      <div className="p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Select Time Slot</CardTitle>
                <CardDescription>
                  Dr. {selectedDoctor.firstName} {selectedDoctor.lastName} - {selectedDoctor.specialization}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Selected Patient</p>
              <p className="font-medium">
                {selectedPatient?.firstName} {selectedPatient?.lastName}
              </p>
            </div>

            <div className="space-y-4">
              <Label>Available Time Slots</Label>
              {dates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No available slots for this doctor
                </p>
              ) : (
                dates.map((dateKey) => (
                  <div key={dateKey} className="space-y-2">
                    <h3 className="font-medium text-sm">
                      {new Date(dateKey).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {groupedSlots[dateKey].map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                          onClick={() => handleSelectSlot(slot)}
                          className="justify-center"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(slot.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedSlot && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for visit..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleBookAppointment}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Select Doctor View
  if (step === "selectDoctor" && doctors.length > 0) {
    return (
      <div className="p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Select Doctor</CardTitle>
                <CardDescription>
                  Choose a doctor for {selectedPatient?.firstName} {selectedPatient?.lastName}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectDoctor(doctor)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h3>
                          <Badge variant="outline">{doctor.specialization}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {doctor.departmentName}
                        </p>
                        <p className="text-sm">
                          {doctor.qualification} • {doctor.experience} years experience
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground pt-2">
                          <Calendar className="h-4 w-4" />
                          <span>{doctor.availableSlotsCount} slots available</span>
                        </div>
                      </div>
                      <Button>Select</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Search Patient View
  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Book Walk-in Appointment
          </CardTitle>
          <CardDescription>
            Search for a patient to book an appointment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="search">Search Patient</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or CNIC..."
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter at least 2 characters to search
            </p>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>Search Results</Label>
              <div className="space-y-2 max-h-96 overflow-auto">
                {searchResults.map((patient) => (
                  <Card
                    key={patient.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">{patient.email}</p>
                          <p className="text-sm text-muted-foreground">CNIC: {patient.cnic}</p>
                        </div>
                        <Button size="sm">Select</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
