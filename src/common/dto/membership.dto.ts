import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { MembershipCategory, MembershipBillingCycle } from '../../membership/schema/membership.schema'; // adjust path

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

  @IsEnum(MembershipCategory)
  type: MembershipCategory;

  @IsEnum(MembershipBillingCycle)
  billingCycle: MembershipBillingCycle;
}

export class UpdateMembershipTypeDto extends PartialType(
  CreateMembershipTypeDto,
) {}

export class CreateUserMembershipDto {
  @IsMongoId()
  membershipType: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;
  
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  qrCode?: string;
}
