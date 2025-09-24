import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
}

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);