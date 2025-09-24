import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { LecturesService } from './lectures.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('lectures')
@Controller('lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new lecture' })
  @ApiBearerAuth()
  async create(
    @Body() createLectureDto: CreateLectureDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.lecturesService.create(createLectureDto, file, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lectures with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'subject', required: false, type: String })
  @ApiQuery({ name: 'groupId', required: false, type: String })
  @ApiQuery({ name: 'difficulty', required: false, type: String })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('subject') subject?: string,
    @Query('groupId') groupId?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (subject) where.subject = { contains: subject, mode: 'insensitive' };
    if (groupId) where.groupId = groupId;
    if (difficulty) where.difficulty = difficulty;

    return this.lecturesService.findAll({
      skip,
      take: limit,
      where,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search lectures by query and filters' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'subject', required: false, type: String })
  @ApiQuery({ name: 'difficulty', required: false, type: String })
  @ApiQuery({ name: 'groupId', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  async searchLectures(
    @Query('q') query: string,
    @Query('subject') subject?: string,
    @Query('difficulty') difficulty?: string,
    @Query('groupId') groupId?: string,
    @Query('tags') tags?: string[],
  ) {
    return this.lecturesService.searchLectures(query, {
      subject,
      difficulty,
      groupId,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lecture by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.lecturesService.findOne(id, user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update lecture' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateLectureDto: UpdateLectureDto,
    @CurrentUser() user: any,
  ) {
    return this.lecturesService.update(id, updateLectureDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete lecture' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lecturesService.remove(id, user.id);
  }

  @Post(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Download lecture file' })
  @ApiBearerAuth()
  async downloadLecture(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const downloadInfo = await this.lecturesService.downloadLecture(id, user.id);
    
    if (!fs.existsSync(downloadInfo.filePath)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'File not found',
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${downloadInfo.fileName}"`);
    res.setHeader('Content-Type', downloadInfo.mimeType);
    
    const fileStream = fs.createReadStream(downloadInfo.filePath);
    fileStream.pipe(res);
  }

  @Get(':id/stream')
  @ApiOperation({ summary: 'Stream lecture file (for viewing)' })
  async streamLecture(@Param('id') id: string, @Res() res: Response, @CurrentUser() user?: any) {
    const lecture = await this.lecturesService.findOne(id, user?.id);
    
    if (!fs.existsSync(lecture.filePath)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'File not found',
      });
    }

    const stat = fs.statSync(lecture.filePath);
    const fileSize = stat.size;
    
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Type', lecture.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${lecture.originalFileName}"`);
    
    const fileStream = fs.createReadStream(lecture.filePath);
    fileStream.pipe(res);
  }
}