import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean = false;

  @IsOptional()
  @IsNumber()
  maxDownloads?: number;

  @IsOptional()
  @IsNumber()
  maxGroups?: number;

  @IsOptional()
  @IsBoolean()
  aiFeatures?: boolean = false;

  @IsOptional()
  @IsBoolean()
  prioritySupport?: boolean = false;
}