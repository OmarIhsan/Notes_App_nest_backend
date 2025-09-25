import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, IsObject, IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStageDto {
  @ApiProperty({ example: 'Introduction to Variables' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Learn about variables and data types', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'category-uuid' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  stageNumber?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ 
    example: { 
      minimumDocuments: 5, 
      requiredAnnotations: 10, 
      timeLimit: 30 
    }, 
    required: false 
  })
  @IsOptional()
  @IsObject()
  requirements?: {
    minimumDocuments?: number;
    requiredAnnotations?: number;
    timeLimit?: number;
  };

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @ApiProperty({ example: ['stage-id-1', 'stage-id-2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisiteStages?: string[];

  @ApiProperty({ example: 80.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumScore?: number;
}