"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Clock, User, Stethoscope, GraduationCap, Award } from "lucide-react";
import { mockDepartments, mockDoctors, mockAvailableSlots } from "@/lib/mock-data-patient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function BookAppointmentDialog() {
  const [open, setOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(mockDepartments[0]?.name || "");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  // Group available slots by doctor for the selected department
  const getSlotsByDepartment = (deptName: string) => {
    // Get all doctors from this department
    const deptDoctors = mockDoctors.filter((doc) => doc.departmentName === deptName);
    const doctorIds = deptDoctors.map((doc) => doc.id);
    
    // Get all available slots for these doctors
    return mockAvailableSlots.filter(
      (slot) =>
        doctorIds.includes(slot.doctorId) &&
        !slot.isBooked &&
        slot.isBookable &&
        new Date(slot.startTime) > new Date()
    );
  };

  const availableSlots = getSlotsByDepartment(selectedDepartment);

  // Group slots by date for better organization
  const groupSlotsByDate = (slots: typeof mockAvailableSlots) => {
    const grouped: Record<string, typeof mockAvailableSlots> = {};
    slots.forEach((slot) => {
      const date = new Date(slot.startTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDate(availableSlots);

  const handleBookAppointment = () => {
    if (!selectedSlot) return;
    
    const slot = mockAvailableSlots.find((s) => s.id === selectedSlot);
    
    // In the real app, this would make an API call
    console.log("Booking appointment:", {
      slotId: selectedSlot,
      doctorId: slot?.doctorId,
      reason,
    });
    
    // Reset form
    setSelectedSlot(null);
    setReason("");
    setOpen(false);
    
    // Show success message (you can add a toast here)
    alert("Appointment booked successfully!");
  };

  const isFormValid = selectedSlot !== null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6" />
            Book Your Appointment
          </DialogTitle>
          <DialogDescription className="text-base">
            Browse available slots across all departments and doctors
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Department Tabs */}
          <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
              {mockDepartments.map((dept) => (
                <TabsTrigger 
                  key={dept.id} 
                  value={dept.name}
                  className="text-xs sm:text-sm py-2"
                >
                  {dept.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {mockDepartments.map((dept) => (
              <TabsContent key={dept.id} value={dept.name} className="space-y-4 mt-4">
                {availableSlots.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        No available slots in {dept.name} at the moment.
                        <br />
                        Please check back later or try another department.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Display slots grouped by date */}
                    {Object.entries(groupedSlots).map(([date, slots]) => (
                      <div key={date} className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {slots.map((slot) => {
                            const startDate = new Date(slot.startTime);
                            const endDate = new Date(slot.endTime);
                            const isSelected = selectedSlot === slot.id;
                            const doctor = mockDoctors.find((d) => d.id === slot.doctorId);

                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSelectedSlot(slot.id)}
                                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <div className="space-y-2">
                                  {/* Doctor Info */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <User className="h-5 w-5 text-primary" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-sm truncate">
                                          {doctor?.firstName} {doctor?.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Stethoscope className="h-3 w-3" />
                                          {doctor?.specialization}
                                        </p>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <Badge className="bg-primary flex-shrink-0">Selected</Badge>
                                    )}
                                  </div>

                                  {/* Time Info */}
                                  <div className="flex items-center gap-2 text-sm bg-muted/50 rounded px-3 py-2">
                                    <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="font-medium">
                                      {startDate.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}{" "}
                                      -{" "}
                                      {endDate.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>

                                  {/* Doctor Details */}
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    <p className="flex items-center gap-1">
                                      <GraduationCap className="h-3 w-3" />
                                      {doctor?.qualification}
                                    </p>
                                    <p className="flex items-center gap-1">
                                      <Award className="h-3 w-3" />
                                      {doctor?.experience} years experience
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Reason for Visit */}
          {selectedSlot !== null && (
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="reason" className="text-base font-semibold">
                Reason for Visit (Optional)
              </Label>
              <Textarea
                id="reason"
                placeholder="Describe your symptoms or reason for visit to help the doctor prepare..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleBookAppointment} disabled={!isFormValid}>
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
