/**
 * Extended Mock Data for Patient Portal - Doctor Booking
 * This includes comprehensive doctor profiles and their schedules
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

// Comprehensive Doctors List with Detailed Profiles
export const mockDoctorsDetailed = [
  {
    id: 1,
    firstName: "Dr. Ahmed",
    lastName: "Khan",
    email: "ahmed.khan@hospital.com",
    specialization: "Cardiology",
    qualification: "MBBS, MD Cardiology, FCPS",
    experience: 15,
    departmentName: "Cardiology",
    licenseNumber: "DOC-2024-001",
    about: "Specialist in interventional cardiology with expertise in cardiac catheterization, angioplasty, and heart disease management. Over 15 years of experience treating complex cardiac conditions.",
    rating: 4.8,
    totalReviews: 245,
    consultationFee: 2500,
    languages: ["English", "Urdu", "Punjabi"],
    education: [
      "MBBS - Aga Khan University, 2009",
      "MD Cardiology - Shifa International, 2014",
      "FCPS - College of Physicians & Surgeons Pakistan, 2015"
    ],
    achievements: [
      "Best Cardiologist Award 2023",
      "Published 20+ research papers",
      "Member of Pakistan Cardiac Society"
    ]
  },
  {
    id: 2,
    firstName: "Dr. Fatima",
    lastName: "Ali",
    email: "fatima.ali@hospital.com",
    specialization: "Neurology",
    qualification: "MBBS, MD Neurology, MRCP",
    experience: 12,
    departmentName: "Neurology",
    licenseNumber: "DOC-2024-002",
    about: "Expert neurologist specializing in epilepsy, stroke management, and neurodegenerative disorders. Dedicated to providing comprehensive neurological care.",
    rating: 4.9,
    totalReviews: 189,
    consultationFee: 2200,
    languages: ["English", "Urdu"],
    education: [
      "MBBS - Dow University, 2010",
      "MD Neurology - Liaquat National Hospital, 2015",
      "MRCP - Royal College of Physicians UK, 2016"
    ],
    achievements: [
      "Excellence in Neurology 2022",
      "Stroke Management Certification",
      "International Epilepsy Conference Speaker"
    ]
  },
  {
    id: 3,
    firstName: "Dr. Hassan",
    lastName: "Malik",
    email: "hassan.malik@hospital.com",
    specialization: "General Medicine",
    qualification: "MBBS, FCPS Medicine",
    experience: 10,
    departmentName: "General Medicine",
    licenseNumber: "DOC-2024-003",
    about: "General physician with broad expertise in internal medicine, preventive care, and chronic disease management. Committed to holistic patient care.",
    rating: 4.7,
    totalReviews: 312,
    consultationFee: 1800,
    languages: ["English", "Urdu", "Sindhi"],
    education: [
      "MBBS - Karachi Medical College, 2013",
      "FCPS Medicine - CPSP Pakistan, 2018"
    ],
    achievements: [
      "Community Health Award 2021",
      "100% Patient Satisfaction Rate",
      "Preventive Medicine Specialist"
    ]
  },
  {
    id: 4,
    firstName: "Dr. Aisha",
    lastName: "Rahman",
    email: "aisha.rahman@hospital.com",
    specialization: "Pediatrics",
    qualification: "MBBS, FCPS Pediatrics",
    experience: 14,
    departmentName: "Pediatrics",
    licenseNumber: "DOC-2024-004",
    about: "Experienced pediatrician specializing in child development, immunizations, and pediatric infectious diseases. Passionate about children's health and wellness.",
    rating: 4.9,
    totalReviews: 428,
    consultationFee: 2000,
    languages: ["English", "Urdu"],
    education: [
      "MBBS - King Edward Medical University, 2009",
      "FCPS Pediatrics - CPSP, 2014",
      "Advanced Pediatric Life Support - 2015"
    ],
    achievements: [
      "Best Pediatrician Award 2023",
      "Child Vaccination Champion",
      "Pediatric Emergency Care Expert"
    ]
  },
  {
    id: 5,
    firstName: "Dr. Sana",
    lastName: "Iqbal",
    email: "sana.iqbal@hospital.com",
    specialization: "Gynecology",
    qualification: "MBBS, FCPS Gynecology",
    experience: 11,
    departmentName: "Gynecology",
    licenseNumber: "DOC-2024-005",
    about: "Women's health specialist with expertise in obstetrics, gynecological surgeries, and reproductive health. Compassionate care for women at all life stages.",
    rating: 4.8,
    totalReviews: 267,
    consultationFee: 2300,
    languages: ["English", "Urdu"],
    education: [
      "MBBS - Fatima Jinnah Medical College, 2012",
      "FCPS Gynecology - CPSP, 2017"
    ],
    achievements: [
      "Women's Health Excellence Award 2022",
      "High-Risk Pregnancy Specialist",
      "Laparoscopic Surgery Expert"
    ]
  },
  {
    id: 6,
    firstName: "Dr. Imran",
    lastName: "Sheikh",
    email: "imran.sheikh@hospital.com",
    specialization: "Orthopedics",
    qualification: "MBBS, MS Orthopedics, FRCS",
    experience: 13,
    departmentName: "Orthopedics",
    licenseNumber: "DOC-2024-006",
    about: "Orthopedic surgeon specializing in joint replacement, sports injuries, and trauma surgery. Advanced training in minimally invasive techniques.",
    rating: 4.7,
    totalReviews: 198,
    consultationFee: 2400,
    languages: ["English", "Urdu", "Punjabi"],
    education: [
      "MBBS - Allama Iqbal Medical College, 2010",
      "MS Orthopedics - Jinnah Hospital, 2015",
      "FRCS - Royal College of Surgeons, 2017"
    ],
    achievements: [
      "Joint Replacement Specialist",
      "Sports Medicine Certification",
      "Arthroscopic Surgery Expert"
    ]
  },
  {
    id: 7,
    firstName: "Dr. Zainab",
    lastName: "Hussain",
    email: "zainab.hussain@hospital.com",
    specialization: "Dermatology",
    qualification: "MBBS, FCPS Dermatology",
    experience: 9,
    departmentName: "Dermatology",
    licenseNumber: "DOC-2024-007",
    about: "Dermatologist specializing in medical and cosmetic dermatology, treating skin conditions ranging from acne to complex autoimmune disorders.",
    rating: 4.9,
    totalReviews: 356,
    consultationFee: 2100,
    languages: ["English", "Urdu"],
    education: [
      "MBBS - Services Institute of Medical Sciences, 2014",
      "FCPS Dermatology - CPSP, 2019",
      "Aesthetic Dermatology Fellowship - 2020"
    ],
    achievements: [
      "Skin Health Excellence Award",
      "Laser Treatment Specialist",
      "Cosmetic Dermatology Expert"
    ]
  },
  {
    id: 8,
    firstName: "Dr. Kamran",
    lastName: "Aziz",
    email: "kamran.aziz@hospital.com",
    specialization: "Psychiatry",
    qualification: "MBBS, FCPS Psychiatry",
    experience: 10,
    departmentName: "Psychiatry",
    licenseNumber: "DOC-2024-008",
    about: "Mental health specialist with expertise in anxiety disorders, depression, bipolar disorder, and psychotherapy. Committed to destigmatizing mental health.",
    rating: 4.8,
    totalReviews: 223,
    consultationFee: 2200,
    languages: ["English", "Urdu", "Punjabi"],
    education: [
      "MBBS - Nishtar Medical College, 2013",
      "FCPS Psychiatry - CPSP, 2018",
      "CBT Therapy Certification - 2019"
    ],
    achievements: [
      "Mental Health Advocate Award",
      "Depression Management Expert",
      "Addiction Treatment Specialist"
    ]
  },
  {
    id: 9,
    firstName: "Dr. Maria",
    lastName: "Khan",
    email: "maria.khan@hospital.com",
    specialization: "ENT",
    qualification: "MBBS, FCPS ENT",
    experience: 11,
    departmentName: "ENT",
    licenseNumber: "DOC-2024-009",
    about: "ENT surgeon with specialized training in sinus surgery, hearing disorders, and voice problems. Modern approach to ear, nose, and throat conditions.",
    rating: 4.7,
    totalReviews: 178,
    consultationFee: 1900,
    languages: ["English", "Urdu"],
    education: [
      "MBBS - Lahore Medical College, 2012",
      "FCPS ENT - CPSP, 2017",
      "Endoscopic Sinus Surgery Training - 2018"
    ],
    achievements: [
      "Sinus Surgery Specialist",
      "Hearing Restoration Expert",
      "Voice Disorders Treatment"
    ]
  },
  {
    id: 10,
    firstName: "Dr. Usman",
    lastName: "Tariq",
    email: "usman.tariq@hospital.com",
    specialization: "Cardiology",
    qualification: "MBBS, MD Cardiology",
    experience: 8,
    departmentName: "Cardiology",
    licenseNumber: "DOC-2024-010",
    about: "Young and dynamic cardiologist specializing in preventive cardiology and non-invasive cardiac imaging. Focus on lifestyle modification and heart health.",
    rating: 4.6,
    totalReviews: 145,
    consultationFee: 2000,
    languages: ["English", "Urdu"],
    education: [
      "MBBS - Aga Khan University, 2015",
      "MD Cardiology - Shaukat Khanum Hospital, 2020"
    ],
    achievements: [
      "Preventive Cardiology Specialist",
      "Echocardiography Expert",
      "Young Doctors Award 2023"
    ]
  },
  {
    id: 11,
    firstName: "Dr. Saima",
    lastName: "Noor",
    email: "saima.noor@hospital.com",
    specialization: "General Medicine",
    qualification: "MBBS, FCPS Medicine",
    experience: 7,
    departmentName: "General Medicine",
    licenseNumber: "DOC-2024-011",
    about: "General physician with special interest in diabetes management and hypertension. Patient-centered approach to chronic disease care.",
    rating: 4.8,
    totalReviews: 189,
    consultationFee: 1700,
    languages: ["English", "Urdu", "Punjabi"],
    education: [
      "MBBS - Combined Military Hospital, 2016",
      "FCPS Medicine - CPSP, 2021"
    ],
    achievements: [
      "Diabetes Care Excellence",
      "Hypertension Management Specialist",
      "Patient Care Award 2022"
    ]
  },
  {
    id: 12,
    firstName: "Dr. Bilal",
    lastName: "Ahmed",
    email: "bilal.ahmed@hospital.com",
    specialization: "Neurology",
    qualification: "MBBS, FCPS Neurology",
    experience: 9,
    departmentName: "Neurology",
    licenseNumber: "DOC-2024-012",
    about: "Neurologist with expertise in headache disorders, multiple sclerosis, and movement disorders. Evidence-based approach to neurological care.",
    rating: 4.7,
    totalReviews: 167,
    consultationFee: 2100,
    languages: ["English", "Urdu"],
    education: [
      "MBBS - Rawalpindi Medical College, 2014",
      "FCPS Neurology - CPSP, 2019"
    ],
    achievements: [
      "Headache Specialist",
      "MS Treatment Expert",
      "Neurological Research Contributor"
    ]
  }
];

// Comprehensive Schedules with Multiple Slots
export const mockDoctorSchedules = [
  // Dr. Ahmed Khan (Cardiology) - Today & Next 3 days
  {
    doctorId: 1,
    slots: [
      // Today
      { id: 101, startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 102, startTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 103, startTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(), isBooked: true, isBookable: true },
      // Tomorrow
      { id: 104, startTime: new Date(new Date(Date.now() + 86400000).setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 105, startTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 106, startTime: new Date(new Date(Date.now() + 86400000).setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 107, startTime: new Date(new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(16, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      // Day +2
      { id: 108, startTime: new Date(new Date(Date.now() + 172800000).setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 109, startTime: new Date(new Date(Date.now() + 172800000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 110, startTime: new Date(new Date(Date.now() + 172800000).setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(15, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Fatima Ali (Neurology)
  {
    doctorId: 2,
    slots: [
      { id: 201, startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 202, startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 203, startTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 204, startTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(12, 0, 0, 0)).toISOString(), isBooked: true, isBookable: true },
      { id: 205, startTime: new Date(new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(16, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 206, startTime: new Date(new Date(Date.now() + 172800000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 207, startTime: new Date(new Date(Date.now() + 172800000).setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(15, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Hassan Malik (General Medicine)
  {
    doctorId: 3,
    slots: [
      { id: 301, startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 302, startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 303, startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 304, startTime: new Date(new Date(Date.now() + 86400000).setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 305, startTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 306, startTime: new Date(new Date(Date.now() + 172800000).setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 307, startTime: new Date(new Date(Date.now() + 172800000).setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Aisha Rahman (Pediatrics)
  {
    doctorId: 4,
    slots: [
      { id: 401, startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 402, startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 403, startTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 404, startTime: new Date(new Date(Date.now() + 86400000).setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 405, startTime: new Date(new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(16, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 406, startTime: new Date(new Date(Date.now() + 172800000).setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Sana Iqbal (Gynecology)
  {
    doctorId: 5,
    slots: [
      { id: 501, startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 502, startTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 503, startTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 504, startTime: new Date(new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(16, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 505, startTime: new Date(new Date(Date.now() + 172800000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Imran Sheikh (Orthopedics)
  {
    doctorId: 6,
    slots: [
      { id: 601, startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 602, startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 603, startTime: new Date(new Date(Date.now() + 86400000).setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 604, startTime: new Date(new Date(Date.now() + 86400000).setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 605, startTime: new Date(new Date(Date.now() + 172800000).setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Zainab Hussain (Dermatology)
  {
    doctorId: 7,
    slots: [
      { id: 701, startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 702, startTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 703, startTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 704, startTime: new Date(new Date(Date.now() + 86400000).setHours(16, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(17, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 705, startTime: new Date(new Date(Date.now() + 172800000).setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Kamran Aziz (Psychiatry)
  {
    doctorId: 8,
    slots: [
      { id: 801, startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 802, startTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 803, startTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 804, startTime: new Date(new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(16, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 805, startTime: new Date(new Date(Date.now() + 172800000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Maria Khan (ENT)
  {
    doctorId: 9,
    slots: [
      { id: 901, startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 902, startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 903, startTime: new Date(new Date(Date.now() + 86400000).setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 904, startTime: new Date(new Date(Date.now() + 86400000).setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 905, startTime: new Date(new Date(Date.now() + 172800000).setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Usman Tariq (Cardiology)
  {
    doctorId: 10,
    slots: [
      { id: 1001, startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1002, startTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1003, startTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1004, startTime: new Date(new Date(Date.now() + 86400000).setHours(16, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(17, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1005, startTime: new Date(new Date(Date.now() + 172800000).setHours(10, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(11, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Saima Noor (General Medicine)
  {
    doctorId: 11,
    slots: [
      { id: 1101, startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1102, startTime: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1103, startTime: new Date(new Date(Date.now() + 86400000).setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1104, startTime: new Date(new Date(Date.now() + 86400000).setHours(13, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(14, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1105, startTime: new Date(new Date(Date.now() + 172800000).setHours(9, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(10, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
  // Dr. Bilal Ahmed (Neurology)
  {
    doctorId: 12,
    slots: [
      { id: 1201, startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1202, startTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1203, startTime: new Date(new Date(Date.now() + 86400000).setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1204, startTime: new Date(new Date(Date.now() + 86400000).setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 86400000).setHours(16, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
      { id: 1205, startTime: new Date(new Date(Date.now() + 172800000).setHours(11, 0, 0, 0)).toISOString(), endTime: new Date(new Date(Date.now() + 172800000).setHours(12, 0, 0, 0)).toISOString(), isBooked: false, isBookable: true },
    ]
  },
];

// Existing appointments and checkups data remain the same
export const mockMyAppointments = [
  {
    id: 1,
    slotId: 103,
    scheduleId: 1,
    patientId: 1,
    startTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    reason: "Regular checkup for heart condition",
    status: "confirmed",
    doctor: {
      id: 1,
      firstName: "Dr. Ahmed",
      lastName: "Khan",
      specialization: "Cardiology",
      departmentName: "Cardiology",
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

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
    createdAt: new Date(Date.now() - 604800000).toISOString(),
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
];

export const mockDepartments = [
  { id: 1, name: "Cardiology", code: "CARD" },
  { id: 2, name: "Neurology", code: "NEUR" },
  { id: 3, name: "Orthopedics", code: "ORTH" },
  { id: 4, name: "Pediatrics", code: "PEDI" },
  { id: 5, name: "Gynecology", code: "GYNE" },
  { id: 6, name: "General Medicine", code: "GENM" },
  { id: 7, name: "Dermatology", code: "DERM" },
  { id: 8, name: "Psychiatry", code: "PSYC" },
  { id: 9, name: "ENT", code: "ENT" },
];
