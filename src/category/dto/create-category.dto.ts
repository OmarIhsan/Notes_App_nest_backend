import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsNumber()
    displayOrder?: number;
}