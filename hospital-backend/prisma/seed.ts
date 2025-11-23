import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Hospital Administrator',
    },
  });

  const doctorRole = await prisma.role.upsert({
    where: { name: 'DOCTOR' },
    update: {},
    create: {
      name: 'DOCTOR',
      description: 'Doctor',
    },
  });

  await prisma.role.upsert({
    where: { name: 'PATIENT' },
    update: {},
    create: {
      name: 'PATIENT',
      description: 'Patient',
    },
  });

  await prisma.role.upsert({
    where: { name: 'RECEPTIONIST' },
    update: {},
    create: {
      name: 'RECEPTIONIST',
      description: 'Receptionist',
    },
  });

  // Create standard departments
  const standardDepartments = [
    {
      name: 'Cardiology',
      code: 'CARD',
      description: 'Heart and cardiovascular system',
    },
    {
      name: 'Neurology',
      code: 'NEUR',
      description: 'Brain and nervous system',
    },
    { name: 'Orthopedics', code: 'ORTH', description: 'Bones and joints' },
    { name: 'Pediatrics', code: 'PEDI', description: 'Children healthcare' },
    { name: 'Gynecology', code: 'GYNE', description: 'Women healthcare' },
    { name: 'Radiology', code: 'RADI', description: 'Medical imaging' },
    {
      name: 'General Medicine',
      code: 'GENM',
      description: 'General medical care',
    },
  ];

  for (const dept of standardDepartments) {
    await prisma.standardDepartment.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin123456',
    10,
  );

  const adminUser = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@hospital.com' },
    update: {},
    create: {
      firstName: process.env.ADMIN_FIRST_NAME || 'Hospital',
      lastName: process.env.ADMIN_LAST_NAME || 'Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@hospital.com',
      cnic: process.env.ADMIN_CNIC || '12345-6789012-3',
      password: hashedPassword,
      gender: 'MALE',
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Create a default department (Cardiology)
  const cardiologyStandard = await prisma.standardDepartment.findUnique({
    where: { code: 'CARD' },
  });

  const cardiologyDept = await prisma.department.upsert({
    where: { name: 'Cardiology Department' },
    update: {},
    create: {
      name: 'Cardiology Department',
      description: 'Heart and cardiovascular system department',
      standardDepartmentId: cardiologyStandard!.id,
    },
  });

  // Create a default doctor
  const defaultPassword = await bcrypt.hash(
    process.env.DEFAULT_PASSWORD || 'password123',
    10,
  );

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'doctor@hospital.com',
      cnic: '12345-1234567-1',
      password: defaultPassword,
      gender: 'MALE',
    },
  });

  // Assign doctor role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: doctorUser.id,
        roleId: doctorRole.id,
      },
    },
    update: {},
    create: {
      userId: doctorUser.id,
      roleId: doctorRole.id,
    },
  });

  // Create doctor profile
  await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      departmentId: cardiologyDept.id,
      licenseNumber: 'DOC-2024-001',
      specialization: 'Cardiology',
      experience: 10,
      qualification: 'MBBS, MD Cardiology',
    },
  });

  // Get patient role
  const patientRole = await prisma.role.findUnique({
    where: { name: 'PATIENT' },
  });

  // Create a test patient with completed onboarding
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@hospital.com' },
    update: {},
    create: {
      firstName: 'Ahmed',
      lastName: 'Ali',
      email: 'patient@hospital.com',
      cnic: '42101-1234567-8',
      password: defaultPassword,
      gender: 'MALE',
    },
  });

  // Assign patient role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: patientUser.id,
        roleId: patientRole!.id,
      },
    },
    update: {},
    create: {
      userId: patientUser.id,
      roleId: patientRole!.id,
    },
  });

  // Create patient profile with completed onboarding
  await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      dateOfBirth: new Date('1990-05-15'),
      bloodGroup: 'O+',
      phoneNumber: '+92-300-1234567',
      address: '123 Main Street, Karachi, Pakistan',
      emergencyContact: '+92-300-7654321',
      allergies: 'None',
      medicalHistory: 'No significant medical history',
      familyHistory: 'No significant family history',
      onboardingDone: true,
      onboardedAt: new Date(),
    },
  });

  // Get receptionist role
  const receptionistRole = await prisma.role.findUnique({
    where: { name: 'RECEPTIONIST' },
  });

  // Create a test receptionist
  const receptionistUser = await prisma.user.upsert({
    where: { email: 'receptionist@hospital.com' },
    update: {},
    create: {
      firstName: 'Sarah',
      lastName: 'Khan',
      email: 'receptionist@hospital.com',
      cnic: '42201-9876543-2',
      password: defaultPassword,
      gender: 'FEMALE',
    },
  });

  // Assign receptionist role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: receptionistUser.id,
        roleId: receptionistRole!.id,
      },
    },
    update: {},
    create: {
      userId: receptionistUser.id,
      roleId: receptionistRole!.id,
    },
  });

  // Create receptionist profile
  await prisma.receptionist.upsert({
    where: { userId: receptionistUser.id },
    update: {},
    create: {
      userId: receptionistUser.id,
      phoneNumber: '+92-321-9876543',
      experience: 5,
      qualification: 'Diploma in Healthcare Administration',
    },
  });

  // Seed Drugs
  const drugs = [
    {
      name: 'Paracetamol 500mg',
      formulaName: 'Acetaminophen',
      chemicalFormula: 'C8H9NO2',
      strength: '500mg',
      dosageForm: 'Tablet',
      description: 'Pain reliever and fever reducer',
      supplier: 'PharmaCare Ltd',
    },
    {
      name: 'Amoxicillin 500mg',
      formulaName: 'Amoxicillin',
      chemicalFormula: 'C16H19N3O5S',
      strength: '500mg',
      dosageForm: 'Capsule',
      description: 'Antibiotic for bacterial infections',
      supplier: 'MedLife Pharma',
    },
    {
      name: 'Ibuprofen 400mg',
      formulaName: 'Ibuprofen',
      chemicalFormula: 'C13H18O2',
      strength: '400mg',
      dosageForm: 'Tablet',
      description: 'Anti-inflammatory and pain reliever',
      supplier: 'HealthPlus Pharma',
    },
    {
      name: 'Metformin 850mg',
      formulaName: 'Metformin Hydrochloride',
      chemicalFormula: 'C4H11N5·HCl',
      strength: '850mg',
      dosageForm: 'Tablet',
      description: 'Oral diabetes medicine for type 2 diabetes',
      supplier: 'DiabetCare Inc',
    },
    {
      name: 'Omeprazole 20mg',
      formulaName: 'Omeprazole',
      chemicalFormula: 'C17H19N3O3S',
      strength: '20mg',
      dosageForm: 'Capsule',
      description: 'Proton pump inhibitor for acid reflux',
      supplier: 'GastroCare Pharma',
    },
    {
      name: 'Atorvastatin 10mg',
      formulaName: 'Atorvastatin Calcium',
      chemicalFormula: 'C33H35FN2O5',
      strength: '10mg',
      dosageForm: 'Tablet',
      description: 'Statin to lower cholesterol',
      supplier: 'CardioCare Ltd',
    },
    {
      name: 'Lisinopril 10mg',
      formulaName: 'Lisinopril',
      chemicalFormula: 'C21H31N3O5',
      strength: '10mg',
      dosageForm: 'Tablet',
      description: 'ACE inhibitor for high blood pressure',
      supplier: 'CardioMed Pharma',
    },
    {
      name: 'Azithromycin 500mg',
      formulaName: 'Azithromycin',
      chemicalFormula: 'C38H72N2O12',
      strength: '500mg',
      dosageForm: 'Tablet',
      description: 'Antibiotic for respiratory infections',
      supplier: 'RespiCare Pharma',
    },
  ];

  for (const drug of drugs) {
    await prisma.drug.upsert({
      where: { name: drug.name },
      update: {},
      create: drug,
    });
  }

  // Seed Lab Test Templates
  const bloodTestTemplate = await prisma.labTestTemplate.upsert({
    where: { 
      name_version: {
        name: 'Complete Blood Count (CBC)',
        version: '1.0',
      },
    },
    update: {},
    create: {
      name: 'Complete Blood Count (CBC)',
      description: 'Comprehensive blood cell count analysis',
      version: '1.0',
      formStructure: {
        sections: [
          {
            title: 'Red Blood Cells',
            fields: [
              { name: 'rbc_count', label: 'RBC Count', type: 'number', unit: 'million/μL', normalRange: '4.5-5.5' },
              { name: 'hemoglobin', label: 'Hemoglobin', type: 'number', unit: 'g/dL', normalRange: '13.5-17.5' },
              { name: 'hematocrit', label: 'Hematocrit', type: 'number', unit: '%', normalRange: '38.8-50.0' },
            ],
          },
          {
            title: 'White Blood Cells',
            fields: [
              { name: 'wbc_count', label: 'WBC Count', type: 'number', unit: 'thousand/μL', normalRange: '4.5-11.0' },
              { name: 'neutrophils', label: 'Neutrophils', type: 'number', unit: '%', normalRange: '40-70' },
              { name: 'lymphocytes', label: 'Lymphocytes', type: 'number', unit: '%', normalRange: '20-40' },
            ],
          },
          {
            title: 'Platelets',
            fields: [
              { name: 'platelet_count', label: 'Platelet Count', type: 'number', unit: 'thousand/μL', normalRange: '150-400' },
            ],
          },
        ],
      },
    },
  });

  const lipidPanelTemplate = await prisma.labTestTemplate.upsert({
    where: { 
      name_version: {
        name: 'Lipid Panel',
        version: '1.0',
      },
    },
    update: {},
    create: {
      name: 'Lipid Panel',
      description: 'Cholesterol and triglyceride levels',
      version: '1.0',
      formStructure: {
        sections: [
          {
            title: 'Lipid Profile',
            fields: [
              { name: 'total_cholesterol', label: 'Total Cholesterol', type: 'number', unit: 'mg/dL', normalRange: '<200' },
              { name: 'ldl_cholesterol', label: 'LDL Cholesterol', type: 'number', unit: 'mg/dL', normalRange: '<100' },
              { name: 'hdl_cholesterol', label: 'HDL Cholesterol', type: 'number', unit: 'mg/dL', normalRange: '>40' },
              { name: 'triglycerides', label: 'Triglycerides', type: 'number', unit: 'mg/dL', normalRange: '<150' },
            ],
          },
        ],
      },
    },
  });

  const bloodGlucoseTemplate = await prisma.labTestTemplate.upsert({
    where: { 
      name_version: {
        name: 'Blood Glucose Test',
        version: '1.0',
      },
    },
    update: {},
    create: {
      name: 'Blood Glucose Test',
      description: 'Fasting blood sugar level test',
      version: '1.0',
      formStructure: {
        sections: [
          {
            title: 'Glucose Levels',
            fields: [
              { name: 'fasting_glucose', label: 'Fasting Glucose', type: 'number', unit: 'mg/dL', normalRange: '70-100' },
              { name: 'random_glucose', label: 'Random Glucose', type: 'number', unit: 'mg/dL', normalRange: '<140' },
            ],
          },
        ],
      },
    },
  });

  const liverFunctionTemplate = await prisma.labTestTemplate.upsert({
    where: { 
      name_version: {
        name: 'Liver Function Test (LFT)',
        version: '1.0',
      },
    },
    update: {},
    create: {
      name: 'Liver Function Test (LFT)',
      description: 'Comprehensive liver enzyme and function test',
      version: '1.0',
      formStructure: {
        sections: [
          {
            title: 'Liver Enzymes',
            fields: [
              { name: 'alt', label: 'ALT (SGPT)', type: 'number', unit: 'U/L', normalRange: '7-56' },
              { name: 'ast', label: 'AST (SGOT)', type: 'number', unit: 'U/L', normalRange: '10-40' },
              { name: 'alp', label: 'Alkaline Phosphatase', type: 'number', unit: 'U/L', normalRange: '44-147' },
            ],
          },
          {
            title: 'Bilirubin',
            fields: [
              { name: 'total_bilirubin', label: 'Total Bilirubin', type: 'number', unit: 'mg/dL', normalRange: '0.3-1.2' },
              { name: 'direct_bilirubin', label: 'Direct Bilirubin', type: 'number', unit: 'mg/dL', normalRange: '0.0-0.3' },
            ],
          },
        ],
      },
    },
  });

  const kidneyFunctionTemplate = await prisma.labTestTemplate.upsert({
    where: { 
      name_version: {
        name: 'Kidney Function Test (KFT)',
        version: '1.0',
      },
    },
    update: {},
    create: {
      name: 'Kidney Function Test (KFT)',
      description: 'Renal function assessment',
      version: '1.0',
      formStructure: {
        sections: [
          {
            title: 'Kidney Markers',
            fields: [
              { name: 'creatinine', label: 'Creatinine', type: 'number', unit: 'mg/dL', normalRange: '0.7-1.3' },
              { name: 'bun', label: 'Blood Urea Nitrogen', type: 'number', unit: 'mg/dL', normalRange: '7-20' },
              { name: 'uric_acid', label: 'Uric Acid', type: 'number', unit: 'mg/dL', normalRange: '3.5-7.2' },
            ],
          },
        ],
      },
    },
  });

  const urinalysisTemplate = await prisma.labTestTemplate.upsert({
    where: { 
      name_version: {
        name: 'Urinalysis',
        version: '1.0',
      },
    },
    update: {},
    create: {
      name: 'Urinalysis',
      description: 'Complete urine examination',
      version: '1.0',
      formStructure: {
        sections: [
          {
            title: 'Physical Properties',
            fields: [
              { name: 'color', label: 'Color', type: 'text', normalRange: 'Pale to dark yellow' },
              { name: 'appearance', label: 'Appearance', type: 'text', normalRange: 'Clear' },
              { name: 'specific_gravity', label: 'Specific Gravity', type: 'number', normalRange: '1.005-1.030' },
            ],
          },
          {
            title: 'Chemical Analysis',
            fields: [
              { name: 'ph', label: 'pH', type: 'number', normalRange: '4.5-8.0' },
              { name: 'protein', label: 'Protein', type: 'text', normalRange: 'Negative' },
              { name: 'glucose', label: 'Glucose', type: 'text', normalRange: 'Negative' },
            ],
          },
        ],
      },
    },
  });

  // Create lab tests for different departments
  const radiologyDept = await prisma.standardDepartment.findUnique({
    where: { code: 'RADI' },
  });

  await prisma.department.upsert({
    where: { name: 'Radiology Department' },
    update: {},
    create: {
      name: 'Radiology Department',
      description: 'Medical imaging and diagnostics',
      standardDepartmentId: radiologyDept!.id,
    },
  });

  const generalMedicineDept = await prisma.standardDepartment.findUnique({
    where: { code: 'GENM' },
  });

  const generalMedicineDeptFull = await prisma.department.upsert({
    where: { name: 'General Medicine Department' },
    update: {},
    create: {
      name: 'General Medicine Department',
      description: 'General medical care and diagnostics',
      standardDepartmentId: generalMedicineDept!.id,
    },
  });

  // Create lab tests linked to templates
  await prisma.labTest.upsert({
    where: { 
      id: 1,
    },
    update: {},
    create: {
      name: 'Complete Blood Count (CBC)',
      description: 'Comprehensive analysis of blood cells',
      departmentId: generalMedicineDeptFull.id,
      templateId: bloodTestTemplate.id,
    },
  });

  await prisma.labTest.upsert({
    where: { 
      id: 2,
    },
    update: {},
    create: {
      name: 'Lipid Profile',
      description: 'Cholesterol and lipid analysis',
      departmentId: cardiologyDept.id,
      templateId: lipidPanelTemplate.id,
    },
  });

  await prisma.labTest.upsert({
    where: { 
      id: 3,
    },
    update: {},
    create: {
      name: 'Fasting Blood Sugar',
      description: 'Blood glucose level test',
      departmentId: generalMedicineDeptFull.id,
      templateId: bloodGlucoseTemplate.id,
    },
  });

  await prisma.labTest.upsert({
    where: { 
      id: 4,
    },
    update: {},
    create: {
      name: 'Liver Function Test',
      description: 'Comprehensive liver enzyme analysis',
      departmentId: generalMedicineDeptFull.id,
      templateId: liverFunctionTemplate.id,
    },
  });

  await prisma.labTest.upsert({
    where: { 
      id: 5,
    },
    update: {},
    create: {
      name: 'Kidney Function Test',
      description: 'Renal function markers',
      departmentId: generalMedicineDeptFull.id,
      templateId: kidneyFunctionTemplate.id,
    },
  });

  await prisma.labTest.upsert({
    where: { 
      id: 6,
    },
    update: {},
    create: {
      name: 'Urinalysis',
      description: 'Complete urine examination',
      departmentId: generalMedicineDeptFull.id,
      templateId: urinalysisTemplate.id,
    },
  });

  console.log('Seed data created successfully!');
  console.log('\n=== Admin credentials ===');
  console.log('Email:', process.env.ADMIN_EMAIL || 'admin@hospital.com');
  console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123456');
  console.log('\n=== Doctor credentials ===');
  console.log('Email: doctor@hospital.com');
  console.log('Password:', process.env.DEFAULT_PASSWORD || 'password123');
  console.log('\n=== Patient credentials ===');
  console.log('Email: patient@hospital.com');
  console.log('Password:', process.env.DEFAULT_PASSWORD || 'password123');
  console.log('Onboarding: Completed');
  console.log('\n=== Receptionist credentials ===');
  console.log('Email: receptionist@hospital.com');
  console.log('Password:', process.env.DEFAULT_PASSWORD || 'password123');
  console.log('\n=== Seeded Data Summary ===');
  console.log('Drugs: 8 medications');
  console.log('Lab Test Templates: 6 templates');
  console.log('Lab Tests: 6 tests');
  console.log('Departments: Cardiology, Radiology, General Medicine');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
