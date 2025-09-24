import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export class CreateLectureDto {
  @ApiProperty({ description: 'Title of the lecture' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Description of the lecture content' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Subject/course name' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ description: 'Specific topic within the subject' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ description: 'Academic semester' })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiPropertyOptional({ 
    enum: DifficultyLevel, 
    description: 'Difficulty level of the content',
    default: DifficultyLevel.INTERMEDIATE 
  })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel = DifficultyLevel.INTERMEDIATE;

  @ApiProperty({ description: 'ID of the group this lecture belongs to' })
  @IsString()
  groupId: string;

  @ApiPropertyOptional({ 
    type: [String], 
    description: 'Tags for categorizing the lecture',
    default: [] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];

  @ApiPropertyOptional({ 
    description: 'Whether the lecture is publicly accessible',
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Whether a subscription is required to access this lecture',
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  requiresSubscription?: boolean = false;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    description: 'Lecture file (PDF, PPT, PPTX, DOC, DOCX, TXT)' 
  })
  file: any; // This will be handled by multer middleware
}