"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Search, User, Clock, CheckCircle2, Stethoscope, X, ChevronsUpDown, Check, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  searchPatients,
  getDoctorsNext24Hours,
  getAllDepartments,
  bookWalkinAppointment,
  formatAppointmentTime,
  formatAppointmentDate,
  type Patient,
  type DoctorWithSlots,
  type AppointmentSlot,
  type Appointment,
  type Department,
} from "@/lib/api-receptionist";

export default function BookAppointmentPage() {
  // State management
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithSlots | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [reason, setReason] = useState("");
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  // Search and filter states
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientPopoverOpen, setPatientPopoverOpen] = useState(false);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [doctors, setDoctors] = useState<DoctorWithSlots[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorWithSlots[]>([]);
  const [doctorLoading, setDoctorLoading] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load departments and doctors on mount
  useEffect(() => {
    loadDepartments();
    loadDoctors();
  }, []);

  // Filter doctors based on search and department
  useEffect(() => {
    let filtered = doctors;

    // Apply department filter
    if (departmentFilter && departmentFilter !== "all") {
      filtered = filtered.filter(
        (doc) => doc.departmentId === parseInt(departmentFilter)
      );
    }

    // Apply search filter (client-side for instant results)
    if (doctorSearch.trim()) {
      const search = doctorSearch.toLowerCase();
      filtered = filtered.filter((doc) => {
        const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
        const specialization = doc.specialization.toLowerCase();
        return fullName.includes(search) || specialization.includes(search);
      });
    }

    setFilteredDoctors(filtered);
  }, [doctors, departmentFilter, doctorSearch]);

  const loadDepartments = async () => {
    try {
      const deps = await getAllDepartments();
      setDepartments(deps);
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  const loadDoctors = async () => {
    try {
      setDoctorLoading(true);
      const docs = await getDoctorsNext24Hours();
      setDoctors(docs);
      setFilteredDoctors(docs);
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setError("Failed to load doctors");
    } finally {
      setDoctorLoading(false);
    }
  };

  const handlePatientSearch = async (searchValue: string) => {
    if (!searchValue.trim() || searchValue.trim().length < 2) {
      setPatientResults([]);
      return;
    }

    try {
      setPatientLoading(true);
      setError(null);
      const results = await searchPatients(searchValue);
      setPatientResults(results);

      if (results.length === 0) {
        setError("No patients found. Please register the patient first.");
      }
    } catch (err: any) {
      console.error("Failed to search patients:", err);
      setError(err.response?.data?.message || "Failed to search patients");
      setPatientResults([]);
    } finally {
      setPatientLoading(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientPopoverOpen(false);
    setError(null);
  };

  const handleSelectDoctor = (doctor: DoctorWithSlots) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null); // Reset slot when changing doctor
  };

  const handleSelectSlot = (slot: AppointmentSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    if (!selectedPatient) {
      setError("Please select a patient");
      return;
    }
    if (!selectedSlot) {
      setError("Please select a time slot");
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
    } catch (err: any) {
      console.error("Failed to book appointment:", err);
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedPatient(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setReason("");
    setPatientSearch("");
    setPatientResults([]);
    setPatientPopoverOpen(false);
    setDoctorSearch("");
    setDepartmentFilter("all");
    setError(null);
    setBookedAppointment(null);
    loadDoctors(); // Reload doctors to refresh slots
  };

  // Success View
  if (bookedAppointment) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-linear-to-br from-emerald-50 via-white to-blue-50">
        <Card className="max-w-3xl mx-auto border-2 border-emerald-200 shadow-lg bg-white">
          <CardHeader className="bg-linear-to-r from-emerald-50 to-green-50 border-b border-emerald-100 -mt-6 pt-8 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-emerald-700">Appointment Booked Successfully!</CardTitle>
                <CardDescription className="text-emerald-600">
                  Walk-in appointment has been scheduled
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <p className="text-base font-semibold text-blue-900">Patient</p>
                </div>
                <p className="font-semibold text-lg text-slate-900">
                  {bookedAppointment.patient.firstName} {bookedAppointment.patient.lastName}
                </p>
                <p className="text-base text-slate-600">{bookedAppointment.patient.email}</p>
                {bookedAppointment.patient.phoneNumber && (
                  <p className="text-base text-slate-600">{bookedAppointment.patient.phoneNumber}</p>
                )}
              </div>

              <div className="p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="h-5 w-5 text-purple-600" />
                  <p className="text-base font-semibold text-purple-900">Doctor</p>
                </div>
                <p className="font-semibold text-lg text-slate-900">
                  Dr. {bookedAppointment.doctor.firstName} {bookedAppointment.doctor.lastName}
                </p>
                <p className="text-base text-slate-600">{bookedAppointment.doctor.specialization}</p>
                <p className="text-base text-slate-600">{bookedAppointment.doctor.departmentName}</p>
              </div>
            </div>

            <div className="p-4 bg-linear-to-br from-amber-50 to-orange-100 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-amber-700" />
                <p className="text-base font-semibold text-amber-900">Appointment Time</p>
              </div>
              <p className="font-semibold text-lg text-slate-900">
                {formatAppointmentDate(bookedAppointment.startTime)}
              </p>
              <p className="text-base text-slate-600">
                {formatAppointmentTime(bookedAppointment.startTime, bookedAppointment.endTime)}
              </p>
            </div>

            {bookedAppointment.reason && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-base font-semibold text-slate-700 mb-1">Reason for Visit</p>
                <p className="text-base text-slate-600">{bookedAppointment.reason}</p>
              </div>
            )}

            <Button
              onClick={handleReset}
              className="w-full bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-6 text-lg"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book Another Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Booking Interface
  return (
    <div className="p-6 md:p-8 min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black bg-clip-text">
          Book Walk-in Appointment
        </h1>
        <p className="text-muted-foreground text-base mt-2">
          Search patient, select doctor, and book appointment - all in one place
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Patient & Doctor Selection */}
        <div className="space-y-6">
          {/* Patient Search */}
          <Card className="border bg-blue-50 shadow-sm h-70 flex flex-col">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                1. Select Patient
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="space-y-4">

                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="patientSearch" className="text-base">Search by name, email</Label>
                  <Input
                    id="patientSearch"
                    placeholder="Search by name, email, or CNIC..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value)
                      handlePatientSearch(e.target.value)
                    }}
                    className="border-slate-200 bg-white"
                  />
                </div>

                {/* Search Results */}
                {patientSearch.length > 0 && !selectedPatient && (
                  <div className="border border-slate-200 rounded-lg bg-white max-h-75 overflow-y-auto">

                    {patientLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : patientResults.length === 0 ? (
                      <div className="text-center py-6 text-base text-muted-foreground">
                        {patientSearch.length >= 2
                          ? "No patients found"
                          : "Type at least 2 characters to search"}
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {patientResults.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => handleSelectPatient(patient)}
                            className="w-full text-left p-3 rounded-md hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                          >
                            <div className="font-medium text-base text-slate-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {patient.email}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Patient */}
                {selectedPatient && (
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-base text-slate-900">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {selectedPatient.email}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(null)
                          setPatientSearch("")
                          setPatientResults([])
                        }}
                        className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>


          {/* Doctor Selection */}
          <Card className="border shadow-sm bg-purple-50 h-[calc(100vh-420px)] min-h-125 flex flex-col">
            <CardHeader className="bg-purple-50 border-b border-purple-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                2. Select Doctor
              </CardTitle>
              <CardDescription>
                Showing doctors with slots in next 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              {/* Filters */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="doctorSearch" className="text-base">Search Doctor</Label>
                  <Input
                    id="doctorSearch"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Name or specialization..."
                    className="border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-base">Department</Label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger id="department" className="border-slate-200 w-full bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Doctor List */}
              <div className="flex-1 overflow-hidden">
                {doctorLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : filteredDoctors.length === 0 ? (
                  <div className="text-center flex flex-col items-center justify-center h-full">
                    <Stethoscope className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-base text-muted-foreground">No doctors available with slots in next 24 hours</p>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto pr-2 space-y-2">
                    {filteredDoctors.map((doctor) => (
                      <Card
                        key={doctor.id}
                        className={`cursor-pointer border transition-all ${selectedDoctor?.id === doctor.id
                            ? "border-2 border-purple-400 bg-white shadow-md"
                            : "border-slate-200 hover:border-purple-300 hover:shadow-sm"
                          }`}
                        onClick={() => handleSelectDoctor(doctor)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-base text-slate-900">
                                  Dr. {doctor.firstName} {doctor.lastName}
                                </p>
                                {selectedDoctor?.id === doctor.id && (
                                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                                )}
                              </div>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm">
                                {doctor.specialization}
                              </Badge>
                              <p className="text-sm text-muted-foreground">{doctor.departmentName}</p>
                              <div className="flex items-center gap-1 text-sm text-emerald-600 pt-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{doctor.availableSlotsCount} slots available</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Time Slots & Booking */}
        <div className="space-y-6">
          {/* Time Slots */}
          <Card className="border shadow-sm bg-emerald-50 h-95 flex flex-col">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                3. Select Time Slot
              </CardTitle>
              {selectedDoctor && (
                <CardDescription>
                  Dr. {selectedDoctor.firstName} {selectedDoctor.lastName} - Next 24 hours
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {!selectedDoctor ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Clock className="h-16 w-16 text-slate-200 mb-4" />
                  <p className="text-base text-muted-foreground text-center px-4">Please select a doctor to view available time slots</p>
                </div>
              ) : selectedDoctor.upcomingSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Calendar className="h-16 w-16 text-slate-200 mb-4" />
                  <p className="text-base text-muted-foreground">No slots available in next 24 hours</p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3 pr-2">
                    {selectedDoctor.upcomingSlots.map((slot) => {
                      const slotDate = new Date(slot.startTime);
                      const isSelected = selectedSlot?.id === slot.id;

                      return (
                        <Button
                          key={slot.id}
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleSelectSlot(slot)}
                          className={`h-auto py-3 flex flex-col items-start ${isSelected
                              ? "bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-400"
                              : "border-slate-200 hover:bg-emerald-50 hover:text-black hover:border-emerald-300"
                            }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm font-semibold">
                              {slotDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                                <span className="text-sm opacity-80">
                            {slotDate.toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Confirmation */}
          <Card className="border shadow-sm bg-amber-50 h-[calc(100vh-520px)] min-h-100 flex flex-col">
            <CardHeader className="bg-amber-50 border-b border-amber-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                4. Confirm Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-base">Reason for Visit (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for visit..."
                    rows={3}
                    className="border-slate-200 resize-none h-30 bg-white"
                  />
                </div>

                {/* <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Booking Summary</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-600">
                      <span className="font-medium">Patient:</span>{" "}
                      {selectedPatient
                        ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                        : <span className="text-muted-foreground">Not selected</span>}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium">Doctor:</span>{" "}
                      {selectedDoctor
                        ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`
                        : <span className="text-muted-foreground">Not selected</span>}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium">Time:</span>{" "}
                      {selectedSlot
                        ? `${new Date(selectedSlot.startTime).toLocaleString()}`
                        : <span className="text-muted-foreground">Not selected</span>}
                    </p>
                  </div>
                </div> */}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 mt-4">
                <Button
                  onClick={handleBookAppointment}
                  disabled={!selectedPatient || !selectedSlot || loading}
                  className="w-full bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Confirm Booking
                    </>
                  )}
                </Button>

                {(selectedPatient || selectedDoctor || selectedSlot) && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="w-full border-slate-300 hover:bg-slate-100"
                  >
                    Reset Form
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
