import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StagesService } from './stages.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('stages')
@Controller('stages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new stage' })
  @ApiResponse({ status: 201, description: 'Stage created successfully' })
  @ApiResponse({ status: 409, description: 'Stage number already exists for this category' })
  async create(@Body() createStageDto: CreateStageDto) {
    return this.stagesService.create(createStageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stages with pagination' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive stages (default: false)' })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('includeInactive', new ParseBoolPipe({ optional: true })) includeInactive: boolean = false,
  ) {
    return this.stagesService.findAll(categoryId, page, limit, includeInactive);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get all stages for a specific category' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive stages (default: false)' })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('includeInactive', new ParseBoolPipe({ optional: true })) includeInactive: boolean = false,
  ) {
    return this.stagesService.findByCategory(categoryId, includeInactive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stage by ID' })
  @ApiResponse({ status: 200, description: 'Stage found successfully' })
  @ApiResponse({ status: 404, description: 'Stage not found' })
  async findOne(@Param('id') id: string) {
    return this.stagesService.findOne(id);
  }

  @Get(':id/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get stage statistics' })
  @ApiResponse({ status: 200, description: 'Stage statistics retrieved successfully' })
  async getStageStats(@Param('id') id: string) {
    return this.stagesService.getStageStats(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a stage' })
  @ApiResponse({ status: 200, description: 'Stage updated successfully' })
  @ApiResponse({ status: 404, description: 'Stage not found' })
  @ApiResponse({ status: 409, description: 'Stage number already exists for this category' })
  async update(@Param('id') id: string, @Body() updateStageDto: UpdateStageDto) {
    return this.stagesService.update(id, updateStageDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a stage' })
  @ApiResponse({ status: 200, description: 'Stage deleted successfully' })
  @ApiResponse({ status: 404, description: 'Stage not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete stage - it is a prerequisite for other stages' })
  async remove(@Param('id') id: string) {
    return this.stagesService.remove(id);
  }

  @Post('category/:categoryId/reorder')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reorder stages within a category' })
  @ApiResponse({ status: 200, description: 'Stages reordered successfully' })
  async reorderStages(
    @Param('categoryId') categoryId: string,
    @Body() stageOrders: { id: string; displayOrder: number }[],
  ) {
    return this.stagesService.reorderStages(categoryId, stageOrders);
  }
}