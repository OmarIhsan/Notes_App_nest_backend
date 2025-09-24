import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    username: string;

    @IsString()
    @MinLength(2)
    firstName: string;

    @IsString()
    @MinLength(2)
    lastName: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsString()
    university?: string;

    @IsOptional()
    yearOfStudy?: number;

    @IsOptional()
    @IsString()
    specialization?: string;
}