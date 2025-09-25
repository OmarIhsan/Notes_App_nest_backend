import { PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';import { PartialType } from '@nestjs/mapped-types';

import { IsOptional, IsString, IsEmail, IsBoolean, IsEnum, IsNumber, IsDateString } from 'class-validator';import { CreateUserDto } from './create-user.dto';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) { }
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'john_doe_updated', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'john.doe.updated@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'John Updated', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe Updated', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: UserRole.ADMIN, enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: SubscriptionStatus.ACTIVE, enum: SubscriptionStatus, required: false })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  subscriptionStart?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  subscriptionEnd?: string;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  documentsAccessed?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  annotationsCreated?: number;
}