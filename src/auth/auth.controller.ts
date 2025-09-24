import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Patch,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }



    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }


    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    async changePassword(
        @CurrentUser() user: User,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(user.id, changePasswordDto);
    }
    // Protect a route with JWT
    @UseGuards(JwtAuthGuard)
    @Get('protected')
    async protectedRoute(@CurrentUser() user: User) {
        return { message: 'This is protected', user: user.email };
    }
    // Protect with role-based access
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Get('admin-only')
    async adminOnly(@CurrentUser() user: User) {
        return { message: 'Admin access granted', user };
    }
}

function Roles(...roles: UserRole[]): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata('roles', roles, target[propertyKey]);
    };
}


