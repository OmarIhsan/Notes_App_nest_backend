import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  async create(@Body() createproductDto: CreateProductDto) {
    return this.productService.create(createproductDto);
  }

  @Get()
  async findAll(
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
  ) {
    return this.productService.findAll(offset, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateproductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateproductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.productService.remove(id);
  }
}