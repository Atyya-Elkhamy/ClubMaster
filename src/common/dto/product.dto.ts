import { IsString, IsNumber, Min, IsEnum, IsOptional, IsArray, ValidateIf, IsUrl } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsEnum(['vip', 'original'])
  type: 'vip' | 'original';

  @IsNumber()
  @Min(0)
  @ValidateIf(o => o.vipPrice !== undefined) 
  @IsOptional()
  vipPrice?: number;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  pictures?: string[];

  @IsEnum(['draft', 'published', 'out_of_stock', 'archived'])
  @IsOptional()
  status?: 'draft' | 'published' | 'out_of_stock' | 'archived';
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}