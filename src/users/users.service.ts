import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { email, name, password, role } = createUserDto;
        const existingUser = await this.userRepository.findOne({
            where: { email: email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepository.create({
            email: email,
            name: name,
            role: UserRole.CUSTOMER,
            password: hashedPassword,
        });

        return this.userRepository.save(user);
    }
    async findAll(offset: number = 1, limit: number = 10): Promise<{}> {
        const [data, count] = await this.userRepository.findAndCount({
            skip: offset,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return {
            data,
            count,
        };
    }
    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
    async update(id: number, updateData: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        const { email, name } = updateData;

        if (email && email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email },
            });
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;

        return this.userRepository.save(user);
    }
    async remove(id: number): Promise<{ message: string }> {

        const user = await this.findOne(id);
        await this.userRepository.remove(user);
        return { message: 'User deleted successfully' };
    }
}
