import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stage } from './entities/stage.entity';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(Stage)
    private readonly stageRepository: Repository<Stage>,
  ) {}

  async create(createStageDto: CreateStageDto): Promise<Stage> {
    const {
      name,
      description,
      categoryId,
      stageNumber,
      displayOrder,
      isActive,
      isRequired,
      requirements,
      estimatedDuration,
      prerequisiteStages,
      minimumScore,
    } = createStageDto;

    // Check if stage number already exists for this category
    if (stageNumber) {
      const existingStage = await this.stageRepository.findOne({
        where: { 
          categoryId, 
          stageNumber 
        },
      });

      if (existingStage) {
        throw new ConflictException(`Stage number ${stageNumber} already exists for this category`);
      }
    }

    // Auto-assign stage number if not provided
    let finalStageNumber = stageNumber;
    if (!finalStageNumber) {
      const maxStageNumber = await this.stageRepository
        .createQueryBuilder('stage')
        .select('MAX(stage.stageNumber)', 'max')
        .where('stage.categoryId = :categoryId', { categoryId })
        .getRawOne();
      
      finalStageNumber = (maxStageNumber?.max || 0) + 1;
    }

    // Auto-assign display order if not provided
    let finalDisplayOrder = displayOrder;
    if (!finalDisplayOrder) {
      const maxDisplayOrder = await this.stageRepository
        .createQueryBuilder('stage')
        .select('MAX(stage.displayOrder)', 'max')
        .where('stage.categoryId = :categoryId', { categoryId })
        .getRawOne();
      
      finalDisplayOrder = (parseFloat(maxDisplayOrder?.max) || 0) + 1;
    }

    const stage = this.stageRepository.create({
      name,
      description,
      categoryId,
      stageNumber: finalStageNumber,
      displayOrder: finalDisplayOrder,
      isActive: isActive ?? true,
      isRequired: isRequired ?? false,
      requirements,
      estimatedDuration,
      prerequisiteStages: prerequisiteStages || [],
      minimumScore,
    });

    return this.stageRepository.save(stage);
  }

  async findAll(
    categoryId?: string,
    page: number = 1,
    limit: number = 10,
    includeInactive: boolean = false
  ): Promise<{ stages: Stage[]; total: number; pages: number; currentPage: number }> {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.stageRepository
      .createQueryBuilder('stage')
      .leftJoinAndSelect('stage.category', 'category')
      .skip(skip)
      .take(limit)
      .orderBy('stage.displayOrder', 'ASC')
      .addOrderBy('stage.stageNumber', 'ASC');

    if (categoryId) {
      queryBuilder.where('stage.categoryId = :categoryId', { categoryId });
    }

    if (!includeInactive) {
      queryBuilder.andWhere('stage.isActive = :isActive', { isActive: true });
    }

    const [stages, total] = await queryBuilder.getManyAndCount();

    return {
      stages,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: string): Promise<Stage> {
    const stage = await this.stageRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!stage) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }

    return stage;
  }

  async findByCategory(categoryId: string, includeInactive: boolean = false): Promise<Stage[]> {
    const queryBuilder = this.stageRepository
      .createQueryBuilder('stage')
      .where('stage.categoryId = :categoryId', { categoryId })
      .orderBy('stage.displayOrder', 'ASC')
      .addOrderBy('stage.stageNumber', 'ASC');

    if (!includeInactive) {
      queryBuilder.andWhere('stage.isActive = :isActive', { isActive: true });
    }

    return queryBuilder.getMany();
  }

  async update(id: string, updateStageDto: UpdateStageDto): Promise<Stage> {
    const stage = await this.findOne(id);

    // Check for stage number conflicts if updating stage number
    if (updateStageDto.stageNumber && updateStageDto.stageNumber !== stage.stageNumber) {
      const existingStage = await this.stageRepository.findOne({
        where: { 
          categoryId: stage.categoryId, 
          stageNumber: updateStageDto.stageNumber 
        },
      });

      if (existingStage && existingStage.id !== id) {
        throw new ConflictException(`Stage number ${updateStageDto.stageNumber} already exists for this category`);
      }
    }

    // Validate prerequisite stages exist
    if (updateStageDto.prerequisiteStages) {
      const prerequisiteIds = updateStageDto.prerequisiteStages;
      const existingPrerequisites = await this.stageRepository.findByIds(prerequisiteIds);
      
      if (existingPrerequisites.length !== prerequisiteIds.length) {
        const missing = prerequisiteIds.filter(id => 
          !existingPrerequisites.some(stage => stage.id === id)
        );
        throw new BadRequestException(`Prerequisite stages not found: ${missing.join(', ')}`);
      }

      // Check for circular dependencies
      if (prerequisiteIds.includes(id)) {
        throw new BadRequestException('A stage cannot be a prerequisite of itself');
      }
    }

    Object.assign(stage, updateStageDto);
    return this.stageRepository.save(stage);
  }

  async remove(id: string): Promise<{ message: string }> {
    const stage = await this.findOne(id);
    
    // Check if this stage is a prerequisite for other stages
    const dependentStages = await this.stageRepository
      .createQueryBuilder('stage')
      .where(':stageId = ANY(stage.prerequisiteStages)', { stageId: id })
      .getMany();

    if (dependentStages.length > 0) {
      const dependentNames = dependentStages.map(s => s.name).join(', ');
      throw new BadRequestException(
        `Cannot delete stage. It is a prerequisite for: ${dependentNames}`
      );
    }

    await this.stageRepository.remove(stage);
    return { message: 'Stage deleted successfully' };
  }

  async reorderStages(categoryId: string, stageOrders: { id: string; displayOrder: number }[]): Promise<Stage[]> {
    // Validate all stages belong to the category
    const stages = await this.stageRepository.find({
      where: { categoryId },
    });

    const stageIds = stages.map(s => s.id);
    const providedIds = stageOrders.map(o => o.id);
    
    const invalidIds = providedIds.filter(id => !stageIds.includes(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(`Invalid stage IDs: ${invalidIds.join(', ')}`);
    }

    // Update display orders
    const updatedStages: Stage[] = [];
    for (const order of stageOrders) {
      const stage = stages.find(s => s.id === order.id);
      if (stage) {
        stage.displayOrder = order.displayOrder;
        const savedStage = await this.stageRepository.save(stage);
        updatedStages.push(savedStage);
      }
    }

    return updatedStages;
  }

  async getStageStats(id: string): Promise<any> {
    // TODO: Implement stage statistics when UserStageProgress entity is created
    const stage = await this.findOne(id);
    
    return {
      stage,
      stats: {
        totalUsers: 0,
        completedUsers: 0,
        averageScore: 0,
        averageCompletionTime: 0,
        completionRate: 0,
      },
      message: 'Stage statistics will be implemented when UserStageProgress entity is created',
    };
  }
}