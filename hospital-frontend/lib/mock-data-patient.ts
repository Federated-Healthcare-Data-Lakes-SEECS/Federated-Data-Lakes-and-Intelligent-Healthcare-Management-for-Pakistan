/**
 * Mock Data for Patient Portal
 * This data simulates API responses for patient features
 */

// Patient Profile
export const mockPatientProfile = {
  id: 1,
  firstName: "Sarah",
  lastName: "Ahmed",
  email: "sarah.ahmed@example.com",
  gender: "FEMALE",
  cnic: "12345-1234567-1",
  dateOfBirth: "1995-05-15T00:00:00.000Z",
  bloodGroup: "A+",
  phoneNumber: "+923001234567",
  address: "123 Main Street, Karachi",
  emergencyContact: "+923009876543",
  medicalHistory: "No major illnesses. Previous surgery for appendicitis in 2018.",
  familyHistory: "Father has diabetes. Mother has hypertension.",
  allergies: "Penicillin, Pollen",
  createdAt: "2024-01-15T10:00:00.000Z",
};

// Available Doctors
export const mockDoctors = [
  {
    id: 1,
    firstName: "Dr. Ahmed",
    lastName: "Khan",
    specialization: "Cardiology",
    qualification: "MBBS, MD Cardiology",
    experience: 10,
    departmentName: "Cardiology Department",
    licenseNumber: "DOC-2024-001",
  },
  {
    id: 2,
    firstName: "Dr. Fatima",
    lastName: "Ali",
    specialization: "Neurology",
    qualification: "MBBS, MD Neurology",
    experience: 8,
    departmentName: "Neurology Department",
    licenseNumber: "DOC-2024-002",
  },
  {
    id: 3,
    firstName: "Dr. Hassan",
    lastName: "Malik",
    specialization: "General Medicine",
    qualification: "MBBS, FCPS Medicine",
    experience: 15,
    departmentName: "General Medicine Department",
    licenseNumber: "DOC-2024-003",
  },
  {
    id: 4,
    firstName: "Dr. Aisha",
    lastName: "Rahman",
    specialization: "Pediatrics",
    qualification: "MBBS, DCH, FCPS Pediatrics",
    experience: 12,
    departmentName: "Pediatrics Department",
    licenseNumber: "DOC-2024-004",
  },
];

// Available Appointment Slots
export const mockAvailableSlots = [
  // Today
  {
    id: 1,
    doctorId: 1,
    doctorName: "Dr. Ahmed Khan",
    specialization: "Cardiology",
    scheduleId: 1,
    startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    isBookable: true,
    isBooked: false,
  },
  {
    id: 2,
    doctorId: 1,
    doctorName: "Dr. Ahmed Khan",
    specialization: "Cardiology",
    scheduleId: 1,
    startTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
    isBookable: true,
    isBooked: false,
  },
  // Tomorrow
  {
    id: 3,
    doctorId: 2,
    doctorName: "Dr. Fatima Ali",
    specialization: "Neurology",
    scheduleId: 2,
    startTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(),
    isBookable: true,
    isBooked: false,
  },
  {
    id: 4,
    doctorId: 2,
    doctorName: "Dr. Fatima Ali",
    specialization: "Neurology",
    scheduleId: 2,
    startTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date(Date.now() + 86400000).setHours(12, 0, 0, 0)).toISOString(),
    isBookable: true,
    isBooked: false,
  },
  {
    id: 5,
    doctorId: 3,
    doctorName: "Dr. Hassan Malik",
    specialization: "General Medicine",
    scheduleId: 3,
    startTime: new Date(new Date(Date.now() + 86400000).setHours(9, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(),
    isBookable: true,
    isBooked: false,
  },
  // Day after tomorrow
  {
    id: 6,
    doctorId: 4,
    doctorName: "Dr. Aisha Rahman",
    specialization: "Pediatrics",
    scheduleId: 4,
    startTime: new Date(new Date(Date.now() + 172800000).setHours(14, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date(Date.now() + 172800000).setHours(15, 0, 0, 0)).toISOString(),
    isBookable: true,
    isBooked: false,
  },
];

// My Appointments (Booked)
export const mockMyAppointments = [
  {
    id: 1,
    slotId: 1,
    scheduleId: 1,
    patientId: 1,
    startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    reason: "Regular checkup for heart condition",
    status: "confirmed",
    doctor: {
      id: 1,
      firstName: "Dr. Ahmed",
      lastName: "Khan",
      specialization: "Cardiology",
      departmentName: "Cardiology Department",
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 2,
    slotId: 3,
    scheduleId: 2,
    patientId: 1,
    startTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(),
    reason: "Follow-up consultation for headaches",
    status: "confirmed",
    doctor: {
      id: 2,
      firstName: "Dr. Fatima",
      lastName: "Ali",
      specialization: "Neurology",
      departmentName: "Neurology Department",
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// My Checkup History
export const mockPatientCheckups = [
  {
    id: 1,
    appointmentId: 100,
    diagnosis: "Mild hypertension detected. Blood pressure slightly elevated. Recommended lifestyle modifications and regular monitoring.",
    symptoms: "Occasional headaches, fatigue, mild dizziness",
    bloodPressure: "140/90",
    temperature: "98.6",
    heartRate: "78",
    bloodSugar: "110",
    notes: "Patient advised to reduce salt intake, exercise regularly, and monitor blood pressure at home. Follow-up in 4 weeks.",
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    doctor: {
      firstName: "Dr. Ahmed",
      lastName: "Khan",
      specialization: "Cardiology",
    },
    appointment: {
      startTime: new Date(Date.now() - 604800000).toISOString(),
      reason: "Routine checkup",
    },
    medications: [
      {
        drugId: 1,
        drug: {
          id: 1,
          name: "Amlodipine",
          formulaName: "Amlodipine Besylate",
          strength: "5mg",
          dosageForm: "Tablet",
        },
        dosePerIntake: "5mg",
        timesPerDay: 1,
        totalDays: 30,
        instructions: "Take once daily in the morning with water",
      },
    ],
    recommendedLabTests: [
      {
        id: 1,
        name: "Lipid Profile",
        description: "Complete cholesterol test",
      },
      {
        id: 2,
        name: "ECG",
        description: "Electrocardiogram",
      },
    ],
    additionalTests: "Consider stress test if symptoms persist",
  },
  {
    id: 2,
    appointmentId: 99,
    diagnosis: "Common viral infection (upper respiratory tract infection). Symptoms should resolve within 5-7 days with proper rest and hydration.",
    symptoms: "Sore throat, runny nose, mild fever, body aches",
    bloodPressure: "120/80",
    temperature: "99.2",
    heartRate: "82",
    bloodSugar: "95",
    notes: "Patient advised complete rest, plenty of fluids, and over-the-counter pain relievers as needed.",
    createdAt: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
    doctor: {
      firstName: "Dr. Hassan",
      lastName: "Malik",
      specialization: "General Medicine",
    },
    appointment: {
      startTime: new Date(Date.now() - 1209600000).toISOString(),
      reason: "Flu symptoms",
    },
    medications: [
      {
        drugId: 2,
        drug: {
          id: 2,
          name: "Paracetamol",
          formulaName: "Acetaminophen",
          strength: "500mg",
          dosageForm: "Tablet",
        },
        dosePerIntake: "500mg",
        timesPerDay: 3,
        totalDays: 5,
        instructions: "Take after meals. Do not exceed 3 grams per day",
      },
      {
        drugId: 3,
        drug: {
          id: 3,
          name: "Cetirizine",
          formulaName: "Cetirizine HCl",
          strength: "10mg",
          dosageForm: "Tablet",
        },
        dosePerIntake: "10mg",
        timesPerDay: 1,
        totalDays: 5,
        instructions: "Take at bedtime",
      },
    ],
    recommendedLabTests: [],
  },
  {
    id: 3,
    appointmentId: 98,
    diagnosis: "Migraine headache. No signs of serious neurological issues. Triggered by stress and lack of sleep.",
    symptoms: "Severe throbbing headache, sensitivity to light, nausea",
    bloodPressure: "118/75",
    temperature: "98.4",
    heartRate: "72",
    bloodSugar: "92",
    notes: "Patient counseled on stress management techniques and importance of regular sleep schedule. Prescribed preventive medication.",
    createdAt: new Date(Date.now() - 2592000000).toISOString(), // 1 month ago
    doctor: {
      firstName: "Dr. Fatima",
      lastName: "Ali",
      specialization: "Neurology",
    },
    appointment: {
      startTime: new Date(Date.now() - 2592000000).toISOString(),
      reason: "Persistent headaches",
    },
    medications: [
      {
        drugId: 4,
        drug: {
          id: 4,
          name: "Sumatriptan",
          formulaName: "Sumatriptan Succinate",
          strength: "50mg",
          dosageForm: "Tablet",
        },
        dosePerIntake: "50mg",
        timesPerDay: 1,
        totalDays: 10,
        instructions: "Take at onset of migraine symptoms. Maximum 2 doses per day",
      },
    ],
    recommendedLabTests: [
      {
        id: 3,
        name: "Brain MRI",
        description: "Magnetic Resonance Imaging of brain",
      },
    ],
    additionalTests: "MRI only if symptoms worsen or change pattern",
  },
];

// Departments
export const mockDepartments = [
  { id: 1, name: "Cardiology", code: "CARD" },
  { id: 2, name: "Neurology", code: "NEUR" },
  { id: 3, name: "Orthopedics", code: "ORTH" },
  { id: 4, name: "Pediatrics", code: "PEDI" },
  { id: 5, name: "Gynecology", code: "GYNE" },
  { id: 6, name: "General Medicine", code: "GENM" },
];
