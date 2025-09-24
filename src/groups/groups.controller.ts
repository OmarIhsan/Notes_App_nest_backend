import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JoinGroupDto, GroupRole } from './dto/join-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new lecture group' })
  @ApiBearerAuth()
  async create(@Body() createGroupDto: CreateGroupDto, @CurrentUser() user: any) {
    return this.groupsService.create(createGroupDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'subject', required: false, type: String })
  @ApiQuery({ name: 'university', required: false, type: String })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('subject') subject?: string,
    @Query('university') university?: string,
    @CurrentUser() user?: any,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (subject) where.subject = { contains: subject, mode: 'insensitive' };
    if (university) where.university = { contains: university, mode: 'insensitive' };

    return this.groupsService.findAll({
      skip,
      take: limit,
      where,
      userId: user?.id,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search groups by query and filters' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'subject', required: false, type: String })
  @ApiQuery({ name: 'university', required: false, type: String })
  @ApiQuery({ name: 'isPrivate', required: false, type: Boolean })
  async searchGroups(
    @Query('q') query: string,
    @Query('subject') subject?: string,
    @Query('university') university?: string,
    @Query('isPrivate') isPrivate?: boolean,
  ) {
    return this.groupsService.searchGroups(query, {
      subject,
      university,
      isPrivate,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.groupsService.findOne(id, user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update group' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @CurrentUser() user: any,
  ) {
    return this.groupsService.update(id, updateGroupDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete group (soft delete)' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.remove(id, user.id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Join a group' })
  @ApiBearerAuth()
  async joinGroup(
    @Param('id') id: string,
    @Body() joinGroupDto: JoinGroupDto,
    @CurrentUser() user: any,
  ) {
    return this.groupsService.joinGroup(id, user.id, joinGroupDto);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Leave a group' })
  @ApiBearerAuth()
  async leaveGroup(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.leaveGroup(id, user.id);
  }

  @Post(':id/members/:userId/approve')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve a pending membership' })
  @ApiBearerAuth()
  async approveMembership(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.groupsService.approveMembership(id, userId, user.id);
  }

  @Patch(':id/members/:userId/role')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update member role' })
  @ApiBearerAuth()
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('role') newRole: GroupRole,
    @CurrentUser() user: any,
  ) {
    return this.groupsService.updateMemberRole(id, userId, newRole, user.id);
  }
}