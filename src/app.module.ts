import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

// Core modules
import { UsersModule } from './users/users.module';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { User } from './users/entities/user.entity';
import { Category } from './category/entities/category.entity';
import { Subscription } from './subscriptions/entities/subscription.entity';

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



    // Database configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '2004',
      database: process.env.DB_DATABASE || 'document_annotation_db',
      entities: [
        User,
        Category,
        Subscription,
      ],
      synchronize: process.env.NODE_ENV !== 'production', // ⚠️ Disable in production
      logging: process.env.NODE_ENV === 'development',
    }),

    // Feature modules
    UsersModule,
    CategoryModule,
    AuthModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
