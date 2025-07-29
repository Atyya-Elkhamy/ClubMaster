import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsMongoId,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export enum MembershipName {
  VIP = 'vip',
  STANDARD = 'standard',
  REGULAR = 'regular',
  BASIC = 'basic',
}

export class CreateMembershipTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  durationInDays: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateMembershipTypeDto extends PartialType(
  CreateMembershipTypeDto,
) {}

export class CreateUserMembershipDto {
  @IsMongoId()
  user: string;

  @IsMongoId()
  membershipType: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  qrCode?: string;
}
