import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  @IsOptional() // Optional because default is CUSTOMER
  role?: UserRole;

  @IsString()
  @MinLength(6)
  password: string;
}