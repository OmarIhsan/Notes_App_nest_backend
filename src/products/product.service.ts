import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly categoryService: CategoryService,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const { name, description, price, stock, categoryId } = createProductDto;

        const existing = await this.productRepository.findOne({ where: { name } });
        if (existing) {
            throw new ConflictException('Product name already exists');
        }

        if (categoryId) {
            const category = await this.categoryService.findOne(categoryId);
        }

        const product = this.productRepository.create({
            name,
            description,
            price,
            stock,
            categoryId,
        });

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

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);

        const { name, description, price, stock, categoryId } = updateProductDto;


        if (name && name !== product.name) {
            const existingProduct = await this.productRepository.findOne({
                where: { name },
            });
            if (existingProduct) {
                throw new ConflictException('Product name already exists');
            }
        }

        if (categoryId && categoryId !== product.categoryId) {
            const category = await this.categoryService.findOne(categoryId);
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