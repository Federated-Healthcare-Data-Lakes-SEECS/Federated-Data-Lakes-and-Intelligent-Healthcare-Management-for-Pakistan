// Helper functions for doctor portal
import { mockAppointmentSlots, mockBookedAppointments, mockSchedules, mockCheckups } from "./mock-data";

export function getScheduleWithSlots(scheduleId: number) {
  const schedule = mockSchedules.find((s) => s.id === scheduleId);
  if (!schedule) return null;
  const slots = mockAppointmentSlots.filter((s) => s.scheduleId === scheduleId);
  return { ...schedule, slots };
}

export function getSchedules() {
  return mockSchedules.map(s => ({
    ...s,
    slots: mockAppointmentSlots.filter(sl => sl.scheduleId === s.id)
  }));
}

export function getUpcomingAppointmentsMinimal() {
  return mockBookedAppointments.slice(0, 5).map(a => ({
    id: a.id,
    slotId: a.slotId,
    scheduleId: a.scheduleId,
    startTime: a.startTime,
    endTime: a.endTime,
    reason: a.reason,
  }));
}

export function calculateDashboardStats() {
  const totalSlots = mockAppointmentSlots.length;
  const bookedSlots = mockAppointmentSlots.filter(s => s.isBooked).length;
  const unbookableSlots = mockAppointmentSlots.filter(s => !s.isBookable).length;
  const availableSlots = totalSlots - bookedSlots - unbookableSlots;
  return {
    totalSchedules: mockSchedules.length,
    bookedSlots,
    availableSlots,
    unbookableSlots,
    checkupsCompleted: mockCheckups.length,
    upcomingToday: mockBookedAppointments.filter(a => new Date(a.startTime).toDateString() === new Date().toDateString()).length,
  };
}

// Slot mutation helpers (mock only - would call API in real app)
export function toggleSlotBookable(slotId: number) {
  const slot = mockAppointmentSlots.find(s => s.id === slotId);
  if (slot && !slot.isBooked) {
    slot.isBookable = !slot.isBookable;
  }
  return slot;
}

export function cancelAppointment(appointmentId: number) {
  const appointment = mockBookedAppointments.find(a => a.id === appointmentId);
  if (!appointment) return null;
  const slot = mockAppointmentSlots.find(s => s.id === appointment.slotId);
  if (slot) {
    slot.isBooked = false;
  }
  return slot;
}
