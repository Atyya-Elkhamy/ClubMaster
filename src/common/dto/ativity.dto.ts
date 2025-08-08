import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsMongoId,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsEnum(['vip', 'original'])
  type: 'vip' | 'original';

  @IsNumber()
  numberOfSeats: number;

  @IsNumber()
  pricePerOne: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsEnum(['athlete', 'other'])
  category: 'athlete' | 'other';

  @IsArray()
  @IsOptional()
  pictures?: string[];
}


export class UpdateActivityDto extends PartialType(CreateActivityDto) {}


export class CreateBookingDto {
  @IsMongoId()
  activity: string;

  @IsNumber()
  numberOfSeats: number;

  @IsString()
  @IsOptional()
  specialDescription?: string;
}


export class UpdateBookingDto extends PartialType(CreateBookingDto) {}
