import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCheckupDto } from './dto';

@Injectable()
export class CheckupService {
  constructor(private prisma: PrismaService) {}

  async createCheckup(data: CreateCheckupDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { slot: true, onlineAppointment: true, walkinAppointment: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.onlineAppointment) {
      if (appointment.onlineAppointment.status !== 'BOOKED') {
        throw new BadRequestException(
          'Cannot create checkup if status is not BOOKED',
        );
      }
    }

    if (appointment.walkinAppointment) {
      if (appointment.walkinAppointment.status !== 'BOOKED') {
        throw new BadRequestException(
          'Cannot create checkup if status is not BOOKED',
        );
      }
    }

    // Past Appointment Check
    if (appointment.slot.startTime > new Date()) {
      throw new BadRequestException(
        'Cannot create checkup for future appointment',
      );
    }

    if (appointment.slot.endTime < new Date()) {
      throw new BadRequestException(
        'Cannot create checkup for past appointment',
      );
    }

    const existingCheckup = await this.prisma.checkup.findUnique({
      where: { appointmentId: data.appointmentId },
    });

    if (existingCheckup) {
      throw new BadRequestException(
        'Checkup already exists for this appointment',
      );
    }

    // check if drugs exist in db
    if (data.medications && data.medications.length > 0) {
      for (const med of data.medications) {
        const drug = await this.prisma.drug.findUnique({
          where: { id: med.drugId, isActive: true },
        });
        if (!drug) {
          throw new BadRequestException(`Drug with ID ${med.drugId} not found`);
        }
      }
    }

    if (data.recommendedTests && data.recommendedTests.length > 0) {
      for (const test of data.recommendedTests) {
        const labTest = await this.prisma.labTest.findUnique({
          where: { id: test.testId, isActive: true },
        });
        if (!labTest) {
          throw new BadRequestException(
            `Lab test with ID ${test.testId} not found`,
          );
        }
      }
    }

    const checkup = await this.prisma.$transaction(async (prisma) => {
      const prescription = await prisma.prescription.create({
        data: {
          additionalMedications: data.additionalMedications,
        },
      });

      if (data.medications && data.medications.length > 0) {
        await prisma.medication.createMany({
          data: data.medications.map((med) => ({
            prescriptionId: prescription.id,
            drugId: med.drugId,
            quantity: med.quantity,
            dosage: med.dosage,
            dailyFrequency: med.dailyFrequency,
            durationDays: med.durationDays,
            guidelines: med.guidelines,
          })),
        });
      }

      const checkupTestRecommendations =
        await prisma.checkupTestRecommendation.create({
          data: {
            additionalTests: data.additionalTests,
          },
        });

      if (data.recommendedTests && data.recommendedTests.length > 0) {
        await prisma.recommendedLabTest.createMany({
          data: data.recommendedTests.map((test) => ({
            recommendationId: checkupTestRecommendations.id,
            labTestId: test.testId,
          })),
        });
      }

      return prisma.checkup.create({
        data: {
          appointmentId: data.appointmentId,
          bloodPressure: data.bloodPressure,
          temperature: data.temperature,
          heartRate: data.heartRate,
          bloodSugar: data.bloodSugar,
          symptoms: data.symptoms,
          diagnosis: data.diagnosis,
          notes: data.notes,
          prescriptionId: prescription.id,
          checkupTestRecommendationId: checkupTestRecommendations.id,
        },
        include: { prescription: true, checkupTestRecommendation: true },
      });
    });

    return checkup;
  }

  getAllCheckups(doctorId?: number, patientId?: number) {
    return this.prisma.checkup.findMany({
      where: {
        AND: [
          doctorId ? { appointment: { slot: { schedule: { doctorId } } } } : {},
          patientId ? { appointment: { patientId } } : {},
        ],
      },
      include: { prescription: true, checkupTestRecommendation: true },
    });
  }
}
