import { IsString, IsOptional, IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @IsPositive()
    price:number

    @IsInt()
    stock:number

    @IsInt()
    categoryId:number
}