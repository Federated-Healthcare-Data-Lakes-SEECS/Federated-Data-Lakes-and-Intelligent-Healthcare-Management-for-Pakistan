/**
 * Patient Portal API Service
 * All API calls for patient-related functionality
 */

import { api } from "./api";

// ============================================================================
// TYPES
// ============================================================================

export interface PatientProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  cnic: string;
  dateOfBirth: string;
  bloodGroup: string | null;
  medicalHistory: string | null;
  familyHistory: string | null;
  allergies: string | null;
  address: string | null;
  phoneNumber: string | null;
  emergencyContact: string | null;
  onboardingDone: boolean;
  onboardedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  upcomingAppointments: number;
  completedCheckups: number;
  pendingLabTests: number;
}

export interface DoctorInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  qualification: string;
  experience: number;
  departmentName: string;
}

export interface DoctorWithSlots extends DoctorInfo {
  userId: number;
  gender: string;
  departmentId: number;
  licenseNumber: string;
  availableSlotsCount: number;
  upcomingSlots: AppointmentSlot[];
}

export interface DoctorWithSlotsForDate extends Omit<DoctorWithSlots, 'upcomingSlots'> {
  slots: AppointmentSlot[];
}

export interface DoctorsByDateResponse {
  date: string;
  totalDoctors: number;
  doctors: DoctorWithSlotsForDate[];
}

export interface AppointmentSlot {
  id: number;
  scheduleId: number;
  startTime: string;
  endTime: string;
  isBookable: boolean;
  isBooked: boolean;
}

export interface DoctorSlotsResponse {
  doctor: DoctorInfo & {
    licenseNumber: string;
    departmentId: number;
  };
  slots: AppointmentSlot[];
}

export interface Appointment {
  id: number;
  reason: string;
  status: "BOOKED" | "COMPLETED" | "CANCELLED" | "NOT_ATTENDED";
  appointmentType: "online" | "walk-in";
  startTime: string;
  endTime: string;
  createdAt: string;
  doctor: DoctorInfo;
}

export interface BookAppointmentRequest {
  slotId: number;
  reason?: string;
}

export interface BookAppointmentResponse extends Appointment {
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AudioInfo {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transcription?: string;
  extractedInfo?: Record<string, any>;
  processedAt?: string;
  errorMessage?: string;
}

export interface Checkup {
  id: number;
  appointmentId: number;
  diagnosis: string | null;
  symptoms: string | null;
  bloodPressure: string | null;
  temperature: string | null;
  heartRate: string | null;
  bloodSugar: string | null;
  notes: string | null;
  gapAnalysis: string | null; // Gap analysis from AI
  additionalTests: string | null;
  additionalMedications: string | null;
  hasAudio?: boolean;
  audioInfo?: AudioInfo;
  createdAt: string;
  doctor: DoctorInfo;
  medications: Medication[];
  recommendedLabTests: LabTest[];
}

export interface Medication {
  id: number;
  drugId: number;
  dosePerIntake: string;
  timesPerDay: number;
  totalDays: number;
  instructions: string | null;
  drug: {
    id: number;
    name: string;
    description: string | null;
  };
}

export interface LabTest {
  id: number;
  name: string;
  description: string | null;
}

export interface UpdateProfileRequest {
  dateOfBirth?: string;
  bloodGroup?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  address?: string;
  allergies?: string;
  medicalHistory?: string;
  familyHistory?: string;
  onboardingDone?: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get patient profile
 */
export async function getPatientProfile(): Promise<PatientProfile> {
  const response = await api.get("/patients/profile");
  return response.data;
}

/**
 * Update patient profile
 */
export async function updatePatientProfile(
  data: UpdateProfileRequest
): Promise<PatientProfile> {
  const response = await api.patch("/patients/profile", data);
  return response.data;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get("/patients/dashboard/stats");
  return response.data;
}

/**
 * Get upcoming appointments for dashboard
 */
export async function getUpcomingAppointments(
  limit: number = 5
): Promise<Appointment[]> {
  try {
    const response = await api.get(
      `/patients/dashboard/upcoming-appointments?limit=${limit}`
    );
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
 * Get recent checkups for dashboard
 */
export async function getRecentCheckups(limit: number = 5): Promise<Checkup[]> {
  try {
    const response = await api.get(
      `/patients/dashboard/recent-checkups?limit=${limit}`
    );
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
 * Get all doctors with available slots
 */
export async function getAllDoctorsWithSlots(): Promise<DoctorWithSlots[]> {
  try {
    const response = await api.get("/appointment-slots/doctors-with-slots");
    return response.data;
  } catch (error: any) {
    // Return empty array if no doctors found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching doctors with slots:", error);
    return [];
  }
}

/**
 * Get doctors with available slots for a specific date
 * @param date - Date string in YYYY-MM-DD format
 * @param limit - Maximum number of slots per doctor (default: 8)
 */
export async function getDoctorsByDate(
  date: string,
  limit: number = 8
): Promise<DoctorsByDateResponse> {
  try {
    const response = await api.get("/appointment-slots/doctors-by-date", {
      params: { date, limit },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching doctors by date:", error);
    return {
      date,
      totalDoctors: 0,
      doctors: [],
    };
  }
}

/**
 * Get available slots for a specific doctor
 */
export async function getDoctorAvailableSlots(
  doctorId: number
): Promise<DoctorSlotsResponse> {
  const response = await api.get(`/appointment-slots/doctor/${doctorId}`);
  return response.data;
}

/**
 * Book an appointment
 */
export async function bookAppointment(
  data: BookAppointmentRequest
): Promise<BookAppointmentResponse> {
  const response = await api.post("/online-appointments/book", data);
  return response.data;
}

/**
 * Get my appointments
 * @param status - Filter by status: BOOKED, COMPLETED, CANCELLED, NOT_ATTENDED
 * @param timeFilter - Filter by time: upcoming, past, all
 */
export async function getMyAppointments(
  status?: string,
  timeFilter?: "upcoming" | "past" | "all"
): Promise<Appointment[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (timeFilter) params.append("timeFilter", timeFilter);

    const queryString = params.toString();
    const url = `/online-appointments/my-appointments${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    // Return empty array if no appointments found (404) or other errors
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching appointments:", error);
    return [];
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  appointmentId: number
): Promise<Appointment> {
  const response = await api.patch(
    `/online-appointments/${appointmentId}/cancel`
  );
  return response.data;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if an appointment can be cancelled (at least 1 hour before)
 */
export function canCancelAppointment(startTime: string): boolean {
  const appointmentTime = new Date(startTime);
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  return appointmentTime > oneHourFromNow;
}

/**
 * Format appointment time
 */
export function formatAppointmentTime(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Format appointment date
 */
export function formatAppointmentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PK', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Group slots by date
 */
export function groupSlotsByDate(
  slots: AppointmentSlot[]
): Record<string, AppointmentSlot[]> {
  const grouped: Record<string, AppointmentSlot[]> = {};
  
  slots.forEach((slot) => {
    const date = new Date(slot.startTime).toDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(slot);
  });
  
  return grouped;
}
