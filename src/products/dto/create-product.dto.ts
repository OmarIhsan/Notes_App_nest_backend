import { IsString, IsOptional } from 'class-validator';

export class CreateproductDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}