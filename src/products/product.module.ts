import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { productService } from './product.service';
import { productController } from './product.conttroller';
import { product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([product])],
  controllers: [productController],
  providers: [productService],
  exports: [productService], 
})
export class productModule {}