import {
  mockDepartments,
  mockDoctors,
  mockPatients,
  mockReceptionists,
  mockDrugs,
  mockStandardDepartments,
} from "./mock-data"
import type {
  Department,
  Doctor,
  Patient,
  Receptionist,
  Drug,
  StandardDepartment,
  DepartmentFormData,
  DoctorFormData,
  ReceptionistFormData,
  PatientFormData,
  DrugFormData,
} from "./types"

// Simulate API delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Department Service
export const departmentService = {
  async getAll(): Promise<Department[]> {
    await delay(500)
    return mockDepartments
  },

  async getById(id: number): Promise<Department | null> {
    await delay(300)
    return mockDepartments.find((dept) => dept.id === id) || null
  },

  async create(data: DepartmentFormData): Promise<Department> {
    await delay(800)
    const standardDept = mockStandardDepartments.find((sd) => sd.id === data.standardDepartmentId)!
    const newDepartment: Department = {
      id: Math.max(...mockDepartments.map((d) => d.id)) + 1,
      name: data.name,
      standardDepartmentId: data.standardDepartmentId,
      description: data.description,
      isActive: data.isActive,
      createdAt: new Date(),
      standardDepartment: standardDept,
    }
    mockDepartments.push(newDepartment)
    return newDepartment
  },

  async update(id: number, data: DepartmentFormData): Promise<Department> {
    await delay(800)
    const index = mockDepartments.findIndex((dept) => dept.id === id)
    if (index === -1) throw new Error("Department not found")

    const standardDept = mockStandardDepartments.find((sd) => sd.id === data.standardDepartmentId)!
    mockDepartments[index] = {
      ...mockDepartments[index],
      name: data.name,
      standardDepartmentId: data.standardDepartmentId,
      description: data.description,
      isActive: data.isActive,
      standardDepartment: standardDept,
    }
    return mockDepartments[index]
  },

  async delete(id: number): Promise<void> {
    await delay(500)
    const index = mockDepartments.findIndex((dept) => dept.id === id)
    if (index === -1) throw new Error("Department not found")
    mockDepartments.splice(index, 1)
  },
}

// Standard Department Service
export const standardDepartmentService = {
  async getAll(): Promise<StandardDepartment[]> {
    await delay(300)
    return mockStandardDepartments
  },
}

// Doctor Service
export const doctorService = {
  async getAll(): Promise<Doctor[]> {
    await delay(500)
    return mockDoctors
  },

  async getById(id: number): Promise<Doctor | null> {
    await delay(300)
    return mockDoctors.find((doctor) => doctor.id === id) || null
  },

  async create(data: DoctorFormData): Promise<Doctor> {
    await delay(800)
    // This would create a user first in a real implementation
    const newDoctor: Doctor = {
      id: Math.max(...mockDoctors.map((d) => d.id)) + 1,
      userId: Math.max(...mockDoctors.map((d) => d.userId)) + 1,
      departmentId: data.departmentId,
      licenseNumber: data.licenseNumber,
      specialization: data.specialization,
      experience: data.experience,
      qualification: data.qualification,
      createdAt: new Date(),
      user: {
        id: Math.max(...mockDoctors.map((d) => d.userId)) + 1,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: "hashed_password",
        gender: data.gender,
        cnic: data.cnic,
        createdAt: new Date(),
        registeredAt: new Date(),
        isActive: true,
      },
      department: mockDepartments.find((d) => d.id === data.departmentId)!,
    }
    mockDoctors.push(newDoctor)
    return newDoctor
  },

  async update(id: number, data: DoctorFormData): Promise<Doctor> {
    await delay(800)
    const index = mockDoctors.findIndex((doctor) => doctor.id === id)
    if (index === -1) throw new Error("Doctor not found")

    mockDoctors[index] = {
      ...mockDoctors[index],
      departmentId: data.departmentId,
      licenseNumber: data.licenseNumber,
      specialization: data.specialization,
      experience: data.experience,
      qualification: data.qualification,
      user: {
        ...mockDoctors[index].user,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        gender: data.gender,
        cnic: data.cnic,
      },
      department: mockDepartments.find((d) => d.id === data.departmentId)!,
    }
    return mockDoctors[index]
  },

  async delete(id: number): Promise<void> {
    await delay(500)
    const index = mockDoctors.findIndex((doctor) => doctor.id === id)
    if (index === -1) throw new Error("Doctor not found")
    mockDoctors.splice(index, 1)
  },
}

// Patient Service
export const patientService = {
  async getAll(): Promise<Patient[]> {
    await delay(500)
    return mockPatients
  },

  async getById(id: number): Promise<Patient | null> {
    await delay(300)
    return mockPatients.find((patient) => patient.id === id) || null
  },

  async create(data: PatientFormData): Promise<Patient> {
    await delay(800)
    const newPatient: Patient = {
      id: Math.max(...mockPatients.map((p) => p.id)) + 1,
      userId: Math.max(...mockPatients.map((p) => p.userId)) + 1,
      dateOfBirth: data.dateOfBirth,
      bloodGroup: data.bloodGroup,
      address: data.address,
      phoneNumber: data.phoneNumber,
      emergencyContact: data.emergencyContact,
      medicalHistory: data.medicalHistory,
      familyHistory: data.familyHistory,
      allergies: data.allergies,
      createdBy: 1, // Admin user
      user: {
        id: Math.max(...mockPatients.map((p) => p.userId)) + 1,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: "hashed_password",
        gender: data.gender,
        cnic: data.cnic,
        createdAt: new Date(),
        registeredAt: new Date(),
        isActive: true,
      },
    }
    mockPatients.push(newPatient)
    return newPatient
  },

  async update(id: number, data: PatientFormData): Promise<Patient> {
    await delay(800)
    const index = mockPatients.findIndex((patient) => patient.id === id)
    if (index === -1) throw new Error("Patient not found")

    mockPatients[index] = {
      ...mockPatients[index],
      dateOfBirth: data.dateOfBirth,
      bloodGroup: data.bloodGroup,
      address: data.address,
      phoneNumber: data.phoneNumber,
      emergencyContact: data.emergencyContact,
      medicalHistory: data.medicalHistory,
      familyHistory: data.familyHistory,
      allergies: data.allergies,
      user: {
        ...mockPatients[index].user,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        gender: data.gender,
        cnic: data.cnic,
      },
    }
    return mockPatients[index]
  },

  async delete(id: number): Promise<void> {
    await delay(500)
    const index = mockPatients.findIndex((patient) => patient.id === id)
    if (index === -1) throw new Error("Patient not found")
    mockPatients.splice(index, 1)
  },
}

// Receptionist Service
export const receptionistService = {
  async getAll(): Promise<Receptionist[]> {
    await delay(500)
    return mockReceptionists
  },

  async getById(id: number): Promise<Receptionist | null> {
    await delay(300)
    return mockReceptionists.find((receptionist) => receptionist.id === id) || null
  },

  async create(data: ReceptionistFormData): Promise<Receptionist> {
    await delay(800)
    const newReceptionist: Receptionist = {
      id: Math.max(...mockReceptionists.map((r) => r.id)) + 1,
      userId: Math.max(...mockReceptionists.map((r) => r.userId)) + 1,
      phoneNumber: data.phoneNumber,
      createdAt: new Date(),
      user: {
        id: Math.max(...mockReceptionists.map((r) => r.userId)) + 1,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: "hashed_password",
        gender: data.gender,
        cnic: data.cnic,
        createdAt: new Date(),
        registeredAt: new Date(),
        isActive: true,
      },
    }
    mockReceptionists.push(newReceptionist)
    return newReceptionist
  },

  async update(id: number, data: ReceptionistFormData): Promise<Receptionist> {
    await delay(800)
    const index = mockReceptionists.findIndex((receptionist) => receptionist.id === id)
    if (index === -1) throw new Error("Receptionist not found")

    mockReceptionists[index] = {
      ...mockReceptionists[index],
      phoneNumber: data.phoneNumber,
      user: {
        ...mockReceptionists[index].user,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        gender: data.gender,
        cnic: data.cnic,
      },
    }
    return mockReceptionists[index]
  },

  async delete(id: number): Promise<void> {
    await delay(500)
    const index = mockReceptionists.findIndex((receptionist) => receptionist.id === id)
    if (index === -1) throw new Error("Receptionist not found")
    mockReceptionists.splice(index, 1)
  },
}

// Drug Service
export const drugService = {
  async getAll(): Promise<Drug[]> {
    await delay(500)
    return mockDrugs
  },

  async getById(id: number): Promise<Drug | null> {
    await delay(300)
    return mockDrugs.find((drug) => drug.id === id) || null
  },

  async create(data: DrugFormData): Promise<Drug> {
    await delay(800)
    const newDrug: Drug = {
      id: Math.max(...mockDrugs.map((d) => d.id)) + 1,
      name: data.name,
      formulaName: data.formulaName,
      chemicalFormula: data.chemicalFormula,
      strength: data.strength,
      dosageForm: data.dosageForm,
      description: data.description,
      supplier: data.supplier,
      isActive: data.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 1, // Admin user
    }
    mockDrugs.push(newDrug)
    return newDrug
  },

  async update(id: number, data: DrugFormData): Promise<Drug> {
    await delay(800)
    const index = mockDrugs.findIndex((drug) => drug.id === id)
    if (index === -1) throw new Error("Drug not found")

    mockDrugs[index] = {
      ...mockDrugs[index],
      name: data.name,
      formulaName: data.formulaName,
      chemicalFormula: data.chemicalFormula,
      strength: data.strength,
      dosageForm: data.dosageForm,
      description: data.description,
      supplier: data.supplier,
      isActive: data.isActive,
      updatedAt: new Date(),
    }
    return mockDrugs[index]
  },

  async delete(id: number): Promise<void> {
    await delay(500)
    const index = mockDrugs.findIndex((drug) => drug.id === id)
    if (index === -1) throw new Error("Drug not found")
    mockDrugs.splice(index, 1)
  },
}
