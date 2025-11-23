import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckupDto, CheckupResponseDto } from './dto';

@Injectable()
export class CheckupService {
  constructor(private prisma: PrismaService) {}

  async createCheckup(
    dto: CreateCheckupDto,
    userId: number,
  ): Promise<CheckupResponseDto> {
    // Verify doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Verify appointment exists and belongs to this doctor
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: {
        slot: {
          include: {
            schedule: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.slot.schedule.doctorId !== doctor.id) {
      throw new ForbiddenException(
        'You can only create checkups for your own appointments',
      );
    }

    // Check if checkup already exists for this appointment
    const existingCheckup = await this.prisma.checkup.findUnique({
      where: { appointmentId: dto.appointmentId },
    });

    if (existingCheckup) {
      throw new BadRequestException(
        'Checkup already exists for this appointment',
      );
    }

    // Validate drugs exist
    if (dto.medications.length > 0) {
      const drugIds = dto.medications.map((m) => m.drugId);
      const drugs = await this.prisma.drug.findMany({
        where: { id: { in: drugIds }, isActive: true },
      });

      if (drugs.length !== drugIds.length) {
        throw new BadRequestException('One or more drugs not found or inactive');
      }
    }

    // Validate lab tests exist
    if (dto.recommendedLabTestIds.length > 0) {
      const labTests = await this.prisma.labTest.findMany({
        where: { id: { in: dto.recommendedLabTestIds }, isActive: true },
      });

      if (labTests.length !== dto.recommendedLabTestIds.length) {
        throw new BadRequestException(
          'One or more lab tests not found or inactive',
        );
      }
    }

    // Create checkup with all related data in a transaction
    const checkup = await this.prisma.$transaction(async (prisma) => {
      // Create prescription
      const prescription = await prisma.prescription.create({
        data: {
          additionalMedications: dto.additionalMedications,
        },
      });

      // Create medications
      if (dto.medications.length > 0) {
        await prisma.medication.createMany({
          data: dto.medications.map((med) => ({
            drugId: med.drugId,
            prescriptionId: prescription.id,
            dosePerIntake: med.dosePerIntake,
            timesPerDay: med.timesPerDay,
            totalDays: med.totalDays,
            instructions: med.instructions,
          })),
        });
      }

      // Create test recommendation
      const testRecommendation = await prisma.checkupTestRecommendation.create({
        data: {
          additionalTests: dto.additionalTests,
        },
      });

      // Create recommended lab tests
      if (dto.recommendedLabTestIds.length > 0) {
        await prisma.recommendedLabTest.createMany({
          data: dto.recommendedLabTestIds.map((labTestId) => ({
            testRecommendationId: testRecommendation.id,
            labTestId,
          })),
        });
      }

      // Create checkup
      const newCheckup = await prisma.checkup.create({
        data: {
          appointmentId: dto.appointmentId,
          bloodPressure: dto.bloodPressure,
          temperature: dto.temperature,
          heartRate: dto.heartRate,
          bloodSugar: dto.bloodSugar,
          symptoms: dto.symptoms,
          diagnosis: dto.diagnosis,
          notes: dto.notes,
          prescriptionId: prescription.id,
          checkupTestRecommendationId: testRecommendation.id,
        },
      });

      return newCheckup;
    });

    // Return full checkup details
    return this.getCheckupById(checkup.id, userId);
  }

  async getCheckupHistory(userId: number): Promise<CheckupResponseDto[]> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const checkups = await this.prisma.checkup.findMany({
      where: {
        appointment: {
          slot: {
            schedule: {
              doctorId: doctor.id,
            },
          },
        },
      },
      include: {
        appointment: {
          include: {
            slot: true,
            patient: {
              include: {
                user: true,
              },
            },
          },
        },
        prescription: {
          include: {
            medications: {
              include: {
                drug: true,
              },
            },
          },
        },
        checkupTestRecommendation: {
          include: {
            recommendedLabTests: {
              include: {
                labTest: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return checkups.map((checkup) => this.transformToCheckupResponse(checkup));
  }

  async getCheckupById(
    id: number,
    userId: number,
  ): Promise<CheckupResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const checkup = await this.prisma.checkup.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            slot: true,
            patient: {
              include: {
                user: true,
              },
            },
          },
        },
        prescription: {
          include: {
            medications: {
              include: {
                drug: true,
              },
            },
          },
        },
        checkupTestRecommendation: {
          include: {
            recommendedLabTests: {
              include: {
                labTest: true,
              },
            },
          },
        },
      },
    });

    if (!checkup) {
      throw new NotFoundException('Checkup not found');
    }

    // Verify this checkup belongs to the requesting doctor
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: checkup.appointmentId },
      include: {
        slot: {
          include: {
            schedule: true,
          },
        },
      },
    });

    if (appointment?.slot.schedule.doctorId !== doctor.id) {
      throw new ForbiddenException(
        'You can only view checkups for your own appointments',
      );
    }

    return this.transformToCheckupResponse(checkup);
  }

  private transformToCheckupResponse(checkup: any): CheckupResponseDto {
    return {
      id: checkup.id,
      appointmentId: checkup.appointmentId,
      bloodPressure: checkup.bloodPressure,
      temperature: checkup.temperature,
      heartRate: checkup.heartRate,
      bloodSugar: checkup.bloodSugar,
      symptoms: checkup.symptoms,
      diagnosis: checkup.diagnosis,
      notes: checkup.notes,
      prescription: {
        id: checkup.prescription.id,
        additionalMedications: checkup.prescription.additionalMedications,
        medications: checkup.prescription.medications.map((med: any) => ({
          id: med.id,
          drug: {
            id: med.drug.id,
            name: med.drug.name,
            strength: med.drug.strength,
            dosageForm: med.drug.dosageForm,
            formulaName: med.drug.formulaName,
          },
          dosePerIntake: med.dosePerIntake,
          timesPerDay: med.timesPerDay,
          totalDays: med.totalDays,
          instructions: med.instructions,
        })),
      },
      checkupTestRecommendation: {
        id: checkup.checkupTestRecommendation.id,
        additionalTests: checkup.checkupTestRecommendation.additionalTests,
        recommendedLabTests:
          checkup.checkupTestRecommendation.recommendedLabTests.map(
            (test: any) => ({
              id: test.id,
              labTest: {
                id: test.labTest.id,
                name: test.labTest.name,
              },
            }),
          ),
      },
      appointment: {
        id: checkup.appointment.id,
        patientId: checkup.appointment.patientId,
        slotId: checkup.appointment.slotId,
        reason: checkup.appointment.reason,
        createdAt: checkup.appointment.createdAt,
        slot: {
          startTime: checkup.appointment.slot.startTime,
          endTime: checkup.appointment.slot.endTime,
        },
        patient: {
          id: checkup.appointment.patient.id,
          firstName: checkup.appointment.patient.user.firstName,
          lastName: checkup.appointment.patient.user.lastName || '',
          dateOfBirth: checkup.appointment.patient.dateOfBirth,
          bloodGroup: checkup.appointment.patient.bloodGroup,
          medicalHistory: checkup.appointment.patient.medicalHistory,
          allergies: checkup.appointment.patient.allergies,
        },
      },
      createdAt: checkup.createdAt,
      updatedAt: checkup.updatedAt,
    };
  }
}
