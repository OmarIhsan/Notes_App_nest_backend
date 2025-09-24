import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { FileProcessingService } from '../file-processing/file-processing.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LecturesService {
  constructor(
    private prisma: PrismaService,
    private fileProcessingService: FileProcessingService,
  ) {}

  async create(createLectureDto: CreateLectureDto, file: Express.Multer.File, userId?: string) {
    // Verify group exists and user has access
    const group = await this.prisma.lectureGroup.findUnique({
      where: { id: createLectureDto.groupId },
      include: {
        userGroups: {
          where: { userId: userId },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (userId && !group.userGroups.some(ug => ['OWNER', 'ADMIN', 'MODERATOR'].includes(ug.role))) {
      throw new ForbiddenException('Insufficient permissions to upload lectures');
    }

    // Process the uploaded file
    const processedFile = await this.fileProcessingService.processLectureFile(file);

    // Create lecture record
    const lecture = await this.prisma.lecture.create({
      data: {
        title: createLectureDto.title,
        description: createLectureDto.description,
        subject: createLectureDto.subject,
        topic: createLectureDto.topic,
        semester: createLectureDto.semester,
        difficulty: createLectureDto.difficulty,
        fileName: processedFile.fileName,
        originalFileName: file.originalname,
        filePath: processedFile.filePath,
        fileSize: BigInt(file.size),
        fileType: processedFile.fileType,
        mimeType: file.mimetype,
        groupId: createLectureDto.groupId,
        tags: createLectureDto.tags || [],
        isPublic: createLectureDto.isPublic || false,
        requiresSubscription: createLectureDto.requiresSubscription || false,
        thumbnailPath: processedFile.thumbnailPath,
        processingStatus: 'COMPLETED',
      },
      include: {
        group: true,
      },
    });

    return lecture;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LectureWhereInput;
    orderBy?: Prisma.LectureOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 20, where, orderBy } = params;
    
    return this.prisma.lecture.findMany({
      skip,
      take,
      where: {
        ...where,
        isActive: true,
      },
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            subject: true,
            university: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId?: string) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id, isActive: true },
      include: {
        group: {
          include: {
            userGroups: {
              where: { userId: userId },
            },
          },
        },
      },
    });

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    // Check access permissions
    if (!lecture.isPublic && userId) {
      const hasAccess = lecture.group.userGroups.length > 0;
      if (!hasAccess) {
        throw new ForbiddenException('Access denied to this lecture');
      }
    }

    // Increment view count
    await this.prisma.lecture.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return lecture;
  }

  async update(id: string, updateLectureDto: UpdateLectureDto, userId?: string) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            userGroups: {
              where: { userId: userId },
            },
          },
        },
      },
    });

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    // Check permissions
    if (userId) {
      const userGroup = lecture.group.userGroups[0];
      if (!userGroup || !['OWNER', 'ADMIN', 'MODERATOR'].includes(userGroup.role)) {
        throw new ForbiddenException('Insufficient permissions to update lecture');
      }
    }

    return this.prisma.lecture.update({
      where: { id },
      data: updateLectureDto,
      include: {
        group: true,
      },
    });
  }

  async remove(id: string, userId?: string) {
    const lecture = await this.findOne(id, userId);
    
    // Check permissions (similar to update)
    if (userId) {
      const group = await this.prisma.lectureGroup.findUnique({
        where: { id: lecture.groupId },
        include: {
          userGroups: {
            where: { userId: userId },
          },
        },
      });

      const userGroup = group?.userGroups[0];
      if (!userGroup || !['OWNER', 'ADMIN'].includes(userGroup.role)) {
        throw new ForbiddenException('Insufficient permissions to delete lecture');
      }
    }

    // Soft delete
    return this.prisma.lecture.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async downloadLecture(lectureId: string, userId: string, deviceInfo?: string) {
    const lecture = await this.findOne(lectureId, userId);
    
    // Record download
    await this.prisma.lectureDownload.upsert({
      where: {
        userId_lectureId: {
          userId,
          lectureId,
        },
      },
      update: {
        downloadedAt: new Date(),
        deviceInfo,
      },
      create: {
        userId,
        lectureId,
        deviceInfo,
      },
    });

    // Increment download count
    await this.prisma.lecture.update({
      where: { id: lectureId },
      data: { downloads_count: { increment: 1 } },
    });

    return {
      filePath: lecture.filePath,
      fileName: lecture.originalFileName,
      mimeType: lecture.mimeType,
    };
  }

  async searchLectures(query: string, filters: {
    subject?: string;
    difficulty?: string;
    groupId?: string;
    tags?: string[];
  }) {
    const whereConditions: Prisma.LectureWhereInput = {
      isActive: true,
      isPublic: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { subject: { contains: query, mode: 'insensitive' } },
        { topic: { contains: query, mode: 'insensitive' } },
        { textContent: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters.subject) {
      whereConditions.subject = { contains: filters.subject, mode: 'insensitive' };
    }

    if (filters.difficulty) {
      whereConditions.difficulty = filters.difficulty as any;
    }

    if (filters.groupId) {
      whereConditions.groupId = filters.groupId;
    }

    if (filters.tags?.length) {
      whereConditions.tags = {
        hasEvery: filters.tags,
      };
    }

    return this.prisma.lecture.findMany({
      where: whereConditions,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
      },
      orderBy: [
        { views: 'desc' },
        { downloads_count: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }
}