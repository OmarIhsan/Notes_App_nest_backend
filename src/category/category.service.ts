import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        createCategoryDto: CreateCategoryDto,
        image?: Express.Multer.File,
    ): Promise<any> {
        const { name, description, isActive, displayOrder } = createCategoryDto;
        
        // Check if category with same name exists
        const existingCategory = await this.prisma.category.findFirst({ 
            where: { name } 
        });
        if (existingCategory) {
            throw new ConflictException('Category name already exists');
        }
        
        const category = await this.prisma.category.create({
            data: {
                name,
                description,
                imagePath: image ? `uploads/categories/${image.filename}` : undefined,
                isActive: isActive ?? true,
                displayOrder: displayOrder ?? 0,
            }
        });
        
        return category;
    }

    async findAll(
        page: number = 1, 
        limit: number = 10,
        includeInactive: boolean = false
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const offset = (page - 1) * limit;
        const whereCondition = includeInactive ? {} : { isActive: true };
        
        const [data, total] = await Promise.all([
            this.prisma.category.findMany({
                where: whereCondition,
                skip: offset,
                take: limit,
                orderBy: [
                    { displayOrder: 'asc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    userProgress: true
                }
            }),
            this.prisma.category.count({ where: whereCondition })
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string): Promise<any> {
        const category = await this.prisma.category.findUnique({ 
            where: { id },
            include: { userProgress: true }
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<any> {
        const category = await this.findOne(id);
        const { name, description, isActive, displayOrder } = updateCategoryDto;

        // Check if name is being changed and if new name already exists
        if (name && name !== category.name) {
            const existingCategory = await this.prisma.category.findFirst({
                where: { name, NOT: { id } },
            });
            if (existingCategory) {
                throw new ConflictException('Category name already exists');
            }
        }

        // Update the category
        const updatedCategory = await this.prisma.category.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(isActive !== undefined && { isActive }),
                ...(displayOrder !== undefined && { displayOrder }),
            }
        });

        return updatedCategory;
    }

    async remove(id: string): Promise<{ message: string }> {
        await this.findOne(id); // Check if exists
        await this.prisma.category.delete({ where: { id } });
        return { message: 'Category deleted successfully' };
    }

    async updateStats(id: string): Promise<void> {
        // This would typically update totalStages and totalDocuments
        // Will implement when stages and documents are added
        await this.findOne(id); // Check if exists
        
        // Update stats when stages module is implemented
        // const stagesCount = await this.prisma.stage.count({ where: { categoryId: id } });
        // const documentsCount = await this.prisma.document.count({ where: { stages: { some: { categoryId: id } } } });
        
        // await this.prisma.category.update({
        //     where: { id },
        //     data: {
        //         totalStages: stagesCount,
        //         totalDocuments: documentsCount
        //     }
        // });
    }
}