import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, IsObject } from 'class-validator';import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, IsObject } from 'class-validator';import { ApiProperty } from '@nestjs/swagger';



export class CreateStageDto {import { IsString, IsOptional, IsInt, Min, IsBoolean, IsArray, IsNumber } from 'class-validator';

    @IsString()

    name: string;export class CreateStageDto {



    @IsOptional()    @IsString()export class CreateStageDto {

    @IsString()

    description?: string;    name: string;  @ApiProperty({ example: 'Introduction to Variables' })



    @IsUUID()  @IsString()

    categoryId: string;

    @IsOptional()  name: string;

    @IsOptional()

    @IsNumber()    @IsString()

    displayOrder?: number;

    description?: string;  @ApiProperty({ example: 'Learn about variables and data types', required: false })

    @IsOptional()

    @IsBoolean()  @IsOptional()

    isActive?: boolean;

    @IsUUID()  @IsString()

    @IsOptional()

    @IsObject()    categoryId: string;  description?: string;

    requirements?: {

        minimumDocuments?: number;

        requiredAnnotations?: number;

        timeLimit?: number;    @IsOptional()  @ApiProperty({ example: 1 })

    };

}    @IsNumber()  @IsInt()

    displayOrder?: number;  @Min(1)

  stageNumber: number;

    @IsOptional()

    @IsBoolean()  @ApiProperty({ example: true, required: false })

    isActive?: boolean;  @IsOptional()

  @IsBoolean()

    @IsOptional()  isRequired?: boolean;

    @IsObject()

    requirements?: {  @ApiProperty({ example: 30, required: false })

        minimumDocuments?: number;  @IsOptional()

        requiredAnnotations?: number;  @IsInt()

        timeLimit?: number;  @Min(1)

    };  estimatedDuration?: number;

}
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

  @ApiProperty({ example: 'category-id' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}