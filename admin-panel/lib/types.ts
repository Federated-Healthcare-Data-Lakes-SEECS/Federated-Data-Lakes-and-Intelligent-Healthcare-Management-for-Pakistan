// Core types based on Prisma schema
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  password: string
  gender: Gender
  cnic: string
  createdAt: Date
  registeredAt: Date
  isActive: boolean
}

export interface Role {
  id: number
  name: string
  description?: string
  createdAt: Date
}

export interface UserRole {
  id: number
  userId: number
  roleId: number
  user: User
  role: Role
}

export interface StandardDepartment {
  id: number
  name: string
  code: string
}

export interface Department {
  id: number
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  code: string
}

export interface Doctor {
  id: number
  firstName: string
  lastName: string
  email: string
  gender: string
  cnic: string
  licenseNumber: string
  specialization: string
  experience: number
  qualification: string
  createdAt: Date
  departmentName: string
  isActive: boolean
}

export interface Patient {
  id: number
  firstName: string
  lastName: string
  email: string
  gender: Gender
  cnic: string
  isActive: boolean
  dateOfBirth?: Date | null
  bloodGroup?: string | null
  medicalHistory?: string | null
  familyHistory?: string | null
  allergies?: string | null
  address?: string | null
  phoneNumber?: string | null
  emergencyContact?: string | null
  onboardingDone: boolean
  createdAt: Date
}

export interface Receptionist {
  id: number
  firstName: string
  lastName: string
  email: string
  cnic: string
  gender: Gender
  phoneNumber?: string
  isActive: boolean
  createdAt: Date
}

export interface LabTechnician {
  id: number
  firstName: string
  lastName: string
  email: string
  cnic: string
  gender: Gender
  phoneNumber?: string
  createdAt: Date
}

export interface Drug {
  id: number
  name: string
  formulaName: string
  chemicalFormula: string
  strength: string
  dosageForm: string
  description: string
  supplier: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // createdBy?: number
  // createdByUser?: User
}

export interface LabTest {
  id: number
  name: string
  description: string
  departmentName: string
  templateId: number
  templateName?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Form types for CRUD operations
export interface DepartmentFormData {
  name: string
  description?: string
  code: string
}

export interface DoctorFormData {
  firstName: string
  lastName: string
  email: string
  gender: Gender
  cnic: string
  departmentName: string
  licenseNumber: string
  specialization: string
  experience: number
  qualification: string
}

export interface ReceptionistFormData {
  firstName: string
  lastName: string
  email: string
  gender: Gender
  cnic: string
  phoneNumber?: string
}

export interface PatientFormData {
  firstName: string
  lastName: string
  email: string
  gender: Gender
  cnic: string
  // dateOfBirth?: Date
  // bloodGroup: string
  // address: string
  // phoneNumber: string
  // emergencyContact: string
  // medicalHistory: string
  // familyHistory: string
  // allergies: string
}

export interface DrugFormData {
  name: string
  formulaName: string
  chemicalFormula: string
  strength: string
  dosageForm: string
  description: string
  supplier: string
  isActive: boolean
}

export interface LabTestFormData {
  name: string
  description: string
  departmentName: string
  templateId: number
}

export interface LabTestTemplate {
  id: number
  name: string
  description?: string
  version: string
  formStructure: string // JSON string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
