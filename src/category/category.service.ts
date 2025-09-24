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
        const { name, description, isActive, displayOrder } = createCategoryDto;
        
        // Check if category with same name exists
        const existingCategory = await this.categoryRepository.findOne({ where: { name } });
        if (existingCategory) {
            throw new ConflictException('Category name already exists');
        }
        
        const category = this.categoryRepository.create({
            name,
            description,
            image: image ? `uploads/categories/${image.filename}` : undefined,
            isActive: isActive ?? true,
            displayOrder: displayOrder ?? 0,
        });
        
        return this.categoryRepository.save(category);
    }

    async findAll(
        page: number = 1, 
        limit: number = 10,
        includeInactive: boolean = false
    ): Promise<{
        data: Category[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const offset = (page - 1) * limit;
        const whereCondition = includeInactive ? {} : { isActive: true };
        
        const [data, total] = await this.categoryRepository.findAndCount({
            where: whereCondition,
            skip: offset,
            take: limit,
            order: { displayOrder: 'ASC', createdAt: 'DESC' },
            relations: ['userProgress'],
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({ 
            where: { id },
            relations: ['userProgress']
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);
        const { name, description, isActive, displayOrder } = updateCategoryDto;

        // Check if name is being changed and if new name already exists
        if (name && name !== category.name) {
            const existingCategory = await this.categoryRepository.findOne({
                where: { name },
            });
            if (existingCategory) {
                throw new ConflictException('Category name already exists');
            }
        }

        // Update fields
        Object.assign(category, {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(isActive !== undefined && { isActive }),
            ...(displayOrder !== undefined && { displayOrder }),
        });

        return this.categoryRepository.save(category);
    }

    async remove(id: string): Promise<{ message: string }> {
        const category = await this.findOne(id);
        await this.categoryRepository.remove(category);
        return { message: 'Category deleted successfully' };
    }

    async updateStats(id: string): Promise<void> {
        // This would typically update totalStages and totalDocuments
        // Will implement when stages and documents are added
        const category = await this.findOne(id);
        // category.totalStages = await this.stageRepository.count({ where: { categoryId: id } });
        // category.totalDocuments = await this.documentRepository.count({ where: { stage: { categoryId: id } } });
        await this.categoryRepository.save(category);
    }
}