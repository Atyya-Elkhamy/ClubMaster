import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
  IsMongoId,
  IsString,
  IsArray,
} from 'class-validator';
import { UserRole } from '../../users/users.schema';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^(010|011|012|015)\d{8}$/, {
    message:
      'Phone number must be 11 digits and start with 010, 011, 012, or 015',
  })
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either partner or admin' })
  role?: UserRole;

  @IsOptional()
  picture?: string;

  @IsOptional()
  refreshToken?: string | null;

  @IsOptional()
  @IsMongoId({ message: 'Invalid membership ID' })
  activeMembership?: string;
}

export class CreateGoogleUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsOptional()
  picture?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either partner or admin' })
  role?: UserRole;

  @IsOptional()
  refreshToken?: string | null;

  @IsOptional()
  @IsMongoId({ message: 'Invalid membership ID' })
  activeMembership?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^(010|011|012|015)\d{8}$/, {
    message:
      'Phone number must be 11 digits and start with 010, 011, 012, or 015',
  })
  phone?: string;

  @IsOptional()
  @IsArray()
  addresses?: string[];
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class AddAddressDto {
  @IsString()
  address: string;
}