import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './products/product.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '2004',
      database: 'eCommerce-nest',
      autoLoadEntities: true,
      synchronize: true, // ⚠️ Disable in production
    }),
    UsersModule,
    ProductModule,
    CategoryModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
