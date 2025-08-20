import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsDateString,
  IsEnum,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../schemas/notification.schema';

class RecurringConfigDto {
  @IsString()
  pattern: string; // cron pattern

  @IsString()
  timezone: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SendNotificationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  body: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  // Targeting options
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetDevices?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTopics?: string[];

  @IsOptional()
  @IsObject()
  targetQuery?: Record<string, any>;

  // Scheduling
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RecurringConfigDto)
  recurring?: RecurringConfigDto;

  // Template
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsObject()
  templateVariables?: Record<string, any>;
}
