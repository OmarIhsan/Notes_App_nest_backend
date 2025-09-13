import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    async create(createproductDto: CreateProductDto): Promise<Product> {
        const { name } = createproductDto;
        const existing = await this.productRepository.findOne({ where: { name } });
        if (existing) {
            throw new ConflictException('product name already exists');
        }
        const product = this.productRepository.create(createproductDto);
        return this.productRepository.save(product);
    }

    async findAll(offset: number = 0, limit: number = 10): Promise<{}> {
        const [data, count] = await this.productRepository.findAndCount({
            relations: ['category'],
            skip: offset,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, count };
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({ 
            where: { id }, 
            relations: ['category'] 
        });

        if (!product) {
            throw new NotFoundException('product not found');
        }

        return product;
    }

    async update(id: number, UpdateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);

        const { name, description, price, stock, categoryId } = UpdateProductDto;


        if (name && name !== product.name) {
            const existingProduct = await this.productRepository.findOne({
                where: { name },
            });
            if (existingProduct) {
                throw new ConflictException('Product name already exists');
            }
        }

        if (categoryId && categoryId !== product.categoryId) {
            const categoryExists = await this.productRepository.manager.findOne('categories', { 
                where: { id: categoryId } 
            });
            if (!categoryExists) {
                throw new NotFoundException('Category not found');
            }
        }

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (stock !== undefined) product.stock = stock;
        if (categoryId !== undefined) product.categoryId = categoryId;

        return this.productRepository.save(product);
    }

    async remove(id: number): Promise<{ message: string }> {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
        return { message: 'product deleted successfully' };
    }
}