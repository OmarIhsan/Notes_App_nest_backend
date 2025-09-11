import { PartialType } from '@nestjs/mapped-types';
import { CreateproductDto } from './create-product.dto';

export class UpdateproductDto extends PartialType(CreateproductDto) { }