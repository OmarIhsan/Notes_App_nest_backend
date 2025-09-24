import { IsString, IsOptional, IsBoolean, IsEnum, IsArray } from 'class-validator';

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsString()
  telegramChannelId?: string;

  @IsOptional()
  @IsString()
  telegramInviteLink?: string;

  @IsOptional()
  @IsBoolean()
  autoSync?: boolean = true;

  @IsOptional()
  @IsString()
  syncSchedule?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean = false;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean = false;

  @IsOptional()
  @IsEnum(SubscriptionPlan)
  subscriptionRequired?: SubscriptionPlan = SubscriptionPlan.FREE;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFileTypes?: string[] = ['pdf', 'ppt', 'pptx', 'doc', 'docx'];

  @IsOptional()
  maxFileSize?: number = 50; // MB
}