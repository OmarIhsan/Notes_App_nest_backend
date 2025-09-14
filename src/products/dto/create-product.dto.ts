import { IsString, IsOptional, IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsInt()
    @IsPositive()
    stock: number;

    @IsInt()
    @IsPositive()
    categoryId: number;
}