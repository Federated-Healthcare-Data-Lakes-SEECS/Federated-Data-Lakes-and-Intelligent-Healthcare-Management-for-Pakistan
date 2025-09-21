import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorScheduleDto } from './dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { DoctorSchedule } from '@prisma/client';

@Injectable()
export class DoctorScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  private readonly scheduleServiceBaseUrl =
    process.env.CHECKUP_MICROSERVICE_URL || 'http://localhost:3001';

  async createDoctorSchedule(userId: number, dto: CreateDoctorScheduleDto) {
    // Check doctor existence
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new BadRequestException('User is not a doctor or does not exist');
    }

    // Send request to schedule microservice
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.scheduleServiceBaseUrl}/schedules`, {
          ...dto,
          doctorId: doctor.id,
        }),
      );

      return response.data as DoctorSchedule;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  // Get my doctor schedules
  async getMyDoctorSchedules(userId: number) {
    // Check doctor existence
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new BadRequestException('User is not a doctor or does not exist');
    }

    // Send request to schedule microservice
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.scheduleServiceBaseUrl}/schedules/?doctorId=${doctor.id}`,
        ),
      );

      return response.data as DoctorSchedule[];
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  // Get doctor schedule by ID
  async getDoctorScheduleById(scheduleId: number) {
    // Send request to schedule microservice
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.scheduleServiceBaseUrl}/schedules/${scheduleId}`,
        ),
      );

      return response.data as DoctorSchedule;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  // Delete doctor schedule by ID
  async deleteDoctorScheduleById(scheduleId: number, userId: number) {
    // Check doctor existence
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new BadRequestException('User is not a doctor or does not exist');
    }

    // Send request to schedule microservice
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.scheduleServiceBaseUrl}/schedules/${scheduleId}/delete`,
          {
            data: { doctorId: doctor.id }, // body goes here
          },
        ),
      );

      return response.data as { success: boolean; message: string };
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  // Handle Axios errors
  private handleAxiosError(error: unknown): never {
    const axiosError = error as AxiosError;

    if (axiosError.response?.data) {
      const errorMessage =
        (axiosError.response.data as { message?: string })?.message ||
        'Checkup Service Error';
      throw new BadRequestException(errorMessage);
    } else {
      throw new BadRequestException('Unable to connect to checkup service');
    }
  }
}
