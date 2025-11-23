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
  medications?: Medication[];
  additionalMedications?: string;
  recommendedLabTests?: { id: number; name: string }[];
  additionalTests?: string;
  createdAt: string;
  appointment: {
    slot: {
      startTime: string;
      endTime: string;
    };
    patient: {
      firstName: string;
      lastName: string;
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
 * Get all booked appointments
 */
export async function getBookedAppointments(): Promise<UpcomingAppointment[]> {
  try {
    const response = await api.get("/doctors/appointments/booked");
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
 * Create a new checkup
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
    const response = await api.get("/lab-tests");
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
    const response = await api.get(`/lab-tests/department/${departmentName}`);
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
