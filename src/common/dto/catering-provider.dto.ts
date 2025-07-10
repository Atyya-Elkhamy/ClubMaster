// dto/create-catering-provider.dto.ts
import {
  IsString,
  IsOptional,
  IsArray,
  IsMongoId,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

class ContactInfoDto {
  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;
}

export class CreateCateringProviderDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  menuItems?: string[];

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsBoolean()
  isTopRated?: boolean;

  @IsOptional()
  @IsBoolean()
  isHighlyRecommended?: boolean;
}

export class UpdateCateringProviderDto extends PartialType(
  CreateCateringProviderDto,
) {}
