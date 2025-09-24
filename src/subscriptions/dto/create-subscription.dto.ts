import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { SubscriptionPlan } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsString()
  userId: string;

  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  maxCategories?: number;

  @IsOptional()
  @IsNumber()
  maxDocuments?: number;

  @IsOptional()
  @IsBoolean()
  premiumFeatures?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
