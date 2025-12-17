import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updatePatientProfile(userId: number, dto: UpdatePatientProfileDto) {
    // First check if the user exists and is a patient
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        },
        patient: true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has patient role
    const isPatient = user.userRoles.some(ur => ur.role.name === 'PATIENT');
    if (!isPatient) {
      throw new ForbiddenException('Only patients can update their profile');
    }

    // If user is a patient but doesn't have a patient profile yet
    if (!user.patient) {
      throw new NotFoundException('Patient profile not found');
    }

    // Extract CNIC if provided (goes to User table)
    const { cnic, ...patientData } = dto;

    // Update user's CNIC if provided
    if (cnic !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { cnic }
      });
    }

    // Update the patient profile
    const updatedPatient = await this.prisma.patient.update({
      where: {
        userId: userId
      },
      data: {
        ...patientData,
        onboardingDone: true
      }
    });

    return updatedPatient;
  }
}
