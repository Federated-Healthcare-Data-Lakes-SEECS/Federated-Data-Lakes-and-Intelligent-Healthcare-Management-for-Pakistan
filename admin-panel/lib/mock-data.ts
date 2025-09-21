import {
  type User,
  type StandardDepartment,
  type Department,
  type Doctor,
  type Patient,
  type Receptionist,
  type Drug,
  Gender,
} from "./types"

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@hospital.com",
    password: "hashed_password",
    gender: Gender.MALE,
    cnic: "12345-6789012-3",
    createdAt: new Date("2024-01-15"),
    registeredAt: new Date("2024-01-15"),
    isActive: true,
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@hospital.com",
    password: "hashed_password",
    gender: Gender.FEMALE,
    cnic: "12345-6789012-4",
    createdAt: new Date("2024-01-20"),
    registeredAt: new Date("2024-01-20"),
    isActive: true,
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@hospital.com",
    password: "hashed_password",
    gender: Gender.MALE,
    cnic: "12345-6789012-5",
    createdAt: new Date("2024-02-01"),
    registeredAt: new Date("2024-02-01"),
    isActive: true,
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@hospital.com",
    password: "hashed_password",
    gender: Gender.FEMALE,
    cnic: "12345-6789012-6",
    createdAt: new Date("2024-02-10"),
    registeredAt: new Date("2024-02-10"),
    isActive: true,
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@hospital.com",
    password: "hashed_password",
    gender: Gender.MALE,
    cnic: "12345-6789012-7",
    createdAt: new Date("2024-02-15"),
    registeredAt: new Date("2024-02-15"),
    isActive: true,
  },
]

// Mock Standard Departments
export const mockStandardDepartments: StandardDepartment[] = [
  {
    id: 1,
    name: "Cardiology",
    description: "Heart and cardiovascular system",
    code: "CARD",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    name: "Neurology",
    description: "Brain and nervous system",
    code: "NEUR",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 3,
    name: "Orthopedics",
    description: "Bones, joints, and muscles",
    code: "ORTH",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 4,
    name: "Pediatrics",
    description: "Children's healthcare",
    code: "PEDI",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 5,
    name: "Emergency Medicine",
    description: "Emergency and trauma care",
    code: "EMER",
    createdAt: new Date("2024-01-01"),
  },
]

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: 1,
    name: "Cardiology Department",
    standardDepartmentId: 1,
    description: "Comprehensive cardiac care and treatment",
    isActive: true,
    createdAt: new Date("2024-01-05"),
    standardDepartment: mockStandardDepartments[0],
  },
  {
    id: 2,
    name: "Neurology Department",
    standardDepartmentId: 2,
    description: "Neurological disorders and brain health",
    isActive: true,
    createdAt: new Date("2024-01-05"),
    standardDepartment: mockStandardDepartments[1],
  },
  {
    id: 3,
    name: "Orthopedics Department",
    standardDepartmentId: 3,
    description: "Bone and joint specialists",
    isActive: true,
    createdAt: new Date("2024-01-05"),
    standardDepartment: mockStandardDepartments[2],
  },
  {
    id: 4,
    name: "Pediatrics Department",
    standardDepartmentId: 4,
    description: "Specialized care for children",
    isActive: true,
    createdAt: new Date("2024-01-05"),
    standardDepartment: mockStandardDepartments[3],
  },
  {
    id: 5,
    name: "Emergency Department",
    standardDepartmentId: 5,
    description: "24/7 emergency medical services",
    isActive: true,
    createdAt: new Date("2024-01-05"),
    standardDepartment: mockStandardDepartments[4],
  },
]

// Mock Doctors
export const mockDoctors: Doctor[] = [
  {
    id: 1,
    userId: 1,
    departmentId: 1,
    licenseNumber: "MD-001-2024",
    specialization: "Interventional Cardiology",
    experience: 15,
    qualification: "MBBS, MD Cardiology",
    createdAt: new Date("2024-01-15"),
    user: mockUsers[0],
    department: mockDepartments[0],
  },
  {
    id: 2,
    userId: 2,
    departmentId: 2,
    licenseNumber: "MD-002-2024",
    specialization: "Neurological Surgery",
    experience: 12,
    qualification: "MBBS, MS Neurosurgery",
    createdAt: new Date("2024-01-20"),
    user: mockUsers[1],
    department: mockDepartments[1],
  },
  {
    id: 3,
    userId: 3,
    departmentId: 3,
    licenseNumber: "MD-003-2024",
    specialization: "Joint Replacement",
    experience: 10,
    qualification: "MBBS, MS Orthopedics",
    createdAt: new Date("2024-02-01"),
    user: mockUsers[2],
    department: mockDepartments[2],
  },
]

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: 1,
    userId: 4,
    dateOfBirth: new Date("1985-05-15"),
    bloodGroup: "A+",
    address: "123 Main Street, City Center",
    phoneNumber: "0300-1234567",
    emergencyContact: "0300-7654321",
    medicalHistory: "Hypertension, Diabetes Type 2",
    familyHistory: "Family history of heart disease",
    allergies: "Penicillin, Shellfish",
    createdBy: 1,
    user: mockUsers[3],
    creator: mockUsers[0],
  },
  {
    id: 2,
    userId: 5,
    dateOfBirth: new Date("1990-08-22"),
    bloodGroup: "B+",
    address: "456 Oak Avenue, Downtown",
    phoneNumber: "0300-2345678",
    emergencyContact: "0300-8765432",
    medicalHistory: "Asthma, Seasonal allergies",
    familyHistory: "No significant family history",
    allergies: "Dust, Pollen",
    createdBy: 1,
    user: mockUsers[4],
    creator: mockUsers[0],
  },
]

// Mock Receptionists
export const mockReceptionists: Receptionist[] = [
  {
    id: 1,
    userId: 1,
    phoneNumber: "0300-1111111",
    createdAt: new Date("2024-01-15"),
    user: mockUsers[0],
  },
]

// Mock Drugs
export const mockDrugs: Drug[] = [
  {
    id: 1,
    name: "Aspirin",
    formulaName: "Acetylsalicylic Acid",
    chemicalFormula: "C9H8O4",
    strength: "75mg",
    dosageForm: "Tablet",
    description: "Pain reliever and blood thinner",
    supplier: "PharmaCorp Ltd",
    isActive: true,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    createdBy: 1,
    createdByUser: mockUsers[0],
  },
  {
    id: 2,
    name: "Metformin",
    formulaName: "Metformin Hydrochloride",
    chemicalFormula: "C4H11N5·HCl",
    strength: "500mg",
    dosageForm: "Tablet",
    description: "Diabetes medication for blood sugar control",
    supplier: "MediSupply Inc",
    isActive: true,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
    createdBy: 1,
    createdByUser: mockUsers[0],
  },
  {
    id: 3,
    name: "Lisinopril",
    formulaName: "Lisinopril",
    chemicalFormula: "C21H31N3O5",
    strength: "10mg",
    dosageForm: "Tablet",
    description: "ACE inhibitor for blood pressure control",
    supplier: "CardioMeds Ltd",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    createdBy: 1,
    createdByUser: mockUsers[0],
  },
  {
    id: 4,
    name: "Amoxicillin",
    formulaName: "Amoxicillin Trihydrate",
    chemicalFormula: "C16H19N3O5S·3H2O",
    strength: "250mg",
    dosageForm: "Capsule",
    description: "Antibiotic for bacterial infections",
    supplier: "AntiBio Pharma",
    isActive: true,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
    createdBy: 1,
    createdByUser: mockUsers[0],
  },
  {
    id: 5,
    name: "Ibuprofen",
    formulaName: "Ibuprofen",
    chemicalFormula: "C13H18O2",
    strength: "400mg",
    dosageForm: "Tablet",
    description: "Anti-inflammatory pain reliever",
    supplier: "PainRelief Corp",
    isActive: true,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    createdBy: 1,
    createdByUser: mockUsers[0],
  },
]

// Helper functions for data manipulation
export const getDepartmentById = (id: number): Department | undefined => {
  return mockDepartments.find((dept) => dept.id === id)
}

export const getDoctorsByDepartment = (departmentId: number): Doctor[] => {
  return mockDoctors.filter((doctor) => doctor.departmentId === departmentId)
}

export const getActiveUsers = (): User[] => {
  return mockUsers.filter((user) => user.isActive)
}

export const getActiveDrugs = (): Drug[] => {
  return mockDrugs.filter((drug) => drug.isActive)
}

export const getActiveDepartments = (): Department[] => {
  return mockDepartments.filter((dept) => dept.isActive)
}
