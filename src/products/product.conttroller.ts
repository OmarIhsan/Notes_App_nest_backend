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
import { productService } from './product.service';
import { CreateproductDto } from './dto/create-product.dto';
import { UpdateproductDto } from './dto/update-product.dto';

@Controller('products')
export class productController {
  constructor(private readonly productService: productService) {}

  @Post()
  async create(@Body() createproductDto: CreateproductDto) {
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
    @Body() updateproductDto: UpdateproductDto,
  ) {
    return this.productService.update(id, updateproductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.productService.remove(id);
  }
}