import { Module } from '@nestjs/common';import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';import { UsersService } from './users.service';

import { PrismaModule } from '../prisma/prisma.module';import { UsersController } from './users.controller';

import { User } from './entities/user.entity';

@Module({

  imports: [PrismaModule],@Module({

  controllers: [UsersController],  imports: [TypeOrmModule.forFeature([User])],

  providers: [UsersService],  controllers: [UsersController],

  exports: [UsersService],  providers: [UsersService],

})  exports: [UsersService],

export class UsersModule {}})
export class UsersModule { }