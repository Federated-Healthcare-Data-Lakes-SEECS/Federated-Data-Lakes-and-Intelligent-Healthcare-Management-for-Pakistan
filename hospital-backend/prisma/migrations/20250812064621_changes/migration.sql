/*
  Warnings:

  - Made the column `specialization` on table `doctors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `experience` on table `doctors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `qualification` on table `doctors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `blood_group` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone_number` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emergency_contact` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `medical_history` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `family_history` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `allergies` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cnic` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "doctors" ALTER COLUMN "specialization" SET NOT NULL,
ALTER COLUMN "specialization" SET DEFAULT 'General Practitioner',
ALTER COLUMN "experience" SET NOT NULL,
ALTER COLUMN "experience" SET DEFAULT 0,
ALTER COLUMN "qualification" SET NOT NULL,
ALTER COLUMN "qualification" SET DEFAULT 'MBBS';

-- AlterTable
ALTER TABLE "patients" ALTER COLUMN "blood_group" SET NOT NULL,
ALTER COLUMN "blood_group" SET DEFAULT '',
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "address" SET DEFAULT '',
ALTER COLUMN "phone_number" SET NOT NULL,
ALTER COLUMN "phone_number" SET DEFAULT '',
ALTER COLUMN "emergency_contact" SET NOT NULL,
ALTER COLUMN "emergency_contact" SET DEFAULT '',
ALTER COLUMN "medical_history" SET NOT NULL,
ALTER COLUMN "medical_history" SET DEFAULT '',
ALTER COLUMN "family_history" SET NOT NULL,
ALTER COLUMN "family_history" SET DEFAULT '',
ALTER COLUMN "allergies" SET NOT NULL,
ALTER COLUMN "allergies" SET DEFAULT '';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "cnic" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL;
