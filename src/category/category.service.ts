import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(
        createCategoryDto: CreateCategoryDto,
        image?: Express.Multer.File,
    ): Promise<Category> {
        const { name, description } = createCategoryDto;
        const existingCategory = await this.categoryRepository.findOne({ where: { name } });

        
        
        const category = this.categoryRepository.create({
            name,
            description,
            image: `uploads/categories/${image ? image.filename : ''}`
        });
        return this.categoryRepository.save(category);
    }

    async findAll(offset: number = 1, limit: number = 10): Promise<{}> {
        const [data, count] = await this.categoryRepository.findAndCount({
            skip: offset,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, count };
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { id: id } });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);

        if (!category) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }

        const { name } = updateCategoryDto;

        if (name && name !== category.name) {
            const existingCategory = await this.categoryRepository.findOne({
                where: { name },
            });
            if (existingCategory) {
                throw new ConflictException('Category name already exists');
            }
        }

        if (name !== undefined) category.name = name;

        return this.categoryRepository.save(category);
    }

    async remove(id: number): Promise<{ message: string }> {
        const category = await this.findOne(id);
        await this.categoryRepository.remove(category);
        return { message: 'Category deleted successfully' };
    }
}