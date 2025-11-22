// Page-focused mock fetch helpers (simulate API endpoints with minimal payloads)
import { mockDoctor, mockBookedAppointments, mockAppointmentSlots, mockSchedules, mockCheckups } from './mock-data';

export function fetchDoctorLite() {
  const { id, firstName, specialization } = mockDoctor;
  return { id, firstName, specialization };
}

export function fetchUpcomingAppointmentsLite(limit = 5) {
  return mockBookedAppointments
    .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, limit)
    .map(a => ({
      id: a.id,
      startTime: a.startTime,
      endTime: a.endTime,
      reason: a.reason || 'Appointment',
      slotId: a.slotId,
    }));
}

export function fetchDashboardStats() {
  const totalSlots = mockAppointmentSlots.length;
  const bookedSlots = mockAppointmentSlots.filter(s => s.isBooked).length;
  const unbookableSlots = mockAppointmentSlots.filter(s => !s.isBookable && !s.isBooked).length;
  const availableSlots = totalSlots - bookedSlots - unbookableSlots;
  return {
    schedules: mockSchedules.length,
    bookedSlots,
    availableSlots,
    unbookableSlots,
    checkups: mockCheckups.length,
    todayAppointments: mockBookedAppointments.filter(a => new Date(a.startTime).toDateString() === new Date().toDateString()).length,
  };
}

export function fetchSchedulesLite() {
  return mockSchedules.map(s => ({
    id: s.id,
    from: s.from,
    to: s.to,
    noOfSlots: s.noOfSlots,
    slots: mockAppointmentSlots.filter(sl => sl.scheduleId === s.id).map(sl => ({
      id: sl.id,
      startTime: sl.startTime,
      endTime: sl.endTime,
      isBookable: sl.isBookable,
      isBooked: sl.isBooked,
    }))
  }));
}

export function fetchCheckupHistoryLite(limit = 10) {
  return mockCheckups
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(c => ({
      id: c.id,
      createdAt: c.createdAt,
      diagnosisPreview: c.diagnosis.slice(0, 80) + (c.diagnosis.length > 80 ? '…' : ''),
      slotStart: c.appointment.slot.startTime,
      bloodPressure: c.bloodPressure,
      temperature: c.temperature,
      heartRate: c.heartRate,
      bloodSugar: c.bloodSugar,
    }));
}
