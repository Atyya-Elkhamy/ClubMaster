// src/common/dto/userCart.dto.ts
import {
  IsMongoId,
  IsNumber,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CartItemDto {
  @IsMongoId()
  product: string; // Accepts string ID (converted to ObjectId later)

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateCartDto {
  @IsMongoId()
  user: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}

export class UpdateCartDto extends PartialType(CreateCartDto) {} // Reuse validation
