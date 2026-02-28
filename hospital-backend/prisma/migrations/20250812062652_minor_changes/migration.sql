/*
  Warnings:

  - The `status` column on the `OnlineAppointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `WalkinAppointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `daily_frequency` on the `Medication` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WalkinAppointmentStatus" AS ENUM ('BOOKED', 'COMPLETED', 'NOT_ATTENDED');

-- CreateEnum
CREATE TYPE "OnlineAppointmentStatus" AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED', 'NOT_ATTENDED');

-- DropIndex
DROP INDEX "appointments_slot_id_key";

-- AlterTable
ALTER TABLE "Medication" DROP COLUMN "daily_frequency",
ADD COLUMN     "daily_frequency" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OnlineAppointment" DROP COLUMN "status",
ADD COLUMN     "status" "OnlineAppointmentStatus" NOT NULL DEFAULT 'BOOKED';

-- AlterTable
ALTER TABLE "WalkinAppointment" DROP COLUMN "status",
ADD COLUMN     "status" "WalkinAppointmentStatus" NOT NULL DEFAULT 'BOOKED';

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "reason" TEXT;
