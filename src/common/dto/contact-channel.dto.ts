import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateContactChannelDto {
  @IsEnum(['WhatsApp', 'Facebook Messenger', 'Phone', 'Hotline'])
  type: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsMongoId()
  restaurant: string;
}

export class UpdateContactChannelDto extends PartialType(
  CreateContactChannelDto,
) {}
