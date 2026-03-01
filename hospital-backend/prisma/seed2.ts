import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// ====================================================================
// TYPES
// ====================================================================
interface CsvRow {
  checkup_id: string;
  blood_pressure: string;
  temperature: string;
  heart_rate: string;
  blood_sugar: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  insights: string;
  gap_analysis: string;
  checkup_created_at: string;
  checkup_updated_at: string;
  department_name: string;
  patient_dob: string;
  patient_blood_group: string;
  patient_medical_history: string;
  patient_allergies: string;
  patient_address: string;
  patient_gender: string;
  prescription: string;
  test_recommendations: string;
}

interface CsvDrug {
  id: number;
  name: string;
  strength: string;
  description: string;
  dosage_form: string;
  formula_name: string;
  chemical_formula: string;
}

interface CsvMedication {
  id: number;
  drug: CsvDrug;
  total_days: number;
  instructions: string;
  times_per_day: number;
  dose_per_intake: string;
}

interface CsvPrescription {
  id: number;
  created_at: string;
  medications: CsvMedication[];
  additional_medications: string;
}

interface CsvLabTest {
  id: number;
  name: string;
  description: string;
  department_id: number;
}

interface CsvRecommendedTest {
  id: number;
  lab_test: CsvLabTest;
}

interface CsvTestRecommendation {
  id: number;
  created_at: string;
  additional_tests: string | null;
  recommended_tests: CsvRecommendedTest[];
}

// ====================================================================
// HELPERS — Instance 2 specific names
// ====================================================================

const maleFirstNames = [
  'Owais', 'Talha', 'Farhan', 'Basit', 'Noman', 'Waqas', 'Rameez', 'Hammad',
  'Taimoor', 'Arslan', 'Ehsan', 'Naeem', 'Salman', 'Asad', 'Qasim', 'Waheed',
  'Shakeel', 'Aftab', 'Raheel', 'Zain', 'Moiz', 'Shehzad', 'Babar', 'Haroon',
  'Mudassar', 'Saqlain', 'Suleman', 'Ahtesham', 'Fawad', 'Tayyab', 'Anwar', 'Jameel',
  'Pervaiz', 'Sabir', 'Majid', 'Rauf', 'Hafeez', 'Latif', 'Hanif', 'Mushtaq',
];

const femaleFirstNames = [
  'Mahnoor', 'Areeba', 'Anum', 'Komal', 'Kinza', 'Nimra', 'Alina', 'Laiba',
  'Amna', 'Hafsa', 'Malaika', 'Sadia', 'Sahar', 'Farah', 'Naila', 'Iram',
  'Tehmina', 'Ambreen', 'Zunaira', 'Rida', 'Maheen', 'Zara', 'Javeria', 'Misbah',
  'Rahat', 'Abida', 'Tayyaba', 'Neelam', 'Safia', 'Perveen', 'Sumaira', 'Kiran',
  'Noreen', 'Samia', 'Bilqees', 'Muneeba', 'Hadia', 'Wardah', 'Saima', 'Sobia',
];

const lastNames = [
  'Tariq', 'Rehman', 'Zahid', 'Hamid', 'Wazir', 'Khattak', 'Yousafzai', 'Niazi',
  'Durrani', 'Leghari', 'Marri', 'Baloch', 'Mengal', 'Achakzai', 'Kakar', 'Sethi',
  'Hayat', 'Memon', 'Junejo', 'Bhutto', 'Soomro', 'Shaikh', 'Patel', 'Bhatti',
  'Warraich', 'Gondal', 'Virk', 'Sandhu', 'Gill', 'Dogar',
];

let patientEmailCounter = 0;

function generatePatientEmail(): string {
  patientEmailCounter++;
  return `patient2.seed${patientEmailCounter}@hospital2.com`;
}

function generateCnic(index: number): string {
  const area = 45000 + (index % 10000);
  const mid = 2000000 + index;
  const last = index % 10;
  return `${area}-${mid}-${last}`;
}

function generatePhone(index: number): string {
  const prefix = ['300', '301', '302', '303', '311', '312', '321', '322', '331', '333', '345', '346'];
  return `+92-${prefix[index % prefix.length]}-${(2000000 + index).toString().slice(0, 7)}`;
}

// Deterministic seed-like random based on index
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function generateDateOfBirth(index: number): Date {
  // Ages between 5 and 75
  const age = 5 + Math.floor(seededRandom(index + 150) * 70);
  const d = new Date(2026, 2, 1); // March 1, 2026
  d.setFullYear(d.getFullYear() - age);
  d.setMonth(Math.floor(seededRandom(index + 250) * 12));
  d.setDate(1 + Math.floor(seededRandom(index + 350) * 27));
  return d;
}

// Generate a realistic date spanning 2 months before today (Jan 1 2026 - Feb 28 2026)
function generateCheckupDate(csvIndex: number): Date {
  const startDate = new Date(2026, 0, 1); // Jan 1, 2026
  const endDate = new Date(2026, 1, 28);  // Feb 28, 2026
  const range = endDate.getTime() - startDate.getTime();
  const offset = seededRandom(csvIndex * 7 + 99) * range;
  const d = new Date(startDate.getTime() + offset);
  d.setHours(9 + Math.floor(seededRandom(csvIndex * 3 + 23) * 11));
  d.setMinutes(Math.floor(seededRandom(csvIndex * 5 + 31) * 60));
  d.setSeconds(0, 0);
  return d;
}

// ====================================================================
// MAIN SEED FUNCTION
// ====================================================================
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    Hospital Database Seed 2 - Second Instance (117+)     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // ===========================
  // STEP 1: Clear all data
  // ===========================
  console.log('🗑️  Clearing existing data...');
  await prisma.checkupAudio.deleteMany();
  await prisma.recommendedLabTest.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.checkupTestRecommendation.deleteMany();
  await prisma.checkup.deleteMany();
  await prisma.onlineAppointment.deleteMany();
  await prisma.walkinAppointment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.appointmentSlot.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.patientLabTest.deleteMany();
  await prisma.labTest.deleteMany();
  await prisma.labTestTemplate.deleteMany();
  await prisma.drug.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.receptionist.deleteMany();
  await prisma.labTechnician.deleteMany();
  await prisma.pathologist.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.department.deleteMany();
  await prisma.standardDepartment.deleteMany();
  console.log('✅ Existing data cleared.\n');

  // ===========================
  // STEP 2: Roles
  // ===========================
  console.log('👤 Creating roles...');
  const roles: Record<string, Awaited<ReturnType<typeof prisma.role.create>>> = {};
  for (const r of [
    { name: 'ADMIN', description: 'Hospital Administrator' },
    { name: 'DOCTOR', description: 'Doctor' },
    { name: 'PATIENT', description: 'Patient' },
    { name: 'RECEPTIONIST', description: 'Receptionist' },
    { name: 'LAB_TECHNICIAN', description: 'Lab Technician' },
    { name: 'PATHOLOGIST', description: 'Pathologist' },
  ]) {
    roles[r.name] = await prisma.role.create({ data: r });
  }
  console.log(`✅ ${Object.keys(roles).length} roles created.\n`);

  // ===========================
  // STEP 3: Standard Departments & Departments
  // ===========================
  console.log('🏥 Creating departments...');
  const standardDepts = [
    { name: 'Cardiology', code: 'CARD', description: 'Heart and cardiovascular system' },
    { name: 'Neurology', code: 'NEUR', description: 'Brain and nervous system' },
    { name: 'Orthopedics', code: 'ORTH', description: 'Bones and joints' },
    { name: 'Pediatrics', code: 'PEDI', description: 'Children healthcare' },
    { name: 'Gynecology', code: 'GYNE', description: 'Women healthcare' },
    { name: 'Radiology', code: 'RADI', description: 'Medical imaging' },
    { name: 'General Medicine', code: 'GENM', description: 'General medical care' },
  ];

  const stdDeptMap: Record<string, number> = {};
  for (const sd of standardDepts) {
    const created = await prisma.standardDepartment.create({ data: sd });
    stdDeptMap[sd.name] = created.id;
  }

  const deptConfigs = [
    { name: 'Cardiology Department', stdName: 'Cardiology', desc: 'Heart and cardiovascular system department' },
    { name: 'Neurology Department', stdName: 'Neurology', desc: 'Brain and nervous system department' },
    { name: 'Orthopedics Department', stdName: 'Orthopedics', desc: 'Bones and joints department' },
    { name: 'Pediatrics Department', stdName: 'Pediatrics', desc: 'Children healthcare department' },
    { name: 'Gynecology Department', stdName: 'Gynecology', desc: 'Women healthcare department' },
    { name: 'Radiology Department', stdName: 'Radiology', desc: 'Medical imaging and diagnostics' },
    { name: 'General Medicine Department', stdName: 'General Medicine', desc: 'General medical care and diagnostics' },
  ];

  const deptMap: Record<string, Awaited<ReturnType<typeof prisma.department.create>>> = {};
  for (const dc of deptConfigs) {
    const dept = await prisma.department.create({
      data: {
        name: dc.name,
        description: dc.desc,
        standardDepartmentId: stdDeptMap[dc.stdName],
      },
    });
    deptMap[dc.stdName] = dept;
  }
  console.log(`✅ ${deptConfigs.length} departments created.\n`);

  // ===========================
  // STEP 4: Admin user (@hospital2.com)
  // ===========================
  console.log('🔑 Creating admin user...');
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123456', 10);
  const adminUser = await prisma.user.create({
    data: {
      firstName: process.env.ADMIN_FIRST_NAME || 'City',
      lastName: process.env.ADMIN_LAST_NAME || 'Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@hospital2.com',
      cnic: process.env.ADMIN_CNIC || '55345-6789012-3',
      password: hashedPassword,
      gender: 'MALE',
    },
  });
  await prisma.userRole.create({ data: { userId: adminUser.id, roleId: roles['ADMIN'].id } });
  console.log('✅ Admin user created.\n');

  // ===========================
  // STEP 5: Default password for staff
  // ===========================
  const defaultPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'password123', 10);

  // ===========================
  // STEP 6: Doctors (one per department — different identities from instance 1)
  // ===========================
  console.log('👨‍⚕️ Creating doctors...');
  const doctorConfigs = [
    { email: 'doctor@hospital2.com', firstName: 'Dr. Naveed', lastName: 'Anwar', cnic: '52101-2345678-1', gender: 'MALE' as const, dept: 'Cardiology', license: 'PMC-82345', spec: 'Interventional Cardiology', exp: 16, qual: 'MBBS, FCPS (Cardiology)' },
    { email: 'dr.samina@hospital2.com', firstName: 'Dr. Samina', lastName: 'Rehman', cnic: '52201-3456789-2', gender: 'FEMALE' as const, dept: 'Gynecology', license: 'PMC-83456', spec: 'Obstetrics and Gynecology', exp: 14, qual: 'MBBS, FCPS (Gynecology)' },
    { email: 'dr.waqar@hospital2.com', firstName: 'Dr. Waqar', lastName: 'Siddiqui', cnic: '52301-4567890-3', gender: 'MALE' as const, dept: 'Neurology', license: 'PMC-84567', spec: 'Neurologist', exp: 17, qual: 'MBBS, FCPS (Neurology)' },
    { email: 'dr.hina@hospital2.com', firstName: 'Dr. Hina', lastName: 'Tariq', cnic: '52401-5678901-4', gender: 'FEMALE' as const, dept: 'Pediatrics', license: 'PMC-85678', spec: 'Pediatrician', exp: 9, qual: 'MBBS, DCH, FCPS (Pediatrics)' },
    { email: 'dr.bilal@hospital2.com', firstName: 'Dr. Bilal', lastName: 'Chaudhry', cnic: '52501-6789012-5', gender: 'MALE' as const, dept: 'Orthopedics', license: 'PMC-86789', spec: 'Orthopedic Surgeon', exp: 22, qual: 'MBBS, FCPS (Orthopedics)' },
    { email: 'dr.shahbaz@hospital2.com', firstName: 'Dr. Shahbaz', lastName: 'Aslam', cnic: '52601-7890123-6', gender: 'MALE' as const, dept: 'General Medicine', license: 'PMC-87890', spec: 'General Physician', exp: 13, qual: 'MBBS, FCPS (Medicine)' },
    { email: 'dr.rabia@hospital2.com', firstName: 'Dr. Rabia', lastName: 'Iqbal', cnic: '52701-8901234-7', gender: 'FEMALE' as const, dept: 'Radiology', license: 'PMC-88901', spec: 'Radiologist', exp: 10, qual: 'MBBS, FCPS (Radiology)' },
  ];

  const doctorByDept: Record<string, Awaited<ReturnType<typeof prisma.doctor.create>>> = {};
  for (const dc of doctorConfigs) {
    const user = await prisma.user.create({
      data: { firstName: dc.firstName, lastName: dc.lastName, email: dc.email, cnic: dc.cnic, password: defaultPassword, gender: dc.gender },
    });
    await prisma.userRole.create({ data: { userId: user.id, roleId: roles['DOCTOR'].id } });
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        departmentId: deptMap[dc.dept].id,
        licenseNumber: dc.license,
        specialization: dc.spec,
        experience: dc.exp,
        qualification: dc.qual,
      },
    });
    doctorByDept[dc.dept] = doctor;
  }
  console.log(`✅ ${doctorConfigs.length} doctors created.\n`);

  // ===========================
  // STEP 7: Receptionists
  // ===========================
  console.log('💁 Creating receptionists...');
  const receptionistConfigs = [
    { email: 'receptionist@hospital2.com', firstName: 'Nida', lastName: 'Tariq', cnic: '52201-9876543-2', gender: 'FEMALE' as const, phone: '+92-321-5876543', exp: 4, qual: 'Diploma in Healthcare Administration' },
    { email: 'hassan.reception@hospital2.com', firstName: 'Hassan', lastName: 'Waqar', cnic: '52301-8765432-1', gender: 'MALE' as const, phone: '+92-333-5765432', exp: 2, qual: 'Bachelor in Business Administration' },
    { email: 'saba.reception@hospital2.com', firstName: 'Saba', lastName: 'Niazi', cnic: '52401-7654321-0', gender: 'FEMALE' as const, phone: '+92-311-5654321', exp: 6, qual: 'Diploma in Medical Office Administration' },
  ];

  const receptionists: Awaited<ReturnType<typeof prisma.receptionist.create>>[] = [];
  for (const rc of receptionistConfigs) {
    const user = await prisma.user.create({
      data: { firstName: rc.firstName, lastName: rc.lastName, email: rc.email, cnic: rc.cnic, password: defaultPassword, gender: rc.gender },
    });
    await prisma.userRole.create({ data: { userId: user.id, roleId: roles['RECEPTIONIST'].id } });
    const rec = await prisma.receptionist.create({
      data: { userId: user.id, phoneNumber: rc.phone, experience: rc.exp, qualification: rc.qual },
    });
    receptionists.push(rec);
  }
  console.log(`✅ ${receptionistConfigs.length} receptionists created.\n`);

  // ===========================
  // STEP 8: Lab Technicians
  // ===========================
  console.log('🔬 Creating lab technicians...');
  const labTechConfigs = [
    { email: 'labtechnician@hospital2.com', firstName: 'Umer', lastName: 'Baloch', cnic: '52501-1122334-4', gender: 'MALE' as const, dept: 'Cardiology', spec: 'Clinical Chemistry', exp: 7, qual: 'BS Medical Laboratory Technology' },
    { email: 'arshad.labtech@hospital2.com', firstName: 'Arshad', lastName: 'Marri', cnic: '52601-2233445-5', gender: 'MALE' as const, dept: 'Neurology', spec: 'Hematology', exp: 5, qual: 'BS Medical Laboratory Technology' },
    { email: 'saira.labtech@hospital2.com', firstName: 'Saira', lastName: 'Khattak', cnic: '52701-3344556-6', gender: 'FEMALE' as const, dept: 'Orthopedics', spec: 'Microbiology', exp: 4, qual: 'BS Microbiology' },
    { email: 'huma.labtech@hospital2.com', firstName: 'Huma', lastName: 'Durrani', cnic: '52801-4455667-7', gender: 'FEMALE' as const, dept: 'Pediatrics', spec: 'Immunology', exp: 3, qual: 'BS Medical Laboratory Technology' },
  ];

  for (const lt of labTechConfigs) {
    const user = await prisma.user.create({
      data: { firstName: lt.firstName, lastName: lt.lastName, email: lt.email, cnic: lt.cnic, password: defaultPassword, gender: lt.gender },
    });
    await prisma.userRole.create({ data: { userId: user.id, roleId: roles['LAB_TECHNICIAN'].id } });
    await prisma.labTechnician.create({
      data: { userId: user.id, departmentId: deptMap[lt.dept].id, specialization: lt.spec, experience: lt.exp, qualification: lt.qual },
    });
  }
  console.log(`✅ ${labTechConfigs.length} lab technicians created.\n`);

  // ===========================
  // STEP 9: Pathologists
  // ===========================
  console.log('🧪 Creating pathologists...');
  const pathConfigs = [
    { email: 'pathologist@hospital2.com', firstName: 'Dr. Pervaiz', lastName: 'Hayat', cnic: '52901-5566778-8', gender: 'MALE' as const, dept: 'Cardiology', spec: 'Clinical Pathology', exp: 11, qual: 'MBBS, MPhil Pathology' },
    { email: 'dr.rubina.path@hospital2.com', firstName: 'Dr. Rubina', lastName: 'Sethi', cnic: '52102-6677889-9', gender: 'FEMALE' as const, dept: 'Neurology', spec: 'Histopathology', exp: 9, qual: 'MBBS, FCPS Histopathology' },
    { email: 'dr.salman.path@hospital2.com', firstName: 'Dr. Salman', lastName: 'Memon', cnic: '52202-7788990-0', gender: 'MALE' as const, dept: 'Orthopedics', spec: 'Chemical Pathology', exp: 14, qual: 'MBBS, FCPS Chemical Pathology' },
    { email: 'dr.asma.path@hospital2.com', firstName: 'Dr. Asma', lastName: 'Junejo', cnic: '52302-8899001-1', gender: 'FEMALE' as const, dept: 'Gynecology', spec: 'Cytopathology', exp: 8, qual: 'MBBS, MPhil Pathology' },
  ];

  for (const pc of pathConfigs) {
    const user = await prisma.user.create({
      data: { firstName: pc.firstName, lastName: pc.lastName, email: pc.email, cnic: pc.cnic, password: defaultPassword, gender: pc.gender },
    });
    await prisma.userRole.create({ data: { userId: user.id, roleId: roles['PATHOLOGIST'].id } });
    await prisma.pathologist.create({
      data: { userId: user.id, departmentId: deptMap[pc.dept].id, specialization: pc.spec, experience: pc.exp, qualification: pc.qual },
    });
  }
  console.log(`✅ ${pathConfigs.length} pathologists created.\n`);

  // ===========================
  // STEP 10: Drugs (same pharmaceutical catalogue)
  // ===========================
  console.log('💊 Creating drugs...');
  const drugDataList = [
    { name: 'Panadol 500mg', formulaName: 'Paracetamol', chemicalFormula: 'C8H9NO2', strength: '500mg', dosageForm: 'Tablet', description: 'Pain reliever and fever reducer', supplier: 'GlaxoSmithKline Pakistan' },
    { name: 'Disprin 300mg', formulaName: 'Aspirin', chemicalFormula: 'C9H8O4', strength: '300mg', dosageForm: 'Tablet', description: 'Pain reliever, fever reducer, and anti-inflammatory', supplier: 'Reckitt Benckiser Pakistan' },
    { name: 'Brufen 400mg', formulaName: 'Ibuprofen', chemicalFormula: 'C13H18O2', strength: '400mg', dosageForm: 'Tablet', description: 'Non-steroidal anti-inflammatory drug (NSAID)', supplier: 'Abbott Laboratories Pakistan' },
    { name: 'Ponstan 500mg', formulaName: 'Mefenamic Acid', chemicalFormula: 'C15H15NO2', strength: '500mg', dosageForm: 'Capsule', description: 'NSAID for pain relief', supplier: 'Pfizer Pakistan' },
    { name: 'Augmentin 625mg', formulaName: 'Amoxicillin + Clavulanic Acid', chemicalFormula: 'C16H19N3O5S + C8H9NO5', strength: '500mg + 125mg', dosageForm: 'Tablet', description: 'Broad-spectrum antibiotic', supplier: 'GlaxoSmithKline Pakistan' },
    { name: 'Ceclor 500mg', formulaName: 'Cefaclor', chemicalFormula: 'C15H14ClN3O4S', strength: '500mg', dosageForm: 'Capsule', description: 'Cephalosporin antibiotic', supplier: 'Eli Lilly Pakistan' },
    { name: 'Zithromax 500mg', formulaName: 'Azithromycin', chemicalFormula: 'C38H72N2O12', strength: '500mg', dosageForm: 'Tablet', description: 'Macrolide antibiotic for respiratory infections', supplier: 'Pfizer Pakistan' },
    { name: 'Flagyl 400mg', formulaName: 'Metronidazole', chemicalFormula: 'C6H9N3O3', strength: '400mg', dosageForm: 'Tablet', description: 'Antibiotic for anaerobic infections', supplier: 'Sanofi Pakistan' },
    { name: 'Ciproxin 500mg', formulaName: 'Ciprofloxacin', chemicalFormula: 'C17H18FN3O3', strength: '500mg', dosageForm: 'Tablet', description: 'Fluoroquinolone antibiotic', supplier: 'Bayer Pakistan' },
    { name: 'Glucophage 500mg', formulaName: 'Metformin', chemicalFormula: 'C4H11N5', strength: '500mg', dosageForm: 'Tablet', description: 'First-line medication for type 2 diabetes', supplier: 'Merck Pakistan' },
    { name: 'Glucophage XR 1000mg', formulaName: 'Metformin Extended Release', chemicalFormula: 'C4H11N5', strength: '1000mg', dosageForm: 'Tablet', description: 'Extended release metformin for type 2 diabetes', supplier: 'Merck Pakistan' },
    { name: 'Diamicron 80mg', formulaName: 'Gliclazide', chemicalFormula: 'C15H21N3O3S', strength: '80mg', dosageForm: 'Tablet', description: 'Sulfonylurea for type 2 diabetes', supplier: 'Servier Pakistan' },
    { name: 'Januvia 100mg', formulaName: 'Sitagliptin', chemicalFormula: 'C16H15F6N5O', strength: '100mg', dosageForm: 'Tablet', description: 'DPP-4 inhibitor for type 2 diabetes', supplier: 'MSD Pakistan' },
    { name: 'Lipitor 10mg', formulaName: 'Atorvastatin', chemicalFormula: 'C33H35FN2O5', strength: '10mg', dosageForm: 'Tablet', description: 'Statin to lower cholesterol', supplier: 'Pfizer Pakistan' },
    { name: 'Lipitor 20mg', formulaName: 'Atorvastatin', chemicalFormula: 'C33H35FN2O5', strength: '20mg', dosageForm: 'Tablet', description: 'Statin to lower cholesterol', supplier: 'Pfizer Pakistan' },
    { name: 'Concor 5mg', formulaName: 'Bisoprolol', chemicalFormula: 'C18H31NO4', strength: '5mg', dosageForm: 'Tablet', description: 'Beta-blocker for hypertension and heart failure', supplier: 'Merck Pakistan' },
    { name: 'Norvasc 5mg', formulaName: 'Amlodipine', chemicalFormula: 'C20H25ClN2O5', strength: '5mg', dosageForm: 'Tablet', description: 'Calcium channel blocker for hypertension', supplier: 'Pfizer Pakistan' },
    { name: 'Aprovel 150mg', formulaName: 'Irbesartan', chemicalFormula: 'C25H28N6O', strength: '150mg', dosageForm: 'Tablet', description: 'Angiotensin receptor blocker for hypertension', supplier: 'Sanofi Pakistan' },
    { name: 'Lasix 40mg', formulaName: 'Furosemide', chemicalFormula: 'C12H11ClN2O5S', strength: '40mg', dosageForm: 'Tablet', description: 'Loop diuretic for fluid retention', supplier: 'Sanofi Pakistan' },
    { name: 'Nexium 40mg', formulaName: 'Esomeprazole', chemicalFormula: 'C17H19N3O3S', strength: '40mg', dosageForm: 'Capsule', description: 'Proton pump inhibitor for GERD', supplier: 'AstraZeneca Pakistan' },
    { name: 'Risek 20mg', formulaName: 'Omeprazole', chemicalFormula: 'C17H19N3O3S', strength: '20mg', dosageForm: 'Capsule', description: 'Proton pump inhibitor for acid reflux', supplier: 'Getz Pharma' },
    { name: 'Motilium 10mg', formulaName: 'Domperidone', chemicalFormula: 'C22H24ClN5O2', strength: '10mg', dosageForm: 'Tablet', description: 'Anti-emetic and prokinetic', supplier: 'Janssen Pakistan' },
    { name: 'Ventolin Inhaler', formulaName: 'Salbutamol', chemicalFormula: 'C13H21NO3', strength: '100mcg/dose', dosageForm: 'Inhaler', description: 'Short-acting bronchodilator for asthma', supplier: 'GlaxoSmithKline Pakistan' },
    { name: 'Montair 10mg', formulaName: 'Montelukast', chemicalFormula: 'C35H36ClNO3S', strength: '10mg', dosageForm: 'Tablet', description: 'Leukotriene receptor antagonist for asthma', supplier: 'Getz Pharma' },
    { name: 'Zyrtec 10mg', formulaName: 'Cetirizine', chemicalFormula: 'C21H25ClN2O3', strength: '10mg', dosageForm: 'Tablet', description: 'Antihistamine for allergic conditions', supplier: 'GlaxoSmithKline Pakistan' },
    { name: 'Avil 25mg', formulaName: 'Pheniramine', chemicalFormula: 'C16H20N2', strength: '25mg', dosageForm: 'Tablet', description: 'Antihistamine for allergies', supplier: 'Sanofi Pakistan' },
    { name: 'Lexapro 10mg', formulaName: 'Escitalopram', chemicalFormula: 'C20H21FN2O', strength: '10mg', dosageForm: 'Tablet', description: 'SSRI for depression and anxiety', supplier: 'Abbott Laboratories Pakistan' },
    { name: 'Xanax 0.5mg', formulaName: 'Alprazolam', chemicalFormula: 'C17H13ClN4', strength: '0.5mg', dosageForm: 'Tablet', description: 'Benzodiazepine for anxiety disorders', supplier: 'Pfizer Pakistan' },
    { name: 'Neurobion Forte', formulaName: 'Vitamin B Complex', chemicalFormula: 'Various B Vitamins', strength: 'B1 100mg + B6 200mg + B12 200mcg', dosageForm: 'Tablet', description: 'Vitamin B complex for nerve health', supplier: 'P&G Health Pakistan' },
    { name: 'Fefol 150mg', formulaName: 'Ferrous Sulfate + Folic Acid', chemicalFormula: 'FeSO4 + C19H19N7O6', strength: '150mg + 0.5mg', dosageForm: 'Capsule', description: 'Iron supplement for anemia', supplier: 'GlaxoSmithKline Pakistan' },
    { name: 'Calcet D 600mg', formulaName: 'Calcium Carbonate + Vitamin D3', chemicalFormula: 'CaCO3 + C27H44O', strength: '600mg + 400IU', dosageForm: 'Tablet', description: 'Calcium and vitamin D supplement', supplier: 'Getz Pharma' },
    { name: 'Eltroxin 100mcg', formulaName: 'Levothyroxine', chemicalFormula: 'C15H11I4NO4', strength: '100mcg', dosageForm: 'Tablet', description: 'Thyroid hormone replacement', supplier: 'GlaxoSmithKline Pakistan' },
    // Additional drugs from CSV
    { name: 'Ascard 75mg', formulaName: 'Aspirin', chemicalFormula: 'C9H8O4', strength: '75mg', dosageForm: 'Tablet', description: 'Blood thinner for cardiovascular protection', supplier: 'Atco Laboratories Pakistan' },
    { name: 'Ponstan 250mg', formulaName: 'Mefenamic Acid', chemicalFormula: 'C15H15NO2', strength: '250mg', dosageForm: 'Forte', description: 'Pain reliever', supplier: 'Pfizer Pakistan' },
    { name: 'Softin 10mg', formulaName: 'Loratadine', chemicalFormula: 'C22H23ClN2O2', strength: '10mg', dosageForm: 'Tablet', description: 'Antihistamine for allergic conditions', supplier: 'Hilton Pharma Pakistan' },
    { name: 'Gravinate 50mg', formulaName: 'Dimenhydrinate', chemicalFormula: 'C17H21NO', strength: '50mg', dosageForm: 'Tablet', description: 'Anti-nausea and anti-motion sickness medication', supplier: 'Searle Pakistan' },
  ];

  const drugMap: Record<string, Awaited<ReturnType<typeof prisma.drug.create>>> = {};
  for (const d of drugDataList) {
    const drug = await prisma.drug.create({ data: d });
    drugMap[d.name] = drug;
  }
  console.log(`✅ ${drugDataList.length} drugs created.\n`);

  // ===========================
  // STEP 11: Lab Test Templates
  // ===========================
  console.log('📋 Creating lab test templates...');
  const templates: Record<string, Awaited<ReturnType<typeof prisma.labTestTemplate.create>>> = {};

  const templateDefs = [
    {
      name: 'Complete Blood Count (CBC)', version: '1.0', description: 'Comprehensive blood cell count analysis',
      formStructure: {
        sections: [
          { title: 'Red Blood Cells', fields: [{ name: 'rbc_count', label: 'RBC Count', type: 'number', unit: 'million/μL', normalMin: 4.5, normalMax: 5.5 }, { name: 'hemoglobin', label: 'Hemoglobin', type: 'number', unit: 'g/dL', normalMin: 13.5, normalMax: 17.5 }, { name: 'hematocrit', label: 'Hematocrit', type: 'number', unit: '%', normalMin: 38.8, normalMax: 50.0 }] },
          { title: 'White Blood Cells', fields: [{ name: 'wbc_count', label: 'WBC Count', type: 'number', unit: 'thousand/μL', normalMin: 4.5, normalMax: 11.0 }, { name: 'neutrophils', label: 'Neutrophils', type: 'number', unit: '%', normalMin: 40, normalMax: 70 }, { name: 'lymphocytes', label: 'Lymphocytes', type: 'number', unit: '%', normalMin: 20, normalMax: 40 }] },
          { title: 'Platelets', fields: [{ name: 'platelet_count', label: 'Platelet Count', type: 'number', unit: 'thousand/μL', normalMin: 150, normalMax: 400 }] },
        ],
      },
    },
    {
      name: 'Lipid Panel', version: '1.0', description: 'Cholesterol and triglyceride levels',
      formStructure: {
        sections: [{ title: 'Lipid Profile', fields: [{ name: 'total_cholesterol', label: 'Total Cholesterol', type: 'number', unit: 'mg/dL', normalMax: 200 }, { name: 'ldl_cholesterol', label: 'LDL Cholesterol', type: 'number', unit: 'mg/dL', normalMax: 100 }, { name: 'hdl_cholesterol', label: 'HDL Cholesterol', type: 'number', unit: 'mg/dL', normalMin: 40 }, { name: 'triglycerides', label: 'Triglycerides', type: 'number', unit: 'mg/dL', normalMax: 150 }] }],
      },
    },
    {
      name: 'Blood Glucose Test', version: '1.0', description: 'Fasting blood sugar level test',
      formStructure: {
        sections: [{ title: 'Glucose Levels', fields: [{ name: 'fasting_glucose', label: 'Fasting Glucose', type: 'number', unit: 'mg/dL', normalMin: 70, normalMax: 100 }, { name: 'random_glucose', label: 'Random Glucose', type: 'number', unit: 'mg/dL', normalMax: 140 }] }],
      },
    },
    {
      name: 'Liver Function Test (LFT)', version: '1.0', description: 'Comprehensive liver enzyme and function test',
      formStructure: {
        sections: [
          { title: 'Liver Enzymes', fields: [{ name: 'alt', label: 'ALT (SGPT)', type: 'number', unit: 'U/L', normalMin: 7, normalMax: 56 }, { name: 'ast', label: 'AST (SGOT)', type: 'number', unit: 'U/L', normalMin: 10, normalMax: 40 }, { name: 'alp', label: 'Alkaline Phosphatase', type: 'number', unit: 'U/L', normalMin: 44, normalMax: 147 }] },
          { title: 'Bilirubin', fields: [{ name: 'total_bilirubin', label: 'Total Bilirubin', type: 'number', unit: 'mg/dL', normalMin: 0.3, normalMax: 1.2 }, { name: 'direct_bilirubin', label: 'Direct Bilirubin', type: 'number', unit: 'mg/dL', normalMin: 0.0, normalMax: 0.3 }] },
        ],
      },
    },
    {
      name: 'Kidney Function Test (KFT)', version: '1.0', description: 'Renal function assessment',
      formStructure: {
        sections: [{ title: 'Kidney Markers', fields: [{ name: 'creatinine', label: 'Creatinine', type: 'number', unit: 'mg/dL', normalMin: 0.7, normalMax: 1.3 }, { name: 'bun', label: 'Blood Urea Nitrogen', type: 'number', unit: 'mg/dL', normalMin: 7, normalMax: 20 }, { name: 'uric_acid', label: 'Uric Acid', type: 'number', unit: 'mg/dL', normalMin: 3.5, normalMax: 7.2 }] }],
      },
    },
    {
      name: 'Urinalysis', version: '1.0', description: 'Complete urine examination',
      formStructure: {
        sections: [
          { title: 'Physical Properties', fields: [{ name: 'color', label: 'Color', type: 'text' }, { name: 'appearance', label: 'Appearance', type: 'text' }, { name: 'specific_gravity', label: 'Specific Gravity', type: 'number', normalMin: 1.005, normalMax: 1.030 }] },
          { title: 'Chemical Analysis', fields: [{ name: 'ph', label: 'pH', type: 'number', normalMin: 4.5, normalMax: 8.0 }, { name: 'protein', label: 'Protein', type: 'text' }, { name: 'glucose', label: 'Glucose', type: 'text' }] },
        ],
      },
    },
    {
      name: 'Thyroid Function Test (TFT)', version: '1.0', description: 'Comprehensive thyroid hormone panel',
      formStructure: {
        sections: [{ title: 'Thyroid Hormones', fields: [{ name: 'tsh', label: 'TSH', type: 'number', unit: 'mIU/L', normalMin: 0.4, normalMax: 4.0 }, { name: 't3', label: 'T3', type: 'number', unit: 'ng/dL', normalMin: 80, normalMax: 200 }, { name: 't4', label: 'T4', type: 'number', unit: 'μg/dL', normalMin: 5.0, normalMax: 12.0 }, { name: 'free_t4', label: 'Free T4', type: 'number', unit: 'ng/dL', normalMin: 0.8, normalMax: 1.8 }] }],
      },
    },
    {
      name: 'HbA1c Test', version: '1.0', description: 'Glycated hemoglobin test for diabetes monitoring',
      formStructure: {
        sections: [{ title: 'Diabetes Control', fields: [{ name: 'hba1c', label: 'HbA1c', type: 'number', unit: '%', normalMax: 5.7 }, { name: 'average_glucose', label: 'Estimated Average Glucose', type: 'number', unit: 'mg/dL', normalMax: 117 }] }],
      },
    },
    {
      name: 'Electrolyte Panel', version: '1.0', description: 'Serum electrolyte levels',
      formStructure: {
        sections: [{ title: 'Electrolytes', fields: [{ name: 'sodium', label: 'Sodium', type: 'number', unit: 'mmol/L', normalMin: 136, normalMax: 145 }, { name: 'potassium', label: 'Potassium', type: 'number', unit: 'mmol/L', normalMin: 3.5, normalMax: 5.0 }, { name: 'chloride', label: 'Chloride', type: 'number', unit: 'mmol/L', normalMin: 96, normalMax: 106 }, { name: 'bicarbonate', label: 'Bicarbonate', type: 'number', unit: 'mmol/L', normalMin: 22, normalMax: 29 }] }],
      },
    },
    {
      name: 'X-Ray Template', version: '1.0', description: 'Standard X-Ray imaging template',
      formStructure: {
        sections: [{ title: 'X-Ray Findings', fields: [{ name: 'findings', label: 'Findings', type: 'text' }, { name: 'impression', label: 'Impression', type: 'text' }] }],
      },
    },
    {
      name: 'Ultrasound Template', version: '1.0', description: 'Standard ultrasound imaging template',
      formStructure: {
        sections: [{ title: 'Ultrasound Findings', fields: [{ name: 'findings', label: 'Findings', type: 'text' }, { name: 'impression', label: 'Impression', type: 'text' }] }],
      },
    },
    {
      name: 'ECG Template', version: '1.0', description: 'Electrocardiogram template',
      formStructure: {
        sections: [{ title: 'ECG Findings', fields: [{ name: 'heart_rate_ecg', label: 'Heart Rate', type: 'number', unit: 'bpm' }, { name: 'rhythm', label: 'Rhythm', type: 'text' }, { name: 'findings', label: 'Findings', type: 'text' }] }],
      },
    },
  ];

  for (const td of templateDefs) {
    const t = await prisma.labTestTemplate.create({ data: td });
    templates[td.name] = t;
  }
  console.log(`✅ ${templateDefs.length} lab test templates created.\n`);

  // ===========================
  // STEP 12: Lab Tests
  // ===========================
  console.log('🧬 Creating lab tests...');

  const labTestDefs = [
    { name: 'Complete Blood Count (CBC)', description: 'Comprehensive analysis of blood cells', dept: 'General Medicine', template: 'Complete Blood Count (CBC)' },
    { name: 'Lipid Profile', description: 'Cholesterol and lipid analysis', dept: 'Cardiology', template: 'Lipid Panel' },
    { name: 'Fasting Blood Sugar', description: 'Blood glucose level test', dept: 'General Medicine', template: 'Blood Glucose Test' },
    { name: 'Liver Function Test', description: 'Comprehensive liver enzyme analysis', dept: 'General Medicine', template: 'Liver Function Test (LFT)' },
    { name: 'Kidney Function Test', description: 'Renal function markers', dept: 'General Medicine', template: 'Kidney Function Test (KFT)' },
    { name: 'Urinalysis', description: 'Complete urine examination', dept: 'General Medicine', template: 'Urinalysis' },
    { name: 'Thyroid Function Test', description: 'Complete thyroid hormone panel', dept: 'General Medicine', template: 'Thyroid Function Test (TFT)' },
    { name: 'HbA1c Test', description: 'Diabetes monitoring test', dept: 'General Medicine', template: 'HbA1c Test' },
    { name: 'Electrolyte Panel', description: 'Serum electrolyte measurement', dept: 'General Medicine', template: 'Electrolyte Panel' },
    { name: 'X-Ray Chest', description: 'Chest imaging', dept: 'Radiology', template: 'X-Ray Template' },
    { name: 'Ultrasound Abdomen', description: 'Abdominal imaging', dept: 'Radiology', template: 'Ultrasound Template' },
    { name: 'ECG', description: 'Heart rhythm monitoring', dept: 'Cardiology', template: 'ECG Template' },
    { name: 'Blood Sugar Random', description: 'Random glucose level', dept: 'General Medicine', template: 'Blood Glucose Test' },
    { name: 'HbA1c', description: 'Long term sugar monitoring', dept: 'General Medicine', template: 'HbA1c Test' },
    { name: 'Urine Routine', description: 'Urine analysis', dept: 'General Medicine', template: 'Urinalysis' },
  ];

  const labTestMap: Record<string, Awaited<ReturnType<typeof prisma.labTest.create>>> = {};
  for (const lt of labTestDefs) {
    const test = await prisma.labTest.create({
      data: {
        name: lt.name,
        description: lt.description,
        departmentId: deptMap[lt.dept].id,
        templateId: templates[lt.template].id,
      },
    });
    labTestMap[lt.name] = test;
  }
  console.log(`✅ ${labTestDefs.length} lab tests created.\n`);

  // ===========================
  // STEP 13: Parse CSV (checkup_data2.csv)
  // ===========================
  console.log('📄 Parsing CSV file (checkup_data2.csv)...');
  const csvPath = path.resolve(__dirname, '..', 'checkup_data2.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvRows: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });
  console.log(`✅ Parsed ${csvRows.length} rows from CSV.\n`);

  // ===========================
  // STEP 14: Create Patients from CSV
  // ===========================
  console.log('🧑‍🤝‍🧑 Creating patients from CSV data...');

  const csvPatientIds: number[] = [];

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i];
    const gender = row.patient_gender === 'MALE' ? 'MALE' : row.patient_gender === 'FEMALE' ? 'FEMALE' : 'OTHER';
    const isMale = gender === 'MALE';
    const isFemale = gender === 'FEMALE';

    const firstNames = isMale ? maleFirstNames : isFemale ? femaleFirstNames : [...maleFirstNames, ...femaleFirstNames];
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const email = generatePatientEmail();

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        cnic: generateCnic(i + 200),
        password: defaultPassword,
        gender: gender as any,
      },
    });

    await prisma.userRole.create({ data: { userId: user.id, roleId: roles['PATIENT'].id } });

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        dateOfBirth: generateDateOfBirth(i),
        bloodGroup: row.patient_blood_group || null,
        medicalHistory: row.patient_medical_history === 'None significant' ? null : row.patient_medical_history || null,
        allergies: (!row.patient_allergies || row.patient_allergies === 'None') ? null : row.patient_allergies,
        address: row.patient_address || null,
        phoneNumber: generatePhone(i),
        emergencyContact: generatePhone(i + 600),
        onboardingDone: true,
        onboardedAt: new Date(),
      },
    });

    csvPatientIds.push(patient.id);

    if ((i + 1) % 20 === 0) {
      console.log(`   Created ${i + 1}/${csvRows.length} patients...`);
    }
  }
  console.log(`✅ ${csvRows.length} patients created.\n`);

  // ===========================
  // STEP 15: Create Doctor Schedules spanning 2 months
  // ===========================
  console.log('📅 Creating doctor schedules (past 2 months + future 4 days)...');

  const scheduleStartDate = new Date(2026, 0, 1);
  const scheduleEndDate = new Date(2026, 2, 5);
  const allDoctors = await prisma.doctor.findMany();

  type SlotRecord = Awaited<ReturnType<typeof prisma.appointmentSlot.create>>;
  const slotsByDoctorDate: Record<number, Record<string, SlotRecord[]>> = {};

  for (const doctor of allDoctors) {
    slotsByDoctorDate[doctor.id] = {};
    const current = new Date(scheduleStartDate);

    while (current <= scheduleEndDate) {
      if (current.getDay() !== 0) {
        const dateKey = current.toISOString().split('T')[0];

        // Morning shift 9 AM - 1 PM (8 slots)
        const morningStart = new Date(current);
        morningStart.setHours(9, 0, 0, 0);
        const morningEnd = new Date(current);
        morningEnd.setHours(13, 0, 0, 0);

        const morningSchedule = await prisma.doctorSchedule.create({
          data: { doctorId: doctor.id, from: morningStart, to: morningEnd, noOfSlots: 8 },
        });

        const slots: SlotRecord[] = [];
        for (let s = 0; s < 8; s++) {
          const slotStart = new Date(morningStart);
          slotStart.setMinutes(s * 30);
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotStart.getMinutes() + 30);

          const slot = await prisma.appointmentSlot.create({
            data: { scheduleId: morningSchedule.id, startTime: slotStart, endTime: slotEnd, isBookable: true, isBooked: false },
          });
          slots.push(slot);
        }

        // Evening shift 5 PM - 9 PM (8 slots)
        const eveningStart = new Date(current);
        eveningStart.setHours(17, 0, 0, 0);
        const eveningEnd = new Date(current);
        eveningEnd.setHours(21, 0, 0, 0);

        const eveningSchedule = await prisma.doctorSchedule.create({
          data: { doctorId: doctor.id, from: eveningStart, to: eveningEnd, noOfSlots: 8 },
        });

        for (let s = 0; s < 8; s++) {
          const slotStart = new Date(eveningStart);
          slotStart.setMinutes(s * 30);
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotStart.getMinutes() + 30);

          const slot = await prisma.appointmentSlot.create({
            data: { scheduleId: eveningSchedule.id, startTime: slotStart, endTime: slotEnd, isBookable: true, isBooked: false },
          });
          slots.push(slot);
        }

        slotsByDoctorDate[doctor.id][dateKey] = slots;
      }
      current.setDate(current.getDate() + 1);
    }
  }
  console.log('✅ Doctor schedules and slots created.\n');

  // ===========================
  // STEP 16: Create Appointments + Checkups from CSV
  // ===========================
  console.log('📝 Creating appointments and checkups from CSV...');

  const slotUsageIndex: Record<string, number> = {};

  function getNextSlot(doctorId: number, dateKey: string): SlotRecord | null {
    const key = `${doctorId}-${dateKey}`;
    const idx = slotUsageIndex[key] || 0;
    const availableSlots = slotsByDoctorDate[doctorId]?.[dateKey];
    if (!availableSlots || idx >= availableSlots.length) return null;
    slotUsageIndex[key] = idx + 1;
    return availableSlots[idx];
  }

  let checkupsCreated = 0;
  let appointmentsCreated = 0;

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i];
    const patientId = csvPatientIds[i];

    const deptName = row.department_name;
    const doctor = doctorByDept[deptName];
    if (!doctor) {
      console.warn(`  ⚠️ No doctor for department "${deptName}" (row ${i + 1}), skipping.`);
      continue;
    }

    const checkupDate = generateCheckupDate(i);
    const dateKey = checkupDate.toISOString().split('T')[0];

    let slot = getNextSlot(doctor.id, dateKey);
    if (!slot) {
      for (let offset = 1; offset <= 5; offset++) {
        const d1 = new Date(checkupDate);
        d1.setDate(d1.getDate() + offset);
        const dk1 = d1.toISOString().split('T')[0];
        slot = getNextSlot(doctor.id, dk1);
        if (slot) break;

        const d2 = new Date(checkupDate);
        d2.setDate(d2.getDate() - offset);
        const dk2 = d2.toISOString().split('T')[0];
        slot = getNextSlot(doctor.id, dk2);
        if (slot) break;
      }
    }

    if (!slot) {
      console.warn(`  ⚠️ No slot available for row ${i + 1}, skipping.`);
      continue;
    }

    // Mark slot as booked
    await prisma.appointmentSlot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    // Derive realistic timestamps from the slot's date
    const slotDate = new Date(slot.startTime);
    const slotDateEnd = new Date(slotDate.getTime() + 30 * 60 * 1000); // +30 min

    const isWalkin = i % 3 === 0;
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        slotId: slot.id,
        reason: row.symptoms.substring(0, 200),
        createdAt: slotDate,
        updatedAt: slotDate,
      },
    });

    if (isWalkin) {
      const receptionist = receptionists[i % receptionists.length];
      await prisma.walkinAppointment.create({
        data: {
          appointmentId: appointment.id,
          receptionistId: receptionist.id,
          status: 'COMPLETED',
          createdAt: slotDate,
          updatedAt: slotDate,
        },
      });
    } else {
      await prisma.onlineAppointment.create({
        data: {
          appointmentId: appointment.id,
          status: 'COMPLETED',
          createdAt: slotDate,
          updatedAt: slotDate,
        },
      });
    }

    // Parse prescription JSON
    let prescriptionData: CsvPrescription | null = null;
    try {
      if (row.prescription && row.prescription.trim()) {
        prescriptionData = JSON.parse(row.prescription) as CsvPrescription;
      }
    } catch {
      // Skip bad JSON
    }

    // Parse test recommendations JSON
    let testRecData: CsvTestRecommendation | null = null;
    try {
      if (row.test_recommendations && row.test_recommendations.trim()) {
        testRecData = JSON.parse(row.test_recommendations) as CsvTestRecommendation;
      }
    } catch {
      // Skip bad JSON
    }

    // Create Prescription
    const prescription = await prisma.prescription.create({
      data: {
        additionalMedications: prescriptionData?.additional_medications || null,
        createdAt: slotDateEnd,
        updatedAt: slotDateEnd,
      },
    });

    // Create medications
    if (prescriptionData?.medications) {
      for (const med of prescriptionData.medications) {
        const drugName = med.drug?.name;
        if (!drugName) continue;

        let drug = drugMap[drugName];
        if (!drug) {
          drug = await prisma.drug.create({
            data: {
              name: med.drug.name,
              formulaName: med.drug.formula_name || 'Unknown',
              chemicalFormula: med.drug.chemical_formula || 'Unknown',
              strength: med.drug.strength || 'Unknown',
              dosageForm: med.drug.dosage_form || 'Tablet',
              description: med.drug.description || '',
              supplier: 'Unknown Supplier',
            },
          });
          drugMap[drugName] = drug;
          console.log(`   💊 Auto-created drug: ${drugName}`);
        }

        await prisma.medication.create({
          data: {
            drugId: drug.id,
            prescriptionId: prescription.id,
            dosePerIntake: med.dose_per_intake || '1 dose',
            timesPerDay: med.times_per_day || 1,
            totalDays: med.total_days || 7,
            instructions: med.instructions || null,
            createdAt: slotDateEnd,
            updatedAt: slotDateEnd,
          },
        });
      }
    }

    // Create CheckupTestRecommendation
    const testRecommendation = await prisma.checkupTestRecommendation.create({
      data: {
        additionalTests: testRecData?.additional_tests || null,
        createdAt: slotDateEnd,
        updatedAt: slotDateEnd,
      },
    });

    // Link recommended lab tests
    if (testRecData?.recommended_tests) {
      for (const rec of testRecData.recommended_tests) {
        const testName = rec.lab_test?.name;
        if (!testName) continue;

        let labTest = labTestMap[testName];
        if (!labTest) {
          const deptForTest = deptMap['General Medicine'];
          const defaultTemplate = templates['Complete Blood Count (CBC)'];
          labTest = await prisma.labTest.create({
            data: {
              name: testName,
              description: rec.lab_test.description || testName,
              departmentId: deptForTest.id,
              templateId: defaultTemplate.id,
            },
          });
          labTestMap[testName] = labTest;
          console.log(`   🧬 Auto-created lab test: ${testName}`);
        }

        await prisma.recommendedLabTest.create({
          data: {
            testRecommendationId: testRecommendation.id,
            labTestId: labTest.id,
            createdAt: slotDateEnd,
            updatedAt: slotDateEnd,
          },
        });
      }
    }

    // Create Checkup
    await prisma.checkup.create({
      data: {
        appointmentId: appointment.id,
        bloodPressure: row.blood_pressure || null,
        temperature: row.temperature || null,
        heartRate: row.heart_rate || null,
        bloodSugar: row.blood_sugar || null,
        symptoms: row.symptoms || 'No symptoms recorded',
        diagnosis: row.diagnosis || 'Pending diagnosis',
        notes: row.notes || null,
        insights: row.insights || null,
        gapAnalysis: row.gap_analysis || null,
        isDraft: false,
        prescriptionId: prescription.id,
        checkupTestRecommendationId: testRecommendation.id,
        createdAt: slotDateEnd,
        updatedAt: slotDateEnd,
      },
    });

    appointmentsCreated++;
    checkupsCreated++;

    if ((i + 1) % 20 === 0) {
      console.log(`   Processed ${i + 1}/${csvRows.length} checkup rows...`);
    }
  }

  console.log(`✅ ${appointmentsCreated} appointments created.`);
  console.log(`✅ ${checkupsCreated} checkups created.\n`);

  // ===========================
  // STEP 17: Add a few future BOOKED appointments (no checkups)
  // ===========================
  console.log('📌 Creating future booked appointments...');

  const allPatientsForFuture = await prisma.patient.findMany({ take: 10 });
  const futureDates = ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05'];
  let futureCount = 0;

  for (let f = 0; f < 15; f++) {
    const patientForFuture = allPatientsForFuture[f % allPatientsForFuture.length];
    const doctorForFuture = allDoctors[f % allDoctors.length];
    const dateKey = futureDates[f % futureDates.length];
    const slot = getNextSlot(doctorForFuture.id, dateKey);
    if (!slot) continue;

    await prisma.appointmentSlot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientForFuture.id,
        slotId: slot.id,
        reason: 'Routine follow-up',
      },
    });

    if (f % 2 === 0) {
      await prisma.onlineAppointment.create({
        data: { appointmentId: appointment.id, status: 'BOOKED' },
      });
    } else {
      await prisma.walkinAppointment.create({
        data: {
          appointmentId: appointment.id,
          receptionistId: receptionists[f % receptionists.length].id,
          status: 'BOOKED',
        },
      });
    }
    futureCount++;
  }
  console.log(`✅ ${futureCount} future appointments created.\n`);

  // ===========================
  // DONE
  // ===========================
  const totalPatients = await prisma.patient.count();
  const totalAppointments = await prisma.appointment.count();
  const totalCheckups = await prisma.checkup.count();
  const totalDrugs = await prisma.drug.count();
  const totalLabTests = await prisma.labTest.count();
  const totalDepartments = await prisma.department.count();
  const totalMedications = await prisma.medication.count();
  const totalRecommendedTests = await prisma.recommendedLabTest.count();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║               SEED 2 (Instance 2) COMPLETE               ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Patients:              ${String(totalPatients).padStart(5)}                           ║`);
  console.log(`║  Appointments:          ${String(totalAppointments).padStart(5)}                           ║`);
  console.log(`║  Checkups:              ${String(totalCheckups).padStart(5)}                           ║`);
  console.log(`║  Drugs:                 ${String(totalDrugs).padStart(5)}                           ║`);
  console.log(`║  Lab Tests:             ${String(totalLabTests).padStart(5)}                           ║`);
  console.log(`║  Departments:           ${String(totalDepartments).padStart(5)}                           ║`);
  console.log(`║  Medications:           ${String(totalMedications).padStart(5)}                           ║`);
  console.log(`║  Recommended Tests:     ${String(totalRecommendedTests).padStart(5)}                           ║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Roles: 6 (Admin, Doctor, Patient, Receptionist,         ║');
  console.log('║         Lab Technician, Pathologist)                      ║');
  console.log('║  Standard Departments: 7                                  ║');
  console.log('║  Doctors: 7 (one per department)                          ║');
  console.log('║  Receptionists: 3                                         ║');
  console.log('║  Lab Technicians: 4                                       ║');
  console.log('║  Pathologists: 4                                          ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Admin:        admin@hospital2.com / admin123456          ║');
  console.log('║  Doctor:       doctor@hospital2.com / password123         ║');
  console.log('║  Receptionist: receptionist@hospital2.com / password123   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
}

main()
  .catch((e) => {
    console.error('❌ Seed 2 failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
