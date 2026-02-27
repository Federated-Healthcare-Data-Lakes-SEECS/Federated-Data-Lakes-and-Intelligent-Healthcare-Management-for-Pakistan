/**
 * Doctor Portal API Service
 * Interfaces with hospital backend APIs for doctor-specific operations
 */

import { api } from "../api";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DoctorProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  cnic: string;
  licenseNumber: string;
  specialization: string;
  experience: number;
  qualification: string;
  departmentName: string;
  createdAt: string;
}

export interface DashboardStats {
  schedules: number;
  bookedSlots: number;
  availableSlots: number;
  unbookableSlots: number;
  checkups: number;
  todayAppointments: number;
}

export interface UpcomingAppointment {
  id: number;
  patientId: number;
  slotId: number;
  scheduleId: number;
  startTime: string;
  endTime: string;
  reason: string;
  status: string;
  appointmentType?: string;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    cnic: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    medicalHistory?: string;
    allergies?: string;
  };
  createdAt: string;
}

export interface AudioInfo {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transcription?: string;
  extractedInfo?: Record<string, any>;
  processedAt?: string;
  errorMessage?: string;
}

export interface RecentCheckup {
  id: number;
  appointmentId: number;
  diagnosis: string;
  symptoms?: string;
  bloodPressure?: string;
  temperature?: string;
  heartRate?: string;
  bloodSugar?: string;
  notes?: string;
  gapAnalysis?: string; // Gap analysis from AI
  medications?: Medication[];
  additionalMedications?: string;
  recommendedLabTests?: { id: number; name: string }[];
  additionalTests?: string;
  hasAudio?: boolean;
  audioInfo?: AudioInfo;
  createdAt: string;
  appointment: {
    slot: {
      startTime: string;
      endTime: string;
    };
    patient: {
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      bloodGroup?: string;
      medicalHistory?: string;
      allergies?: string;
      gender?: string;
      familyHistory?: string;
    };
  };
}

export interface Schedule {
  id: number;
  doctorId: number;
  from: string;
  to: string;
  noOfSlots: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  appointmentSlots: AppointmentSlot[];
}

export interface AppointmentSlot {
  id: number;
  scheduleId: number;
  startTime: string;
  endTime: string;
  isBookable: boolean;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  appointments?: SlotAppointment[];
}

export interface SlotAppointment {
  id: number;
  patientId: number;
  slotId: number;
  reason?: string;
  createdAt: string;
  patient: {
    user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    cnic?: string;
    }
    dateOfBirth?: string;
    bloodGroup?: string;
  };
  walkinAppointment?: {
    status: string;
  };
  onlineAppointment?: {
    status: string;
  };
}

export interface Medication {
  drugId: number;
  dosePerIntake: string;
  timesPerDay: number;
  totalDays: number;
  instructions?: string;
  drug?: Drug;
}

export interface Drug {
  id: number;
  name: string;
  description?: string;
  formulaName?: string;
  chemicalFormula?: string;
  dosageForm?: string;
  strength?: string;
  supplier?: string;
  isActive: boolean;
}

export interface LabTest {
  id: number;
  name: string;
  description?: string;
  departmentName: string;
  templateName: string;
  isActive: boolean;
}

export interface CreateScheduleDto {
  from: string;
  to: string;
  noOfSlots: number;
}

export interface CreateCheckupDto {
  appointmentId: number;
  diagnosis: string;
  symptoms?: string;
  bloodPressure?: string;
  temperature?: string;
  heartRate?: string;
  bloodSugar?: string;
  notes?: string;
  medications?: {
    drugId: number;
    dosePerIntake: string;
    timesPerDay: number;
    totalDays: number;
    instructions?: string;
  }[];
  additionalMedications?: string;
  recommendedLabTestIds?: number[];
  additionalTests?: string;
}

export interface SaveDraftDto {
  appointmentId: number;
  diagnosis?: string;
  symptoms?: string;
  bloodPressure?: string;
  temperature?: string;
  heartRate?: string;
  bloodSugar?: string;
  notes?: string;
  medications?: {
    drugId: number;
    dosePerIntake: string;
    timesPerDay: number;
    totalDays: number;
    instructions?: string;
  }[];
  additionalMedications?: string;
  recommendedLabTestIds?: number[];
  additionalTests?: string;
}

export interface CheckupData {
  id: number;
  appointmentId: number;
  bloodPressure?: string;
  temperature?: string;
  heartRate?: string;
  bloodSugar?: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  insights?: string;
  isDraft: boolean;
  hasAudio?: boolean;
  prescription: {
    id: number;
    additionalMedications?: string;
    medications: {
      id: number;
      drug: {
        id: number;
        name: string;
        strength?: string;
        dosageForm?: string;
        formulaName?: string;
      };
      dosePerIntake: string;
      timesPerDay: number;
      totalDays: number;
      instructions?: string;
    }[];
  };
  checkupTestRecommendation: {
    id: number;
    additionalTests?: string;
    recommendedLabTests: {
      id: number;
      labTest: {
        id: number;
        name: string;
      };
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DOCTOR PROFILE & DASHBOARD APIs
// ============================================================================

/**
 * Get current doctor's profile
 */
export async function getDoctorProfile(): Promise<DoctorProfile> {
  const response = await api.get("/doctors/profile");
  return response.data;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get("/doctors/dashboard/stats");
  return response.data;
}

/**
 * Get upcoming appointments
 */
export async function getUpcomingAppointments(limit: number = 5): Promise<UpcomingAppointment[]> {
  try {
    const response = await api.get(`/doctors/dashboard/upcoming-appointments?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    // Return empty array if no appointments found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching upcoming appointments:", error);
    return [];
  }
}

/**
 * Get recent checkups
 */
export async function getRecentCheckups(limit: number = 5): Promise<RecentCheckup[]> {
  try {
    const response = await api.get(`/doctors/dashboard/recent-checkups?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    // Return empty array if no checkups found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching recent checkups:", error);
    return [];
  }
}

/**
 * Get all booked appointments with optional filter
 */
export async function getBookedAppointments(filter?: string): Promise<UpcomingAppointment[]> {
  try {
    const filterParam = filter ? `?filter=${filter}` : '';
    const response = await api.get(`/doctors/appointments/booked${filterParam}`);
    return response.data;
  } catch (error: any) {
    // Return empty array if no appointments found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching booked appointments:", error);
    return [];
  }
}

/**
 * Get ALL appointments without date filtering
 */
export async function getAllAppointments(): Promise<UpcomingAppointment[]> {
  try {
    const response = await api.get("/doctors/appointments/all");
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    // Return empty array if no appointments found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching all appointments:", error);
    return [];
  }
}

// ============================================================================
// SCHEDULE APIs
// ============================================================================

/**
 * Create a new schedule
 */
export async function createSchedule(data: CreateScheduleDto): Promise<Schedule> {
  const response = await api.post("/doctorschedules", data);
  return response.data;
}

/**
 * Get all schedules for current doctor
 */
export async function getSchedules(): Promise<Schedule[]> {
  try {
    const response = await api.get("/doctorschedules");
    return response.data;
  } catch (error: any) {
    // Return empty array if no schedules found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching schedules:", error);
    return [];
  }
}

/**
 * Get a specific schedule by ID
 */
export async function getScheduleById(scheduleId: number): Promise<Schedule> {
  const response = await api.get(`/doctorschedules/${scheduleId}`);
  return response.data;
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(scheduleId: number): Promise<void> {
  await api.delete(`/doctorschedules/${scheduleId}`);
}

/**
 * Toggle slot bookability (enable/disable slot for booking)
 */
export async function toggleSlotBookability(slotId: number): Promise<any> {
  const response = await api.patch(`/doctorschedules/slots/${slotId}/toggle-bookability`);
  return response.data;
}

// ============================================================================
// CHECKUP APIs
// ============================================================================

/**
 * Submit checkup with optional audio file
 */
export async function submitCheckup(data: CreateCheckupDto, audioBlob?: Blob | null): Promise<CheckupData> {
  const formData = new FormData();
  
  // Add all checkup data fields
  formData.append('appointmentId', String(data.appointmentId));
  formData.append('symptoms', data.symptoms || '');
  formData.append('diagnosis', data.diagnosis);
  if (data.bloodPressure) formData.append('bloodPressure', data.bloodPressure);
  if (data.temperature) formData.append('temperature', data.temperature);
  if (data.heartRate) formData.append('heartRate', data.heartRate);
  if (data.bloodSugar) formData.append('bloodSugar', data.bloodSugar);
  if (data.notes) formData.append('notes', data.notes);
  if (data.additionalMedications) formData.append('additionalMedications', data.additionalMedications);
  if (data.additionalTests) formData.append('additionalTests', data.additionalTests);
  
  // Add medications as JSON string - ALWAYS append, even if empty
  const medicationsJson = JSON.stringify(data.medications || []);
  formData.append('medications', medicationsJson);
  
  // Add lab test IDs as JSON string - ALWAYS append, even if empty
  const labTestsJson = JSON.stringify(data.recommendedLabTestIds || []);
  formData.append('recommendedLabTestIds', labTestsJson);
  
  // Add audio file if provided
  if (audioBlob) {
    formData.append('audio', audioBlob, 'recording.webm');
  }
  
  const response = await api.post("/checkups", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Save checkup as draft (no audio, doesn't complete appointment)
 */
export async function saveDraft(data: SaveDraftDto): Promise<CheckupData> {
  const response = await api.post("/checkups/draft", data);
  return response.data;
}

/**
 * Get checkup for a specific appointment (returns draft or completed)
 */
export async function getCheckupByAppointmentId(appointmentId: number): Promise<CheckupData | null> {
  try {
    const response = await api.get(`/checkups/appointment/${appointmentId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Create a new checkup (legacy - use submitCheckup instead)
 */
export async function createCheckup(data: CreateCheckupDto): Promise<any> {
  const response = await api.post("/checkups", data);
  return response.data;
}

/**
 * Get checkup history
 */
export async function getCheckupHistory(): Promise<RecentCheckup[]> {
  try {
    const response = await api.get("/checkups/history");
    return response.data;
  } catch (error: any) {
    // Return empty array if no checkup history found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching checkup history:", error);
    return [];
  }
}

/**
 * Get a specific checkup by ID
 */
export async function getCheckupById(checkupId: number): Promise<RecentCheckup> {
  const response = await api.get(`/checkups/${checkupId}`);
  return response.data;
}

// ============================================================================
// DRUGS & LAB TESTS APIs (Read-only for doctors)
// ============================================================================

/**
 * Get all active drugs
 */
export async function getDrugs(): Promise<Drug[]> {
  try {
    const response = await api.get("/drugs");
    return response.data;
  } catch (error: any) {
    // Return empty array if no drugs found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching drugs:", error);
    return [];
  }
}

/**
 * Get all active lab tests
 */
export async function getLabTests(): Promise<LabTest[]> {
  try {
    const response = await api.get("/labtests");
    return response.data;
  } catch (error: any) {
    // Return empty array if no lab tests found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching lab tests:", error);
    return [];
  }
}

/**
 * Get lab tests by department
 */
export async function getLabTestsByDepartment(departmentName: string): Promise<LabTest[]> {
  try {
    const response = await api.get(`/labtests/department/${departmentName}`);
    return response.data;
  } catch (error: any) {
    // Return empty array if no lab tests found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching lab tests by department:", error);
    return [];
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(appointmentId: number): Promise<void> {
  await api.patch(`/doctors/appointments/${appointmentId}/cancel`);
}

/**
 * Reschedule a single appointment to a new slot (within the same schedule)
 */
export async function rescheduleAppointment(
  appointmentId: number,
  targetSlotId: number,
): Promise<{ success: boolean; message: string; newSlot: { id: number; startTime: string; endTime: string } }> {
  const response = await api.patch(`/doctorschedules/appointments/${appointmentId}/reschedule`, {
    targetSlotId,
  });
  return response.data;
}

/**
 * Get available slots for a specific schedule
 */
export async function getAvailableSlotsForSchedule(
  scheduleId: number,
): Promise<{ id: number; scheduleId: number; startTime: string; endTime: string; isBookable: boolean; isBooked: boolean }[]> {
  const response = await api.get(`/doctorschedules/${scheduleId}/available-slots`);
  return response.data;
}

export interface MarkBusyResult {
  success: boolean;
  message: string;
  totalRescheduled: number;
  totalCancelled: number;
  totalSlotsBlocked: number;
  details: Array<{
    scheduleId: number;
    rescheduled: Array<{
      appointmentId: number;
      patientName: string;
      fromSlot: { startTime: string; endTime: string };
      toSlot: { startTime: string; endTime: string };
    }>;
    cancelled: Array<{
      appointmentId: number;
      patientName: string;
      slot: { startTime: string; endTime: string };
    }>;
    slotsBlocked: number;
  }>;
}

/**
 * Mark doctor as busy for an interval and auto-reschedule/cancel overlapping appointments
 */
export async function markBusyAndReschedule(
  busyFrom: string,
  busyTo: string,
): Promise<MarkBusyResult> {
  const response = await api.post(`/doctorschedules/mark-busy`, {
    busyFrom,
    busyTo,
  });
  return response.data;
}

// ============================================================================
// NEW DASHBOARD APIS - Enhanced Features
// ============================================================================

export interface TodaysAppointmentsSummary {
  upcoming: UpcomingAppointment[];
  completed: UpcomingAppointment[];
  missed: UpcomingAppointment[];
  cancelled: UpcomingAppointment[];
}

export interface WeeklyStats {
  patientsSeenThisWeek: number;
  pendingCheckups: number;
}

export interface RecentPatient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  cnic?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  medicalHistory?: string;
  familyHistory?: string;
  allergies?: string;
  lastAppointmentDate: string;
  totalAppointments: number;
}

export interface UpcomingScheduleItem {
  id: number;
  from: string;
  to: string;
  noOfSlots: number;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  unbookableSlots: number;
}

export interface PatientDetails {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  cnic?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  medicalHistory?: string;
  familyHistory?: string;
  allergies?: string;
  address?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  appointments: {
    id: number;
    date: string;
    reason?: string;
    status: string;
    checkup?: {
      diagnosis: string;
      symptoms?: string;
      bloodPressure?: string;
      temperature?: string;
      heartRate?: string;
      bloodSugar?: string;
      notes?: string;
      medications: {
        drugName: string;
        dosePerIntake: string;
        timesPerDay: number;
        totalDays: number;
        instructions?: string;
      }[];
      labTests: string[];
    };
  }[];
}

/**
 * Get today's appointments categorized (upcoming, completed, missed, cancelled)
 */
export async function getTodaysAppointments(): Promise<TodaysAppointmentsSummary> {
  try {
    const response = await api.get("/doctors/dashboard/todays-appointments");
    console.log('Fetched today\'s appointments successfully');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('404 - error on lib/api/doctor.ts line 675 (getTodayAppointments FUNCTION)');
      return { upcoming: [], completed: [], missed: [], cancelled: [] };
    }
    console.error("Error fetching today's appointments:", error);
    return { upcoming: [], completed: [], missed: [], cancelled: [] };
  }
}

/**
 * Get weekly statistics
 */
export async function getWeeklyStats(): Promise<WeeklyStats> {
  try {
    const response = await api.get("/doctors/dashboard/weekly-stats");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching weekly stats:", error);
    return { patientsSeenThisWeek: 0, pendingCheckups: 0 };
  }
}

/**
 * Get recent patients (up to 10, sorted by recency)
 */
export async function getRecentPatients(limit: number = 10): Promise<RecentPatient[]> {
  try {
    const response = await api.get(`/doctors/dashboard/recent-patients?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching recent patients:", error);
    return [];
  }
}

/**
 * Get upcoming schedule (today and tomorrow)
 */
export async function getUpcomingSchedule(): Promise<UpcomingScheduleItem[]> {
  try {
    const response = await api.get("/doctors/dashboard/upcoming-schedule");
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching upcoming schedule:", error);
    return [];
  }
}

/**
 * Get patient details (only accessible if doctor has treated them)
 */
export async function getPatientDetails(patientId: number): Promise<PatientDetails> {
  const response = await api.get(`/doctors/patients/${patientId}`);
  return response.data;
}
