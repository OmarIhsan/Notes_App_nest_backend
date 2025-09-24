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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change user password' })
    async changePassword(
        @CurrentUser() user: any,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(user.id, changePasswordDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@CurrentUser() user: any) {
        return this.authService.validateUser(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('protected')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Protected route example' })
    async protectedRoute(@CurrentUser() user: any) {
        return { message: 'This is protected', user: user.email };
    }
}


