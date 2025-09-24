import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

// Feature modules  
import { LecturesModule } from './lectures/lectures.module';
import { GroupsModule } from './groups/groups.module';
import { FileProcessingModule } from './file-processing/file-processing.module';

// Core controllers and services
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 15 * 60 * 1000, // 15 minutes
        limit: 100, // requests per ttl
      },
    ]),

    // Static file serving for uploads
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Core modules
    PrismaModule,
    AuthModule,

    // Feature modules
    LecturesModule,
    GroupsModule,
    FileProcessingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
