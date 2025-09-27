import {
    ForbiddenException,
    Injectable,
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

    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        // generate the password hash
        const hash = await bcrypt.hash(dto.password, 10);

        try {
            // save the new user in the db
            const user =  await this.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                data: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    email: dto.email,
                    password: hash,
                    cnic: dto.cnic,
                    gender: dto.gender,
                },
            });

            await prisma.patient.create({
            data: {
                userId: user.id,
                createdBy: user.id,
            },
            });

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

        return this.signToken(user.id, user.email);
        } catch (error) {
            if (
                error instanceof
                PrismaClientKnownRequestError
            ) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                        'Credentials taken',
                    );
                }
            }
            throw error;
        }
    }

    async login(dto: LoginDto): Promise<AuthResponseDto> {
        console.log(dto);
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
    ): Promise<{ access_token: string }> {
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
            access_token: token,
        };
    }
}