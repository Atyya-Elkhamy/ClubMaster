import { IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsEnum(['product', 'activity'])
  type: 'product' | 'activity';
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
