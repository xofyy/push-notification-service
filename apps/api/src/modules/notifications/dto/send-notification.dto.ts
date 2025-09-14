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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../schemas/notification.schema';

class RecurringConfigDto {
  @ApiProperty({
    description: 'Cron pattern for recurring notifications',
    example: '0 9 * * MON-FRI',
  })
  @IsString()
  pattern!: string; // cron pattern

  @ApiProperty({
    description: 'Timezone for scheduling',
    example: 'America/New_York',
  })
  @IsString()
  timezone!: string;

  @ApiPropertyOptional({
    description: 'End date for recurring notifications',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SendNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'Welcome to our app!',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @ApiProperty({
    description: 'Notification body/message',
    example: 'Thanks for installing our app. Get started with these features!',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  body!: string;

  @ApiPropertyOptional({
    description: 'Image URL for rich notifications',
    example: 'https://example.com/images/welcome.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Action URL when notification is clicked',
    example: 'https://example.com/welcome',
  })
  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Custom data payload for the notification',
    example: {
      userId: '12345',
      campaignId: 'welcome_series_1',
      customAction: 'open_feature',
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.INSTANT,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  // Targeting options
  @ApiPropertyOptional({
    description: 'Array of specific device IDs to target',
    example: ['device_123', 'device_456'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetDevices?: string[];

  @ApiPropertyOptional({
    description: 'Array of tags to target devices',
    example: ['premium', 'beta-tester', 'ios'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTags?: string[];

  @ApiPropertyOptional({
    description: 'Array of topics to target',
    example: ['news', 'promotions'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTopics?: string[];

  @ApiPropertyOptional({
    description: 'Advanced query for targeting specific user segments',
    example: {
      platform: 'android',
      appVersion: { $gte: '2.0.0' },
      lastSeen: { $gte: '2023-12-01' },
    },
  })
  @IsOptional()
  @IsObject()
  targetQuery?: Record<string, any>;

  // Scheduling
  @ApiPropertyOptional({
    description: 'Schedule notification for future delivery',
    example: '2023-12-08T09:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @ApiPropertyOptional({
    description: 'Expiration time for the notification',
    example: '2023-12-08T18:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Configuration for recurring notifications',
    type: RecurringConfigDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurringConfigDto)
  recurring?: RecurringConfigDto;

  // Template
  @ApiPropertyOptional({
    description: 'Template ID for template-based notifications',
    example: '64f1a2b3c4d5e6f7a8b9c0d4',
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Variables for template substitution',
    example: {
      userName: 'John Doe',
      productName: 'Premium Plan',
      discountAmount: '20%',
    },
  })
  @IsOptional()
  @IsObject()
  templateVariables?: Record<string, any>;
}
