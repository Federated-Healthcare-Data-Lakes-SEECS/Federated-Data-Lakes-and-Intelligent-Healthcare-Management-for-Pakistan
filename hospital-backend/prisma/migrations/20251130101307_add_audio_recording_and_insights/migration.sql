/*
  Warnings:

  - You are about to drop the column `created_by` on the `Drug` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `LabTest` table. All the data in the column will be lost.
  - You are about to drop the column `daily_frequency` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `dosage` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `duration_days` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `guidelines` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `WalkinAppointment` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `registered_at` on the `users` table. All the data in the column will be lost.
  - Added the required column `template_id` to the `LabTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dosePerIntake` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `times_per_day` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_days` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receptionist_id` to the `WalkinAppointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `doctor_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `receptionists` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone_number` on table `receptionists` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AudioProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PatientLabTestStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Drug" DROP CONSTRAINT "Drug_created_by_fkey";

-- DropForeignKey
ALTER TABLE "LabTest" DROP CONSTRAINT "LabTest_created_by_fkey";

-- DropForeignKey
ALTER TABLE "WalkinAppointment" DROP CONSTRAINT "WalkinAppointment_created_by_fkey";

-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_created_by_fkey";

-- DropIndex
DROP INDEX "users_cnic_key";

-- AlterTable
ALTER TABLE "Checkup" ADD COLUMN     "insights" TEXT,
ADD COLUMN     "is_draft" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Drug" DROP COLUMN "created_by";

-- AlterTable
ALTER TABLE "LabTest" DROP COLUMN "created_by",
ADD COLUMN     "template_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Medication" DROP COLUMN "daily_frequency",
DROP COLUMN "dosage",
DROP COLUMN "duration_days",
DROP COLUMN "guidelines",
DROP COLUMN "quantity",
ADD COLUMN     "dosePerIntake" VARCHAR(100) NOT NULL,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "times_per_day" INTEGER NOT NULL,
ADD COLUMN     "total_days" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "WalkinAppointment" DROP COLUMN "created_by",
ADD COLUMN     "receptionist_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "appointment_slots" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_bookable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "is_active",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "doctor_schedules" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "created_by",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "onboarded_at" TIMESTAMP(3),
ADD COLUMN     "onboarding_done" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "blood_group" DROP NOT NULL,
ALTER COLUMN "blood_group" DROP DEFAULT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "address" DROP DEFAULT,
ALTER COLUMN "phone_number" DROP NOT NULL,
ALTER COLUMN "phone_number" DROP DEFAULT,
ALTER COLUMN "emergency_contact" DROP NOT NULL,
ALTER COLUMN "emergency_contact" DROP DEFAULT,
ALTER COLUMN "medical_history" DROP NOT NULL,
ALTER COLUMN "medical_history" DROP DEFAULT,
ALTER COLUMN "family_history" DROP NOT NULL,
ALTER COLUMN "family_history" DROP DEFAULT,
ALTER COLUMN "allergies" DROP NOT NULL,
ALTER COLUMN "allergies" DROP DEFAULT;

-- AlterTable
ALTER TABLE "receptionists" ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "qualification" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "phone_number" SET NOT NULL,
ALTER COLUMN "phone_number" SET DEFAULT '';

-- AlterTable
ALTER TABLE "user_roles" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "registered_at",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL,
ALTER COLUMN "cnic" DROP NOT NULL;

-- CreateTable
CREATE TABLE "lab_technicians" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "specialization" VARCHAR(100) NOT NULL DEFAULT '',
    "qualification" VARCHAR(255) NOT NULL DEFAULT '',
    "experience" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pathologists" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "specialization" VARCHAR(100) NOT NULL,
    "qualification" VARCHAR(255) NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pathologists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkup_audios" (
    "id" SERIAL NOT NULL,
    "checkup_id" INTEGER NOT NULL,
    "audio_data" BYTEA NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "duration" DOUBLE PRECISION,
    "processing_status" "AudioProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkup_audios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTestTemplate" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "version" VARCHAR(50) NOT NULL,
    "form_structure" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTestTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_lab_tests" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "lab_test_id" INTEGER NOT NULL,
    "result" TEXT,
    "performed_at" TIMESTAMP(3),
    "status" "PatientLabTestStatus" NOT NULL DEFAULT 'PENDING',
    "lab_technician_assigned" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_lab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lab_technicians_user_id_key" ON "lab_technicians"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pathologists_user_id_key" ON "pathologists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "checkup_audios_checkup_id_key" ON "checkup_audios"("checkup_id");

-- CreateIndex
CREATE UNIQUE INDEX "LabTestTemplate_name_key" ON "LabTestTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LabTestTemplate_name_version_key" ON "LabTestTemplate"("name", "version");

-- AddForeignKey
ALTER TABLE "lab_technicians" ADD CONSTRAINT "lab_technicians_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_technicians" ADD CONSTRAINT "lab_technicians_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pathologists" ADD CONSTRAINT "pathologists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pathologists" ADD CONSTRAINT "pathologists_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "LabTestTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalkinAppointment" ADD CONSTRAINT "WalkinAppointment_receptionist_id_fkey" FOREIGN KEY ("receptionist_id") REFERENCES "receptionists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkup_audios" ADD CONSTRAINT "checkup_audios_checkup_id_fkey" FOREIGN KEY ("checkup_id") REFERENCES "Checkup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_lab_tests" ADD CONSTRAINT "patient_lab_tests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_lab_tests" ADD CONSTRAINT "patient_lab_tests_lab_test_id_fkey" FOREIGN KEY ("lab_test_id") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_lab_tests" ADD CONSTRAINT "patient_lab_tests_lab_technician_assigned_fkey" FOREIGN KEY ("lab_technician_assigned") REFERENCES "lab_technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
