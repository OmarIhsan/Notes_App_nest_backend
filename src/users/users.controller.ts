import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    Query,
    UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User, UserRole } from './entities/user.entity';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({
        summary: 'Create a new user',
        description: 'Creates a new user account'
    })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'User successfully created',
        type: User
    })
    @ApiResponse({
        status: 409,
        description: 'Email already exists'
    })
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Get()
    @ApiOperation({
        summary: 'Get all users',
        description: 'Retrieves a paginated list of users'
    })
    @ApiResponse({
        status: 200,
        description: 'List of users retrieved successfully',
        type: [User]
    })
    async findAll(@Query('offset') offset: number = 1, @Query('limit') limit: number = 10) {
        return this.usersService.findAll(offset, limit);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Retrieves a user by their ID'
    })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({
        status: 200,
        description: 'User retrieved successfully',
        type: User
    })
    @ApiResponse({
        status: 404,
        description: 'User not found'
    })
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Update user',
        description: 'Updates a user\'s information'
    })
    @ApiParam({ name: 'id', example: 'uuid-string' })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
        type: User
    })
    @ApiResponse({
        status: 404,
        description: 'User not found'
    })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete user',
        description: 'Permanently removes a user'
    })
    @ApiParam({ name: 'id', example: 'uuid-string' })
    @ApiResponse({
        status: 200,
        description: 'User deleted successfully',
        schema: {
            properties: {
                message: {
                    type: 'string',
                    example: 'User deleted successfully'
                }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'User not found'
    })
    async remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
