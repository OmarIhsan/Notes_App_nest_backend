import { IsEnum } from 'class-validator';

export enum GroupRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER'
}

export class JoinGroupDto {
  @IsEnum(GroupRole)
  role?: GroupRole = GroupRole.MEMBER;
}