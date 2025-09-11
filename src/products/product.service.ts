import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { product } from './entities/product.entity';
import { CreateproductDto } from './dto/create-product.dto';
import { UpdateproductDto } from './dto/update-product.dto';

@Injectable()
export class productService {
    constructor(
        @InjectRepository(product)
        private readonly productRepository: Repository<product>,
    ) { }

    async create(createproductDto: CreateproductDto): Promise<product> {
        const { name } = createproductDto;
        const existing = await this.productRepository.findOne({ where: { name } });
        if (existing) {
            throw new ConflictException('product name already exists');
        }
        const product = this.productRepository.create(createproductDto);
        return this.productRepository.save(product);
    }

    async findAll(offset: number = 1, limit: number = 10): Promise<{}> {
        const [data, count] = await this.productRepository.findAndCount({
            skip: offset,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, count };
    }

    async findOne(id: number): Promise<product> {
        const product = await this.productRepository.findOne({ where: { id: id } });

        if (!product) {
            throw new NotFoundException('product not found');
        }

        return product;
    }

    async update(id: number, updateproductDto: UpdateproductDto): Promise<product> {
        const product = await this.findOne(id);

        if (!product) {
            throw new NotFoundException(`product with id ${id} not found`);
        }

        const { name } = updateproductDto;

        if (name && name !== product.name) {
            const existingproduct = await this.productRepository.findOne({
                where: { name },
            });
            if (existingproduct) {
                throw new ConflictException('product name already exists');
            }
        }

        if (name !== undefined) product.name = name;

        return this.productRepository.save(product);
    }

    async remove(id: number): Promise<{ message: string }> {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
        return { message: 'product deleted successfully' };
    }
}