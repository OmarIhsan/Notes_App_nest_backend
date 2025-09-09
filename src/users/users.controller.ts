
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    Query
}
    from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';



@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }
    @Get()
    async findAll(@Query('offset') offset: number = 1, @Query('limit') limit: number = 10) {
        return this.usersService.findAll(offset, limit);
    }
    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.usersService.findOne(id);
    }
    @Put(':id')
    async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.usersService.remove(id);
    }

}
