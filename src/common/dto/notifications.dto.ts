import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  message: string;

  @IsMongoId()
  @IsOptional() 
  user: string;
  
  @IsOptional()
  metadata?: Record<string, any>;
}
