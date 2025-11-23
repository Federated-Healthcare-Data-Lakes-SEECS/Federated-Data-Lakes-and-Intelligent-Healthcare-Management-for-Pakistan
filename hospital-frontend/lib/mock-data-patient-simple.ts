/**
 * Simplified Mock Data for Patient Portal - Based on Backend Schema
 * Only includes fields that exist in the Prisma schema
 */

// Patient Profile (from User + Patient models)
export const mockPatientProfile = {
  id: 1,
  userId: 101,
  firstName: "Ahmed",
  lastName: "Khan",
  email: "ahmed.khan@example.com",
  gender: "MALE" as const,
  cnic: "42101-1234567-1",
  dateOfBirth: new Date("1990-05-15"),
  bloodGroup: "B+",
  phoneNumber: "+92-300-1234567",
  emergencyContact: "+92-301-7654321",
  address: "House 123, Street 5, F-7 Markaz, Islamabad",
  medicalHistory: "No significant medical history",
  familyHistory: "Father has diabetes",
  allergies: "Penicillin",
  onboardingDone: true,
};

// Departments (from Department + StandardDepartment models)
export const mockDepartments = [
  { id: 1, name: "Cardiology", standardDepartmentId: 1, code: "CARD", description: "Heart and cardiovascular system" },
  { id: 2, name: "Neurology", standardDepartmentId: 2, code: "NEUR", description: "Brain and nervous system" },
  { id: 3, name: "General Medicine", standardDepartmentId: 3, code: "GENM", description: "General medical consultations" },
  { id: 4, name: "Pediatrics", standardDepartmentId: 4, code: "PEDI", description: "Child healthcare" },
  { id: 5, name: "Gynecology", standardDepartmentId: 5, code: "GYNE", description: "Women's health" },
  { id: 6, name: "Orthopedics", standardDepartmentId: 6, code: "ORTH", description: "Bones and joints" },
  { id: 7, name: "Dermatology", standardDepartmentId: 7, code: "DERM", description: "Skin conditions" },
  { id: 8, name: "Psychiatry", standardDepartmentId: 8, code: "PSYC", description: "Mental health" },
  { id: 9, name: "ENT", standardDepartmentId: 9, code: "ENT", description: "Ear, Nose, and Throat" },
];

// Doctors (from User + Doctor models - ONLY schema fields)
export const mockDoctorsSimple = [
  {
    id: 1,
    userId: 201,
    firstName: "Ahmed",
    lastName: "Hassan",
    email: "ahmed.hassan@hospital.com",
    gender: "MALE" as const,
    departmentId: 1,
    departmentName: "Cardiology",
    licenseNumber: "PMC-12345",
    specialization: "Interventional Cardiology",
    qualification: "MBBS, FCPS (Cardiology)",
    experience: 15,
  },
  {
    id: 2,
    userId: 202,
    firstName: "Sarah",
    lastName: "Khan",
    email: "sarah.khan@hospital.com",
    gender: "FEMALE" as const,
    departmentId: 1,
    departmentName: "Cardiology",
    licenseNumber: "PMC-12346",
    specialization: "Pediatric Cardiology",
    qualification: "MBBS, MD (Cardiology)",
    experience: 12,
  },
  {
    id: 3,
    userId: 203,
    firstName: "Muhammad",
    lastName: "Ali",
    email: "muhammad.ali@hospital.com",
    gender: "MALE" as const,
    departmentId: 2,
    departmentName: "Neurology",
    licenseNumber: "PMC-12347",
    specialization: "Stroke Medicine",
    qualification: "MBBS, FCPS (Neurology)",
    experience: 10,
  },
  {
    id: 4,
    userId: 204,
    firstName: "Fatima",
    lastName: "Malik",
    email: "fatima.malik@hospital.com",
    gender: "FEMALE" as const,
    departmentId: 2,
    departmentName: "Neurology",
    licenseNumber: "PMC-12348",
    specialization: "Epilepsy and Seizure Disorders",
    qualification: "MBBS, MD (Neurology)",
    experience: 8,
  },
  {
    id: 5,
    userId: 205,
    firstName: "Usman",
    lastName: "Tariq",
    email: "usman.tariq@hospital.com",
    gender: "MALE" as const,
    departmentId: 3,
    departmentName: "General Medicine",
    licenseNumber: "PMC-12349",
    specialization: "Internal Medicine",
    qualification: "MBBS, FCPS (Medicine)",
    experience: 14,
  },
  {
    id: 6,
    userId: 206,
    firstName: "Ayesha",
    lastName: "Siddiqui",
    email: "ayesha.siddiqui@hospital.com",
    gender: "FEMALE" as const,
    departmentId: 3,
    departmentName: "General Medicine",
    licenseNumber: "PMC-12350",
    specialization: "General Practitioner",
    qualification: "MBBS",
    experience: 7,
  },
  {
    id: 7,
    userId: 207,
    firstName: "Hassan",
    lastName: "Sheikh",
    email: "hassan.sheikh@hospital.com",
    gender: "MALE" as const,
    departmentId: 4,
    departmentName: "Pediatrics",
    licenseNumber: "PMC-12351",
    specialization: "Child Development",
    qualification: "MBBS, FCPS (Pediatrics)",
    experience: 11,
  },
  {
    id: 8,
    userId: 208,
    firstName: "Zainab",
    lastName: "Hussain",
    email: "zainab.hussain@hospital.com",
    gender: "FEMALE" as const,
    departmentId: 5,
    departmentName: "Gynecology",
    licenseNumber: "PMC-12352",
    specialization: "Obstetrics and Gynecology",
    qualification: "MBBS, FCPS (Gynecology)",
    experience: 13,
  },
  {
    id: 9,
    userId: 209,
    firstName: "Bilal",
    lastName: "Ahmed",
    email: "bilal.ahmed@hospital.com",
    gender: "MALE" as const,
    departmentId: 6,
    departmentName: "Orthopedics",
    licenseNumber: "PMC-12353",
    specialization: "Joint Replacement Surgery",
    qualification: "MBBS, FCPS (Orthopedics)",
    experience: 16,
  },
  {
    id: 10,
    userId: 210,
    firstName: "Mariam",
    lastName: "Yousaf",
    email: "mariam.yousaf@hospital.com",
    gender: "FEMALE" as const,
    departmentId: 7,
    departmentName: "Dermatology",
    licenseNumber: "PMC-12354",
    specialization: "Cosmetic Dermatology",
    qualification: "MBBS, FCPS (Dermatology)",
    experience: 9,
  },
  {
    id: 11,
    userId: 211,
    firstName: "Ali",
    lastName: "Raza",
    email: "ali.raza@hospital.com",
    gender: "MALE" as const,
    departmentId: 8,
    departmentName: "Psychiatry",
    licenseNumber: "PMC-12355",
    specialization: "Adult Psychiatry",
    qualification: "MBBS, FCPS (Psychiatry)",
    experience: 10,
  },
  {
    id: 12,
    userId: 212,
    firstName: "Sana",
    lastName: "Khalid",
    email: "sana.khalid@hospital.com",
    gender: "FEMALE" as const,
    departmentId: 9,
    departmentName: "ENT",
    licenseNumber: "PMC-12356",
    specialization: "Otolaryngology",
    qualification: "MBBS, FCPS (ENT)",
    experience: 8,
  },
];

// Doctor Schedules with Slots (from DoctorSchedule + AppointmentSlot models)
export const mockDoctorSchedules = mockDoctorsSimple.map((doctor, index) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const slots: Array<{
    id: number;
    scheduleId: number;
    startTime: string;
    endTime: string;
    isBookable: boolean;
    isBooked: boolean;
  }> = [];
  let slotId = 101 + (index * 10);
  
  // Generate slots for next 3 days
  for (let day = 0; day < 3; day++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + day);
    
    // Morning slots (9 AM - 12 PM)
    const morningTimes = [
      { start: 9, end: 9.5 },
      { start: 10, end: 10.5 },
      { start: 11, end: 11.5 },
    ];
    
    // Afternoon slots (2 PM - 5 PM)
    const afternoonTimes = [
      { start: 14, end: 14.5 },
      { start: 15, end: 15.5 },
      { start: 16, end: 16.5 },
    ];
    
    const times = day % 2 === 0 ? morningTimes : afternoonTimes;
    
    times.forEach((time) => {
      const startTime = new Date(slotDate);
      startTime.setHours(Math.floor(time.start), (time.start % 1) * 60, 0, 0);
      
      const endTime = new Date(slotDate);
      endTime.setHours(Math.floor(time.end), (time.end % 1) * 60, 0, 0);
      
      // Some slots are booked for realism
      const isBooked = Math.random() > 0.7;
      
      slots.push({
        id: slotId++,
        scheduleId: 1000 + index,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isBookable: true,
        isBooked: isBooked,
      });
    });
  }
  
  return {
    doctorId: doctor.id,
    doctorName: `${doctor.firstName} ${doctor.lastName}`,
    scheduleId: 1000 + index,
    slots,
  };
});

// Patient's Appointments (from Appointment + OnlineAppointment models)
export const mockMyAppointments = [
  {
    id: 1,
    patientId: 1,
    slotId: 105,
    reason: "Regular checkup for chest pain",
    status: "BOOKED" as const,
    appointmentType: "online" as const,
    doctorName: "Dr. Ahmed Hassan",
    departmentName: "Cardiology",
    specialization: "Interventional Cardiology",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    patientId: 1,
    slotId: 203,
    reason: "Follow-up for migraine treatment",
    status: "COMPLETED" as const,
    appointmentType: "online" as const,
    doctorName: "Dr. Muhammad Ali",
    departmentName: "Neurology",
    specialization: "Stroke Medicine",
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Patient's Medical History (from Checkup model)
export const mockPatientCheckups = [
  {
    id: 1,
    appointmentId: 2,
    bloodPressure: "120/80",
    temperature: "98.6",
    heartRate: "72",
    bloodSugar: "95",
    symptoms: "Severe headache, sensitivity to light",
    diagnosis: "Migraine with aura",
    notes: "Prescribed pain management medication. Follow-up in 2 weeks.",
    doctorName: "Dr. Muhammad Ali",
    departmentName: "Neurology",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    medications: [
      {
        drugName: "Sumatriptan",
        dosePerIntake: "50mg",
        timesPerDay: 1,
        totalDays: 14,
        instructions: "Take at onset of migraine",
      },
    ],
  },
];
