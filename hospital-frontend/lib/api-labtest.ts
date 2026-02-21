/**
 * Lab Test API Service
 * All API calls for lab test related functionality across portals
 */

import { api } from "./api";

// ============================================================================
// TYPES
// ============================================================================

export interface AvailableLabTest {
  id: number;
  name: string;
  description: string;
  departmentName: string;
  templateName: string;
}

export interface PatientLabTestSummary {
  id: number;
  labTestName: string;
  departmentName: string;
  status: PatientLabTestStatus;
  orderedAt: string;
  sampleCollectedAt: string | null;
  performedAt: string | null;
  resultsAddedAt: string | null;
  reviewedAt: string | null;
  labTechnicianName: string | null;
}

export interface PatientInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  cnic: string;
  phoneNumber: string;
}

export interface LabTestInfo {
  id: number;
  name: string;
  description: string;
  departmentName: string;
  templateId: number;
  templateName: string;
  formStructure: FormStructure | null;
}

export interface LabTechnicianInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  departmentName: string;
}

export interface PathologistInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  departmentName: string;
}

export interface PatientLabTest {
  id: number;
  status: PatientLabTestStatus;
  result: Record<string, any> | null;
  labTechnicianNotes: string | null;
  pathologistNotes: string | null;
  orderedAt: string;
  sampleCollectedAt: string | null;
  performedAt: string | null;
  resultsAddedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  patient: PatientInfo;
  labTest: LabTestInfo;
  labTechnician: LabTechnicianInfo | null;
  pathologist: PathologistInfo | null;
}

export interface OrderLabTestResponse {
  id: number;
  labTestName: string;
  departmentName: string;
  status: string;
  orderedAt: string;
  labTechnicianName: string;
  message: string;
}

export type PatientLabTestStatus =
  | "ORDERED"
  | "SAMPLE_COLLECTED"
  | "PERFORMED"
  | "RESULTS_ADDED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

// Form structure types for dynamic form rendering
export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "date";
  required?: boolean;
  options?: string[];
  unit?: string;
  min?: number;
  max?: number;
  normalRange?: string;
  placeholder?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export interface FormStructure {
  sections: FormSection[];
}

// ============================================================================
// PATIENT API FUNCTIONS
// ============================================================================

/**
 * Get available lab tests for ordering
 */
export async function getAvailableLabTests(): Promise<AvailableLabTest[]> {
  const response = await api.get("/patient-lab-tests/available");
  return response.data;
}

/**
 * Order a new lab test
 */
export async function orderLabTest(labTestId: number): Promise<OrderLabTestResponse> {
  const response = await api.post("/patient-lab-tests/order", { labTestId });
  return response.data;
}

/**
 * Get all my lab tests (patient)
 */
export async function getMyLabTests(): Promise<PatientLabTestSummary[]> {
  const response = await api.get("/patient-lab-tests/my-tests");
  return response.data;
}

/**
 * Get approved lab test results (patient)
 */
export async function getMyApprovedLabTests(): Promise<PatientLabTest[]> {
  const response = await api.get("/patient-lab-tests/my-tests/approved");
  return response.data;
}

/**
 * Get specific lab test details (patient)
 */
export async function getMyLabTestDetails(id: number): Promise<PatientLabTest> {
  const response = await api.get(`/patient-lab-tests/my-tests/${id}`);
  return response.data;
}

// ============================================================================
// LAB TECHNICIAN API FUNCTIONS
// ============================================================================

/**
 * Get all assigned lab tests (lab technician)
 */
export async function getAssignedLabTests(): Promise<PatientLabTest[]> {
  const response = await api.get("/patient-lab-tests/technician/assigned");
  return response.data;
}

/**
 * Get lab test details (lab technician)
 */
export async function getLabTestDetailsForTechnician(id: number): Promise<PatientLabTest> {
  const response = await api.get(`/patient-lab-tests/technician/${id}`);
  return response.data;
}

/**
 * Get available pathologists for a lab test
 */
export async function getAvailablePathologists(labTestId: number): Promise<PathologistInfo[]> {
  const response = await api.get(`/patient-lab-tests/technician/${labTestId}/pathologists`);
  return response.data;
}

/**
 * Collect sample (lab technician)
 */
export async function collectSample(id: number): Promise<PatientLabTest> {
  const response = await api.patch(`/patient-lab-tests/technician/${id}/collect-sample`);
  return response.data;
}

/**
 * Mark test as performed (lab technician)
 */
export async function markTestPerformed(id: number): Promise<PatientLabTest> {
  const response = await api.patch(`/patient-lab-tests/technician/${id}/mark-performed`);
  return response.data;
}

/**
 * Submit test results (lab technician)
 */
export async function submitLabTestResults(
  id: number,
  data: {
    result: Record<string, any>;
    labTechnicianNotes?: string;
    pathologistId: number;
  }
): Promise<PatientLabTest> {
  const response = await api.patch(`/patient-lab-tests/technician/${id}/submit-results`, data);
  return response.data;
}

// ============================================================================
// PATHOLOGIST API FUNCTIONS
// ============================================================================

/**
 * Get lab tests under review (pathologist)
 */
export async function getLabTestsForReview(): Promise<PatientLabTest[]> {
  const response = await api.get("/patient-lab-tests/pathologist/for-review");
  return response.data;
}

/**
 * Get reviewed lab tests history (pathologist)
 */
export async function getReviewedLabTests(): Promise<PatientLabTest[]> {
  const response = await api.get("/patient-lab-tests/pathologist/reviewed");
  return response.data;
}

/**
 * Get lab test details (pathologist)
 */
export async function getLabTestDetailsForPathologist(id: number): Promise<PatientLabTest> {
  const response = await api.get(`/patient-lab-tests/pathologist/${id}`);
  return response.data;
}

/**
 * Review (approve/reject) a lab test (pathologist)
 */
export async function reviewLabTest(
  id: number,
  data: {
    status: "APPROVED" | "REJECTED";
    pathologistNotes?: string;
  }
): Promise<PatientLabTest> {
  const response = await api.patch(`/patient-lab-tests/pathologist/${id}/review`, data);
  return response.data;
}

// ============================================================================
// RECEPTIONIST API FUNCTIONS
// ============================================================================

/**
 * Look up lab tests by patient ID (receptionist)
 */
export async function lookupLabTestsByPatient(patientId: number): Promise<PatientLabTest[]> {
  const response = await api.get(`/patient-lab-tests/lookup/patient/${patientId}`);
  return response.data;
}

/**
 * Look up a lab test by ID (receptionist)
 */
export async function lookupLabTestById(id: number): Promise<PatientLabTest> {
  const response = await api.get(`/patient-lab-tests/lookup/${id}`);
  return response.data;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status badge color
 */
export function getStatusColor(status: PatientLabTestStatus): string {
  switch (status) {
    case "ORDERED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "SAMPLE_COLLECTED":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "PERFORMED":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "RESULTS_ADDED":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "UNDER_REVIEW":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "APPROVED":
      return "bg-green-100 text-green-800 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: PatientLabTestStatus): string {
  switch (status) {
    case "ORDERED":
      return "Ordered";
    case "SAMPLE_COLLECTED":
      return "Sample Collected";
    case "PERFORMED":
      return "Test Performed";
    case "RESULTS_ADDED":
      return "Results Added";
    case "UNDER_REVIEW":
      return "Under Review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

/**
 * Format date for display
 */
export function formatLabTestDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
