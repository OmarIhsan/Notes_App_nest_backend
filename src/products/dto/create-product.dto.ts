import { IsString, IsOptional, IsInt, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    price: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    stock: number;

    @IsString()
    @IsOptional()
    image?: string;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    categoryId: number;
}