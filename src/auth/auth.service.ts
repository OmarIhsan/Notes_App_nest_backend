import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: any; access_token: string }> {
        const { email, password, username, firstName, lastName } = registerDto;

        // Check if user already exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });

        if (existingUser) {
            throw new ConflictException('User with this email or username already exists');
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 12);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                username,
                firstName,
                lastName,
                password: hashedPassword,
            },
        });

        // Generate JWT token
        const payload = { sub: user.id, email: user.email, username: user.username };
        const access_token = this.jwtService.sign(payload);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            access_token,
        };
    }

    async login(loginDto: LoginDto): Promise<{ user: any; access_token: string }> {
        const { email, password } = loginDto;

        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Update last active time
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
        });

        // Generate JWT token
        const payload = { sub: user.id, email: user.email, username: user.username };
        const access_token = this.jwtService.sign(payload);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            access_token,
        };
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
        const { currentPassword, newPassword } = changePasswordDto;

        // Find user
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const hashedNewPassword = await bcryptjs.hash(newPassword, 12);

        // Update password
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });

        return { message: 'Password changed successfully' };
    }

    async validateUser(userId: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                subscriptionPlan: true,
                subscriptionStatus: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            return null;
        }

        return user;
    }
}