import {
    ForbiddenException,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) { }

    async register(dto: RegisterDto): Promise<{ success: boolean; message: string }> {
        // generate the password hash
        const hash = await bcrypt.hash(dto.password, 10);

        try {
            // save the new user in the db
            await this.prisma.$transaction(async (prisma) => {
                // create user
                const user = await prisma.user.create({
                    data: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        email: dto.email,
                        password: hash,
                        cnic: dto.cnic,
                        gender: dto.gender,
                        isActive: true,
                        // createdAt and registeredAt will be set by defaults in Prisma schema
                    },
                });

                // create patient record linked to user with onboardingDone false and createdBy null (self-register)
                await prisma.patient.create({
                    data: {
                        userId: user.id,
                        onboardingDone: false,
                    },
                });

                // find patient role
                const role = await prisma.role.findUnique({
                    where: {
                        name: 'PATIENT',
                    },
                });

                if (!role) {
                    throw new ForbiddenException('Role "PATIENT" not found');
                }

                await prisma.userRole.create({
                    data: {
                        userId: user.id,
                        roleId: role.id,
                    },
                });

                return user;
            });

            // Return success message (frontend can redirect to login)
            return { success: true, message: 'Registration successful' };
        } catch (error) {
            if (
                error instanceof
                PrismaClientKnownRequestError
            ) {
                if (error.code === 'P2002') {
                    // unique constraint failed
                    // figure out which field
                    const meta: any = (error as any).meta;
                    const target = meta?.target;
                    if (Array.isArray(target) && target.includes('email')) {
                        throw new BadRequestException('Email already in use');
                    }
                    if (Array.isArray(target) && target.includes('cnic')) {
                        throw new BadRequestException('CNIC already in use');
                    }
                    throw new BadRequestException('Unique constraint failed');
                }
            }
            throw error;
        }
    }

    async login(dto: LoginDto): Promise<AuthResponseDto> {
        // find the user by email
        const user =
            await this.prisma.user.findUnique({
                where: {
                    email: dto.email,
                },
            });
        // if user does not exist throw exception
        if (!user)
            throw new ForbiddenException(
                'Credentials incorrect',
            );

        // compare password
        const pwMatches = await bcrypt.compare(
            dto.password,
            user.password,
        );
        // if password incorrect throw exception
        if (!pwMatches)
            throw new ForbiddenException(
                'Credentials incorrect',
            );
        return this.signToken(user.id, user.email);
    }

    async signToken(
        userId: number,
        email: string,
    ): Promise<{ access_token: string, success: boolean }> {
        const payload = {
            sub: userId,
            email,
        };
        const secret = this.config.get('JWT_SECRET') as string;

        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '60m',
                secret: secret,
            },
        );

        return {
            success: true,
            access_token: token,
        };
    }
}