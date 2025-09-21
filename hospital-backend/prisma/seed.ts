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

  const patientRole = await prisma.role.upsert({
    where: { name: 'PATIENT' },
    update: {},
    create: {
      name: 'PATIENT',
      description: 'Patient',
    },
  });

  const receptionistRole = await prisma.role.upsert({
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
      cnic: process.env.ADMIN_CNIC || '1234567890123',
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

  console.log('Seed data created successfully!');
  console.log('Admin credentials:');
  console.log('Email:', process.env.ADMIN_EMAIL || 'admin@hospital.com');
  console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
