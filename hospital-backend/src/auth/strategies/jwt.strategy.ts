import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET') || '',
    });
  }

  // async validate(payload: {
  //   sub: number;
  //   email: string;
  // }) {
  //   const user =
  //     await this.prisma.user.findUnique({
  //       where: {
  //         id: payload.sub,
  //       },
  //     });
  //   return user;
  // }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        doctor: {
          include: {
            department: {
              include: {
                standardDepartment: true,
              },
            },
          },
        },
        patient: true,
        receptionist: true,
      },
    });
    if (!user) {
      return null;
    }

    const roles = user.userRoles.map((ur) => ur.role.name);

    const response: any = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      cnic: user.cnic,
      createdAt: user.createdAt,
      registeredAt: user.registeredAt,
      isActive: user.isActive,
      roles,
    };

    if (roles.includes('DOCTOR') && user.doctor) {
      response.doctor = {
        id: user.doctor.id,
        licenseNumber: user.doctor.licenseNumber,
        specialization: user.doctor.specialization,
        experience: user.doctor.experience,
        qualification: user.doctor.qualification,
        department: {
          id: user.doctor.department.id,
          name: user.doctor.department.name,
          description: user.doctor.department.description,
          standardDepartment: user.doctor.department.standardDepartment,
        },
      };
    }

    if (roles.includes('PATIENT') && user.patient) {
      response.patient = {
        id: user.patient.id,
        dateOfBirth: user.patient.dateOfBirth,
        bloodGroup: user.patient.bloodGroup,
        address: user.patient.address,
        phoneNumber: user.patient.phoneNumber,
        emergencyContact: user.patient.emergencyContact,
        medicalHistory: user.patient.medicalHistory,
        familyHistory: user.patient.familyHistory,
        allergies: user.patient.allergies,
      };
    }

    if (roles.includes('RECEPTIONIST') && user.receptionist) {
      response.receptionist = {
        id: user.receptionist.id,
        phoneNumber: user.receptionist.phoneNumber,
        createdAt: user.receptionist.createdAt,
      };
    }

    return response;
  }
}