/**
 * Receptionist Portal API Service
 * All API calls for receptionist-related functionality
 */

import { api } from "./api";

// ============================================================================
// TYPES
// ============================================================================

export interface ReceptionistProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  cnic: string;
  phoneNumber: string | null;
  experience: number;
  qualification: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  todayAppointments: number;
  totalAppointments: number;
  upcomingAppointments: number;
  patientsRegisteredToday: number;
}

export interface Patient {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  cnic: string;
  dateOfBirth: string | null;
  bloodGroup: string | null;
  phoneNumber: string | null;
  address: string | null;
  emergencyContact: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  familyHistory: string | null;
  onboardingDone: boolean;
  createdAt: string;
}

export interface RegisterPatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  cnic: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  allergies?: string;
  medicalHistory?: string;
  familyHistory?: string;
}

export interface RegisterPatientResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  patient: Patient;
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

export interface AppointmentSlot {
  id: number;
  scheduleId: number;
  startTime: string;
  endTime: string;
  isBookable: boolean;
  isBooked: boolean;
}

export interface DoctorWithSlots extends DoctorInfo {
  userId: number;
  gender: string;
  departmentId: number;
  licenseNumber: string;
  availableSlotsCount: number;
  upcomingSlots: AppointmentSlot[];
}

export interface BookWalkinAppointmentRequest {
  patientId: number;
  slotId: number;
  reason?: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  slotId: number;
  reason: string | null;
  status: "BOOKED" | "COMPLETED" | "NOT_ATTENDED";
  appointmentType: "walk-in";
  startTime: string;
  endTime: string;
  createdAt: string;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
  doctor: DoctorInfo;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get receptionist profile
 */
export async function getReceptionistProfile(): Promise<ReceptionistProfile> {
  const response = await api.get("/receptionists/profile/me");
  return response.data;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get("/receptionists/dashboard/stats");
  return response.data;
}

/**
 * Register a new patient
 */
export async function registerPatient(
  data: RegisterPatientRequest
): Promise<RegisterPatientResponse> {
  const response = await api.post("/receptionists/patients/register", data);
  return response.data;
}

/**
 * Search patients by name, email, or CNIC
 */
export async function searchPatients(searchTerm: string): Promise<Patient[]> {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }
    const response = await api.get(
      `/receptionists/patients/search?q=${encodeURIComponent(searchTerm.trim())}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error searching patients:", error);
    return [];
  }
}

/**
 * Get patient details by ID
 */
export async function getPatientById(patientId: number): Promise<Patient> {
  const response = await api.get(`/receptionists/patients/${patientId}`);
  return response.data;
}

/**
 * Get all doctors with available slots
 */
export async function getAllDoctorsWithSlots(): Promise<DoctorWithSlots[]> {
  try {
    const response = await api.get("/appointment-slots/doctors-with-slots");
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching doctors with slots:", error);
    return [];
  }
}

/**
 * Book a walk-in appointment
 */
export async function bookWalkinAppointment(
  data: BookWalkinAppointmentRequest
): Promise<Appointment> {
  const response = await api.post("/receptionists/appointments/book-walkin", data);
  return response.data;
}

/**
 * Get my appointments (appointments booked by this receptionist)
 * @param status - Filter by status: BOOKED, COMPLETED, NOT_ATTENDED, all
 * @param timeFilter - Filter by time: upcoming, past, all
 * @param patientSearch - Search by patient name
 */
export async function getMyAppointments(
  status?: string,
  timeFilter?: "upcoming" | "past" | "all",
  patientSearch?: string
): Promise<Appointment[]> {
  try {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (timeFilter) params.append("timeFilter", timeFilter);
    if (patientSearch && patientSearch.trim()) {
      params.append("patientSearch", patientSearch.trim());
    }

    const queryString = params.toString();
    const url = `/receptionists/appointments/my-appointments${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching appointments:", error);
    return [];
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
  return date.toLocaleDateString('en-US', {
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

/**
 * Validate CNIC format (e.g., 12345-1234567-1)
 */
export function validateCNIC(cnic: string): boolean {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  return cnicRegex.test(cnic);
}

/**
 * Format CNIC as user types (add dashes automatically)
 */
export function formatCNIC(value: string): string {
  // Remove all non-digits
  const digitsOnly = value.replace(/\D/g, '');
  
  // Add dashes at appropriate positions
  if (digitsOnly.length <= 5) {
    return digitsOnly;
  } else if (digitsOnly.length <= 12) {
    return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`;
  } else {
    return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12, 13)}`;
  }
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
